import { users, surveys, responses, surveyTemplates } from "@shared/schema";
import type { User, Survey, Response, InsertUser, InsertSurvey, InsertResponse, SurveyTemplate } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
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

  getTemplates(): Promise<SurveyTemplate[]>;
  getTemplate(id: number): Promise<SurveyTemplate | undefined>;

  getUserByEmail(email: string): Promise<User | undefined>;
  storeResetToken(email: string, token: string, expiry: Date): Promise<void>;
  verifyResetToken(token: string): Promise<{ email: string; expiresAt: Date } | null>;
  updateUserPassword(email: string, newPassword: string): Promise<void>;
  clearResetToken(token: string): Promise<void>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [createdUser] = await db.insert(users).values(user).returning();
    return createdUser;
  }

  // Survey methods
  async createSurvey(survey: InsertSurvey & { userId: number }): Promise<Survey> {
    const [createdSurvey] = await db.insert(surveys).values(survey).returning();
    return createdSurvey;
  }

  async getSurvey(id: number): Promise<Survey | undefined> {
    const [survey] = await db.select().from(surveys).where(eq(surveys.id, id));
    return survey;
  }

  async getSurveysByUser(userId: number): Promise<Survey[]> {
    return db.select().from(surveys).where(eq(surveys.userId, userId));
  }

  async deleteSurvey(id: number): Promise<void> {
    // First delete all responses associated with the survey
    await db.delete(responses).where(eq(responses.surveyId, id));
    // Then delete the survey
    await db.delete(surveys).where(eq(surveys.id, id));
  }

  async updateSurveyStatus(id: number, isActive: boolean): Promise<void> {
    await db
      .update(surveys)
      .set({ isActive })
      .where(eq(surveys.id, id));
  }

  // Response methods
  async createResponse(response: InsertResponse): Promise<Response> {
    const [createdResponse] = await db.insert(responses).values(response).returning();
    return createdResponse;
  }

  async getResponsesBySurvey(surveyId: number): Promise<Response[]> {
    return db.select().from(responses).where(eq(responses.surveyId, surveyId));
  }

  async updateResponseSentiment(responseId: number, sentiment: any): Promise<void> {
    await db
      .update(responses)
      .set({ sentiment })
      .where(eq(responses.id, responseId));
  }

  // Template methods
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

  // Password reset methods
  async storeResetToken(email: string, token: string, expiry: Date): Promise<void> {
    await db
      .update(users)
      .set({ resetToken: token, resetTokenExpiry: expiry })
      .where(eq(users.email, email));
  }

  async verifyResetToken(token: string): Promise<{ email: string; expiresAt: Date } | null> {
    const [user] = await db
      .select({
        email: users.email,
        expiresAt: users.resetTokenExpiry,
      })
      .from(users)
      .where(eq(users.resetToken, token));

    return user || null;
  }

  async updateUserPassword(email: string, newPassword: string): Promise<void> {
    await db
      .update(users)
      .set({ password: newPassword })
      .where(eq(users.email, email));
  }

  async clearResetToken(token: string): Promise<void> {
    await db
      .update(users)
      .set({ resetToken: null, resetTokenExpiry: null })
      .where(eq(users.resetToken, token));
  }
}

export const storage = new DatabaseStorage();