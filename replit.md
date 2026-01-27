# 新歓ナビ - 岡山の大学新入生向け新歓イベント検索サービス

## Overview
大学新入生の「行動量」を増やすことを目的としたWebサービス。特に「行きたいが一歩が出ない」層の心理的ハードルを下げ、安心材料を提供し、行動を起こせる導線を設計。

### 対象大学
- 岡山大学
- 岡山理科大学
- ノートルダム清心女子大学

## 技術スタック
- **Frontend**: React + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Express.js + TypeScript
- **State Management**: TanStack Query
- **Routing**: wouter
- **Validation**: Zod + drizzle-zod
- **Storage**: In-memory (MemStorage)

## プロジェクト構成

```
client/src/
├── pages/
│   ├── home.tsx           # トップページ
│   ├── events.tsx         # イベント検索
│   ├── event-detail.tsx   # イベント詳細
│   ├── groups.tsx         # 団体検索
│   └── group-detail.tsx   # 団体詳細
├── components/
│   ├── layout/
│   │   ├── header.tsx
│   │   └── layout.tsx
│   ├── events/
│   │   ├── event-card.tsx
│   │   ├── event-filters.tsx
│   │   ├── review-card.tsx
│   │   └── review-form.tsx
│   └── groups/
│       └── group-card.tsx
shared/
└── schema.ts              # 共通型定義（Group, Event, Review等）
server/
├── routes.ts              # APIルート
└── storage.ts             # データストレージ + サンプルデータ
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

## データモデル

### Group（団体）
- 大学、団体区分（部活/サークル）、ジャンル
- 雰囲気タグ、初心者歓迎フラグ
- 部員数、設立年、活動日
- よくある質問（FAQ）

### Event（イベント）
- 開催日時、場所、持ち物
- 初心者歓迎フラグ、1人参加しやすさ（1-5）
- 雰囲気タグ、参加の流れ
- 承認状態（pending/approved/rejected）

### Review（レビュー）
- 匿名ニックネーム
- 総合評価、1人参加しやすさ評価、雰囲気評価
- レビュー本文

## 主要機能

### MVP（実装済み）
1. トップページ - キャッチコピー + イベント検索への導線
2. イベント検索 - 大学/団体区分/ジャンル/1人参加しやすさでフィルター
3. イベント詳細 - 情報表示 + レビュー閲覧・投稿
4. 団体検索 - フィルター機能付き
5. 団体詳細 - 基本情報 + FAQ + 関連イベント

### 今後追加予定
- 同行募集掲示板
- イベント追加フォーム（運営承認制）
- reCAPTCHA等の高度なスパム対策
- 管理者画面

## デザイン

### カラースキーム
- Primary: 紫 (262 83% 58%) - ワクワク感、若々しさ
- Accent: オレンジ (24 95% 53%) - CTAボタン
- モダンでクリーン、学生目線のUI

### モバイルファースト
- スマホ利用がメイン想定
- 片手操作、読みやすさ重視
- レスポンシブデザイン対応

## 荒らし対策
- URL・スパムパターンの検出
- 投稿時の注意喚起UI
- 匿名投稿（認証なし）

## 開発メモ
- フロントエンドは0.0.0.0:5000でサーブ
- TanStack Query v5使用（オブジェクト形式のquery関数）
- apiRequestは (method, url, data) の形式
