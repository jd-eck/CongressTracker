// This file contains additional types not defined in the schema

// State for filtering congress members
export interface CongressMemberFilters {
  chamber?: string;
  state?: string;
  party?: string;
}

// Enhanced vote type that includes user preference data
export interface EnhancedVote {
  id: number;
  billId: string;
  billTitle: string;
  billDescription?: string;
  chamber: string;
  date: string;
  question?: string;
  result: string;
  url?: string;
  position: string;
  userPreference?: {
    agreement: boolean;
    importance: number;
  };
}

// Enum for position types
export enum VotePosition {
  Yes = 'Yes',
  No = 'No',
  Present = 'Present',
  NotVoting = 'Not Voting'
}

// Enum for importance levels
export enum ImportanceLevel {
  NotImportant = 1,
  LowImportance = 2,
  Neutral = 3,
  Important = 4,
  VeryImportant = 5
}
