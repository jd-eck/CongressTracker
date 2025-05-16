import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import axios from "axios";
import { z } from "zod";
import { insertUserVotePreferenceSchema, insertRecentRepSchema } from "@shared/schema";

// ProPublica API URL and key
const PROPUBLICA_API_BASE = "https://api.propublica.org/congress/v1";
const PROPUBLICA_API_KEY = process.env.PROPUBLICA_API_KEY || "";

// Create API client for ProPublica
const propublicaClient = axios.create({
  baseURL: PROPUBLICA_API_BASE,
  headers: {
    "X-API-Key": PROPUBLICA_API_KEY
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // Endpoint to search for congress members
  app.get("/api/members", async (req: Request, res: Response) => {
    try {
      const { chamber = "house", state, district, query } = req.query;
      
      if (query) {
        // Search by name is handled differently
        const houseResponse = await propublicaClient.get(`/116/house/members.json`);
        const senateResponse = await propublicaClient.get(`/116/senate/members.json`);
        
        const allMembers = [
          ...houseResponse.data.results[0].members,
          ...senateResponse.data.results[0].members
        ];
        
        const queryStr = String(query).toLowerCase();
        const filtered = allMembers.filter(member => 
          member.name.toLowerCase().includes(queryStr)
        );
        
        return res.json({ results: filtered });
      }
      
      // Filter by chamber, state and district
      let url = `/116/${chamber}/members.json`;
      
      if (state) {
        url = `/members/${chamber}/${state}/current.json`;
      }
      
      const response = await propublicaClient.get(url);
      
      let members = response.data.results;
      
      // Filter by district if provided
      if (district && chamber === "house") {
        members = members.filter((member: any) => 
          member.district === String(district)
        );
      }
      
      res.json({ results: members });
    } catch (error) {
      console.error("Error fetching members:", error);
      res.status(500).json({ error: "Failed to fetch congress members" });
    }
  });

  // Endpoint to get specific member details
  app.get("/api/members/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const response = await propublicaClient.get(`/members/${id}.json`);
      const member = response.data.results[0];
      
      // Add to recent reps
      try {
        await storage.addRecentRep({
          userId: 1, // Use default user for now
          memberId: member.id,
          memberName: member.name,
          chamber: member.current_role?.chamber || "house",
          state: member.current_role?.state || member.roles[0].state,
          district: member.current_role?.district || member.roles[0].district,
          party: member.current_party || member.current_role?.party || member.roles[0].party,
        });
      } catch (e) {
        console.error("Error saving recent rep:", e);
      }
      
      res.json({ result: member });
    } catch (error) {
      console.error("Error fetching member details:", error);
      res.status(500).json({ error: "Failed to fetch member details" });
    }
  });

  // Get member's recent votes
  app.get("/api/members/:id/votes", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const response = await propublicaClient.get(`/members/${id}/votes.json`);
      res.json(response.data);
    } catch (error) {
      console.error("Error fetching member votes:", error);
      res.status(500).json({ error: "Failed to fetch member votes" });
    }
  });

  // Get specific bill details
  app.get("/api/bills/:congress/:bill_id", async (req: Request, res: Response) => {
    try {
      const { congress, bill_id } = req.params;
      const response = await propublicaClient.get(`/${congress}/bills/${bill_id}.json`);
      res.json(response.data);
    } catch (error) {
      console.error("Error fetching bill details:", error);
      res.status(500).json({ error: "Failed to fetch bill details" });
    }
  });

  // Get specific vote details
  app.get("/api/votes/:congress/:chamber/:session/:roll_call", async (req: Request, res: Response) => {
    try {
      const { congress, chamber, session, roll_call } = req.params;
      const response = await propublicaClient.get(`/${congress}/${chamber}/sessions/${session}/votes/${roll_call}.json`);
      res.json(response.data);
    } catch (error) {
      console.error("Error fetching vote details:", error);
      res.status(500).json({ error: "Failed to fetch vote details" });
    }
  });

  // Get user's vote preferences
  app.get("/api/user/votes", async (_req: Request, res: Response) => {
    try {
      const preferences = await storage.getUserVotePreferences(1); // Use default user
      res.json({ preferences });
    } catch (error) {
      console.error("Error fetching user vote preferences:", error);
      res.status(500).json({ error: "Failed to fetch user vote preferences" });
    }
  });

  // Save user vote preference
  app.post("/api/user/votes", async (req: Request, res: Response) => {
    try {
      const preferenceData = insertUserVotePreferenceSchema.parse(req.body);
      
      // Default to user ID 1 for now
      const preference = await storage.saveUserVotePreference({
        ...preferenceData,
        userId: 1
      });
      
      res.json({ preference });
    } catch (error) {
      console.error("Error saving user vote preference:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to save user vote preference" });
    }
  });

  // Get specific user vote preference
  app.get("/api/user/votes/:bill_id/:congress_id", async (req: Request, res: Response) => {
    try {
      const { bill_id, congress_id } = req.params;
      const preference = await storage.getUserVotePreferenceForBill(1, bill_id, congress_id);
      
      if (!preference) {
        return res.status(404).json({ error: "Vote preference not found" });
      }
      
      res.json({ preference });
    } catch (error) {
      console.error("Error fetching user vote preference:", error);
      res.status(500).json({ error: "Failed to fetch user vote preference" });
    }
  });

  // Calculate alignment score
  app.get("/api/alignment/:member_id", async (req: Request, res: Response) => {
    try {
      const { member_id } = req.params;
      const summary = await storage.calculateAlignmentSummary(1, member_id);
      res.json({ summary });
    } catch (error) {
      console.error("Error calculating alignment:", error);
      res.status(500).json({ error: "Failed to calculate alignment" });
    }
  });

  // Get recent representatives
  app.get("/api/user/recent-reps", async (_req: Request, res: Response) => {
    try {
      const reps = await storage.getRecentReps(1); // Use default user
      res.json({ reps });
    } catch (error) {
      console.error("Error fetching recent representatives:", error);
      res.status(500).json({ error: "Failed to fetch recent representatives" });
    }
  });

  // Get congress options
  app.get("/api/congresses", async (_req: Request, res: Response) => {
    // Return a list of recent congresses
    const congresses = [
      { id: "117", name: "117th Congress (2021-2023)" },
      { id: "116", name: "116th Congress (2019-2021)" },
      { id: "115", name: "115th Congress (2017-2019)" },
      { id: "114", name: "114th Congress (2015-2017)" },
      { id: "113", name: "113th Congress (2013-2015)" },
    ];
    
    res.json({ congresses });
  });

  const httpServer = createServer(app);
  return httpServer;
}
