import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertSubmissionSchema } from "@shared/schema";
import { sendAdminNotification, sendApprovalNotification } from "./services/mail";

const adminAuth = (req: any, res: any, next: any) => {
  const authHeader = req.headers["x-admin-key"];
  const adminKey = process.env.ADMIN_KEY || process.env.SESSION_SECRET;
  if (!adminKey || authHeader !== adminKey) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

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

  app.get("/api/events/:id/reviews", async (req, res) => {
    try {
      const reviews = await storage.getReviewsByEvent(req.params.id);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  app.post("/api/events/:id/reviews", async (req, res) => {
    try {
      const eventId = req.params.id;
      
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }

      const reviewSchema = z.object({
        nickname: z.string().max(20).optional().nullable(),
        rating: z.number().min(1).max(5),
        soloFriendlinessRating: z.number().min(1).max(5),
        atmosphereRating: z.number().min(1).max(5),
        content: z.string().min(10).max(500),
      });

      const validatedData = reviewSchema.parse(req.body);
      
      const spamPatterns = [
        /http[s]?:\/\//i,
        /www\./i,
        /[\u4e00-\u9fa5]{50,}/,
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

  app.get("/api/groups", async (req, res) => {
    try {
      const groups = await storage.getGroups();
      res.json(groups);
    } catch (error) {
      console.error("Error fetching groups:", error);
      res.status(500).json({ error: "Failed to fetch groups" });
    }
  });

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

  app.get("/api/groups/:id/events", async (req, res) => {
    try {
      const events = await storage.getEventsByGroup(req.params.id);
      res.json(events);
    } catch (error) {
      console.error("Error fetching group events:", error);
      res.status(500).json({ error: "Failed to fetch group events" });
    }
  });

  app.get("/api/groups/:id/reviews", async (req, res) => {
    try {
      const reviews = await storage.getReviewsByGroup(req.params.id);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching group reviews:", error);
      res.status(500).json({ error: "Failed to fetch group reviews" });
    }
  });

  app.get("/api/groups/:id/review-stats", async (req, res) => {
    try {
      const stats = await storage.getGroupReviewStats(req.params.id);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching group review stats:", error);
      res.status(500).json({ error: "Failed to fetch group review stats" });
    }
  });

  app.get("/api/groups/:id/past-events", async (req, res) => {
    try {
      const pastEvents = await storage.getPastEventsByGroup(req.params.id);
      res.json(pastEvents);
    } catch (error) {
      console.error("Error fetching past events:", error);
      res.status(500).json({ error: "Failed to fetch past events" });
    }
  });

  app.post("/api/submissions", async (req, res) => {
    try {
      const submissionSchema = insertSubmissionSchema.extend({
        requesterEmail: z.string().email("有効なメールアドレスを入力してください"),
        groupName: z.string().min(1, "団体名は必須です").max(200),
        groupUniversity: z.string().min(1, "大学は必須です"),
        groupCategory: z.string().min(1, "区分は必須です"),
        groupGenre: z.string().min(1, "ジャンルは必須です"),
        groupDescription: z.string().min(1, "団体説明は必須です").max(2000),
        groupAtmosphereTags: z.array(z.string()).min(1, "雰囲気タグを1つ以上選択してください"),
      });

      const validatedData = submissionSchema.parse(req.body);

      const submission = await storage.createSubmission(validatedData);

      sendAdminNotification(submission).catch((err) => {
        console.error("[mail] Admin notification failed (non-blocking):", err);
      });

      res.status(201).json({ success: true, id: submission.id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "入力内容に不備があります", details: error.errors });
      }
      console.error("Error creating submission:", error);
      res.status(500).json({ error: "送信に失敗しました" });
    }
  });

  app.get("/api/submissions", adminAuth, async (req, res) => {
    try {
      const submissions = await storage.getSubmissions();
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      res.status(500).json({ error: "Failed to fetch submissions" });
    }
  });

  app.post("/api/submissions/:id/approve", adminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const submission = await storage.getSubmission(id);
      if (!submission) {
        return res.status(404).json({ error: "Submission not found" });
      }
      if (submission.status !== "pending") {
        return res.status(400).json({ error: "この申請は既に処理済みです" });
      }

      const group = await storage.createGroup({
        name: submission.groupName,
        university: submission.groupUniversity,
        category: submission.groupCategory,
        genre: submission.groupGenre,
        description: submission.groupDescription,
        atmosphereTags: submission.groupAtmosphereTags,
        contactInfo: submission.groupContactInfo,
        instagramUrl: submission.groupInstagramUrl,
        twitterUrl: submission.groupTwitterUrl,
        lineUrl: submission.groupLineUrl,
      });

      if (submission.eventTitle && submission.eventLocation) {
        const eventDate = submission.eventDate ? new Date(submission.eventDate) : new Date();
        await storage.createEvent({
          groupId: group.id,
          title: submission.eventTitle,
          description: submission.eventDescription || "",
          date: eventDate,
          endDate: submission.eventEndDate ? new Date(submission.eventEndDate) : null,
          location: submission.eventLocation,
          beginnerWelcome: submission.eventBeginnerWelcome ?? true,
          soloFriendliness: submission.eventSoloFriendliness ?? 3,
          atmosphereTags: submission.groupAtmosphereTags,
          imageUrl: submission.eventImageUrl,
          status: "approved",
        });
      }

      const updated = await storage.updateSubmissionStatus(id, "approved");

      sendApprovalNotification(submission).catch((err) => {
        console.error("[mail] Approval notification failed (non-blocking):", err);
      });

      res.json({ success: true, submission: updated, groupId: group.id });
    } catch (error) {
      console.error("Error approving submission:", error);
      res.status(500).json({ error: "承認処理に失敗しました" });
    }
  });

  app.post("/api/submissions/:id/reject", adminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const submission = await storage.getSubmission(id);
      if (!submission) {
        return res.status(404).json({ error: "Submission not found" });
      }
      if (submission.status !== "pending") {
        return res.status(400).json({ error: "この申請は既に処理済みです" });
      }
      const updated = await storage.updateSubmissionStatus(id, "rejected");
      res.json({ success: true, submission: updated });
    } catch (error) {
      console.error("Error rejecting submission:", error);
      res.status(500).json({ error: "却下処理に失敗しました" });
    }
  });

  return httpServer;
}
