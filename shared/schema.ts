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

export const submissionStatuses = ['pending', 'approved', 'rejected'] as const;
export type SubmissionStatus = typeof submissionStatuses[number];

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
  mapUrl: text("map_url"),
  status: text("status").notNull().default('approved'),
  // 繰り返し設定: 曜日リスト (0=日,1=月,...,6=土) をカンマ区切りで保存
  repeatDays: text("repeat_days"),
  // 繰り返し終了日
  repeatEndDate: timestamp("repeat_end_date"),
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

export const submissions = pgTable("submissions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  requesterEmail: text("requester_email").notNull(),
  requesterName: text("requester_name"),
  message: text("message"),
  groupName: text("group_name").notNull(),
  groupUniversity: text("group_university").notNull(),
  groupCategory: text("group_category").notNull(),
  groupGenre: text("group_genre").notNull(),
  groupDescription: text("group_description").notNull(),
  groupAtmosphereTags: text("group_atmosphere_tags").array().notNull(),
  groupContactInfo: text("group_contact_info"),
  groupInstagramUrl: text("group_instagram_url"),
  groupTwitterUrl: text("group_twitter_url"),
  groupLineUrl: text("group_line_url"),
  eventTitle: text("event_title"),
  eventDescription: text("event_description"),
  eventDate: text("event_date"),
  eventEndDate: text("event_end_date"),
  eventLocation: text("event_location"),
  eventImageUrl: text("event_image_url"),
  groupImages: text("group_images").array(),
  eventImages: text("event_images").array(),
  eventBeginnerWelcome: boolean("event_beginner_welcome"),
  eventSoloFriendliness: integer("event_solo_friendliness"),
  eventMapUrl: text("event_map_url"),
  // 繰り返し設定
  eventRepeatDays: text("event_repeat_days"),
  eventRepeatEndDate: text("event_repeat_end_date"),
  submissionType: text("submission_type").notNull().default('new'),
  targetGroupId: varchar("target_group_id", { length: 36 }),
  status: text("status").notNull().default('pending'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertGroupSchema = createInsertSchema(groups).omit({ id: true, createdAt: true });
export const insertEventSchema = createInsertSchema(events).omit({ id: true, createdAt: true });
export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true });
export const insertSubmissionSchema = createInsertSchema(submissions).omit({ id: true, createdAt: true, updatedAt: true, status: true });

export type InsertGroup = z.infer<typeof insertGroupSchema>;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;

export type Group = typeof groups.$inferSelect;
export type Event = typeof events.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Submission = typeof submissions.$inferSelect;

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
