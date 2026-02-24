import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { getNotionClient, extractDatabaseId, testDatabaseConnection } from "./notion";
import { syncAllFromNotion, syncGroupsFromNotion, syncEventsFromNotion, syncArticlesFromNotion, writeContactToNotion, writeGroupSubmissionToNotion, writeEventSubmissionToNotion } from "./notion-sync";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post("/api/uploads/event-image", async (req, res) => {
    try {
      const uploadSchema = z.object({
        fileName: z.string().min(1).max(200),
        mimeType: z.enum(["image/png", "image/jpeg", "image/webp"]),
        base64Data: z.string().min(1),
      });

      const { fileName, mimeType, base64Data } = uploadSchema.parse(req.body);
      const buffer = Buffer.from(base64Data, "base64");

      if (buffer.length > 5 * 1024 * 1024) {
        return res.status(400).json({ error: "画像サイズは5MB以下にしてください" });
      }

      const ext = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
      const safeName = path.basename(fileName).replace(/[^a-zA-Z0-9_.-]/g, "_");
      const generatedName = `${Date.now()}-${randomUUID()}-${safeName}.${ext}`;
      const uploadDir = path.join(process.cwd(), "attached_assets", "submissions");
      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, generatedName), buffer);

      res.status(201).json({ imageUrl: `/uploads/submissions/${generatedName}` });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      console.error("Error uploading image:", error);
      res.status(500).json({ error: "Failed to upload image" });
    }
  });
  

  app.post("/api/submissions/group", async (req, res) => {
    try {
      const schema = z.object({
        name: z.string().min(1).max(200),
        university: z.string().min(1).max(200),
        category: z.string().min(1).max(100),
        genre: z.string().min(1).max(100),
        description: z.string().min(10).max(2000),
        atmosphereTags: z.array(z.string().max(100)).max(10).default([]),
        beginnerFriendly: z.boolean().default(true),
        memberCount: z.number().int().positive().max(100000).optional().nullable(),
        foundedYear: z.number().int().min(1900).max(2100).optional().nullable(),
        practiceSchedule: z.string().max(1000).optional().nullable(),
        faqs: z.string().max(2000).optional().nullable(),
        contactInfo: z.string().max(1000).optional().nullable(),
        instagramUrl: z.string().url().max(500).optional().nullable().or(z.literal("")),
        twitterUrl: z.string().url().max(500).optional().nullable().or(z.literal("")),
        lineUrl: z.string().url().max(500).optional().nullable().or(z.literal("")),
        imageUrl: z.string().max(500).optional().nullable().or(z.literal("")),
      });

      const data = schema.parse(req.body);
      const result = await writeGroupSubmissionToNotion({
        ...data,
        instagramUrl: data.instagramUrl || null,
        twitterUrl: data.twitterUrl || null,
        lineUrl: data.lineUrl || null,
        imageUrl: data.imageUrl || null,
      });

      if (!result.success) {
        return res.status(502).json({ error: "Notionへの連携に失敗しました", details: result.error });
      }

      return res.status(201).json({ success: true, pageId: result.pageId });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      console.error("Error creating group submission:", error);
      return res.status(500).json({ error: "Failed to submit group" });
    }
  });

  app.post("/api/submissions/event", async (req, res) => {
    try {
      const schema = z.object({
        groupId: z.string().min(1).max(36),
        title: z.string().min(1).max(200),
        description: z.string().min(10).max(2000),
        date: z.string().datetime(),
        endDate: z.string().datetime().optional().nullable().or(z.literal("")),
        location: z.string().min(1).max(200),
        requirements: z.string().max(1000).optional().nullable(),
        atmosphereTags: z.array(z.string().max(100)).max(10).default([]),
        participationFlow: z.string().max(1000).optional().nullable(),
        maxParticipants: z.number().int().positive().max(100000).optional().nullable(),
        imageUrl: z.string().max(500).optional().nullable().or(z.literal("")),
        mapUrl: z.string().url().max(500).optional().nullable().or(z.literal("")),
      });

      const data = schema.parse(req.body);
      const result = await writeEventSubmissionToNotion({
        ...data,
        endDate: data.endDate || null,
        imageUrl: data.imageUrl || null,
        mapUrl: data.mapUrl || null,
      });

      if (!result.success) {
        return res.status(502).json({ error: "Notionへの連携に失敗しました", details: result.error });
      }

      return res.status(201).json({ success: true, pageId: result.pageId });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      console.error("Error creating event submission:", error);
      return res.status(500).json({ error: "Failed to submit event" });
    }
  });

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

  // Get review stats (average solo friendliness) for a group
  app.get("/api/groups/:id/review-stats", async (req, res) => {
    try {
      const stats = await storage.getGroupReviewStats(req.params.id);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching group review stats:", error);
      res.status(500).json({ error: "Failed to fetch group review stats" });
    }
  });

  // Get past events for a group (events before today, excluding the current event)
  app.get("/api/groups/:id/past-events", async (req, res) => {
    try {
      const pastEvents = await storage.getPastEventsByGroup(req.params.id);
      res.json(pastEvents);
    } catch (error) {
      console.error("Error fetching past events:", error);
      res.status(500).json({ error: "Failed to fetch past events" });
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

  // Simple auth middleware for admin endpoints
  const adminAuth = (req: any, res: any, next: any) => {
    const authHeader = req.headers["x-admin-key"];
    const adminKey = process.env.SESSION_SECRET;
    if (!adminKey || authHeader !== adminKey) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    next();
  };

  // Sync all data from Notion (requires auth)
  app.post("/api/notion/sync", adminAuth, async (req, res) => {
    try {
      console.log("Starting full Notion sync...");
      const result = await syncAllFromNotion();
      res.json({
        success: true,
        message: "Sync completed",
        results: result,
      });
    } catch (error: any) {
      console.error("Notion sync error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Sync groups from Notion (requires auth)
  app.post("/api/notion/sync/groups", adminAuth, async (req, res) => {
    try {
      const result = await syncGroupsFromNotion();
      res.json({ success: true, ...result });
    } catch (error: any) {
      console.error("Notion groups sync error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Sync events from Notion (requires auth)
  app.post("/api/notion/sync/events", adminAuth, async (req, res) => {
    try {
      const result = await syncEventsFromNotion();
      res.json({ success: true, ...result });
    } catch (error: any) {
      console.error("Notion events sync error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Sync articles from Notion (requires auth)
  app.post("/api/notion/sync/articles", adminAuth, async (req, res) => {
    try {
      const result = await syncArticlesFromNotion();
      res.json({ success: true, ...result });
    } catch (error: any) {
      console.error("Notion articles sync error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Test Notion connection
  app.get("/api/notion/test", async (req, res) => {
    try {
      const results: Record<string, any> = {};
      
      // Test Events database
      const eventUrl = process.env.NOTION_EVENT_URL;
      if (eventUrl) {
        const eventDbId = extractDatabaseId(eventUrl);
        results.events = await testDatabaseConnection(eventDbId);
        results.events.databaseId = eventDbId;
      } else {
        results.events = { success: false, error: "NOTION_EVENT_URL not set" };
      }
      
      // Test Groups database
      const groupUrl = process.env.NOTION_CIRCLENAME_URL;
      if (groupUrl) {
        const groupDbId = extractDatabaseId(groupUrl);
        results.groups = await testDatabaseConnection(groupDbId);
        results.groups.databaseId = groupDbId;
      } else {
        results.groups = { success: false, error: "NOTION_CIRCLENAME_URL not set" };
      }
      
      // Test Contact database
      const contactUrl = process.env.NOTION_CONTACT_URL;
      if (contactUrl) {
        const contactDbId = extractDatabaseId(contactUrl);
        results.contacts = await testDatabaseConnection(contactDbId);
        results.contacts.databaseId = contactDbId;
      } else {
        results.contacts = { success: false, error: "NOTION_CONTACT_URL not set" };
      }
      
      const allSuccess = results.events?.success && results.groups?.success && results.contacts?.success;
      res.json({ success: allSuccess, databases: results });
    } catch (error: any) {
      console.error("Notion test error:", error);
      res.status(500).json({ success: false, error: error.message });
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
        eventImageUrl: z.string().max(500).optional().nullable().or(z.literal("")),
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

      // Also write to Notion
      const notionResult = await writeContactToNotion({
        type: validatedData.type,
        name: validatedData.name || null,
        university: validatedData.university || null,
        contactMethod: validatedData.contactMethod,
        content: validatedData.content,
        eventName: validatedData.eventName,
        eventDate: validatedData.eventDate,
        eventLocation: validatedData.eventLocation,
        eventDescription: validatedData.eventDescription,
        eventImageUrl: validatedData.eventImageUrl,
      });

      if (!notionResult.success) {
        console.warn("Failed to write contact to Notion:", notionResult.error);
      }

      res.status(201).json({ success: true, id: submission.id, notionSync: notionResult.success });
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
