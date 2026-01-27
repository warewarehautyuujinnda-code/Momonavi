import { 
  type Group, type InsertGroup,
  type Event, type InsertEvent,
  type Review, type InsertReview,
  type CompanionPost, type InsertCompanionPost,
  type EventWithGroup, type GroupWithEvents
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Groups
  getGroups(): Promise<GroupWithEvents[]>;
  getGroup(id: string): Promise<GroupWithEvents | undefined>;
  createGroup(group: InsertGroup): Promise<Group>;
  
  // Events
  getEvents(): Promise<EventWithGroup[]>;
  getEvent(id: string): Promise<EventWithGroup | undefined>;
  getEventsByGroup(groupId: string): Promise<EventWithGroup[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  
  // Reviews
  getReviewsByEvent(eventId: string): Promise<Review[]>;
  getReviewsByGroup(groupId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Companion Posts
  getCompanionPosts(): Promise<CompanionPost[]>;
  getCompanionPostsByEvent(eventId: string): Promise<CompanionPost[]>;
  createCompanionPost(post: InsertCompanionPost): Promise<CompanionPost>;
}

export class MemStorage implements IStorage {
  private groups: Map<string, Group> = new Map();
  private events: Map<string, Event> = new Map();
  private reviews: Map<string, Review> = new Map();
  private companionPosts: Map<string, CompanionPost> = new Map();

  constructor() {
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample Groups
    const sampleGroups: (InsertGroup & { id: string })[] = [
      {
        id: "g1",
        name: "岡山大学バレーボール部",
        university: "岡山大学",
        category: "部活",
        genre: "バレーボール",
        description: "バレーボールを通じて仲間と切磋琢磨しています。初心者から経験者まで、みんなで楽しく練習しています。男女問わず大歓迎！",
        atmosphereTags: ["アットホーム", "初心者歓迎", "男女比良好"],
        beginnerFriendly: true,
        memberCount: 45,
        foundedYear: 1965,
        practiceSchedule: "週3回（月・水・金）",
        faqs: JSON.stringify([
          { question: "未経験でも入れますか？", answer: "もちろんです！毎年未経験者も多く入部しています。先輩が丁寧に教えます。" },
          { question: "練習は厳しいですか？", answer: "楽しみながらも真剣に取り組んでいます。無理のないペースで上達できます。" }
        ]),
        contactInfo: null
      },
      {
        id: "g2",
        name: "軽音楽サークル BEAT",
        university: "岡山大学",
        category: "サークル",
        genre: "軽音",
        description: "ロック、ポップス、ジャズなど様々なジャンルの音楽を楽しむサークルです。ライブ活動も活発に行っています。楽器未経験でも大丈夫！",
        atmosphereTags: ["ゆるい", "初心者歓迎", "大人数"],
        beginnerFriendly: true,
        memberCount: 80,
        foundedYear: 1990,
        practiceSchedule: "随時（バンドごと）",
        faqs: JSON.stringify([
          { question: "楽器を持っていないのですが…", answer: "サークルで貸し出せる楽器もあります。まずは体験に来てください！" },
          { question: "ライブはありますか？", answer: "学園祭や定期ライブなど、年に数回発表の機会があります。" }
        ]),
        contactInfo: null
      },
      {
        id: "g3",
        name: "岡山理科大学サッカー部",
        university: "岡山理科大学",
        category: "部活",
        genre: "サッカー",
        description: "リーグ戦での上位入賞を目指して日々練習に励んでいます。チームワークを大切にし、仲間と共に成長できる環境です。",
        atmosphereTags: ["真剣", "初心者歓迎", "大人数"],
        beginnerFriendly: true,
        memberCount: 55,
        foundedYear: 1972,
        practiceSchedule: "週4回（火・木・土・日）",
        faqs: null,
        contactInfo: null
      },
      {
        id: "g4",
        name: "写真部 Lens",
        university: "岡山理科大学",
        category: "サークル",
        genre: "写真",
        description: "カメラを通じて日常の美しさを切り取ります。撮影会や展示会を定期的に開催。スマホカメラでも参加OK！",
        atmosphereTags: ["ゆるい", "初心者歓迎", "少人数"],
        beginnerFriendly: true,
        memberCount: 25,
        foundedYear: 2005,
        practiceSchedule: "月2回（土曜日）",
        faqs: null,
        contactInfo: null
      },
      {
        id: "g5",
        name: "国際交流サークル Global Friends",
        university: "ノートルダム清心女子大学",
        category: "サークル",
        genre: "国際交流",
        description: "留学生との交流や、異文化理解を深める活動をしています。英語が苦手でも大丈夫！楽しみながら国際感覚を身につけよう。",
        atmosphereTags: ["アットホーム", "初心者歓迎", "少人数"],
        beginnerFriendly: true,
        memberCount: 30,
        foundedYear: 2010,
        practiceSchedule: "週1回（水曜日）",
        faqs: null,
        contactInfo: null
      },
      {
        id: "g6",
        name: "演劇部 Stage",
        university: "ノートルダム清心女子大学",
        category: "部活",
        genre: "演劇",
        description: "年に2回の公演に向けて、演技から舞台づくりまで全員で取り組みます。表現することの楽しさを一緒に体験しませんか？",
        atmosphereTags: ["真剣", "アットホーム", "初心者歓迎"],
        beginnerFriendly: true,
        memberCount: 20,
        foundedYear: 1985,
        practiceSchedule: "週3回（月・木・土）",
        faqs: null,
        contactInfo: null
      }
    ];

    sampleGroups.forEach((g) => {
      const group: Group = {
        ...g,
        createdAt: new Date()
      };
      this.groups.set(g.id, group);
    });

    // Sample Events
    const now = new Date();
    const sampleEvents: (InsertEvent & { id: string })[] = [
      {
        id: "e1",
        groupId: "g1",
        title: "バレー部 新入生歓迎練習会",
        description: "新入生向けの体験練習会です！バレーボールに触れたことがない方も大歓迎。動きやすい服装でお越しください。先輩たちが優しくサポートします。",
        date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        location: "岡山大学 体育館A",
        requirements: "動きやすい服装、室内シューズ、タオル、飲み物",
        beginnerWelcome: true,
        soloFriendliness: 5,
        atmosphereTags: ["アットホーム", "初心者歓迎"],
        participationFlow: "1. 受付で名前を書く\n2. 準備体操\n3. 基本練習体験\n4. ミニゲーム\n5. 質問タイム・交流会",
        maxParticipants: 30,
        status: "approved"
      },
      {
        id: "e2",
        groupId: "g2",
        title: "軽音サークル 楽器体験会",
        description: "ギター、ベース、ドラム、キーボードなど様々な楽器を体験できます。楽器に触ったことがなくても大丈夫！先輩が一から教えます。",
        date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
        location: "岡山大学 学生会館 音楽室",
        requirements: "特になし",
        beginnerWelcome: true,
        soloFriendliness: 4,
        atmosphereTags: ["ゆるい", "初心者歓迎"],
        participationFlow: "1. 自己紹介\n2. 楽器紹介\n3. 楽器体験（ローテーション）\n4. 先輩のミニライブ\n5. 質問・交流タイム",
        maxParticipants: 50,
        status: "approved"
      },
      {
        id: "e3",
        groupId: "g3",
        title: "サッカー部 新歓ミニゲーム大会",
        description: "気軽に参加できるミニゲーム大会です。経験者も未経験者も混ざって楽しくプレーしましょう！",
        date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        location: "岡山理科大学 グラウンド",
        requirements: "動きやすい服装、スパイクまたは運動靴、飲み物",
        beginnerWelcome: true,
        soloFriendliness: 3,
        atmosphereTags: ["真剣", "初心者歓迎"],
        participationFlow: "1. 集合・ウォームアップ\n2. チーム分け\n3. ミニゲーム\n4. 休憩・交流\n5. 部活動紹介",
        maxParticipants: 40,
        status: "approved"
      },
      {
        id: "e4",
        groupId: "g4",
        title: "春の撮影会 in 後楽園",
        description: "岡山の名所・後楽園で春の風景を撮影します。スマホでも一眼でも参加OK！撮影のコツを教えながら、のんびり散策しましょう。",
        date: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
        location: "後楽園 正門前集合",
        requirements: "カメラまたはスマートフォン",
        beginnerWelcome: true,
        soloFriendliness: 5,
        atmosphereTags: ["ゆるい", "初心者歓迎", "少人数"],
        participationFlow: "1. 集合・自己紹介\n2. 撮影基礎レクチャー\n3. 園内散策・撮影\n4. 写真共有会\n5. お茶しながら交流",
        maxParticipants: 15,
        status: "approved"
      },
      {
        id: "e5",
        groupId: "g5",
        title: "Welcome Party 2024",
        description: "留学生と日本人学生が一緒に楽しむパーティーです！ゲームやおしゃべりを通じて友達を作りましょう。英語が話せなくても大丈夫！",
        date: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        location: "ノートルダム清心女子大学 カフェテリア",
        requirements: "特になし",
        beginnerWelcome: true,
        soloFriendliness: 4,
        atmosphereTags: ["アットホーム", "初心者歓迎"],
        participationFlow: "1. 受付\n2. アイスブレイクゲーム\n3. フリートーク\n4. サークル紹介\n5. 連絡先交換タイム",
        maxParticipants: 40,
        status: "approved"
      },
      {
        id: "e6",
        groupId: "g6",
        title: "演劇ワークショップ「表現を楽しもう」",
        description: "演技未経験でも楽しめるワークショップです。声の出し方、体の使い方など、表現の基礎を体験しましょう！",
        date: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        location: "ノートルダム清心女子大学 多目的ホール",
        requirements: "動きやすい服装",
        beginnerWelcome: true,
        soloFriendliness: 4,
        atmosphereTags: ["アットホーム", "初心者歓迎"],
        participationFlow: "1. ストレッチ・発声練習\n2. 表現ゲーム\n3. 簡単なシーン体験\n4. 過去公演の紹介\n5. 質問・交流タイム",
        maxParticipants: 20,
        status: "approved"
      }
    ];

    sampleEvents.forEach((e) => {
      const event: Event = {
        ...e,
        createdAt: new Date()
      };
      this.events.set(e.id, event);
    });

    // Sample Reviews
    const sampleReviews: (InsertReview & { id: string })[] = [
      {
        id: "r1",
        eventId: "e1",
        nickname: "新入生A",
        rating: 5,
        soloFriendlinessRating: 5,
        atmosphereRating: 5,
        content: "1人で参加しましたが、先輩たちがすごく優しくて楽しかったです！バレー初心者でしたが、基本から丁寧に教えてもらえました。入部を決めました！"
      },
      {
        id: "r2",
        eventId: "e2",
        nickname: null,
        rating: 4,
        soloFriendlinessRating: 4,
        atmosphereRating: 5,
        content: "いろんな楽器に触れて楽しかった。ドラムが思ったより難しかったけど、先輩が優しく教えてくれた。ギターやってみたいと思った！"
      },
      {
        id: "r3",
        eventId: "e4",
        nickname: "カメラ初心者",
        rating: 5,
        soloFriendlinessRating: 5,
        atmosphereRating: 5,
        content: "スマホしか持ってなかったけど、構図の取り方とか教えてもらって写真が上手くなった気がする！後楽園きれいだった〜"
      }
    ];

    sampleReviews.forEach((r) => {
      const review: Review = {
        ...r,
        createdAt: new Date()
      };
      this.reviews.set(r.id, review);
    });
  }

  // Groups
  async getGroups(): Promise<GroupWithEvents[]> {
    const groups = Array.from(this.groups.values());
    return groups.map((group) => ({
      ...group,
      events: Array.from(this.events.values()).filter((e) => e.groupId === group.id)
    }));
  }

  async getGroup(id: string): Promise<GroupWithEvents | undefined> {
    const group = this.groups.get(id);
    if (!group) return undefined;
    return {
      ...group,
      events: Array.from(this.events.values()).filter((e) => e.groupId === group.id)
    };
  }

  async createGroup(insertGroup: InsertGroup): Promise<Group> {
    const id = randomUUID();
    const group: Group = {
      ...insertGroup,
      id,
      createdAt: new Date()
    };
    this.groups.set(id, group);
    return group;
  }

  // Events
  async getEvents(): Promise<EventWithGroup[]> {
    const events = Array.from(this.events.values());
    return events
      .filter((e) => e.status === "approved")
      .map((event) => ({
        ...event,
        group: this.groups.get(event.groupId)!
      }))
      .filter((e) => e.group);
  }

  async getEvent(id: string): Promise<EventWithGroup | undefined> {
    const event = this.events.get(id);
    if (!event) return undefined;
    const group = this.groups.get(event.groupId);
    if (!group) return undefined;
    return { ...event, group };
  }

  async getEventsByGroup(groupId: string): Promise<EventWithGroup[]> {
    const group = this.groups.get(groupId);
    if (!group) return [];
    return Array.from(this.events.values())
      .filter((e) => e.groupId === groupId && e.status === "approved")
      .map((event) => ({ ...event, group }));
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = randomUUID();
    const event: Event = {
      ...insertEvent,
      id,
      createdAt: new Date()
    };
    this.events.set(id, event);
    return event;
  }

  // Reviews
  async getReviewsByEvent(eventId: string): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter((r) => r.eventId === eventId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getReviewsByGroup(groupId: string): Promise<Review[]> {
    const groupEventIds = Array.from(this.events.values())
      .filter((e) => e.groupId === groupId)
      .map((e) => e.id);
    return Array.from(this.reviews.values())
      .filter((r) => groupEventIds.includes(r.eventId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = randomUUID();
    const review: Review = {
      ...insertReview,
      id,
      createdAt: new Date()
    };
    this.reviews.set(id, review);
    return review;
  }

  // Companion Posts
  async getCompanionPosts(): Promise<CompanionPost[]> {
    return Array.from(this.companionPosts.values())
      .filter((p) => new Date(p.expiresAt) > new Date())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getCompanionPostsByEvent(eventId: string): Promise<CompanionPost[]> {
    return Array.from(this.companionPosts.values())
      .filter((p) => p.eventId === eventId && new Date(p.expiresAt) > new Date())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createCompanionPost(insertPost: InsertCompanionPost): Promise<CompanionPost> {
    const id = randomUUID();
    const post: CompanionPost = {
      ...insertPost,
      id,
      createdAt: new Date()
    };
    this.companionPosts.set(id, post);
    return post;
  }
}

export const storage = new MemStorage();
