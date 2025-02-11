import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const surveys = pgTable("surveys", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  questions: jsonb("questions").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const responses = pgTable("responses", {
  id: serial("id").primaryKey(),
  surveyId: integer("survey_id").notNull(),
  answers: jsonb("answers").notNull(),
  sentiment: jsonb("sentiment"),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertSurveySchema = createInsertSchema(surveys)
  .omit({ id: true, userId: true })
  .extend({
    questions: z.array(z.object({
      id: z.string(),
      text: z.string(),
      type: z.enum(["multiple_choice", "text", "rating"]),
      options: z.array(z.string()).optional(),
    }))
  });

export const insertResponseSchema = createInsertSchema(responses)
  .omit({ id: true, submittedAt: true, sentiment: true });

export type User = typeof users.$inferSelect;
export type Survey = typeof surveys.$inferSelect;
export type Response = typeof responses.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertSurvey = z.infer<typeof insertSurveySchema>;
export type InsertResponse = z.infer<typeof insertResponseSchema>;
