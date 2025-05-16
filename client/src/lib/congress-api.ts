import axios from "axios";

// Get API key from environment variables
const API_KEY = import.meta.env.VITE_CONGRESS_GOV_API_KEY;
const API_BASE_URL = "https://api.congress.gov/v3";

/**
 * Congress.gov API client
 * Based on the documentation from api.congress.gov
 */
const congressApi = {
  /**
   * Get members of a specific state
   */
  getMembers: async (stateCode?: string, chamber?: string) => {
    try {
      let url = `${API_BASE_URL}/member`;
      if (stateCode) {
        url += `/${stateCode}`;
      }

      const response = await axios.get(url, {
        params: {
          api_key: API_KEY,
          format: "json",
          limit: 250,
        },
      });

      // Filter by chamber if specified
      let members = response.data.members || [];
      if (chamber) {
        const chamberFilter = chamber.toLowerCase();
        members = members.filter(
          (member: any) =>
            member.chamber && member.chamber.toLowerCase() === chamberFilter,
        );
      }

      return members;
    } catch (error) {
      console.error("Error fetching members:", error);
      throw new Error("Failed to fetch congressional members");
    }
  },

  /**
   * Get members by state and district
   */
  getMembersByDistrict: async (stateCode: string, district: string) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/member/${stateCode}/${district}`,
        {
          params: {
            api_key: API_KEY,
            format: "json",
          },
        },
      );
      return response.data.members;
    } catch (error) {
      console.error("Error fetching members by district:", error);
      throw new Error("Failed to fetch congressional members for district");
    }
  },

  /**
   * Get members by congress and state
   */
  getMembersByCongress: async (
    congress: string,
    stateCode: string,
    district?: string,
  ) => {
    try {
      let url = `${API_BASE_URL}/member/congress/${congress}/${stateCode}`;
      if (district) {
        url += `/${district}`;
      }

      const response = await axios.get(url, {
        params: {
          api_key: API_KEY,
          format: "json",
        },
      });
      return response.data.members;
    } catch (error) {
      console.error("Error fetching members by congress:", error);
      throw new Error("Failed to fetch congressional members for congress");
    }
  },

  /**
   * Get house vote data
   */
  getHouseVotes: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/house-vote`, {
        params: {
          api_key: API_KEY,
          format: "json",
          limit: 50,
        },
      });
      return response.data.houseRollCallVotes;
    } catch (error) {
      console.error("Error fetching house votes:", error);
      throw new Error("Failed to fetch house voting records");
    }
  },

  /**
   * Get house votes for a specific congress
   */
  getHouseVotesByCongress: async (congress: string) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/house-vote/${congress}`,
        {
          params: {
            api_key: API_KEY,
            format: "json",
            limit: 50,
          },
        },
      );
      return response.data.houseRollCallVotes;
    } catch (error) {
      console.error("Error fetching house votes by congress:", error);
      throw new Error("Failed to fetch house voting records for congress");
    }
  },

  /**
   * Get house votes for a specific congress and session
   */
  getHouseVotesBySession: async (congress: string, session: string) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/house-vote/${congress}/${session}`,
        {
          params: {
            api_key: API_KEY,
            format: "json",
            limit: 50,
          },
        },
      );
      return response.data.houseRollCallVotes;
    } catch (error) {
      console.error("Error fetching house votes by session:", error);
      throw new Error("Failed to fetch house voting records for session");
    }
  },
};

export default congressApi;
