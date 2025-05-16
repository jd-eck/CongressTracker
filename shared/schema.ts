import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Original user schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Congressional member schema
export const representatives = pgTable("representatives", {
  id: serial("id").primaryKey(),
  memberId: text("member_id").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  chamber: text("chamber").notNull(), // 'senate' or 'house'
  party: text("party").notNull(),
  state: text("state").notNull(),
  district: text("district"),
  officeStart: text("office_start"),
  profileImageUrl: text("profile_image_url"),
});

export const insertRepresentativeSchema = createInsertSchema(representatives).omit({
  id: true,
});

export type InsertRepresentative = z.infer<typeof insertRepresentativeSchema>;
export type Representative = typeof representatives.$inferSelect;

// Bills/Votes schema
export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  billId: text("bill_id").notNull(),
  billTitle: text("bill_title").notNull(),
  billDescription: text("bill_description").notNull(),
  category: text("category"),
  voteDate: timestamp("vote_date").notNull(),
});

export const insertVoteSchema = createInsertSchema(votes).omit({
  id: true,
});

export type InsertVote = z.infer<typeof insertVoteSchema>;
export type Vote = typeof votes.$inferSelect;

// Member votes on bills
export const memberVotes = pgTable("member_votes", {
  id: serial("id").primaryKey(),
  memberId: text("member_id").notNull(),
  billId: text("bill_id").notNull(),
  position: text("position").notNull(), // 'Yes', 'No', 'Present', 'Not Voting'
});

export const insertMemberVoteSchema = createInsertSchema(memberVotes).omit({
  id: true,
});

export type InsertMemberVote = z.infer<typeof insertMemberVoteSchema>;
export type MemberVote = typeof memberVotes.$inferSelect;

// User preferences on votes
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  billId: text("bill_id").notNull(),
  agreement: boolean("agreement").notNull(), // true if user agrees with the vote
  importance: integer("importance").notNull(), // 1 = low, 2 = medium, 3 = high
});

export const insertUserPreferenceSchema = createInsertSchema(userPreferences).omit({
  id: true,
});

export type InsertUserPreference = z.infer<typeof insertUserPreferenceSchema>;
export type UserPreference = typeof userPreferences.$inferSelect;

// API responses for Congress API
export type CongressMember = {
  id: string;
  title: string;
  short_title: string;
  first_name: string;
  last_name: string;
  state: string;
  party: string;
  district?: string;
  chamber: string;
  seniority: string;
  next_election?: string;
  office?: string;
  phone?: string;
  url?: string;
  twitter_account?: string;
  facebook_account?: string;
  youtube_account?: string;
  last_updated: string;
};

export type CongressVote = {
  bill_id: string;
  bill_title: string;
  bill_description: string;
  vote_date: string;
  chamber: string;
  category: string;
  result: string;
  yes: number;
  no: number;
  not_voting: number;
  positions: Array<{
    member_id: string;
    vote_position: string;
  }>;
};

export type AlignmentScore = {
  total: number;
  agree: number;
  disagree: number;
  percentage: number;
  byImportance: {
    high: {
      total: number;
      agree: number;
      disagree: number;
      percentage: number;
    };
    medium: {
      total: number;
      agree: number;
      disagree: number;
      percentage: number;
    };
    low: {
      total: number;
      agree: number;
      disagree: number;
      percentage: number;
    };
  };
};
