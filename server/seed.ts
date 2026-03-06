import { db } from "./db";
import { groups, events, reviews } from "@shared/schema";

async function seed() {
  console.log("Seeding database...");

  const existingGroups = await db.select().from(groups);
  if (existingGroups.length > 0) {
    console.log("Database already has data, skipping seed.");
    return;
  }

  const now = new Date();

  const sampleGroups = [
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
      instagramUrl: "https://instagram.com/example",
      twitterUrl: "https://twitter.com/example",
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
      instagramUrl: "https://instagram.com/beat_okayama",
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
      instagramUrl: "https://instagram.com/ous_soccer",
      twitterUrl: "https://twitter.com/ous_soccer",
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
      instagramUrl: "https://instagram.com/lens_photo",
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
      instagramUrl: "https://instagram.com/global_friends_nd",
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
      twitterUrl: "https://twitter.com/stage_nd",
    }
  ];

  await db.insert(groups).values(sampleGroups);
  console.log("Groups seeded.");

  const sampleEvents = [
    {
      id: "e1",
      groupId: "g1",
      title: "バレーボール部 春の新歓練習会",
      description: "初心者大歓迎！気軽にバレーボールを体験してみませんか？先輩が優しく教えます。",
      date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      location: "岡山大学 総合体育館",
      requirements: "運動できる服装、室内シューズ、タオル、飲み物",
      beginnerWelcome: true,
      soloFriendliness: 5,
      atmosphereTags: ["アットホーム", "初心者歓迎"],
      participationFlow: "1. 受付で名前を記入\n2. 準備運動\n3. 基礎練習\n4. ミニゲーム\n5. 質問タイム",
      status: "approved"
    },
    {
      id: "e2",
      groupId: "g2",
      title: "BEAT 新歓ライブ&説明会",
      description: "現役部員によるライブパフォーマンスと、サークル説明会を開催！音楽好きな方、ぜひお越しください。",
      date: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
      location: "岡山大学 学生会館 多目的ホール",
      beginnerWelcome: true,
      soloFriendliness: 4,
      atmosphereTags: ["ゆるい", "初心者歓迎"],
      participationFlow: "1. 受付\n2. ライブ鑑賞（約30分）\n3. サークル説明\n4. 楽器体験コーナー\n5. 質問・相談",
      status: "approved"
    },
    {
      id: "e3",
      groupId: "g3",
      title: "サッカー部 体験練習会",
      description: "サッカー経験者も初心者も大歓迎！一緒にボールを蹴りましょう。",
      date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      location: "岡山理科大学 グラウンド",
      requirements: "サッカーができる服装、スパイクまたは運動靴",
      beginnerWelcome: true,
      soloFriendliness: 4,
      atmosphereTags: ["真剣", "初心者歓迎"],
      status: "approved"
    },
    {
      id: "e4",
      groupId: "g4",
      title: "写真散歩 - 春の岡山城",
      description: "桜の季節に岡山城周辺を撮影しながら散歩します。スマホでの参加OK！",
      date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
      location: "岡山城 入口集合",
      requirements: "カメラまたはスマートフォン",
      beginnerWelcome: true,
      soloFriendliness: 5,
      atmosphereTags: ["ゆるい", "初心者歓迎", "少人数"],
      participationFlow: "1. 集合・自己紹介\n2. 撮影散歩（約2時間）\n3. カフェで写真共有\n4. 解散",
      status: "approved"
    },
    {
      id: "e5",
      groupId: "g5",
      title: "Global Friends 国際交流カフェ",
      description: "留学生と日本人学生が気軽に交流できるカフェイベント。英語が苦手でも大丈夫！",
      date: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000),
      location: "ノートルダム清心女子大学 学生ラウンジ",
      beginnerWelcome: true,
      soloFriendliness: 5,
      atmosphereTags: ["アットホーム", "初心者歓迎"],
      status: "approved"
    },
    {
      id: "e6",
      groupId: "g6",
      title: "演劇部 ワークショップ体験",
      description: "演技の基礎を楽しく体験！表現することの楽しさを一緒に味わいましょう。",
      date: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000),
      location: "ノートルダム清心女子大学 講堂",
      requirements: "動きやすい服装",
      beginnerWelcome: true,
      soloFriendliness: 4,
      atmosphereTags: ["アットホーム", "初心者歓迎"],
      participationFlow: "1. アイスブレイク\n2. 発声練習\n3. 簡単な演技ゲーム\n4. 部員との交流",
      status: "approved"
    }
  ];

  await db.insert(events).values(sampleEvents);
  console.log("Events seeded.");

  const sampleReviews = [
    {
      id: "r1",
      eventId: "e1",
      nickname: "バレー初心者",
      rating: 5,
      soloFriendlinessRating: 5,
      atmosphereRating: 5,
      content: "初めてのバレーボールでしたが、先輩たちがとても優しく教えてくれました！1人で参加しましたが、同じように1人で来ている人も多くて安心しました。"
    },
    {
      id: "r2",
      eventId: "e1",
      nickname: "元経験者",
      rating: 4,
      soloFriendlinessRating: 4,
      atmosphereRating: 5,
      content: "高校までバレーをしていたので久しぶりに体を動かせて楽しかったです。雰囲気がとても良くて、このサークルに入りたいと思いました！"
    },
    {
      id: "r3",
      eventId: "e2",
      nickname: "音楽好き",
      rating: 5,
      soloFriendlinessRating: 4,
      atmosphereRating: 5,
      content: "ライブがすごくかっこよかった！楽器未経験ですが、先輩が「大丈夫だよ」と言ってくれて嬉しかったです。"
    },
    {
      id: "r4",
      eventId: "e4",
      nickname: "カメラ初心者",
      rating: 5,
      soloFriendlinessRating: 5,
      atmosphereRating: 5,
      content: "スマホで参加しましたが全然大丈夫でした。撮影のコツを教えてもらえて、写真が上手くなった気がします。のんびりした雰囲気で1人でも居心地良かったです。"
    },
    {
      id: "r5",
      eventId: "e5",
      nickname: "英語苦手マン",
      rating: 4,
      soloFriendlinessRating: 5,
      atmosphereRating: 4,
      content: "英語が全然できないので不安でしたが、日本語で話せる留学生もいて楽しく過ごせました。新しい友達ができました！"
    }
  ];

  await db.insert(reviews).values(sampleReviews);
  console.log("Reviews seeded.");

  console.log("Seeding complete!");
}

seed().catch(console.error);
