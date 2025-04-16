import { CongressMemberResponse, VoteResponse, AlignmentStats } from "@shared/schema";

// Base API endpoints
const API_ENDPOINTS = {
  CONGRESS_MEMBERS: '/api/congress-members',
  USER_PREFERENCES: '/api/user-preferences',
  ALIGNMENT: '/api/alignment',
};

// Get all congress members with optional filters
export async function getCongressMembers(filters?: {
  chamber?: string;
  state?: string;
  party?: string;
}): Promise<CongressMemberResponse[]> {
  let url = API_ENDPOINTS.CONGRESS_MEMBERS;
  
  // Add query parameters if filters are provided
  if (filters) {
    const params = new URLSearchParams();
    if (filters.chamber) params.append('chamber', filters.chamber);
    if (filters.state) params.append('state', filters.state);
    if (filters.party) params.append('party', filters.party);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
  }
  
  const response = await fetch(url, { credentials: 'include' });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch congress members: ${response.statusText}`);
  }
  
  return response.json();
}

// Get a specific congress member by ID
export async function getCongressMember(bioguideId: string): Promise<CongressMemberResponse> {
  const response = await fetch(`${API_ENDPOINTS.CONGRESS_MEMBERS}/${bioguideId}`, {
    credentials: 'include'
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch congress member: ${response.statusText}`);
  }
  
  return response.json();
}

// Get voting records for a congress member
export async function getMemberVotes(bioguideId: string, offset = 0, limit = 10): Promise<VoteResponse[]> {
  const response = await fetch(
    `${API_ENDPOINTS.CONGRESS_MEMBERS}/${bioguideId}/votes?offset=${offset}&limit=${limit}`,
    { credentials: 'include' }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch voting records: ${response.statusText}`);
  }
  
  return response.json();
}

// Get user preferences
export async function getUserPreferences(userId: number): Promise<any[]> {
  const response = await fetch(`${API_ENDPOINTS.USER_PREFERENCES}/${userId}`, {
    credentials: 'include'
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch user preferences: ${response.statusText}`);
  }
  
  return response.json();
}

// Set user preference for a vote
export async function setUserPreference(
  userId: number,
  voteId: number,
  agreement: boolean,
  importance: number
): Promise<any> {
  const response = await fetch(API_ENDPOINTS.USER_PREFERENCES, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userId, voteId, agreement, importance }),
    credentials: 'include'
  });
  
  if (!response.ok) {
    throw new Error(`Failed to set user preference: ${response.statusText}`);
  }
  
  return response.json();
}

// Get alignment stats between user and congress member
export async function getAlignmentStats(userId: number, bioguideId: string): Promise<AlignmentStats> {
  const response = await fetch(`${API_ENDPOINTS.ALIGNMENT}/${userId}/${bioguideId}`, {
    credentials: 'include'
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch alignment stats: ${response.statusText}`);
  }
  
  return response.json();
}
