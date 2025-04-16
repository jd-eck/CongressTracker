import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User preferences for each bill/vote
export const userVotePreferences = pgTable("user_vote_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"), // Placeholder for future auth implementation
  billId: text("bill_id").notNull(),
  congressId: text("congress_id").notNull(),
  memberVote: text("member_vote").notNull(), // 'Yes', 'No', etc.
  userVote: text("user_vote").notNull(), // 'Yes', 'No'
  importance: integer("importance").notNull(), // 1-5 star rating
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Recent representatives that the user has viewed
export const recentReps = pgTable("recent_reps", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"), // Placeholder for future auth implementation
  memberId: text("member_id").notNull(), // ProPublica ID
  memberName: text("member_name").notNull(),
  chamber: text("chamber").notNull(), // 'house' or 'senate'
  state: text("state").notNull(),
  district: text("district"),
  party: text("party").notNull(),
  viewedAt: timestamp("viewed_at").defaultNow(),
});

// Original schema from template (kept for compatibility)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Schemas for insert operations
export const insertUserVotePreferenceSchema = createInsertSchema(userVotePreferences).omit({
  id: true,
  createdAt: true,
});

export const insertRecentRepSchema = createInsertSchema(recentReps).omit({
  id: true,
  viewedAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

// Types for database operations
export type InsertUserVotePreference = z.infer<typeof insertUserVotePreferenceSchema>;
export type UserVotePreference = typeof userVotePreferences.$inferSelect;

export type InsertRecentRep = z.infer<typeof insertRecentRepSchema>;
export type RecentRep = typeof recentReps.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// API response types
export type CongressMember = {
  id: string;
  name: string;
  first_name: string;
  last_name: string;
  party: string;
  state: string;
  district?: string;
  chamber: 'house' | 'senate';
  role: string;
  office?: string;
  phone?: string;
  url?: string;
  seniority?: string;
  next_election?: string;
};

export type Bill = {
  bill_id: string;
  bill_slug: string;
  congress: string;
  number: string;
  title: string;
  short_title: string;
  sponsor_name: string;
  sponsor_id: string;
  introduced_date: string;
  committees: string;
  latest_major_action: string;
  latest_major_action_date: string;
  house_passage?: string;
  senate_passage?: string;
  summary?: string;
  primary_subject?: string;
};

export type Vote = {
  vote_id: string;
  chamber: string;
  congress: string;
  bill: {
    bill_id: string;
    number: string;
    bill_title: string;
  };
  question: string;
  description: string;
  vote_type: string;
  date: string;
  time: string;
  result: string;
  total_yes: number;
  total_no: number;
  total_not_voting: number;
  democratic: {
    yes: number;
    no: number;
    not_voting: number;
  };
  republican: {
    yes: number;
    no: number;
    not_voting: number;
  };
  independent: {
    yes: number;
    no: number;
    not_voting: number;
  };
};

export type MemberVote = {
  member_id: string;
  vote_id: string;
  bill_id: string;
  position: string; // 'Yes', 'No', 'Not Voting', etc.
  congress: string;
  chamber: string;
  date: string;
  question: string;
  description: string;
  result: string;
  bill: {
    bill_id: string;
    number: string;
    bill_title: string;
    latest_action: string;
  };
};

export type AlignmentSummary = {
  totalVotes: number;
  totalRated: number;
  matchCount: number;
  alignmentScore: number;
  importanceBreakdown: {
    [key: number]: {
      total: number;
      aligned: number;
      score: number;
    };
  };
  policyBreakdown?: {
    [key: string]: {
      total: number;
      aligned: number;
      score: number;
    };
  };
};
