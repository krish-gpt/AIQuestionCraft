import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { generateSurveyQuestions, analyzeSentiment, analyzeTrends } from "./openai";
import { insertSurveySchema, insertResponseSchema, type Survey, type Response } from "@shared/schema";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // AI routes
  app.post("/api/generate-questions", async (req, res) => {
    if (!req.isAuthenticated()) {
      console.log("Authentication failed for /api/generate-questions");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { topic, count = 5 } = req.body;
    if (!topic) {
      return res.status(400).json({ message: "Topic is required" });
    }

    try {
      const questions = await generateSurveyQuestions(topic, count);
      res.json(questions);
    } catch (error: any) {
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
      userId: req.user!.id,
    });
    res.status(201).json(survey);
  });

  app.post("/api/surveys/from-template/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const template = await storage.getTemplate(Number(req.params.id));
      if (!template) return res.sendStatus(404);

      const survey = await storage.createSurvey({
        title: template.title,
        description: template.description,
        questions: template.questions,
        userId: req.user!.id,
        isActive: true
      });

      res.status(201).json(survey);
    } catch (error) {
      console.error("Error creating survey from template:", error);
      res.status(500).json({ 
        message: "Failed to create survey from template",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/surveys", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const surveys = await storage.getSurveysByUser(req.user!.id);
    res.json(surveys);
  });

  app.get("/api/surveys/:id", async (req, res) => {
    const survey = await storage.getSurvey(Number(req.params.id));
    if (!survey) return res.sendStatus(404);
    res.json(survey);
  });

  // Response routes
  app.post("/api/surveys/:id/responses", async (req, res) => {
    const survey = await storage.getSurvey(Number(req.params.id)) as Survey;
    if (!survey) return res.sendStatus(404);

    // Check if survey is closed
    if (!survey.isActive) {
      return res.status(403).json({ 
        message: "This survey is currently closed and not accepting responses" 
      });
    }

    const parseResult = insertResponseSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json(parseResult.error);
    }

    const response = await storage.createResponse(parseResult.data) as Response;

    res.status(201).json(response);
  });

  app.get("/api/surveys/:id/responses", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const survey = await storage.getSurvey(Number(req.params.id)) as Survey;
    if (!survey) return res.sendStatus(404);
    if (survey.userId !== req.user!.id) return res.sendStatus(403);

    const responses = await storage.getResponsesBySurvey(survey.id);
    res.json(responses);
  });

  // Enhanced Analysis routes
  app.post("/api/surveys/:id/insights", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const survey = await storage.getSurvey(Number(req.params.id)) as Survey;
      if (!survey) return res.sendStatus(404);
      if (survey.userId !== req.user!.id) return res.sendStatus(403);

      const responses = await storage.getResponsesBySurvey(survey.id) as Response[];
      if (!responses.length) {
        return res.status(400).json({ message: "No responses to analyze" });
      }

      console.log(`Processing ${responses.length} responses for sentiment analysis`);

      // Analyze text responses for sentiment
      const textAnalyses = await Promise.all(
        responses.map(async (response) => {
          try {
            const textAnswers = Object.entries(response.answers as Record<string, string>)
              .filter(([id]) => {
                const question = (survey.questions as Array<{id: string, type: string}>)
                  .find(q => q.id === id);
                return question?.type === "text";
              })
              .map(([, answer]) => answer)
              .join(" ");

            if (!textAnswers) {
              console.log(`No text answers found for response ${response.id}`);
              return null;
            }

            console.log(`Analyzing sentiment for response ${response.id}`);
            const sentiment = await analyzeSentiment(textAnswers);
            await storage.updateResponseSentiment(response.id, sentiment);
            return sentiment;
          } catch (err) {
            console.error(`Error analyzing response ${response.id}:`, err);
            return null;
          }
        })
      );

      console.log('Getting trends analysis');
      // Get overall trends analysis
      const trends = await analyzeTrends(responses);

      const insights = {
        sentiment_analysis: textAnalyses.filter(Boolean),
        trends,
      };

      console.log('Sending insights response');
      res.json(insights);
    } catch (err) {
      console.error("Analysis error:", err);
      res.status(500).json({ 
        message: "Failed to generate insights",
        error: err instanceof Error ? err.message : "Unknown error" 
      });
    }
  });

  // Add DELETE survey endpoint
  app.delete("/api/surveys/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const survey = await storage.getSurvey(Number(req.params.id));
    if (!survey) return res.sendStatus(404);
    if (survey.userId !== req.user!.id) return res.sendStatus(403);

    await storage.deleteSurvey(survey.id);
    res.sendStatus(200);
  });

  app.patch("/api/surveys/:id/toggle-status", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const survey = await storage.getSurvey(Number(req.params.id));
    if (!survey) return res.sendStatus(404);
    if (survey.userId !== req.user!.id) return res.sendStatus(403);

    // Toggle the survey status
    await storage.updateSurveyStatus(survey.id, !survey.isActive);
    res.sendStatus(200);
  });

  // Add template routes
  app.get("/api/templates", async (req, res) => {
    try {
      const templates = await storage.getTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ 
        message: "Failed to fetch templates",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/templates/:id", async (req, res) => {
    try {
      const template = await storage.getTemplate(Number(req.params.id));
      if (!template) return res.sendStatus(404);
      res.json(template);
    } catch (error) {
      console.error("Error fetching template:", error);
      res.status(500).json({ 
        message: "Failed to fetch template",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });


  const httpServer = createServer(app);
  return httpServer;
}