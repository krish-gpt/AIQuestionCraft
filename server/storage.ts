import { users, surveys, responses } from "@shared/schema";
import type { User, Survey, Response, InsertUser, InsertSurvey, InsertResponse } from "@shared/schema";
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

  createResponse(response: InsertResponse): Promise<Response>;
  getResponsesBySurvey(surveyId: number): Promise<Response[]>;

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

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createSurvey(insertSurvey: InsertSurvey & { userId: number }): Promise<Survey> {
    const [survey] = await db.insert(surveys).values(insertSurvey).returning();
    return survey;
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

  async createResponse(insertResponse: InsertResponse): Promise<Response> {
    const [response] = await db
      .insert(responses)
      .values({
        ...insertResponse,
        submittedAt: new Date(),
        sentiment: null,
      })
      .returning();
    return response;
  }

  async getResponsesBySurvey(surveyId: number): Promise<Response[]> {
    return db.select().from(responses).where(eq(responses.surveyId, surveyId));
  }
}

export const storage = new DatabaseStorage();