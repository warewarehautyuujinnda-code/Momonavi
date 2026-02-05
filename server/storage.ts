import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { 
  groups, events, reviews, companionPosts, articles, contactSubmissions,
  type Group, type InsertGroup,
  type Event, type InsertEvent,
  type Review, type InsertReview,
  type CompanionPost, type InsertCompanionPost,
  type Article, type InsertArticle,
  type ContactSubmission, type InsertContactSubmission,
  type EventWithGroup, type GroupWithEvents
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getGroups(): Promise<GroupWithEvents[]>;
  getGroup(id: string): Promise<GroupWithEvents | undefined>;
  createGroup(group: InsertGroup): Promise<Group>;
  
  getEvents(): Promise<EventWithGroup[]>;
  getEvent(id: string): Promise<EventWithGroup | undefined>;
  getEventsByGroup(groupId: string): Promise<EventWithGroup[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  
  getReviewsByEvent(eventId: string): Promise<Review[]>;
  getReviewsByGroup(groupId: string): Promise<Review[]>;
  getGroupReviewStats(groupId: string): Promise<{ averageSoloFriendliness: number; reviewCount: number }>;
  getPastEventsByGroup(groupId: string): Promise<Event[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  getCompanionPosts(): Promise<CompanionPost[]>;
  getCompanionPostsByEvent(eventId: string): Promise<CompanionPost[]>;
  createCompanionPost(post: InsertCompanionPost): Promise<CompanionPost>;
  
  getArticles(): Promise<Article[]>;
  getArticle(id: string): Promise<Article | undefined>;
  
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
}

export class DatabaseStorage implements IStorage {
  async getGroups(): Promise<GroupWithEvents[]> {
    const allGroups = await db.select().from(groups);
    const allEvents = await db.select().from(events).where(eq(events.status, "approved"));
    
    return allGroups.map((group) => ({
      ...group,
      events: allEvents.filter((e) => e.groupId === group.id)
    }));
  }

  async getGroup(id: string): Promise<GroupWithEvents | undefined> {
    const [group] = await db.select().from(groups).where(eq(groups.id, id));
    if (!group) return undefined;
    
    const groupEvents = await db.select().from(events)
      .where(eq(events.groupId, id));
    
    return { ...group, events: groupEvents };
  }

  async createGroup(insertGroup: InsertGroup): Promise<Group> {
    const id = randomUUID();
    const [group] = await db.insert(groups).values({
      id,
      ...insertGroup,
      beginnerFriendly: insertGroup.beginnerFriendly ?? true,
      memberCount: insertGroup.memberCount ?? null,
      foundedYear: insertGroup.foundedYear ?? null,
      practiceSchedule: insertGroup.practiceSchedule ?? null,
      faqs: insertGroup.faqs ?? null,
      contactInfo: insertGroup.contactInfo ?? null,
      instagramUrl: insertGroup.instagramUrl ?? null,
      twitterUrl: insertGroup.twitterUrl ?? null,
      lineUrl: insertGroup.lineUrl ?? null,
    }).returning();
    return group;
  }

  async getEvents(): Promise<EventWithGroup[]> {
    const allEvents = await db.select().from(events).where(eq(events.status, "approved"));
    const allGroups = await db.select().from(groups);
    const groupMap = new Map(allGroups.map(g => [g.id, g]));
    
    return allEvents
      .map((event) => {
        const group = groupMap.get(event.groupId);
        if (!group) return null;
        return { ...event, group };
      })
      .filter((e): e is EventWithGroup => e !== null);
  }

  async getEvent(id: string): Promise<EventWithGroup | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    if (!event) return undefined;
    
    const [group] = await db.select().from(groups).where(eq(groups.id, event.groupId));
    if (!group) return undefined;
    
    return { ...event, group };
  }

  async getEventsByGroup(groupId: string): Promise<EventWithGroup[]> {
    const [group] = await db.select().from(groups).where(eq(groups.id, groupId));
    if (!group) return [];
    
    const groupEvents = await db.select().from(events)
      .where(eq(events.groupId, groupId));
    
    return groupEvents
      .filter((e) => e.status === "approved")
      .map((event) => ({ ...event, group }));
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = randomUUID();
    const [event] = await db.insert(events).values({
      id,
      ...insertEvent,
      endDate: insertEvent.endDate ?? null,
      requirements: insertEvent.requirements ?? null,
      beginnerWelcome: insertEvent.beginnerWelcome ?? true,
      soloFriendliness: insertEvent.soloFriendliness ?? 3,
      participationFlow: insertEvent.participationFlow ?? null,
      maxParticipants: insertEvent.maxParticipants ?? null,
      imageUrl: insertEvent.imageUrl ?? null,
      status: insertEvent.status ?? "pending",
    }).returning();
    return event;
  }

  async getReviewsByEvent(eventId: string): Promise<Review[]> {
    return db.select().from(reviews)
      .where(eq(reviews.eventId, eventId))
      .orderBy(desc(reviews.createdAt));
  }

  async getReviewsByGroup(groupId: string): Promise<Review[]> {
    const groupEvents = await db.select().from(events)
      .where(eq(events.groupId, groupId));
    const eventIds = groupEvents.map((e) => e.id);
    
    if (eventIds.length === 0) return [];
    
    const allReviews = await db.select().from(reviews)
      .orderBy(desc(reviews.createdAt));
    
    return allReviews.filter((r) => eventIds.includes(r.eventId));
  }

  async getGroupReviewStats(groupId: string): Promise<{ averageSoloFriendliness: number; reviewCount: number }> {
    const groupEvents = await db.select().from(events)
      .where(eq(events.groupId, groupId));
    const eventIds = groupEvents.map((e) => e.id);
    
    if (eventIds.length === 0) {
      return { averageSoloFriendliness: 0, reviewCount: 0 };
    }
    
    const allReviews = await db.select().from(reviews);
    const groupReviews = allReviews.filter((r) => eventIds.includes(r.eventId));
    
    if (groupReviews.length === 0) {
      return { averageSoloFriendliness: 0, reviewCount: 0 };
    }
    
    const totalSoloFriendliness = groupReviews.reduce((sum, r) => sum + r.soloFriendlinessRating, 0);
    const averageSoloFriendliness = totalSoloFriendliness / groupReviews.length;
    
    return {
      averageSoloFriendliness: Math.round(averageSoloFriendliness * 10) / 10,
      reviewCount: groupReviews.length,
    };
  }

  async getPastEventsByGroup(groupId: string): Promise<Event[]> {
    const now = new Date();
    const allGroupEvents = await db.select().from(events)
      .where(eq(events.groupId, groupId))
      .orderBy(desc(events.date));
    
    // Filter to only past events (date before now)
    return allGroupEvents.filter((e) => new Date(e.date) < now && e.status === "approved");
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = randomUUID();
    const [review] = await db.insert(reviews).values({
      id,
      ...insertReview,
      nickname: insertReview.nickname ?? null,
    }).returning();
    return review;
  }

  async getCompanionPosts(): Promise<CompanionPost[]> {
    const allPosts = await db.select().from(companionPosts)
      .orderBy(desc(companionPosts.createdAt));
    
    return allPosts.filter((p) => new Date(p.expiresAt) > new Date());
  }

  async getCompanionPostsByEvent(eventId: string): Promise<CompanionPost[]> {
    const eventPosts = await db.select().from(companionPosts)
      .where(eq(companionPosts.eventId, eventId))
      .orderBy(desc(companionPosts.createdAt));
    
    return eventPosts.filter((p) => new Date(p.expiresAt) > new Date());
  }

  async createCompanionPost(insertPost: InsertCompanionPost): Promise<CompanionPost> {
    const id = randomUUID();
    const [post] = await db.insert(companionPosts).values({
      id,
      ...insertPost,
      preferences: insertPost.preferences ?? null,
    }).returning();
    return post;
  }

  async getArticles(): Promise<Article[]> {
    return db.select().from(articles)
      .orderBy(desc(articles.publishedAt));
  }

  async getArticle(id: string): Promise<Article | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.id, id));
    return article;
  }

  async createContactSubmission(insertSubmission: InsertContactSubmission): Promise<ContactSubmission> {
    const id = randomUUID();
    const [submission] = await db.insert(contactSubmissions).values({
      id,
      ...insertSubmission,
      name: insertSubmission.name ?? null,
      university: insertSubmission.university ?? null,
      eventName: insertSubmission.eventName ?? null,
      eventDate: insertSubmission.eventDate ?? null,
      eventLocation: insertSubmission.eventLocation ?? null,
      eventDescription: insertSubmission.eventDescription ?? null,
      eventImageUrl: insertSubmission.eventImageUrl ?? null,
    }).returning();
    return submission;
  }
}

export const storage = new DatabaseStorage();
