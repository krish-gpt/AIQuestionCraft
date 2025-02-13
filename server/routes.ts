import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { generateSurveyQuestions, analyzeSentiment, analyzeTrends } from "./openai";
import { insertSurveySchema, insertResponseSchema } from "@shared/schema";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // AI routes
  app.post("/api/generate-questions", async (req, res) => {
    // Add debug logging
    console.log("Authentication status:", req.isAuthenticated());
    console.log("Session:", req.session);

    // Check authentication
    if (!req.isAuthenticated()) {
      console.log("Authentication failed for /api/generate-questions");
      return res.sendStatus(401);
    }

    const { topic, count = 5 } = req.body;
    if (!topic) {
      return res.status(400).json({ message: "Topic is required" });
    }

    try {
      const questions = await generateSurveyQuestions(topic, count);
      res.json(questions);
    } catch (error) {
      console.error("Question generation error:", error);
      res.status(500).json({ 
        message: "Failed to generate questions",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

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
    const survey = await storage.getSurvey(Number(req.params.id));
    if (!survey) return res.sendStatus(404);
    res.json(survey);
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
    const textAnswers = Object.entries(response.answers)
      .filter(([id]) => {
        const question = survey.questions.find(q => q.id === id);
        return question?.type === "text";
      })
      .map(([, answer]) => answer as string)
      .join(" ");

    if (textAnswers) {
      try {
        const sentiment = await analyzeSentiment(textAnswers);
        response.sentiment = sentiment;
      } catch (err) {
        console.error("Sentiment analysis error:", err);
      }
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

  // Enhanced Analysis routes
  app.get("/api/surveys/:id/insights", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const survey = await storage.getSurvey(Number(req.params.id));
    if (!survey) return res.sendStatus(404);
    if (survey.userId !== req.user.id) return res.sendStatus(403);

    const responses = await storage.getResponsesBySurvey(survey.id);
    if (!responses.length) {
      return res.status(400).json({ message: "No responses to analyze" });
    }

    try {
      // Analyze text responses for sentiment
      const textAnalyses = await Promise.all(
        responses.map(async (response) => {
          const textAnswers = Object.entries(response.answers)
            .filter(([id]) => {
              const question = survey.questions.find(q => q.id === id);
              return question?.type === "text";
            })
            .map(([, answer]) => answer as string)
            .join(" ");

          if (!textAnswers) return null;
          return analyzeSentiment(textAnswers);
        })
      );

      // Get overall trends analysis
      const trends = await analyzeTrends(responses);

      res.json({
        sentiment_analysis: textAnalyses.filter(Boolean),
        trends,
      });
    } catch (err) {
      console.error("Analysis error:", err);
      res.status(500).json({ message: "Failed to generate insights" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}