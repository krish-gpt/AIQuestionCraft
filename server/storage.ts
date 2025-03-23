import { users, surveys, responses, surveyTemplates } from "@shared/schema";
import type { User, Survey, Response, InsertUser, InsertSurvey, InsertResponse, SurveyTemplate } from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  createSurvey(survey: InsertSurvey & { userId: number }): Promise<Survey>;
  getSurvey(id: number): Promise<Survey | undefined>;
  getSurveysByUser(userId: number): Promise<Survey[]>;
  deleteSurvey(id: number): Promise<void>;
  updateSurveyStatus(id: number, isActive: boolean): Promise<void>;

  createResponse(response: InsertResponse): Promise<Response>;
  getResponsesBySurvey(surveyId: number): Promise<Response[]>;
  updateResponseSentiment(responseId: number, sentiment: any): Promise<void>;

  // Template methods
  getTemplates(): Promise<SurveyTemplate[]>;
  getTemplate(id: number): Promise<SurveyTemplate | undefined>;

  sessionStore: session.Store;
  getUserByEmail(email: string): Promise<User | undefined>;
  storeResetToken(email: string, token: string, expiry: Date): Promise<void>;
  verifyResetToken(token: string): Promise<{ email: string; expiresAt: Date } | null>;
  updateUserPassword(email: string, newPassword: string): Promise<void>;
  clearResetToken(token: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  // ... existing methods remain unchanged ...

  async getTemplates(): Promise<SurveyTemplate[]> {
    return db.select().from(surveyTemplates);
  }

  async getTemplate(id: number): Promise<SurveyTemplate | undefined> {
    const [template] = await db
      .select()
      .from(surveyTemplates)
      .where(eq(surveyTemplates.id, id));
    return template;
  }

  // ... rest of the existing methods remain unchanged ...
}

export const storage = new DatabaseStorage();
