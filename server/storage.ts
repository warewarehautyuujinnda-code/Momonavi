import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { 
  groups, events, reviews, submissions,
  type Group, type InsertGroup,
  type Event, type InsertEvent,
  type Review, type InsertReview,
  type Submission, type InsertSubmission,
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
  getGroupReviewStats(groupId: string): Promise<{ averageSoloFriendliness: number; eventCount: number }>;
  getPastEventsByGroup(groupId: string): Promise<Event[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  getSubmissions(): Promise<Submission[]>;
  getSubmission(id: string): Promise<Submission | undefined>;
  updateSubmissionStatus(id: string, status: string): Promise<Submission | undefined>;
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

  async getGroupReviewStats(groupId: string): Promise<{ averageSoloFriendliness: number; eventCount: number }> {
    const groupEvents = await db.select().from(events)
      .where(eq(events.groupId, groupId));
    
    const eventsWithSoloFriendliness = groupEvents.filter(
      (e) => e.status === "approved" && e.soloFriendliness !== null && e.soloFriendliness !== undefined
    );
    
    if (eventsWithSoloFriendliness.length === 0) {
      return { averageSoloFriendliness: 0, eventCount: 0 };
    }
    
    const totalSoloFriendliness = eventsWithSoloFriendliness.reduce((sum, e) => sum + (e.soloFriendliness || 0), 0);
    const averageSoloFriendliness = totalSoloFriendliness / eventsWithSoloFriendliness.length;
    
    return {
      averageSoloFriendliness: Math.round(averageSoloFriendliness * 10) / 10,
      eventCount: eventsWithSoloFriendliness.length,
    };
  }

  async getPastEventsByGroup(groupId: string): Promise<Event[]> {
    const now = new Date();
    const allGroupEvents = await db.select().from(events)
      .where(eq(events.groupId, groupId))
      .orderBy(desc(events.date));
    
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

  async createSubmission(insertSubmission: InsertSubmission): Promise<Submission> {
    const id = randomUUID();
    const now = new Date();
    const [submission] = await db.insert(submissions).values({
      id,
      ...insertSubmission,
      requesterName: insertSubmission.requesterName ?? null,
      message: insertSubmission.message ?? null,
      groupContactInfo: insertSubmission.groupContactInfo ?? null,
      groupInstagramUrl: insertSubmission.groupInstagramUrl ?? null,
      groupTwitterUrl: insertSubmission.groupTwitterUrl ?? null,
      groupLineUrl: insertSubmission.groupLineUrl ?? null,
      eventTitle: insertSubmission.eventTitle ?? null,
      eventDescription: insertSubmission.eventDescription ?? null,
      eventDate: insertSubmission.eventDate ?? null,
      eventEndDate: insertSubmission.eventEndDate ?? null,
      eventLocation: insertSubmission.eventLocation ?? null,
      eventImageUrl: insertSubmission.eventImageUrl ?? null,
      eventBeginnerWelcome: insertSubmission.eventBeginnerWelcome ?? null,
      eventSoloFriendliness: insertSubmission.eventSoloFriendliness ?? null,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    }).returning();
    return submission;
  }

  async getSubmissions(): Promise<Submission[]> {
    return db.select().from(submissions).orderBy(desc(submissions.createdAt));
  }

  async getSubmission(id: string): Promise<Submission | undefined> {
    const [submission] = await db.select().from(submissions).where(eq(submissions.id, id));
    return submission;
  }

  async updateSubmissionStatus(id: string, status: string): Promise<Submission | undefined> {
    const [submission] = await db.update(submissions)
      .set({ status, updatedAt: new Date() })
      .where(eq(submissions.id, id))
      .returning();
    return submission;
  }
}

export const storage = new DatabaseStorage();
