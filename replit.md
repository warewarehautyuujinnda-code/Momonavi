# 新歓ナビ (MOMONAVI) - 岡山の大学新入生向け新歓イベント検索サービス

## Overview
大学新入生の「行動量」を増やすことを目的としたWebサービス。特に「行きたいが一歩が出ない」層の心理的ハードルを下げ、安心材料を提供し、行動を起こせる導線を設計。

### 対象大学
- 岡山大学
- 岡山理科大学
- ノートルダム清心女子大学

## 技術スタック
- **Frontend**: React + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL + Drizzle ORM (PostgreSQL単一構成、Notion依存なし)
- **State Management**: TanStack Query
- **Routing**: wouter
- **Validation**: Zod + drizzle-zod
- **Email**: nodemailer (SMTP)

## プロジェクト構成

```
client/src/
├── pages/
│   ├── events.tsx         # ホームページ (ヒーロー + イベント検索)
│   ├── event-detail.tsx   # イベント詳細
│   ├── groups.tsx         # 団体検索
│   ├── group-detail.tsx   # 団体詳細
│   └── contact.tsx        # お問い合わせ＆掲載依頼 (3タブ: 掲載依頼/お問い合わせ/FAQ、プレビューSheet付き)
├── components/
│   ├── layout/
│   │   ├── header.tsx     # 3項目ナビ + モバイル対応
│   │   ├── footer.tsx     # サイト公式リンク (Instagram)
│   │   └── layout.tsx
│   ├── events/
│   │   ├── event-card.tsx
│   │   ├── event-calendar-view.tsx
│   │   ├── event-filters.tsx
│   │   ├── review-card.tsx
│   │   └── review-form.tsx
│   └── groups/
│       └── group-card.tsx
shared/
└── schema.ts              # 共通型定義 (Group, Event, Review, Submission)
server/
├── db.ts                  # データベース接続
├── routes.ts              # APIルート
├── seed.ts                # 初期データ投入スクリプト
├── storage.ts             # データベースストレージ
└── services/
    └── mail.ts            # メール送信サービス (nodemailer)
```

## API エンドポイント

### Events
- `GET /api/events` - 全イベント取得
- `GET /api/events/:id` - イベント詳細取得
- `GET /api/events/:id/reviews` - イベントのレビュー取得
- `POST /api/events/:id/reviews` - レビュー投稿

### Groups
- `GET /api/groups` - 全団体取得
- `GET /api/groups/:id` - 団体詳細取得
- `GET /api/groups/:id/events` - 団体のイベント取得
- `GET /api/groups/:id/reviews` - 団体のレビュー取得

### Submissions (掲載依頼)
- `POST /api/submissions` - 掲載依頼送信 → 管理者メール通知
- `GET /api/submissions` - 一覧取得 (admin認証必要)
- `POST /api/submissions/:id/approve` - 承認 → 団体/イベント自動登録 → 申請者メール通知

admin認証: `x-admin-key` ヘッダーに `SESSION_SECRET` の値を設定

## データモデル

### Group（団体）
- 大学、団体区分（部活/サークル）、ジャンル
- 雰囲気タグ、初心者歓迎フラグ
- 部員数、設立年、活動日
- よくある質問（FAQ）
- 外部リンク（instagramUrl, twitterUrl, lineUrl）

### Event（イベント）
- 開催日時（開始時刻）、終了時刻、場所、持ち物
- 雰囲気タグ、参加の流れ
- 1人参加しやすさは過去レビューから算出

### Review（レビュー）
- 匿名ニックネーム
- 総合評価、1人参加しやすさ評価、雰囲気評価
- レビュー本文

### Submission（掲載依頼）
- 申請者メール (必須)、申請者名
- 団体情報 (必須): name, university, category, genre, description, atmosphereTags, SNS URLs
- イベント情報 (任意): title, description, date, location, imageUrl, beginnerWelcome, soloFriendliness
- ステータス: pending / approved / rejected
- 自由記述メッセージ

