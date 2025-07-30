import { 
  users, type User, type InsertUser,
  representatives, type Representative, type InsertRepresentative,
  votes, type Vote, type InsertVote,
  memberVotes, type MemberVote, type InsertMemberVote,
  userPreferences, type UserPreference, type InsertUserPreference,
  type AlignmentScore
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, ilike, gte, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Representative operations
  getRepresentatives(filters?: { state?: string, chamber?: string, name?: string }): Promise<Representative[]>;
  getRepresentative(id: number): Promise<Representative | undefined>;
  getRepresentativeByMemberId(memberId: string): Promise<Representative | undefined>;
  createRepresentative(representative: InsertRepresentative): Promise<Representative>;
  
  // Vote operations
  getVotes(filters?: { category?: string, timeframe?: string }): Promise<Vote[]>;
  getVote(id: number): Promise<Vote | undefined>;
  getVoteByBillId(billId: string): Promise<Vote | undefined>;
  createVote(vote: InsertVote): Promise<Vote>;
  
  // Member vote operations
  getMemberVotes(memberId: string): Promise<MemberVote[]>;
  createMemberVote(memberVote: InsertMemberVote): Promise<MemberVote>;
  
  // User preference operations
  getUserPreferences(userId: number): Promise<UserPreference[]>;
  getUserPreference(userId: number, billId: string): Promise<UserPreference | undefined>;
  createUserPreference(preference: InsertUserPreference): Promise<UserPreference>;
  updateUserPreference(id: number, preference: Partial<InsertUserPreference>): Promise<UserPreference>;
  
  // Alignment score calculation
  calculateAlignmentScore(userId: number, memberId: string): Promise<AlignmentScore>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private representatives: Map<number, Representative>;
  private votes: Map<number, Vote>;
  private memberVotes: Map<number, MemberVote>;
  private userPreferences: Map<number, UserPreference>;
  
  private userCurrentId: number;
  private representativeCurrentId: number;
  private voteCurrentId: number;
  private memberVoteCurrentId: number;
  private userPreferenceCurrentId: number;

  constructor() {
    this.users = new Map();
    this.representatives = new Map();
    this.votes = new Map();
    this.memberVotes = new Map();
    this.userPreferences = new Map();
    
    this.userCurrentId = 1;
    this.representativeCurrentId = 1;
    this.voteCurrentId = 1;
    this.memberVoteCurrentId = 1;
    this.userPreferenceCurrentId = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Representative operations
  async getRepresentatives(filters?: { state?: string, chamber?: string, name?: string }): Promise<Representative[]> {
    let representatives = Array.from(this.representatives.values());
    
    if (filters) {
      if (filters.state) {
        representatives = representatives.filter(rep => rep.state === filters.state);
      }
      
      if (filters.chamber) {
        representatives = representatives.filter(rep => rep.chamber === filters.chamber);
      }
      
      if (filters.name) {
        const searchTerm = filters.name.toLowerCase();
        representatives = representatives.filter(rep => 
          rep.firstName.toLowerCase().includes(searchTerm) || 
          rep.lastName.toLowerCase().includes(searchTerm)
        );
      }
    }
    
    return representatives;
  }
  
  async getRepresentative(id: number): Promise<Representative | undefined> {
    return this.representatives.get(id);
  }
  
  async getRepresentativeByMemberId(memberId: string): Promise<Representative | undefined> {
    return Array.from(this.representatives.values()).find(
      (rep) => rep.memberId === memberId,
    );
  }
  
  async createRepresentative(insertRepresentative: InsertRepresentative): Promise<Representative> {
    const id = this.representativeCurrentId++;
    const representative: Representative = { 
      ...insertRepresentative, 
      id,
      district: insertRepresentative.district ?? null,
      officeStart: insertRepresentative.officeStart ?? null,
      profileImageUrl: insertRepresentative.profileImageUrl ?? null
    };
    this.representatives.set(id, representative);
    return representative;
  }
  
  // Vote operations
  async getVotes(filters?: { category?: string, timeframe?: string }): Promise<Vote[]> {
    let votes = Array.from(this.votes.values());
    
    if (filters) {
      if (filters.category && filters.category !== 'All Categories') {
        votes = votes.filter(vote => vote.category === filters.category);
      }
      
      if (filters.timeframe) {
        const now = new Date();
        let startDate: Date;
        
        switch (filters.timeframe) {
          case 'Last 30 Days':
            startDate = new Date();
            startDate.setDate(now.getDate() - 30);
            votes = votes.filter(vote => vote.voteDate >= startDate);
            break;
          case 'Last 90 Days':
            startDate = new Date();
            startDate.setDate(now.getDate() - 90);
            votes = votes.filter(vote => vote.voteDate >= startDate);
            break;
          case 'This Year':
            startDate = new Date(now.getFullYear(), 0, 1);
            votes = votes.filter(vote => vote.voteDate >= startDate);
            break;
        }
      }
    }
    
    // Sort by date (newest first)
    return votes.sort((a, b) => b.voteDate.getTime() - a.voteDate.getTime());
  }
  
  async getVote(id: number): Promise<Vote | undefined> {
    return this.votes.get(id);
  }
  
  async getVoteByBillId(billId: string): Promise<Vote | undefined> {
    return Array.from(this.votes.values()).find(
      (vote) => vote.billId === billId,
    );
  }
  
  async createVote(insertVote: InsertVote): Promise<Vote> {
    const id = this.voteCurrentId++;
    const vote: Vote = { 
      ...insertVote, 
      id,
      category: insertVote.category ?? null
    };
    this.votes.set(id, vote);
    return vote;
  }
  
  // Member vote operations
  async getMemberVotes(memberId: string): Promise<MemberVote[]> {
    return Array.from(this.memberVotes.values()).filter(
      (memberVote) => memberVote.memberId === memberId,
    );
  }
  
  async createMemberVote(insertMemberVote: InsertMemberVote): Promise<MemberVote> {
    const id = this.memberVoteCurrentId++;
    const memberVote: MemberVote = { ...insertMemberVote, id };
    this.memberVotes.set(id, memberVote);
    return memberVote;
  }
  
  // User preference operations
  async getUserPreferences(userId: number): Promise<UserPreference[]> {
    return Array.from(this.userPreferences.values()).filter(
      (preference) => preference.userId === userId,
    );
  }
  
  async getUserPreference(userId: number, billId: string): Promise<UserPreference | undefined> {
    return Array.from(this.userPreferences.values()).find(
      (preference) => preference.userId === userId && preference.billId === billId,
    );
  }
  
  async createUserPreference(insertPreference: InsertUserPreference): Promise<UserPreference> {
    const id = this.userPreferenceCurrentId++;
    const preference: UserPreference = { ...insertPreference, id };
    this.userPreferences.set(id, preference);
    return preference;
  }
  
  async updateUserPreference(id: number, updates: Partial<InsertUserPreference>): Promise<UserPreference> {
    const preference = this.userPreferences.get(id);
    if (!preference) {
      throw new Error(`User preference with id ${id} not found`);
    }
    
    const updatedPreference = { ...preference, ...updates };
    this.userPreferences.set(id, updatedPreference);
    return updatedPreference;
  }
  
  // Alignment score calculation
  async calculateAlignmentScore(userId: number, memberId: string): Promise<AlignmentScore> {
    const memberVotes = await this.getMemberVotes(memberId);
    const userPreferences = await this.getUserPreferences(userId);
    
    // Initialize alignment score
    const alignmentScore: AlignmentScore = {
      total: 0,
      agree: 0,
      disagree: 0,
      percentage: 0,
      byImportance: {
        high: { total: 0, agree: 0, disagree: 0, percentage: 0 },
        medium: { total: 0, agree: 0, disagree: 0, percentage: 0 },
        low: { total: 0, agree: 0, disagree: 0, percentage: 0 }
      }
    };
    
    // Filter user preferences to only include those with corresponding member votes
    const memberVoteBillIds = memberVotes.map(mv => mv.billId);
    const relevantPreferences = userPreferences.filter(pref => 
      memberVoteBillIds.includes(pref.billId)
    );
    
    if (relevantPreferences.length === 0) {
      return alignmentScore;
    }
    
    alignmentScore.total = relevantPreferences.length;
    
    // Calculate alignment for each preference
    for (const pref of relevantPreferences) {
      const memberVote = memberVotes.find(mv => mv.billId === pref.billId);
      if (!memberVote) continue;
      
      // Check if user agrees with member's vote
      // "Yes" vote and agreement=true or "No" vote and agreement=false
      const memberVotedYes = memberVote.position === 'Yes';
      const userAgrees = pref.agreement;
      
      const isAligned = (memberVotedYes && userAgrees) || (!memberVotedYes && !userAgrees);
      
      if (isAligned) {
        alignmentScore.agree++;
      } else {
        alignmentScore.disagree++;
      }
      
      // Update by importance
      const importanceLevel = pref.importance === 3 ? 'high' : pref.importance === 2 ? 'medium' : 'low';
      
      alignmentScore.byImportance[importanceLevel].total++;
      if (isAligned) {
        alignmentScore.byImportance[importanceLevel].agree++;
      } else {
        alignmentScore.byImportance[importanceLevel].disagree++;
      }
    }
    
    // Calculate percentages
    alignmentScore.percentage = Math.round((alignmentScore.agree / alignmentScore.total) * 100);
    
    for (const level of ['high', 'medium', 'low'] as const) {
      const { total, agree } = alignmentScore.byImportance[level];
      if (total > 0) {
        alignmentScore.byImportance[level].percentage = Math.round((agree / total) * 100);
      }
    }
    
    return alignmentScore;
  }
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Representative operations
  async getRepresentatives(filters?: { state?: string, chamber?: string, name?: string }): Promise<Representative[]> {
    const conditions = [];

    if (filters?.state) {
      conditions.push(eq(representatives.state, filters.state));
    }

    if (filters?.chamber) {
      conditions.push(eq(representatives.chamber, filters.chamber));
    }

    if (filters?.name) {
      const searchTerm = `%${filters.name.toLowerCase()}%`;
      conditions.push(
        or(
          ilike(representatives.firstName, searchTerm),
          ilike(representatives.lastName, searchTerm)
        )
      );
    }

    if (conditions.length > 0) {
      return await db.select().from(representatives).where(and(...conditions));
    }

    return await db.select().from(representatives);
  }

  async getRepresentative(id: number): Promise<Representative | undefined> {
    const [representative] = await db.select().from(representatives).where(eq(representatives.id, id));
    return representative || undefined;
  }

  async getRepresentativeByMemberId(memberId: string): Promise<Representative | undefined> {
    const [representative] = await db.select().from(representatives).where(eq(representatives.memberId, memberId));
    return representative || undefined;
  }

  async createRepresentative(insertRepresentative: InsertRepresentative): Promise<Representative> {
    const [representative] = await db
      .insert(representatives)
      .values(insertRepresentative)
      .returning();
    return representative;
  }

  // Vote operations
  async getVotes(filters?: { category?: string, timeframe?: string }): Promise<Vote[]> {
    const conditions = [];

    if (filters?.category && filters.category !== 'All Categories') {
      conditions.push(eq(votes.category, filters.category));
    }

    if (filters?.timeframe) {
      const now = new Date();
      let startDate: Date;

      switch (filters.timeframe) {
        case 'Last 30 Days':
          startDate = new Date();
          startDate.setDate(now.getDate() - 30);
          conditions.push(gte(votes.voteDate, startDate));
          break;
        case 'Last 90 Days':
          startDate = new Date();
          startDate.setDate(now.getDate() - 90);
          conditions.push(gte(votes.voteDate, startDate));
          break;
        case 'This Year':
          startDate = new Date(now.getFullYear(), 0, 1);
          conditions.push(gte(votes.voteDate, startDate));
          break;
      }
    }

    if (conditions.length > 0) {
      // Sort by date (newest first)
      return await db.select().from(votes).where(and(...conditions)).orderBy(desc(votes.voteDate));
    }

    // Sort by date (newest first)
    return await db.select().from(votes).orderBy(desc(votes.voteDate));
  }

  async getVote(id: number): Promise<Vote | undefined> {
    const [vote] = await db.select().from(votes).where(eq(votes.id, id));
    return vote || undefined;
  }

  async getVoteByBillId(billId: string): Promise<Vote | undefined> {
    const [vote] = await db.select().from(votes).where(eq(votes.billId, billId));
    return vote || undefined;
  }

  async createVote(insertVote: InsertVote): Promise<Vote> {
    const [vote] = await db
      .insert(votes)
      .values(insertVote)
      .returning();
    return vote;
  }

  // Member vote operations
  async getMemberVotes(memberId: string): Promise<MemberVote[]> {
    return await db.select().from(memberVotes).where(eq(memberVotes.memberId, memberId));
  }

  async createMemberVote(insertMemberVote: InsertMemberVote): Promise<MemberVote> {
    const [memberVote] = await db
      .insert(memberVotes)
      .values(insertMemberVote)
      .returning();
    return memberVote;
  }

  // User preference operations
  async getUserPreferences(userId: number): Promise<UserPreference[]> {
    return await db.select().from(userPreferences).where(eq(userPreferences.userId, userId));
  }

  async getUserPreference(userId: number, billId: string): Promise<UserPreference | undefined> {
    const [preference] = await db.select().from(userPreferences).where(
      and(eq(userPreferences.userId, userId), eq(userPreferences.billId, billId))
    );
    return preference || undefined;
  }

  async createUserPreference(insertPreference: InsertUserPreference): Promise<UserPreference> {
    const [preference] = await db
      .insert(userPreferences)
      .values(insertPreference)
      .returning();
    return preference;
  }

  async updateUserPreference(id: number, updates: Partial<InsertUserPreference>): Promise<UserPreference> {
    const [preference] = await db
      .update(userPreferences)
      .set(updates)
      .where(eq(userPreferences.id, id))
      .returning();
    
    if (!preference) {
      throw new Error(`User preference with id ${id} not found`);
    }
    
    return preference;
  }

  // Alignment score calculation
  async calculateAlignmentScore(userId: number, memberId: string): Promise<AlignmentScore> {
    const memberVotesData = await this.getMemberVotes(memberId);
    const userPreferencesData = await this.getUserPreferences(userId);
    
    // Initialize alignment score
    const alignmentScore: AlignmentScore = {
      total: 0,
      agree: 0,
      disagree: 0,
      percentage: 0,
      byImportance: {
        high: { total: 0, agree: 0, disagree: 0, percentage: 0 },
        medium: { total: 0, agree: 0, disagree: 0, percentage: 0 },
        low: { total: 0, agree: 0, disagree: 0, percentage: 0 }
      }
    };
    
    // Filter user preferences to only include those with corresponding member votes
    const memberVoteBillIds = memberVotesData.map(mv => mv.billId);
    const relevantPreferences = userPreferencesData.filter(pref => 
      memberVoteBillIds.includes(pref.billId)
    );
    
    if (relevantPreferences.length === 0) {
      return alignmentScore;
    }
    
    alignmentScore.total = relevantPreferences.length;
    
    // Calculate alignment for each preference
    for (const pref of relevantPreferences) {
      const memberVote = memberVotesData.find(mv => mv.billId === pref.billId);
      if (!memberVote) continue;
      
      // Check if user agrees with member's vote
      // "Yes" vote and agreement=true or "No" vote and agreement=false
      const memberVotedYes = memberVote.position === 'Yes';
      const userAgrees = pref.agreement;
      
      const isAligned = (memberVotedYes && userAgrees) || (!memberVotedYes && !userAgrees);
      
      if (isAligned) {
        alignmentScore.agree++;
      } else {
        alignmentScore.disagree++;
      }
      
      // Update by importance
      const importanceLevel = pref.importance === 3 ? 'high' : pref.importance === 2 ? 'medium' : 'low';
      
      alignmentScore.byImportance[importanceLevel].total++;
      if (isAligned) {
        alignmentScore.byImportance[importanceLevel].agree++;
      } else {
        alignmentScore.byImportance[importanceLevel].disagree++;
      }
    }
    
    // Calculate percentages
    alignmentScore.percentage = Math.round((alignmentScore.agree / alignmentScore.total) * 100);
    
    for (const level of ['high', 'medium', 'low'] as const) {
      const { total, agree } = alignmentScore.byImportance[level];
      if (total > 0) {
        alignmentScore.byImportance[level].percentage = Math.round((agree / total) * 100);
      }
    }
    
    return alignmentScore;
  }
}

export const storage = new DatabaseStorage();
