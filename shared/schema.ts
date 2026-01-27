import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const universities = ['岡山大学', '岡山理科大学', 'ノートルダム清心女子大学'] as const;
export type University = typeof universities[number];

export const groupCategories = ['部活', 'サークル'] as const;
export type GroupCategory = typeof groupCategories[number];

export const genres = [
  'バレーボール', 'バスケットボール', 'サッカー', 'テニス', '野球', '陸上',
  '軽音', '吹奏楽', '演劇', '写真', '映画', 'ダンス',
  'ボランティア', '国際交流', '学術', 'プログラミング',
  'その他運動系', 'その他文化系'
] as const;
export type Genre = typeof genres[number];

export const atmosphereTags = [
  'アットホーム', '真剣', 'ゆるい', '初心者歓迎', 
  '男女比良好', '少人数', '大人数', '飲み会多め', '飲み会少なめ'
] as const;
export type AtmosphereTag = typeof atmosphereTags[number];

export const articleCategories = ['あるある', '想い'] as const;
export type ArticleCategory = typeof articleCategories[number];

export const contactTypes = ['一般', 'イベント掲載依頼'] as const;
export type ContactType = typeof contactTypes[number];

export const groups = pgTable("groups", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: text("name").notNull(),
  university: text("university").notNull(),
  category: text("category").notNull(),
  genre: text("genre").notNull(),
  description: text("description").notNull(),
  atmosphereTags: text("atmosphere_tags").array().notNull(),
  beginnerFriendly: boolean("beginner_friendly").notNull().default(true),
  memberCount: integer("member_count"),
  foundedYear: integer("founded_year"),
  practiceSchedule: text("practice_schedule"),
  faqs: text("faqs"),
  contactInfo: text("contact_info"),
  instagramUrl: text("instagram_url"),
  twitterUrl: text("twitter_url"),
  lineUrl: text("line_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const events = pgTable("events", {
  id: varchar("id", { length: 36 }).primaryKey(),
  groupId: varchar("group_id", { length: 36 }).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  endDate: timestamp("end_date"),
  location: text("location").notNull(),
  requirements: text("requirements"),
  beginnerWelcome: boolean("beginner_welcome").notNull().default(true),
  soloFriendliness: integer("solo_friendliness").notNull().default(3),
  atmosphereTags: text("atmosphere_tags").array().notNull(),
  participationFlow: text("participation_flow"),
  maxParticipants: integer("max_participants"),
  imageUrl: text("image_url"),
  status: text("status").notNull().default('approved'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: varchar("id", { length: 36 }).primaryKey(),
  eventId: varchar("event_id", { length: 36 }).notNull(),
  nickname: text("nickname"),
  rating: integer("rating").notNull(),
  soloFriendlinessRating: integer("solo_friendliness_rating").notNull(),
  atmosphereRating: integer("atmosphere_rating").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const companionPosts = pgTable("companion_posts", {
  id: varchar("id", { length: 36 }).primaryKey(),
  eventId: varchar("event_id", { length: 36 }).notNull(),
  university: text("university").notNull(),
  message: text("message").notNull(),
  preferences: text("preferences"),
  contactNote: text("contact_note").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const articles = pgTable("articles", {
  id: varchar("id", { length: 36 }).primaryKey(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  tags: text("tags").array().notNull(),
  imageUrl: text("image_url"),
  publishedAt: timestamp("published_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contactSubmissions = pgTable("contact_submissions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  type: text("type").notNull(),
  name: text("name"),
  university: text("university"),
  contactMethod: text("contact_method").notNull(),
  content: text("content").notNull(),
  eventName: text("event_name"),
  eventDate: text("event_date"),
  eventLocation: text("event_location"),
  eventDescription: text("event_description"),
  eventImageUrl: text("event_image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertGroupSchema = createInsertSchema(groups).omit({ id: true, createdAt: true });
export const insertEventSchema = createInsertSchema(events).omit({ id: true, createdAt: true });
export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true });
export const insertCompanionPostSchema = createInsertSchema(companionPosts).omit({ id: true, createdAt: true });
export const insertArticleSchema = createInsertSchema(articles).omit({ id: true, createdAt: true });
export const insertContactSubmissionSchema = createInsertSchema(contactSubmissions).omit({ id: true, createdAt: true });

export type InsertGroup = z.infer<typeof insertGroupSchema>;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type InsertCompanionPost = z.infer<typeof insertCompanionPostSchema>;
export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type InsertContactSubmission = z.infer<typeof insertContactSubmissionSchema>;

export type Group = typeof groups.$inferSelect;
export type Event = typeof events.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type CompanionPost = typeof companionPosts.$inferSelect;
export type Article = typeof articles.$inferSelect;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;

export type EventWithGroup = Event & { group: Group };
export type GroupWithEvents = Group & { events: Event[] };

export type FAQ = {
  question: string;
  answer: string;
};

export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