## 主要機能

### 実装済み
1. ホームページ (イベントページ) - ヒーローセクション + イベント検索
   - ロゴ、タグライン、価値提案の3つの理由、クイックリンクボタン
2. イベント検索 - 大学/団体区分/ジャンル/1人参加しやすさ/日付範囲でフィルター
   - カレンダー表示モード
3. イベント詳細 - 情報表示 + レビュー閲覧・投稿
   - 共有ボタン、Googleカレンダー追加、Google Maps埋め込み
4. 団体検索 - フィルター機能付き
5. 団体詳細 - 基本情報 + FAQ + 関連イベント + 外部リンク
6. お問い合わせ＆掲載依頼 - タブ切替 (掲載依頼 / FAQ)
   - 掲載依頼フォーム + リアルタイムプレビュー (GroupPreviewCard / EventPreviewCard)
   - 送信 → 管理者メール通知
7. メール通知 - 掲載依頼受信時の管理者通知、承認時の申請者通知

### グローバルナビゲーション（3項目）
1. イベント情報 (/)
2. 団体紹介 (/groups)
3. お問い合わせ＆掲載依頼 (/contact)

## メール設定 (環境変数)
- `SMTP_HOST` - SMTPサーバーホスト
- `SMTP_PORT` - SMTPポート
- `SMTP_USER` - SMTP認証ユーザー
- `SMTP_PASS` - SMTP認証パスワード
- `ADMIN_EMAIL` - 管理者通知先メール
- `MAIL_FROM` - 送信元メールアドレス

未設定の場合はメール送信をスキップし警告ログを出力（アプリの動作には影響なし）

## デザイン

### カラースキーム
- Primary: 紫 (262 83% 58%) - ワクワク感、若々しさ
- 全体を紫のトーンで統一
- モダンでクリーン、学生目線のUI

### モバイルファースト
- スマホ利用がメイン想定
- 片手操作、読みやすさ重視
- レスポンシブデザイン対応
- モバイルメニュー（ハンバーガー）対応

### コンポーネントスタイル
- rounded-2xl, shadow-sm を基本としたカードデザイン
- container-narrow でコンテンツ幅を制限

### フォント
- 本文: Inter + Noto Sans JP
- 見出し（ワクワク感）: M PLUS Rounded 1c (`font-rounded` クラス)

### スクロールアニメーション（Reveal Animation）
スクロールで要素が表示領域に入ったタイミングでアニメーション。

**使い方**: `data-reveal` 属性を付けるだけで動作

```html
<h1 data-reveal="stagger" data-reveal-stagger="30">見出しテキスト</h1>
<p data-reveal="stagger-word" data-reveal-stagger="60">本文テキスト</p>
<div data-reveal="fade" data-reveal-delay="200">コンテンツ</div>
```

## 荒らし対策
- URL・スパムパターンの検出
- 投稿時の注意喚起UI
- 匿名投稿（認証なし）

## 開発メモ
- フロントエンドは0.0.0.0:5000でサーブ
- TanStack Query v5使用（オブジェクト形式のquery関数）
- apiRequestは (method, url, data) の形式
- 外部リンクはrel="noopener noreferrer"で安全に開く

## 最近の変更（2026年3月）
- Notion依存を完全撤廃、PostgreSQL単一構成に移行
- 「仲間を探す」「記事」機能を削除
- ホームページを削除、イベントページをメインページ化（ヒーロー付き）
- お問い合わせページを「お問い合わせ＆掲載依頼」にリニューアル（プレビュー付きフォーム）
- submissions テーブル追加（掲載依頼管理）
- nodemailer によるメール通知機能追加
- ナビゲーションを5項目→3項目に簡素化
- articles, companion_posts, contact_submissions テーブルを削除
- server/notion.ts, server/notion-sync.ts, server/scheduler.ts を削除
