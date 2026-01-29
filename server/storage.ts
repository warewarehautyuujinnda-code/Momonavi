import { 
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
  
  // Articles
  getArticles(): Promise<Article[]>;
  getArticle(id: string): Promise<Article | undefined>;
  
  // Contact
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
}

export class MemStorage implements IStorage {
  private groups: Map<string, Group> = new Map();
  private events: Map<string, Event> = new Map();
  private reviews: Map<string, Review> = new Map();
  private companionPosts: Map<string, CompanionPost> = new Map();
  private articles: Map<string, Article> = new Map();
  private contactSubmissions: Map<string, ContactSubmission> = new Map();

  constructor() {
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample Groups with external links
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
        contactInfo: null,
        instagramUrl: "https://instagram.com/example",
        twitterUrl: "https://twitter.com/example",
        lineUrl: null
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
        contactInfo: null,
        instagramUrl: "https://instagram.com/beat_okayama",
        twitterUrl: null,
        lineUrl: "https://line.me/example"
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
        contactInfo: null,
        instagramUrl: "https://instagram.com/ous_soccer",
        twitterUrl: "https://twitter.com/ous_soccer",
        lineUrl: null
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
        contactInfo: null,
        instagramUrl: "https://instagram.com/lens_photo",
        twitterUrl: null,
        lineUrl: null
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
        contactInfo: null,
        instagramUrl: "https://instagram.com/global_friends_nd",
        twitterUrl: null,
        lineUrl: "https://line.me/globalfriends"
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
        contactInfo: null,
        instagramUrl: null,
        twitterUrl: "https://twitter.com/stage_nd",
        lineUrl: null
      }
    ];

    sampleGroups.forEach((g) => {
      const group: Group = {
        id: g.id,
        name: g.name,
        university: g.university,
        category: g.category,
        genre: g.genre,
        description: g.description,
        atmosphereTags: g.atmosphereTags,
        beginnerFriendly: g.beginnerFriendly ?? true,
        memberCount: g.memberCount ?? null,
        foundedYear: g.foundedYear ?? null,
        practiceSchedule: g.practiceSchedule ?? null,
        faqs: g.faqs ?? null,
        contactInfo: g.contactInfo ?? null,
        instagramUrl: g.instagramUrl ?? null,
        twitterUrl: g.twitterUrl ?? null,
        lineUrl: g.lineUrl ?? null,
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
        imageUrl: null,
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
        imageUrl: null,
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
        imageUrl: null,
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
        imageUrl: null,
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
        imageUrl: null,
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
        imageUrl: null,
        status: "approved"
      }
    ];

    sampleEvents.forEach((e) => {
      const event: Event = {
        id: e.id,
        groupId: e.groupId,
        title: e.title,
        description: e.description,
        date: e.date,
        endDate: e.endDate ?? null,
        location: e.location,
        requirements: e.requirements ?? null,
        beginnerWelcome: e.beginnerWelcome ?? true,
        soloFriendliness: e.soloFriendliness ?? 3,
        atmosphereTags: e.atmosphereTags,
        participationFlow: e.participationFlow ?? null,
        maxParticipants: e.maxParticipants ?? null,
        imageUrl: e.imageUrl ?? null,
        status: e.status ?? "pending",
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
        id: r.id,
        eventId: r.eventId,
        nickname: r.nickname ?? null,
        rating: r.rating,
        soloFriendlinessRating: r.soloFriendlinessRating,
        atmosphereRating: r.atmosphereRating,
        content: r.content,
        createdAt: new Date()
      };
      this.reviews.set(r.id, review);
    });

    // Sample Articles
    const sampleArticles: (InsertArticle & { id: string })[] = [
      {
        id: "a1",
        title: "新歓あるある：最初の一歩が一番難しい",
        summary: "「行きたいけど、1人だと不安...」そんな気持ち、みんな同じです。先輩たちの新歓エピソードを紹介します。",
        content: `## 新歓って緊張しますよね

「行ってみたいけど、知り合いがいない...」
「1人で行って浮かないかな...」

新入生なら誰もが感じる不安。でも実は、先輩たちも同じ気持ちでした。

## 先輩たちの声

### バレー部3年 田中さん
「私も1年の時は、1人で新歓に行くのがすごく怖かったです。でも行ってみたら、同じように1人で来てる子がたくさんいて、すぐ仲良くなれました。今では一番の親友です。」

### 軽音サークル2年 佐藤さん
「最初は友達と行こうとしてたけど、予定が合わなくて結局1人で参加。正直不安でしたが、先輩がすごく話しかけてくれて、気づいたら3時間くらい楽しんでました（笑）」

## 1人参加のコツ

1. **最初の5分だけ頑張る** - 受付を済ませたら、あとは流れに任せるだけ
2. **質問を1つ用意しておく** - 「普段の練習は何をしますか？」など、話すきっかけになる
3. **同じように1人の子を探す** - 案外たくさんいます

## 最後に

新歓は「行く」か「行かない」かの二択。迷ったら行ってみよう。
何も起きなければ帰ればいいだけ。でも、一生の友達に出会えるかもしれない。`,
        category: "あるある",
        tags: ["新歓", "1人参加", "先輩の声"],
        imageUrl: null,
        publishedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        id: "a2",
        title: "サークル選びで失敗しないための3つのポイント",
        summary: "「入ってから後悔したくない」という方へ。サークル選びで大切なことをまとめました。",
        content: `## サークル選び、迷いますよね

大学には数十〜数百のサークルや部活があります。
「どれを選べばいいか分からない」という声をよく聞きます。

ここでは、サークル選びで後悔しないためのポイントを3つ紹介します。

## ポイント1：雰囲気を見る

パンフレットやSNSだけでは分からないのが「雰囲気」。
実際に新歓に行って、メンバーの様子を見てみましょう。

チェックポイント：
- 先輩同士の関係性は良さそう？
- 新入生への対応は丁寧？
- 自分と雰囲気が合いそう？

## ポイント2：活動頻度を確認

「週1のつもりが週5だった...」なんてことも。
入る前に必ず確認しましょう。

質問例：
- 普段の練習は週何回ですか？
- 練習に来れない日があっても大丈夫ですか？
- 試験期間中はどうなりますか？

## ポイント3：複数見て比較する

1つだけ見て決めるのはもったいない！
最低3つは見学して、比較してみましょう。

意外と「第二志望だったサークルの方が合ってた」なんてこともあります。

## 焦らなくて大丈夫

4月中に決める必要はありません。
5月、6月に入部する人もたくさんいます。

じっくり選んで、4年間楽しめる場所を見つけてください。`,
        category: "あるある",
        tags: ["サークル選び", "ポイント", "新入生向け"],
        imageUrl: null,
        publishedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        id: "a3",
        title: "なぜ、このサイトを作ったのか",
        summary: "新歓、行くのダルくないですか？過去の自分に向けて、このサイトを作りました。",
        content: `## 新歓、行くのダルくないですか？

運営者の私は2021年に、岡山大学経済学部に入学しました。
当時はコロナ禍で、授業のほとんどがオンライン。サークルの新歓も思うように行われない時期でした。

そんな中、田舎の高知県から進学してきた人見知りの私は、正直、新歓に行くのがとてもだるかったです。
結局、1年生のときに参加したのは、高校時代にバレーボールをしていた流れで行った、2つのバレーボールサークルだけでした。

2つのサークルに入ったものの、なかなか馴染めず、1年生の間はほとんど顔を出しませんでした。
今振り返ると、この時期にあまり行動しなかったことを、少し後悔しています。

## 遅れて始まった大学生活

大学2年生の終わり頃から、少しずつサークルの仲間と打ち解けていきました。
3年生になる頃には、週に3回サークルに参加するようになり、ようやく大学生活を楽しめるようになっていました。

今思うと、時間はかかりましたが、
サークルという場所が、自分にとって「安心できる空間」に変わったことが大きかったのだと思います。

## 就活で気づいた「行動量」の差

3年生になると、就職活動が始まります。
私も先輩に恵まれ、比較的早い段階から就活に取り組みました。

そこで直面したのが、「ガクチカ」という言葉でした。
簡単に言えば、「学生時代にどんなことをしてきましたか？」という質問です。

当時の私のガクチカは、
「1週間連続で飲みに行ったこと」くらいしかなく、
正直、これは就活終わったな…と感じました。

一方で、周りの学生、特に都会の学生は、とても充実した学生生活を送っているように見えました。
話を聞いてみると、そうした人たちは、私が「コロナだから」と動かなかった時期にも、何度も挑戦をしていた人たちでした。

ここで初めて、行動量の差が、経験の差になるということを実感しました。

## それでも、やっぱり行動はダルい

就活を通して、行動してこなかった自分への後悔が強くなりました。
その後、私は1年間大学を休学し、岡山の会社で働いたり、海外留学に挑戦したりしました。

そこで改めて気づいたのは、
行動の大切さを理解していても、行動そのものはやっぱりだるいということです。

「だるい」という感情は、
行動する前に立ちはだかる壁が高すぎるとき、
もしくは、その壁を越える理由をまだ持てていないときに生まれるのではないか。
私はそう考えています。

インターンでも、留学でも、不安やだるさが行動を止めようとした瞬間は、何度もありました。

## 行動の壁を、少しだけ低くしたかった

だからこそ、私はこのサイトを作りました。

行動するときに立ちはだかる壁は、大きく分けて3つあると思っています。

1つ目は、興味の壁
2つ目は、情報の壁
3つ目は、不安の壁

1つ目と2つ目は、実はそこまで高くありません。
大学の公式サイトやInstagramを見れば、情報は簡単に手に入ります。

一番高いのは、3つ目の「不安の壁」です。

1人になったらどうしよう

行って浮いたらどうしよう

変な勧誘をされたらどうしよう

こうした不安は、なかなか簡単には消えません。

## このサイトで用意した2つの仕組み

この不安を少しでも減らしたいと思い、主に2つの機能を用意しました。

1つ目は、イベントのレビュー機能です。
実際に参加した学生が、イベントの雰囲気や感想を共有することで、「自分も行けそう」と感じてもらえるようにしています。

2つ目は、仲間を見つける仕組みです。
興味はあるけど、友達を誘うのは気が引ける。
そんなときに、同じイベントに興味を持つ人同士が、一緒に行けるきっかけを作りたいと考えました。

## 最後に

このサイトは、
過去の、行動できなかった自分に向けて作りました。

そして今、
「行ってみたいけど、だるい」
そう感じている人のための場所です。

合わなかったら、行かなくていい。
途中で帰ってもいい。
見るだけでもいい。

このサイトが、みなさんの行動のハードルを少しでも下げられたら嬉しいです。

みなさんの学生生活が、少しでも充実したものになることを願っています。

HINATA`,
        category: "想い",
        tags: ["運営者", "想い", "行動量", "HINATA"],
        imageUrl: null,
        publishedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000)
      },
      {
        id: "a4",
        title: "「友達できるかな」の不安を乗り越えた話",
        summary: "大学で友達ができるか不安だった私が、どうやって仲間を見つけたのかを振り返ります。",
        content: `## 入学前の不安

高校の友達は地元に残り、私だけ岡山へ。
「友達できるかな...」という不安で、入学式の前夜は眠れませんでした。

## 最初の1週間

入学式、ガイダンス、授業開始。
周りを見ると、すでにグループができている気がして焦りました。

「出遅れた」と思いました。

## 転機は新歓

そんな時、ふと目に入った新歓のチラシ。
「1人参加大歓迎」の文字に惹かれて、勇気を出して参加しました。

行ってみたら、同じように1人で来ている子がたくさん。
「あ、みんな同じなんだ」と気づいた瞬間、肩の力が抜けました。

## 今思うこと

結局、最初にできたグループが一生続くわけじゃない。
大学は、いつでも新しい出会いがある場所です。

焦らなくていい。
でも、チャンスが来たら飛び込んでみて。

きっと、あなたを待っている仲間がいます。`,
        category: "あるある",
        tags: ["友達", "不安", "体験談"],
        imageUrl: null,
        publishedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      }
    ];

    sampleArticles.forEach((a) => {
      const article: Article = {
        id: a.id,
        title: a.title,
        summary: a.summary,
        content: a.content,
        category: a.category,
        tags: a.tags,
        imageUrl: a.imageUrl ?? null,
        publishedAt: a.publishedAt,
        createdAt: new Date()
      };
      this.articles.set(a.id, article);
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
      id,
      name: insertGroup.name,
      university: insertGroup.university,
      category: insertGroup.category,
      genre: insertGroup.genre,
      description: insertGroup.description,
      atmosphereTags: insertGroup.atmosphereTags,
      beginnerFriendly: insertGroup.beginnerFriendly ?? true,
      memberCount: insertGroup.memberCount ?? null,
      foundedYear: insertGroup.foundedYear ?? null,
      practiceSchedule: insertGroup.practiceSchedule ?? null,
      faqs: insertGroup.faqs ?? null,
      contactInfo: insertGroup.contactInfo ?? null,
      instagramUrl: insertGroup.instagramUrl ?? null,
      twitterUrl: insertGroup.twitterUrl ?? null,
      lineUrl: insertGroup.lineUrl ?? null,
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
      id,
      groupId: insertEvent.groupId,
      title: insertEvent.title,
      description: insertEvent.description,
      date: insertEvent.date,
      endDate: insertEvent.endDate ?? null,
      location: insertEvent.location,
      requirements: insertEvent.requirements ?? null,
      beginnerWelcome: insertEvent.beginnerWelcome ?? true,
      soloFriendliness: insertEvent.soloFriendliness ?? 3,
      atmosphereTags: insertEvent.atmosphereTags,
      participationFlow: insertEvent.participationFlow ?? null,
      maxParticipants: insertEvent.maxParticipants ?? null,
      imageUrl: insertEvent.imageUrl ?? null,
      status: insertEvent.status ?? "pending",
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
      id,
      eventId: insertReview.eventId,
      nickname: insertReview.nickname ?? null,
      rating: insertReview.rating,
      soloFriendlinessRating: insertReview.soloFriendlinessRating,
      atmosphereRating: insertReview.atmosphereRating,
      content: insertReview.content,
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
      id,
      eventId: insertPost.eventId,
      university: insertPost.university,
      message: insertPost.message,
      preferences: insertPost.preferences ?? null,
      contactNote: insertPost.contactNote,
      expiresAt: insertPost.expiresAt,
      createdAt: new Date()
    };
    this.companionPosts.set(id, post);
    return post;
  }

  // Articles
  async getArticles(): Promise<Article[]> {
    return Array.from(this.articles.values())
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }

  async getArticle(id: string): Promise<Article | undefined> {
    return this.articles.get(id);
  }

  // Contact
  async createContactSubmission(insertSubmission: InsertContactSubmission): Promise<ContactSubmission> {
    const id = randomUUID();
    const submission: ContactSubmission = {
      id,
      type: insertSubmission.type,
      name: insertSubmission.name ?? null,
      university: insertSubmission.university ?? null,
      contactMethod: insertSubmission.contactMethod,
      content: insertSubmission.content,
      eventName: insertSubmission.eventName ?? null,
      eventDate: insertSubmission.eventDate ?? null,
      eventLocation: insertSubmission.eventLocation ?? null,
      eventDescription: insertSubmission.eventDescription ?? null,
      eventImageUrl: insertSubmission.eventImageUrl ?? null,
      createdAt: new Date()
    };
    this.contactSubmissions.set(id, submission);
    return submission;
  }
}

export const storage = new MemStorage();
