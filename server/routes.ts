import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import axios from "axios";
import { z } from "zod";
import { VoteResponse, congressMemberResponseSchema, voteResponseSchema } from "@shared/schema";

// Congress API constants
const API_BASE_URL = "https://api.propublica.org/congress/v1";
const API_KEY = process.env.PROPUBLICA_API_KEY || "";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for congress members
  app.get("/api/congress-members", async (req, res) => {
    try {
      // Get query parameters for filtering
      const chamber = req.query.chamber as string || undefined;
      const state = req.query.state as string || undefined;
      const party = req.query.party as string || undefined;

      // Get members from API or database
      const members = await storage.getCongressMembers({ chamber, state, party });
      res.json(members);
    } catch (error) {
      console.error("Error fetching congress members:", error);
      res.status(500).json({ message: "Failed to fetch congress members" });
    }
  });

  // API route for a specific congress member
  app.get("/api/congress-members/:bioguideId", async (req, res) => {
    try {
      const { bioguideId } = req.params;
      const member = await storage.getCongressMemberByBioguideId(bioguideId);
      
      if (!member) {
        return res.status(404).json({ message: "Congress member not found" });
      }
      
      res.json(member);
    } catch (error) {
      console.error(`Error fetching congress member ${req.params.bioguideId}:`, error);
      res.status(500).json({ message: "Failed to fetch congress member" });
    }
  });

  // API route for a member's voting record
  app.get("/api/congress-members/:bioguideId/votes", async (req, res) => {
    try {
      const { bioguideId } = req.params;
      // Optional pagination parameters
      const offset = parseInt(req.query.offset as string) || 0;
      const limit = parseInt(req.query.limit as string) || 20;
      
      const votes = await storage.getMemberVotes(bioguideId, offset, limit);
      res.json(votes);
    } catch (error) {
      console.error(`Error fetching votes for ${req.params.bioguideId}:`, error);
      res.status(500).json({ message: "Failed to fetch voting record" });
    }
  });

  // API route for user preferences
  app.get("/api/user-preferences/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const preferences = await storage.getUserPreferences(userId);
      res.json(preferences);
    } catch (error) {
      console.error(`Error fetching preferences for user ${req.params.userId}:`, error);
      res.status(500).json({ message: "Failed to fetch user preferences" });
    }
  });

  // API route to set user preferences for a vote
  app.post("/api/user-preferences", async (req, res) => {
    try {
      const preferenceSchema = z.object({
        userId: z.number(),
        voteId: z.number(),
        agreement: z.boolean(),
        importance: z.number().min(1).max(5)
      });
      
      const validatedData = preferenceSchema.parse(req.body);
      const preference = await storage.setUserPreference(
        validatedData.userId,
        validatedData.voteId,
        validatedData.agreement,
        validatedData.importance
      );
      
      res.status(201).json(preference);
    } catch (error) {
      console.error("Error setting user preference:", error);
      res.status(500).json({ message: "Failed to set user preference" });
    }
  });

  // API route for alignment stats between user and congress member
  app.get("/api/alignment/:userId/:bioguideId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { bioguideId } = req.params;
      
      const stats = await storage.getAlignmentStats(userId, bioguideId);
      res.json(stats);
    } catch (error) {
      console.error(`Error calculating alignment for user ${req.params.userId} and member ${req.params.bioguideId}:`, error);
      res.status(500).json({ message: "Failed to calculate alignment statistics" });
    }
  });

  // Fetch data from ProPublica API to update our database
  app.post("/api/sync/congress-data", async (req, res) => {
    try {
      if (!API_KEY) {
        return res.status(400).json({ 
          message: "API key not configured. Please set the PROPUBLICA_API_KEY environment variable." 
        });
      }

      const chamber = req.query.chamber as string || "both";
      await syncCongressData(chamber);
      
      res.json({ message: "Data synchronization initiated" });
    } catch (error) {
      console.error("Error syncing congress data:", error);
      res.status(500).json({ message: "Failed to sync congress data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function syncCongressData(chamber: string) {
  try {
    // Current congress number (117th, 118th, etc.)
    const currentCongress = 118; // This should be updated automatically or from config
    
    // Fetch Senate members if chamber is "senate" or "both"
    if (chamber === "senate" || chamber === "both") {
      const response = await axios.get(
        `${API_BASE_URL}/${currentCongress}/senate/members.json`,
        { headers: { "X-API-Key": API_KEY } }
      );
      
      const members = response.data?.results?.[0]?.members || [];
      for (const member of members) {
        await processCongressMember(member, "senate");
      }
    }
    
    // Fetch House members if chamber is "house" or "both"
    if (chamber === "house" || chamber === "both") {
      const response = await axios.get(
        `${API_BASE_URL}/${currentCongress}/house/members.json`,
        { headers: { "X-API-Key": API_KEY } }
      );
      
      const members = response.data?.results?.[0]?.members || [];
      for (const member of members) {
        await processCongressMember(member, "house");
      }
    }
    
    // Fetch recent votes for each chamber
    if (chamber === "senate" || chamber === "both") {
      await fetchRecentVotes("senate");
    }
    
    if (chamber === "house" || chamber === "both") {
      await fetchRecentVotes("house");
    }
  } catch (error) {
    console.error("Error in syncCongressData:", error);
    throw error;
  }
}

async function processCongressMember(member: any, chamber: string) {
  try {
    const congressMember = congressMemberResponseSchema.parse({
      bioguideId: member.id,
      name: `${member.first_name} ${member.last_name}`,
      party: member.party,
      state: member.state,
      district: chamber === "house" ? member.district : undefined,
      chamber: chamber,
      termStart: member.seniority,
      imageUrl: undefined // ProPublica API doesn't provide images
    });
    
    await storage.upsertCongressMember(congressMember);
  } catch (error) {
    console.error(`Error processing congress member:`, error);
  }
}

async function fetchRecentVotes(chamber: string) {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/${chamber}/votes/recent.json`,
      { headers: { "X-API-Key": API_KEY } }
    );
    
    const votes = response.data?.results?.votes || [];
    
    for (const vote of votes) {
      await processVote(vote, chamber);
    }
  } catch (error) {
    console.error(`Error fetching recent votes for ${chamber}:`, error);
  }
}

async function processVote(vote: any, chamber: string) {
  try {
    // Process the main vote record
    const voteData = {
      billId: vote.bill?.bill_id || `${vote.question}-${vote.congress}`,
      billTitle: vote.bill?.title || vote.description,
      billDescription: vote.bill?.latest_action,
      chamber: chamber,
      date: vote.date,
      question: vote.question,
      result: vote.result,
      url: vote.bill?.bill_uri
    };
    
    const voteId = await storage.upsertVote(voteData);
    
    // Process how each member voted
    const positions = vote.positions || [];
    for (const position of positions) {
      await storage.upsertMemberVote({
        congressMemberId: position.member_id,
        voteId,
        position: position.vote_position
      });
    }
  } catch (error) {
    console.error(`Error processing vote:`, error);
  }
}
