import {
  UserVotePreference,
  InsertUserVotePreference,
  RecentRep,
  InsertRecentRep,
  User,
  InsertUser,
  AlignmentSummary,
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User methods (from template)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Vote preference methods
  getUserVotePreferences(userId: number): Promise<UserVotePreference[]>;
  getUserVotePreferenceForBill(userId: number, billId: string, congressId: string): Promise<UserVotePreference | undefined>;
  saveUserVotePreference(preference: InsertUserVotePreference): Promise<UserVotePreference>;
  updateUserVotePreference(id: number, preference: Partial<InsertUserVotePreference>): Promise<UserVotePreference | undefined>;
  deleteUserVotePreference(id: number): Promise<boolean>;

  // Recent representatives methods
  getRecentReps(userId: number, limit?: number): Promise<RecentRep[]>;
  addRecentRep(rep: InsertRecentRep): Promise<RecentRep>;
  deleteRecentRep(id: number): Promise<boolean>;

  // Alignment calculation methods
  calculateAlignmentSummary(userId: number, memberId: string): Promise<AlignmentSummary>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private userVotePreferences: Map<number, UserVotePreference>;
  private recentReps: Map<number, RecentRep>;
  private currentUserId: number;
  private currentPrefId: number;
  private currentRepId: number;

  constructor() {
    this.users = new Map();
    this.userVotePreferences = new Map();
    this.recentReps = new Map();
    this.currentUserId = 1;
    this.currentPrefId = 1;
    this.currentRepId = 1;
    
    // Create a default user for unauthenticated operations
    this.createUser({
      username: "guest",
      password: "guest",
    });
  }

  // User methods (from template)
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Vote preference methods
  async getUserVotePreferences(userId: number): Promise<UserVotePreference[]> {
    return Array.from(this.userVotePreferences.values()).filter(
      (pref) => pref.userId === userId,
    );
  }

  async getUserVotePreferenceForBill(userId: number, billId: string, congressId: string): Promise<UserVotePreference | undefined> {
    return Array.from(this.userVotePreferences.values()).find(
      (pref) => pref.userId === userId && pref.billId === billId && pref.congressId === congressId,
    );
  }

  async saveUserVotePreference(preference: InsertUserVotePreference): Promise<UserVotePreference> {
    // Check if there's an existing preference
    const existing = await this.getUserVotePreferenceForBill(
      preference.userId, 
      preference.billId, 
      preference.congressId
    );
    
    if (existing) {
      return this.updateUserVotePreference(existing.id, preference) as Promise<UserVotePreference>;
    }

    const id = this.currentPrefId++;
    const timestamp = new Date();
    const newPreference: UserVotePreference = { 
      ...preference, 
      id, 
      createdAt: timestamp 
    };
    
    this.userVotePreferences.set(id, newPreference);
    return newPreference;
  }

  async updateUserVotePreference(id: number, preference: Partial<InsertUserVotePreference>): Promise<UserVotePreference | undefined> {
    const existing = this.userVotePreferences.get(id);
    
    if (!existing) {
      return undefined;
    }
    
    const updated: UserVotePreference = { 
      ...existing, 
      ...preference 
    };
    
    this.userVotePreferences.set(id, updated);
    return updated;
  }

  async deleteUserVotePreference(id: number): Promise<boolean> {
    return this.userVotePreferences.delete(id);
  }

  // Recent representatives methods
  async getRecentReps(userId: number, limit = 5): Promise<RecentRep[]> {
    return Array.from(this.recentReps.values())
      .filter((rep) => rep.userId === userId)
      .sort((a, b) => b.viewedAt.getTime() - a.viewedAt.getTime())
      .slice(0, limit);
  }

  async addRecentRep(rep: InsertRecentRep): Promise<RecentRep> {
    // Find if this rep is already in recent list
    const existing = Array.from(this.recentReps.values()).find(
      (r) => r.userId === rep.userId && r.memberId === rep.memberId
    );
    
    if (existing) {
      // Update the viewedAt timestamp
      const updated: RecentRep = { 
        ...existing, 
        viewedAt: new Date() 
      };
      this.recentReps.set(existing.id, updated);
      return updated;
    }
    
    const id = this.currentRepId++;
    const timestamp = new Date();
    const newRep: RecentRep = { 
      ...rep, 
      id, 
      viewedAt: timestamp 
    };
    
    this.recentReps.set(id, newRep);
    
    // Limit each user to 5 recent reps
    const userReps = await this.getRecentReps(rep.userId);
    if (userReps.length > 5) {
      // Delete the oldest one
      const oldest = userReps[userReps.length - 1];
      await this.deleteRecentRep(oldest.id);
    }
    
    return newRep;
  }

  async deleteRecentRep(id: number): Promise<boolean> {
    return this.recentReps.delete(id);
  }

  // Alignment calculation methods
  async calculateAlignmentSummary(userId: number, memberId: string): Promise<AlignmentSummary> {
    const userPreferences = await this.getUserVotePreferences(userId);
    
    // Filter preferences that have matching member votes
    const relevantPreferences = userPreferences.filter(pref => 
      pref.memberVote !== null && pref.memberVote !== 'Present' && pref.memberVote !== 'Not Voting'
    );
    
    if (relevantPreferences.length === 0) {
      return {
        totalVotes: 0,
        totalRated: 0,
        matchCount: 0,
        alignmentScore: 0,
        importanceBreakdown: {},
      };
    }
    
    let matchCount = 0;
    const importanceBreakdown: Record<number, { total: number; aligned: number; score: number }> = {};
    
    // Initialize importance breakdown buckets
    for (let i = 1; i <= 5; i++) {
      importanceBreakdown[i] = { total: 0, aligned: 0, score: 0 };
    }
    
    // Calculate alignment
    for (const pref of relevantPreferences) {
      const isMatch = 
        (pref.memberVote === 'Yes' && pref.userVote === 'Yes') || 
        (pref.memberVote === 'No' && pref.userVote === 'No');
      
      importanceBreakdown[pref.importance].total++;
      
      if (isMatch) {
        matchCount++;
        importanceBreakdown[pref.importance].aligned++;
      }
    }
    
    // Calculate scores for each importance level
    for (let i = 1; i <= 5; i++) {
      const bucket = importanceBreakdown[i];
      bucket.score = bucket.total > 0 ? (bucket.aligned / bucket.total) * 100 : 0;
    }
    
    const alignmentScore = relevantPreferences.length > 0 
      ? (matchCount / relevantPreferences.length) * 100 
      : 0;
    
    return {
      totalVotes: relevantPreferences.length,
      totalRated: relevantPreferences.length,
      matchCount,
      alignmentScore,
      importanceBreakdown,
    };
  }
}

export const storage = new MemStorage();
