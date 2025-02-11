import { User, Survey, Response, InsertUser, InsertSurvey, InsertResponse } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createSurvey(survey: InsertSurvey & { userId: number }): Promise<Survey>;
  getSurvey(id: number): Promise<Survey | undefined>;
  getSurveysByUser(userId: number): Promise<Survey[]>;
  
  createResponse(response: InsertResponse): Promise<Response>;
  getResponsesBySurvey(surveyId: number): Promise<Response[]>;
  
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private surveys: Map<number, Survey>;
  private responses: Map<number, Response>;
  currentId: { user: number; survey: number; response: number };
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.surveys = new Map();
    this.responses = new Map();
    this.currentId = { user: 1, survey: 1, response: 1 };
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.user++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createSurvey(insertSurvey: InsertSurvey & { userId: number }): Promise<Survey> {
    const id = this.currentId.survey++;
    const survey: Survey = { ...insertSurvey, id };
    this.surveys.set(id, survey);
    return survey;
  }

  async getSurvey(id: number): Promise<Survey | undefined> {
    return this.surveys.get(id);
  }

  async getSurveysByUser(userId: number): Promise<Survey[]> {
    return Array.from(this.surveys.values()).filter(
      (survey) => survey.userId === userId,
    );
  }

  async createResponse(insertResponse: InsertResponse): Promise<Response> {
    const id = this.currentId.response++;
    const response: Response = {
      ...insertResponse,
      id,
      submittedAt: new Date(),
      sentiment: null,
    };
    this.responses.set(id, response);
    return response;
  }

  async getResponsesBySurvey(surveyId: number): Promise<Response[]> {
    return Array.from(this.responses.values()).filter(
      (response) => response.surveyId === surveyId,
    );
  }
}

export const storage = new MemStorage();
