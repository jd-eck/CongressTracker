import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
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

// Congress member schema
export const congressMembers = pgTable("congress_members", {
  id: serial("id").primaryKey(),
  bioguideId: text("bioguide_id").notNull().unique(), // Official Congress API ID
  name: text("name").notNull(),
  party: text("party").notNull(), // D, R, I, etc.
  state: text("state").notNull(),
  district: text("district"), // Null for senators
  chamber: text("chamber").notNull(), // senate or house
  termStart: text("term_start"), // When they started serving
  imageUrl: text("image_url")
});

export const insertCongressMemberSchema = createInsertSchema(congressMembers).omit({
  id: true
});

export type InsertCongressMember = z.infer<typeof insertCongressMemberSchema>;
export type CongressMember = typeof congressMembers.$inferSelect;

// Vote schema
export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  billId: text("bill_id").notNull(), // e.g., "hr3-117" (bill number and congress)
  billTitle: text("bill_title").notNull(),
  billDescription: text("bill_description"),
  chamber: text("chamber").notNull(), // "house" or "senate"
  date: timestamp("date").notNull(),
  question: text("question"), // What was being voted on
  result: text("result").notNull(), // "Passed" or "Failed"
  url: text("url") // Link to more information
});

export const insertVoteSchema = createInsertSchema(votes).omit({
  id: true
});

export type InsertVote = z.infer<typeof insertVoteSchema>;
export type Vote = typeof votes.$inferSelect;

// Member Vote schema (how each member voted)
export const memberVotes = pgTable("member_votes", {
  id: serial("id").primaryKey(),
  congressMemberId: text("congress_member_id").notNull(), // bioguideId
  voteId: integer("vote_id").notNull(),
  position: text("position").notNull(), // "Yes", "No", "Present", "Not Voting"
});

export const insertMemberVoteSchema = createInsertSchema(memberVotes).omit({
  id: true
});

export type InsertMemberVote = z.infer<typeof insertMemberVoteSchema>;
export type MemberVote = typeof memberVotes.$inferSelect;

// User Preferences schema
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  voteId: integer("vote_id").notNull(),
  agreement: boolean("agreement").notNull(), // true = agree, false = disagree
  importance: integer("importance").notNull() // Scale of 1-5
});

export const insertUserPreferenceSchema = createInsertSchema(userPreferences).omit({
  id: true
});

export type InsertUserPreference = z.infer<typeof insertUserPreferenceSchema>;
export type UserPreference = typeof userPreferences.$inferSelect;

// For API response types that aren't stored directly in the database
export const congressMemberResponseSchema = z.object({
  bioguideId: z.string(),
  name: z.string(),
  party: z.string(),
  state: z.string(),
  district: z.string().optional(),
  chamber: z.string(),
  termStart: z.string().optional(),
  imageUrl: z.string().optional()
});

export const voteResponseSchema = z.object({
  billId: z.string(),
  billTitle: z.string(),
  billDescription: z.string().optional(),
  chamber: z.string(),
  date: z.string(),
  question: z.string().optional(),
  result: z.string(),
  url: z.string().optional(),
  position: z.string() // The member's vote
});

export const alignmentStatsSchema = z.object({
  overall: z.number(),
  byIssue: z.record(z.string(), z.number()),
  overTime: z.array(z.object({
    date: z.string(),
    alignment: z.number()
  })),
  distribution: z.object({
    strongAgreement: z.number(),
    agreement: z.number(),
    neutral: z.number(),
    disagreement: z.number(),
    strongDisagreement: z.number()
  })
});

export type CongressMemberResponse = z.infer<typeof congressMemberResponseSchema>;
export type VoteResponse = z.infer<typeof voteResponseSchema>;
export type AlignmentStats = z.infer<typeof alignmentStatsSchema>;
