import { db } from "./db";
import { groups, events, reviews, articles } from "@shared/schema";

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

  const sampleArticles = [
    {
      id: "a1",
      title: "新歓あるある：最初の一歩が一番難しい",
      summary: "「行きたいけど、1人だと不安...」そんな気持ち、みんな同じです。経験者たちの新歓エピソードを紹介します。",
      content: `## 新歓って緊張しますよね

「行ってみたいけど、知り合いがいない...」
「1人で行って浮かないかな...」

新入生なら誰もが感じる不安。でも実は、経験者たちも同じ気持ちでした。

## 経験者たちの声

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
      tags: ["新歓", "1人参加", "経験者の声"],
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
      publishedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }
  ];

  await db.insert(articles).values(sampleArticles);
  console.log("Articles seeded.");

  console.log("Seeding complete!");
}

seed().catch(console.error);
