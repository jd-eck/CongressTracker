import axios from "axios";

// This API key is a placeholder - in a real application, this would come from environment variables
const API_KEY = process.env.PROPUBLICA_API_KEY || "DEMO_KEY";
const API_BASE_URL = "https://api.propublica.org/congress/v1";

/**
 * ProPublica Congress API client
 * Documentation: https://projects.propublica.org/api-docs/congress-api/
 */
const congressApi = {
  /**
   * Get members of a specific chamber for a specific congress
   */
  getMembers: async (congress = "117", chamber = "senate") => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${congress}/${chamber}/members.json`, {
        headers: {
          "X-API-Key": API_KEY
        }
      });
      return response.data.results[0].members;
    } catch (error) {
      console.error("Error fetching members:", error);
      throw new Error("Failed to fetch congressional members");
    }
  },
  
  /**
   * Get a specific member by ID
   */
  getMember: async (memberId: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/members/${memberId}.json`, {
        headers: {
          "X-API-Key": API_KEY
        }
      });
      return response.data.results[0];
    } catch (error) {
      console.error("Error fetching member:", error);
      throw new Error("Failed to fetch congressional member");
    }
  },
  
  /**
   * Get votes for a specific member
   */
  getMemberVotes: async (memberId: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/members/${memberId}/votes.json`, {
        headers: {
          "X-API-Key": API_KEY
        }
      });
      return response.data.results;
    } catch (error) {
      console.error("Error fetching member votes:", error);
      throw new Error("Failed to fetch member voting record");
    }
  },
  
  /**
   * Get details for a specific vote
   */
  getVote: async (congress: string, chamber: string, sessionNumber: string, rollCallNumber: string) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/${congress}/${chamber}/sessions/${sessionNumber}/votes/${rollCallNumber}.json`, 
        {
          headers: {
            "X-API-Key": API_KEY
          }
        }
      );
      return response.data.results.votes.vote;
    } catch (error) {
      console.error("Error fetching vote details:", error);
      throw new Error("Failed to fetch vote details");
    }
  },
  
  /**
   * Get recent votes
   */
  getRecentVotes: async (chamber = "both") => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${chamber}/votes/recent.json`, {
        headers: {
          "X-API-Key": API_KEY
        }
      });
      return response.data.results.votes;
    } catch (error) {
      console.error("Error fetching recent votes:", error);
      throw new Error("Failed to fetch recent votes");
    }
  }
};

export default congressApi;
