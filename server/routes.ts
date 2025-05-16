import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import axios from "axios";
import { z } from "zod";
import { 
  insertUserPreferenceSchema, 
  type CongressMember, 
  type CongressVote
} from "@shared/schema";

// ProPublica API key
const API_KEY = process.env.PROPUBLICA_API_KEY || "DEMO_KEY";
const API_BASE_URL = "https://api.propublica.org/congress/v1";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for representatives
  app.get("/api/representatives", async (req, res) => {
    try {
      const { state, chamber, name } = req.query;
      
      const filters: { state?: string, chamber?: string, name?: string } = {};
      if (state && typeof state === "string") filters.state = state;
      if (chamber && typeof chamber === "string") filters.chamber = chamber;
      if (name && typeof name === "string") filters.name = name;
      
      const representatives = await storage.getRepresentatives(filters);
      
      // If we don't have any representatives in storage, fetch from the API
      if (representatives.length === 0) {
        const chamberToFetch = chamber || "senate";
        const response = await axios.get(`${API_BASE_URL}/116/${chamberToFetch}/members.json`, {
          headers: {
            "X-API-Key": API_KEY
          }
        });
        
        const members: CongressMember[] = response.data.results[0].members;
        
        for (const member of members) {
          const representative = {
            memberId: member.id,
            firstName: member.first_name,
            lastName: member.last_name,
            chamber: member.chamber,
            party: member.party,
            state: member.state,
            district: member.district,
            officeStart: member.last_updated,
            profileImageUrl: `https://theunitedstates.io/images/congress/225x275/${member.id}.jpg`
          };
          
          await storage.createRepresentative(representative);
        }
        
        // Fetch again with the populated storage
        return res.json(await storage.getRepresentatives(filters));
      }
      
      res.json(representatives);
    } catch (error) {
      console.error("Error fetching representatives:", error);
      res.status(500).json({ message: "Error fetching representatives data" });
    }
  });
  
  app.get("/api/representatives/:memberId", async (req, res) => {
    try {
      const { memberId } = req.params;
      
      let representative = await storage.getRepresentativeByMemberId(memberId);
      
      if (!representative) {
        // Fetch from API if not in storage
        const response = await axios.get(`${API_BASE_URL}/members/${memberId}.json`, {
          headers: {
            "X-API-Key": API_KEY
          }
        });
        
        const member = response.data.results[0];
        
        representative = await storage.createRepresentative({
          memberId: member.id,
          firstName: member.first_name,
          lastName: member.last_name,
          chamber: member.current_role?.chamber || "unknown",
          party: member.current_party,
          state: member.roles?.[0]?.state || "unknown",
          district: member.roles?.[0]?.district,
          officeStart: member.roles?.[0]?.start_date,
          profileImageUrl: `https://theunitedstates.io/images/congress/225x275/${member.id}.jpg`
        });
      }
      
      res.json(representative);
    } catch (error) {
      console.error("Error fetching representative:", error);
      res.status(500).json({ message: "Error fetching representative data" });
    }
  });
  
  // API routes for votes
  app.get("/api/votes/:memberId", async (req, res) => {
    try {
      const { memberId } = req.params;
      const { category, timeframe } = req.query;
      
      // Get member votes from storage
      let memberVotes = await storage.getMemberVotes(memberId);
      
      // If we don't have any member votes in storage, fetch from the API
      if (memberVotes.length === 0) {
        const response = await axios.get(`${API_BASE_URL}/members/${memberId}/votes.json`, {
          headers: {
            "X-API-Key": API_KEY
          }
        });
        
        const votes = response.data.results;
        
        for (const vote of votes) {
          // Create vote record if it doesn't exist
          let voteRecord = await storage.getVoteByBillId(vote.bill?.bill_id || `vote-${vote.roll_call}`);
          
          if (!voteRecord) {
            voteRecord = await storage.createVote({
              billId: vote.bill?.bill_id || `vote-${vote.roll_call}`,
              billTitle: vote.bill?.title || vote.description || `Vote ${vote.roll_call}`,
              billDescription: vote.bill?.latest_action || vote.description || "",
              category: vote.bill?.primary_subject || "Uncategorized",
              voteDate: new Date(vote.date)
            });
          }
          
          // Create member vote record
          await storage.createMemberVote({
            memberId,
            billId: voteRecord.billId,
            position: vote.position
          });
        }
        
        // Fetch again with the populated storage
        memberVotes = await storage.getMemberVotes(memberId);
      }
      
      // Get all votes information for these member votes
      const voteDetails = [];
      for (const memberVote of memberVotes) {
        const vote = await storage.getVoteByBillId(memberVote.billId);
        if (vote) {
          // Get user preference if it exists (assuming user ID 1 for simplicity)
          const userPref = await storage.getUserPreference(1, memberVote.billId);
          
          voteDetails.push({
            ...vote,
            position: memberVote.position,
            userPreference: userPref || null
          });
        }
      }
      
      // Apply filters
      let filteredVotes = voteDetails;
      
      if (category && category !== "All Categories") {
        filteredVotes = filteredVotes.filter(v => v.category === category);
      }
      
      if (timeframe && timeframe !== "All Time") {
        const now = new Date();
        let startDate: Date;
        
        switch (timeframe) {
          case "Last 30 Days":
            startDate = new Date();
            startDate.setDate(now.getDate() - 30);
            filteredVotes = filteredVotes.filter(v => v.voteDate >= startDate);
            break;
          case "Last 90 Days":
            startDate = new Date();
            startDate.setDate(now.getDate() - 90);
            filteredVotes = filteredVotes.filter(v => v.voteDate >= startDate);
            break;
          case "This Year":
            startDate = new Date(now.getFullYear(), 0, 1);
            filteredVotes = filteredVotes.filter(v => v.voteDate >= startDate);
            break;
        }
      }
      
      // Sort by date (newest first)
      filteredVotes.sort((a, b) => b.voteDate.getTime() - a.voteDate.getTime());
      
      res.json(filteredVotes);
    } catch (error) {
      console.error("Error fetching votes:", error);
      res.status(500).json({ message: "Error fetching voting data" });
    }
  });
  
  // API route for user preferences
  app.post("/api/preferences", async (req, res) => {
    try {
      // Validate request body
      const validatedData = insertUserPreferenceSchema.parse(req.body);
      
      // Check if preference already exists
      const existingPref = await storage.getUserPreference(
        validatedData.userId, 
        validatedData.billId
      );
      
      if (existingPref) {
        // Update existing preference
        const updatedPref = await storage.updateUserPreference(
          existingPref.id, 
          validatedData
        );
        return res.json(updatedPref);
      } else {
        // Create new preference
        const newPref = await storage.createUserPreference(validatedData);
        return res.json(newPref);
      }
    } catch (error) {
      console.error("Error saving preference:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error saving preference" });
    }
  });
  
  // API route for alignment scores
  app.get("/api/alignment/:memberId", async (req, res) => {
    try {
      const { memberId } = req.params;
      // Using user ID 1 for simplicity - in a real app this would come from session
      const alignmentScore = await storage.calculateAlignmentScore(1, memberId);
      res.json(alignmentScore);
    } catch (error) {
      console.error("Error calculating alignment:", error);
      res.status(500).json({ message: "Error calculating alignment score" });
    }
  });
  
  // API route for vote categories
  app.get("/api/categories", async (req, res) => {
    try {
      const votes = await storage.getVotes();
      const categories = [...new Set(votes.map(v => v.category))];
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Error fetching categories" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
