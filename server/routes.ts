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

// Congress.gov API key
const CONGRESS_API_KEY = process.env.CONGRESS_GOV_API_KEY;
const CONGRESS_API_BASE_URL = "https://api.congress.gov";

// Add mock data for demonstration purposes when needed
// In a production app, you would use only the API data
const DEMO_DATA = {
  representatives: [
    {
      memberId: "A000370",
      firstName: "Alma",
      lastName: "Adams",
      chamber: "house",
      party: "D",
      state: "NC",
      district: "12",
      officeStart: "2020-01-03",
      profileImageUrl: "https://theunitedstates.io/images/congress/225x275/A000370.jpg"
    },
    {
      memberId: "S000033",
      firstName: "Bernie",
      lastName: "Sanders",
      chamber: "senate",
      party: "I",
      state: "VT",
      district: "",
      officeStart: "2019-01-03",
      profileImageUrl: "https://theunitedstates.io/images/congress/225x275/S000033.jpg"
    },
    {
      memberId: "P000197",
      firstName: "Nancy",
      lastName: "Pelosi",
      chamber: "house",
      party: "D",
      state: "CA",
      district: "11",
      officeStart: "2019-01-03",
      profileImageUrl: "https://theunitedstates.io/images/congress/225x275/P000197.jpg"
    },
    {
      memberId: "M000355",
      firstName: "Mitch",
      lastName: "McConnell",
      chamber: "senate",
      party: "R",
      state: "KY",
      district: "",
      officeStart: "2021-01-03",
      profileImageUrl: "https://theunitedstates.io/images/congress/225x275/M000355.jpg"
    },
    {
      memberId: "O000172",
      firstName: "Alexandria",
      lastName: "Ocasio-Cortez",
      chamber: "house",
      party: "D",
      state: "NY",
      district: "14",
      officeStart: "2019-01-03",
      profileImageUrl: "https://theunitedstates.io/images/congress/225x275/O000172.jpg"
    }
  ]
};

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
      
      // If we don't have any representatives in storage, add demo data
      if (representatives.length === 0) {
        // Use demo data to populate storage
        for (const member of DEMO_DATA.representatives) {
          await storage.createRepresentative(member);
        }
        
        // Filter the representatives based on the requested filters
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
        // Check if the representative exists in our demo data
        const demoMember = DEMO_DATA.representatives.find(m => m.memberId === memberId);
        
        if (demoMember) {
          representative = await storage.createRepresentative(demoMember);
        } else {
          return res.status(404).json({ message: "Representative not found" });
        }
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
      
      // If we don't have any member votes in storage, create sample votes
      if (memberVotes.length === 0) {
        // Determine if the member is in the House or Senate
        const representative = await storage.getRepresentativeByMemberId(memberId);
        
        // Create sample bills based on chamber
        let sampleBills;
        
        if (representative && representative.chamber.toLowerCase() === 'house') {
          sampleBills = [
            { id: "hr1234", title: "American Innovation Act", desc: "A bill to boost technology research", cat: "Science, Technology, Communications" },
            { id: "hr2345", title: "Affordable Housing Act", desc: "A bill to increase housing accessibility", cat: "Housing and Community Development" },
            { id: "hr3456", title: "Clean Energy Jobs Act", desc: "A bill to promote renewable energy jobs", cat: "Energy" },
            { id: "hr4567", title: "Veterans Health Care Act", desc: "A bill to improve veterans' healthcare access", cat: "Armed Forces and National Security" },
            { id: "hr5678", title: "Student Loan Relief Act", desc: "A bill to provide relief for student loan borrowers", cat: "Education" }
          ];
        } else {
          sampleBills = [
            { id: "s1234", title: "Agriculture Improvement Act", desc: "A bill to improve agricultural programs", cat: "Agriculture" },
            { id: "s2345", title: "National Defense Authorization Act", desc: "A bill to authorize defense spending", cat: "Armed Forces and National Security" },
            { id: "s3456", title: "Healthcare Reform Act", desc: "A bill to reform healthcare delivery systems", cat: "Health" },
            { id: "s4567", title: "Education Funding Act", desc: "A bill to provide funding for education programs", cat: "Education" },
            { id: "s5678", title: "Infrastructure Investment Act", desc: "A bill to fund infrastructure improvements", cat: "Transportation and Public Works" }
          ];
        }
        
        // Add bills to storage
        for (const bill of sampleBills) {
          // Create vote record if it doesn't exist
          let voteRecord = await storage.getVoteByBillId(bill.id);
          
          if (!voteRecord) {
            voteRecord = await storage.createVote({
              billId: bill.id,
              billTitle: bill.title,
              billDescription: bill.desc,
              category: bill.cat,
              voteDate: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)) // Random date within last 30 days
            });
          }
          
          // Create member vote record with random position
          const positions = ["Yes", "No", "Present", "Not Voting"];
          const randomPosition = positions[Math.floor(Math.random() * positions.length)];
          
          await storage.createMemberVote({
            memberId,
            billId: voteRecord.billId,
            position: randomPosition
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
      // Extract unique categories from votes
      const categories: string[] = [];
      votes.forEach(vote => {
        if (vote.category && !categories.includes(vote.category)) {
          categories.push(vote.category);
        }
      });
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
