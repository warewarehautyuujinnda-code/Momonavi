import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Get all events
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  // Get single event
  app.get("/api/events/:id", async (req, res) => {
    try {
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({ error: "Failed to fetch event" });
    }
  });

  // Get reviews for an event
  app.get("/api/events/:id/reviews", async (req, res) => {
    try {
      const reviews = await storage.getReviewsByEvent(req.params.id);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  // Create review for an event
  app.post("/api/events/:id/reviews", async (req, res) => {
    try {
      const eventId = req.params.id;
      
      // Check if event exists
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }

      // Validate request body
      const reviewSchema = z.object({
        nickname: z.string().max(20).optional().nullable(),
        rating: z.number().min(1).max(5),
        soloFriendlinessRating: z.number().min(1).max(5),
        atmosphereRating: z.number().min(1).max(5),
        content: z.string().min(10).max(500),
      });

      const validatedData = reviewSchema.parse(req.body);
      
      // Simple spam check - check for common spam patterns
      const spamPatterns = [
        /http[s]?:\/\//i,
        /www\./i,
        /[\u4e00-\u9fa5]{50,}/,  // Long Chinese text
      ];
      
      const isSpam = spamPatterns.some(pattern => 
        pattern.test(validatedData.content) || 
        (validatedData.nickname && pattern.test(validatedData.nickname))
      );
      
      if (isSpam) {
        return res.status(400).json({ error: "スパムの可能性があるため投稿できません" });
      }

      const review = await storage.createReview({
        eventId,
        nickname: validatedData.nickname || null,
        rating: validatedData.rating,
        soloFriendlinessRating: validatedData.soloFriendlinessRating,
        atmosphereRating: validatedData.atmosphereRating,
        content: validatedData.content,
      });

      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      console.error("Error creating review:", error);
      res.status(500).json({ error: "Failed to create review" });
    }
  });

  // Get all groups
  app.get("/api/groups", async (req, res) => {
    try {
      const groups = await storage.getGroups();
      res.json(groups);
    } catch (error) {
      console.error("Error fetching groups:", error);
      res.status(500).json({ error: "Failed to fetch groups" });
    }
  });

  // Get single group
  app.get("/api/groups/:id", async (req, res) => {
    try {
      const group = await storage.getGroup(req.params.id);
      if (!group) {
        return res.status(404).json({ error: "Group not found" });
      }
      res.json(group);
    } catch (error) {
      console.error("Error fetching group:", error);
      res.status(500).json({ error: "Failed to fetch group" });
    }
  });

  // Get events for a group
  app.get("/api/groups/:id/events", async (req, res) => {
    try {
      const events = await storage.getEventsByGroup(req.params.id);
      res.json(events);
    } catch (error) {
      console.error("Error fetching group events:", error);
      res.status(500).json({ error: "Failed to fetch group events" });
    }
  });

  // Get reviews for a group
  app.get("/api/groups/:id/reviews", async (req, res) => {
    try {
      const reviews = await storage.getReviewsByGroup(req.params.id);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching group reviews:", error);
      res.status(500).json({ error: "Failed to fetch group reviews" });
    }
  });

  // Get all articles
  app.get("/api/articles", async (req, res) => {
    try {
      const articles = await storage.getArticles();
      res.json(articles);
    } catch (error) {
      console.error("Error fetching articles:", error);
      res.status(500).json({ error: "Failed to fetch articles" });
    }
  });

  // Get single article
  app.get("/api/articles/:id", async (req, res) => {
    try {
      const article = await storage.getArticle(req.params.id);
      if (!article) {
        return res.status(404).json({ error: "Article not found" });
      }
      res.json(article);
    } catch (error) {
      console.error("Error fetching article:", error);
      res.status(500).json({ error: "Failed to fetch article" });
    }
  });

  // Create contact submission
  app.post("/api/contact", async (req, res) => {
    try {
      const contactSchema = z.object({
        type: z.enum(["一般", "イベント掲載依頼"]),
        name: z.string().max(100).optional().nullable(),
        university: z.string().optional().nullable(),
        contactMethod: z.string().min(1).max(200),
        content: z.string().min(10).max(2000),
        eventName: z.string().max(200).optional().nullable(),
        eventDate: z.string().max(100).optional().nullable(),
        eventLocation: z.string().max(200).optional().nullable(),
        eventDescription: z.string().max(2000).optional().nullable(),
        eventImageUrl: z.string().url().optional().nullable(),
      });

      const validatedData = contactSchema.parse(req.body);

      const submission = await storage.createContactSubmission({
        type: validatedData.type,
        name: validatedData.name || null,
        university: validatedData.university || null,
        contactMethod: validatedData.contactMethod,
        content: validatedData.content,
        eventName: validatedData.eventName || null,
        eventDate: validatedData.eventDate || null,
        eventLocation: validatedData.eventLocation || null,
        eventDescription: validatedData.eventDescription || null,
        eventImageUrl: validatedData.eventImageUrl || null,
      });

      res.status(201).json({ success: true, id: submission.id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      console.error("Error creating contact submission:", error);
      res.status(500).json({ error: "Failed to submit" });
    }
  });

  return httpServer;
}
