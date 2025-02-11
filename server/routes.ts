import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { generateSurveyQuestions, analyzeSentiment } from "./openai";
import { insertSurveySchema, insertResponseSchema } from "@shared/schema";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Survey routes
  app.post("/api/surveys", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const parseResult = insertSurveySchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json(parseResult.error);
    }

    const survey = await storage.createSurvey({
      ...parseResult.data,
      userId: req.user.id,
    });
    res.status(201).json(survey);
  });

  app.get("/api/surveys", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const surveys = await storage.getSurveysByUser(req.user.id);
    res.json(surveys);
  });

  app.get("/api/surveys/:id", async (req, res) => {
    const survey = await storage.getSurvey(Number(req.id));
    if (!survey) return res.sendStatus(404);
    res.json(survey);
  });

  // AI routes
  app.post("/api/generate-questions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const { topic, count = 5 } = req.body;
    if (!topic) return res.status(400).send("Topic is required");
    
    try {
      const questions = await generateSurveyQuestions(topic, count);
      res.json(questions);
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

  // Response routes
  app.post("/api/surveys/:id/responses", async (req, res) => {
    const survey = await storage.getSurvey(Number(req.params.id));
    if (!survey) return res.sendStatus(404);

    const parseResult = insertResponseSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json(parseResult.error);
    }

    const response = await storage.createResponse(parseResult.data);

    // Analyze sentiment for text responses
    const textAnswers = Object.values(response.answers)
      .filter((answer) => typeof answer === "string")
      .join(" ");
    
    if (textAnswers) {
      const sentiment = await analyzeSentiment(textAnswers);
      response.sentiment = sentiment;
      // In a real app, we'd update the response in storage here
    }

    res.status(201).json(response);
  });

  app.get("/api/surveys/:id/responses", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const survey = await storage.getSurvey(Number(req.params.id));
    if (!survey) return res.sendStatus(404);
    if (survey.userId !== req.user.id) return res.sendStatus(403);

    const responses = await storage.getResponsesBySurvey(survey.id);
    res.json(responses);
  });

  const httpServer = createServer(app);
  return httpServer;
}
