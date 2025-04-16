import { 
  insertUserSchema, 
  type User, 
  type InsertUser, 
  type CongressMember, 
  type CongressMemberResponse, 
  type Vote, 
  type MemberVote, 
  type UserPreference,
  type AlignmentStats
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Congress member methods
  getCongressMembers(filters?: {
    chamber?: string;
    state?: string;
    party?: string;
  }): Promise<CongressMemberResponse[]>;
  getCongressMemberByBioguideId(bioguideId: string): Promise<CongressMemberResponse | undefined>;
  upsertCongressMember(member: CongressMemberResponse): Promise<void>;
  
  // Vote methods
  upsertVote(vote: Omit<Vote, "id">): Promise<number>;
  getVoteById(voteId: number): Promise<Vote | undefined>;
  getMemberVotes(bioguideId: string, offset?: number, limit?: number): Promise<any[]>;
  upsertMemberVote(memberVote: { congressMemberId: string; voteId: number; position: string }): Promise<void>;
  
  // User preference methods
  getUserPreferences(userId: number): Promise<UserPreference[]>;
  setUserPreference(userId: number, voteId: number, agreement: boolean, importance: number): Promise<UserPreference>;
  
  // Alignment methods
  getAlignmentStats(userId: number, bioguideId: string): Promise<AlignmentStats>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private congressMembers: Map<string, CongressMemberResponse>;
  private votes: Map<number, Vote>;
  private memberVotes: Map<string, { congressMemberId: string; voteId: number; position: string }>;
  private userPreferences: Map<string, UserPreference>;

  currentUserId: number;
  currentVoteId: number;
  currentPreferenceId: number;

  constructor() {
    this.users = new Map();
    this.congressMembers = new Map();
    this.votes = new Map();
    this.memberVotes = new Map();
    this.userPreferences = new Map();
    this.currentUserId = 1;
    this.currentVoteId = 1;
    this.currentPreferenceId = 1;

    // Add some demo data
    this.initDemoData();
  }

  // User methods
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

  // Congress member methods
  async getCongressMembers(filters?: {
    chamber?: string;
    state?: string;
    party?: string;
  }): Promise<CongressMemberResponse[]> {
    let members = Array.from(this.congressMembers.values());
    
    if (filters) {
      if (filters.chamber) {
        members = members.filter(m => m.chamber === filters.chamber);
      }
      if (filters.state) {
        members = members.filter(m => m.state === filters.state);
      }
      if (filters.party) {
        members = members.filter(m => m.party === filters.party);
      }
    }
    
    return members;
  }

  async getCongressMemberByBioguideId(bioguideId: string): Promise<CongressMemberResponse | undefined> {
    return this.congressMembers.get(bioguideId);
  }

  async upsertCongressMember(member: CongressMemberResponse): Promise<void> {
    this.congressMembers.set(member.bioguideId, member);
  }

  // Vote methods
  async upsertVote(vote: Omit<Vote, "id">): Promise<number> {
    // Check if vote with same billId already exists
    const existingVote = Array.from(this.votes.values()).find(v => v.billId === vote.billId);
    
    if (existingVote) {
      // Update existing vote
      const updatedVote = { ...existingVote, ...vote };
      this.votes.set(existingVote.id, updatedVote);
      return existingVote.id;
    } else {
      // Create new vote
      const id = this.currentVoteId++;
      const newVote = { id, ...vote };
      this.votes.set(id, newVote);
      return id;
    }
  }

  async getVoteById(voteId: number): Promise<Vote | undefined> {
    return this.votes.get(voteId);
  }

  async getMemberVotes(bioguideId: string, offset: number = 0, limit: number = 20): Promise<any[]> {
    // Get all member vote IDs
    const memberVoteEntries = Array.from(this.memberVotes.entries())
      .filter(([_, mv]) => mv.congressMemberId === bioguideId)
      .map(([_, mv]) => mv);
    
    // Get the full vote details for each ID
    const voteDetails = await Promise.all(
      memberVoteEntries
        .slice(offset, offset + limit)
        .map(async (mv) => {
          const vote = await this.getVoteById(mv.voteId);
          if (!vote) return null;
          
          return {
            ...vote,
            position: mv.position
          };
        })
    );
    
    // Filter out null values and sort by date (most recent first)
    return voteDetails
      .filter(v => v !== null)
      .sort((a, b) => {
        if (!a || !b) return 0;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
  }

  async upsertMemberVote(memberVote: { congressMemberId: string; voteId: number; position: string }): Promise<void> {
    const key = `${memberVote.congressMemberId}-${memberVote.voteId}`;
    this.memberVotes.set(key, memberVote);
  }

  // User preference methods
  async getUserPreferences(userId: number): Promise<UserPreference[]> {
    return Array.from(this.userPreferences.values())
      .filter(pref => pref.userId === userId);
  }

  async setUserPreference(userId: number, voteId: number, agreement: boolean, importance: number): Promise<UserPreference> {
    const key = `${userId}-${voteId}`;
    const existingPref = this.userPreferences.get(key);
    
    if (existingPref) {
      // Update existing preference
      const updatedPref = { ...existingPref, agreement, importance };
      this.userPreferences.set(key, updatedPref);
      return updatedPref;
    } else {
      // Create new preference
      const id = this.currentPreferenceId++;
      const newPref = { id, userId, voteId, agreement, importance };
      this.userPreferences.set(key, newPref);
      return newPref;
    }
  }

  // Alignment methods
  async getAlignmentStats(userId: number, bioguideId: string): Promise<AlignmentStats> {
    // Get user preferences
    const userPrefs = await this.getUserPreferences(userId);
    
    // No preferences means no alignment data
    if (userPrefs.length === 0) {
      return {
        overall: 0,
        byIssue: {},
        overTime: [],
        distribution: {
          strongAgreement: 0,
          agreement: 0,
          neutral: 0,
          disagreement: 0,
          strongDisagreement: 0
        }
      };
    }
    
    // Get vote IDs that the user has preferences for
    const voteIds = userPrefs.map(p => p.voteId);
    
    // Get member's votes for these vote IDs
    const memberVoteEntries = Array.from(this.memberVotes.entries())
      .filter(([_, mv]) => 
        mv.congressMemberId === bioguideId && 
        voteIds.includes(mv.voteId)
      )
      .map(([_, mv]) => mv);
    
    // Set up counters
    let alignedCount = 0;
    let totalCount = 0;
    const issueAlignments: Record<string, {aligned: number, total: number}> = {};
    const timeAlignments: Record<string, {aligned: number, total: number}> = {};
    const distribution = {
      strongAgreement: 0,
      agreement: 0,
      neutral: 0,
      disagreement: 0,
      strongDisagreement: 0
    };
    
    // Calculate alignment
    for (const memberVote of memberVoteEntries) {
      const userPref = userPrefs.find(p => p.voteId === memberVote.voteId);
      if (!userPref) continue;
      
      const vote = await this.getVoteById(memberVote.voteId);
      if (!vote) continue;
      
      // Determine if positions align
      const memberPosition = memberVote.position.toLowerCase();
      // Convert Yes/No positions to boolean for comparison
      const memberAgrees = memberPosition === 'yes';
      const aligned = (memberAgrees && userPref.agreement) || (!memberAgrees && !userPref.agreement);
      
      totalCount++;
      if (aligned) alignedCount++;
      
      // Track by issue category (using the bill title as a proxy)
      const issue = this.categorizeIssue(vote.billTitle);
      if (!issueAlignments[issue]) {
        issueAlignments[issue] = { aligned: 0, total: 0 };
      }
      issueAlignments[issue].total++;
      if (aligned) issueAlignments[issue].aligned++;
      
      // Track by time (month/year)
      const date = new Date(vote.date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!timeAlignments[monthYear]) {
        timeAlignments[monthYear] = { aligned: 0, total: 0 };
      }
      timeAlignments[monthYear].total++;
      if (aligned) timeAlignments[monthYear].aligned++;
      
      // Update distribution based on agreement and importance
      if (aligned) {
        if (userPref.importance >= 4) {
          distribution.strongAgreement++;
        } else {
          distribution.agreement++;
        }
      } else {
        if (userPref.importance >= 4) {
          distribution.strongDisagreement++;
        } else {
          distribution.disagreement++;
        }
      }
    }
    
    // Calculate percentage for overall alignment
    const overallAlignment = totalCount > 0 ? (alignedCount / totalCount) * 100 : 0;
    
    // Calculate percentages for issue alignments
    const byIssue: Record<string, number> = {};
    for (const [issue, counts] of Object.entries(issueAlignments)) {
      byIssue[issue] = counts.total > 0 ? (counts.aligned / counts.total) * 100 : 0;
    }
    
    // Prepare time-based alignment data
    const overTime = Object.entries(timeAlignments)
      .map(([date, counts]) => ({
        date,
        alignment: counts.total > 0 ? (counts.aligned / counts.total) * 100 : 0
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    return {
      overall: Math.round(overallAlignment),
      byIssue,
      overTime,
      distribution
    };
  }

  // Helper method to categorize bills into issue areas
  private categorizeIssue(billTitle: string): string {
    const title = billTitle.toLowerCase();
    if (title.includes('health') || title.includes('care') || title.includes('medical')) {
      return 'Healthcare';
    } else if (title.includes('econom') || title.includes('tax') || title.includes('budget') || title.includes('spending')) {
      return 'Economy';
    } else if (title.includes('environment') || title.includes('climate') || title.includes('energy')) {
      return 'Environment';
    } else if (title.includes('defense') || title.includes('military') || title.includes('security')) {
      return 'Defense';
    } else if (title.includes('immigra') || title.includes('border')) {
      return 'Immigration';
    } else if (title.includes('education') || title.includes('school') || title.includes('student')) {
      return 'Education';
    } else {
      return 'Other';
    }
  }

  // Initialize demo data for development
  private initDemoData() {
    // Demo user
    const user: User = { id: 1, username: 'demo', password: 'password' };
    this.users.set(1, user);

    // Demo congress members
    const members: CongressMemberResponse[] = [
      {
        bioguideId: 'A000123',
        name: 'Alexandria Ocasio-Cortez',
        party: 'D',
        state: 'NY',
        district: '14',
        chamber: 'house',
        termStart: '2019',
        imageUrl: undefined
      },
      {
        bioguideId: 'S000033',
        name: 'Bernie Sanders',
        party: 'I',
        state: 'VT',
        chamber: 'senate',
        termStart: '2007',
        imageUrl: undefined
      },
      {
        bioguideId: 'C000147',
        name: 'Ted Cruz',
        party: 'R',
        state: 'TX',
        chamber: 'senate',
        termStart: '2013',
        imageUrl: undefined
      },
      {
        bioguideId: 'P000197',
        name: 'Nancy Pelosi',
        party: 'D',
        state: 'CA',
        district: '11',
        chamber: 'house',
        termStart: '1987',
        imageUrl: undefined
      },
      {
        bioguideId: 'M000312',
        name: 'Kevin McCarthy',
        party: 'R',
        state: 'CA',
        district: '20',
        chamber: 'house',
        termStart: '2007',
        imageUrl: undefined
      }
    ];

    members.forEach(member => {
      this.congressMembers.set(member.bioguideId, member);
    });

    // Demo votes
    const votes: Omit<Vote, 'id'>[] = [
      {
        billId: 'hr1324-117',
        billTitle: 'Climate Action Now Act',
        billDescription: 'This bill requires the President to develop and update annually a plan for the United States to meet its nationally determined contribution under the Paris Agreement on climate change.',
        chamber: 'house',
        date: new Date('2023-05-12'),
        question: 'On Passage',
        result: 'Passed',
        url: 'https://www.congress.gov/bill/117th-congress/house-bill/1324'
      },
      {
        billId: 's386-117',
        billTitle: 'Infrastructure Investment Act',
        billDescription: 'A bill to provide funding for infrastructure projects, including transportation, energy, and broadband internet improvements.',
        chamber: 'senate',
        date: new Date('2023-04-28'),
        question: 'On Passage',
        result: 'Failed',
        url: 'https://www.congress.gov/bill/117th-congress/senate-bill/386'
      },
      {
        billId: 'hr8294-117',
        billTitle: 'Department of Defense Appropriations Act',
        billDescription: 'This bill provides FY2023 appropriations for the Department of Defense for military activities and programs.',
        chamber: 'house',
        date: new Date('2023-03-15'),
        question: 'On Passage',
        result: 'Passed',
        url: 'https://www.congress.gov/bill/117th-congress/house-bill/8294'
      }
    ];

    // Insert votes and create member votes
    votes.forEach(async (vote, index) => {
      const voteId = this.currentVoteId++;
      this.votes.set(voteId, { ...vote, id: voteId });

      // Demo voting positions
      const positions = [
        { bioguideId: 'A000123', position: index === 0 ? 'Yes' : (index === 1 ? 'No' : 'Yes') },
        { bioguideId: 'S000033', position: index === 0 ? 'Yes' : (index === 1 ? 'Yes' : 'No') },
        { bioguideId: 'C000147', position: index === 0 ? 'No' : (index === 1 ? 'No' : 'Yes') },
        { bioguideId: 'P000197', position: index === 0 ? 'Yes' : (index === 1 ? 'Yes' : 'Yes') },
        { bioguideId: 'M000312', position: index === 0 ? 'No' : (index === 1 ? 'No' : 'Yes') }
      ];

      positions.forEach(pos => {
        const key = `${pos.bioguideId}-${voteId}`;
        this.memberVotes.set(key, {
          congressMemberId: pos.bioguideId,
          voteId,
          position: pos.position
        });
      });
    });

    // Demo user preferences
    const preferences: Omit<UserPreference, 'id'>[] = [
      { userId: 1, voteId: 1, agreement: true, importance: 5 },
      { userId: 1, voteId: 2, agreement: true, importance: 4 },
      { userId: 1, voteId: 3, agreement: false, importance: 5 }
    ];

    preferences.forEach(pref => {
      const id = this.currentPreferenceId++;
      const key = `${pref.userId}-${pref.voteId}`;
      this.userPreferences.set(key, { ...pref, id });
    });
  }
}

export const storage = new MemStorage();
