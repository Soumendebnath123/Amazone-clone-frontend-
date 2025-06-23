import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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

// Blockchain-related schemas
export const candidateSchema = z.object({
  id: z.string(),
  name: z.string(),
  info: z.string().optional(),
  votes: z.number(),
  party: z.string().optional(),
});

export const votingSessionSchema = z.object({
  id: z.string(),
  title: z.string(),
  startTime: z.number(),
  endTime: z.number(),
  isActive: z.boolean(),
});

export const voteTransactionSchema = z.object({
  transactionHash: z.string(),
  voterAddress: z.string(),
  candidateId: z.string(),
  timestamp: z.number(),
  blockNumber: z.number(),
});

export const web3ConfigSchema = z.object({
  contractAddress: z.string(),
  networkId: z.number(),
  rpcUrl: z.string(),
});

export type Candidate = z.infer<typeof candidateSchema>;
export type VotingSession = z.infer<typeof votingSessionSchema>;
export type VoteTransaction = z.infer<typeof voteTransactionSchema>;
export type Web3Config = z.infer<typeof web3ConfigSchema>;
