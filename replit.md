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
- **Database**: PostgreSQL + Drizzle ORM
- **State Management**: TanStack Query
- **Routing**: wouter
- **Validation**: Zod + drizzle-zod

## プロジェクト構成

```
client/src/
├── pages/
│   ├── home.tsx           # トップページ
│   ├── events.tsx         # イベント検索
│   ├── event-detail.tsx   # イベント詳細
│   ├── groups.tsx         # 団体検索
│   ├── group-detail.tsx   # 団体詳細
│   ├── buddies.tsx        # 仲間を探す（LINE誘導）
│   ├── articles.tsx       # 記事一覧
│   ├── article-detail.tsx # 記事詳細
│   └── contact.tsx        # お問い合わせ（フォーム + FAQ）
├── components/
│   ├── layout/
│   │   ├── header.tsx     # 5項目ナビ + モバイル対応
│   │   ├── footer.tsx     # サイト公式リンク（Instagram/Notion）
│   │   └── layout.tsx
│   ├── events/
│   │   ├── event-card.tsx
│   │   ├── event-filters.tsx
│   │   ├── review-card.tsx
│   │   └── review-form.tsx
│   └── groups/
│       └── group-card.tsx
shared/
└── schema.ts              # 共通型定義（Group, Event, Review, Article, ContactSubmission等）
server/
├── db.ts                  # データベース接続
├── routes.ts              # APIルート
├── seed.ts                # 初期データ投入スクリプト
└── storage.ts             # データベースストレージ
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

### Articles
- `GET /api/articles` - 全記事取得
- `GET /api/articles/:id` - 記事詳細取得

### Contact
- `POST /api/contact` - お問い合わせ送信

## データモデル

### Group（団体）
- 大学、団体区分（部活/サークル）、ジャンル
- 雰囲気タグ、初心者歓迎フラグ
- 部員数、設立年、活動日
- よくある質問（FAQ）
- 外部リンク（instagramUrl, twitterUrl, lineUrl）

### Event（イベント）
- 開催日時（開始時刻）、終了時刻、場所、持ち物
- 初心者歓迎フラグ、1人参加しやすさ（1-5）
- 雰囲気タグ、参加の流れ
- 承認状態（pending/approved/rejected）

### Review（レビュー）
- 匿名ニックネーム
- 総合評価、1人参加しやすさ評価、雰囲気評価
- レビュー本文

### Article（記事）
- タイトル、要約、本文
- カテゴリ（あるある/想い）
- タグ、公開日

### ContactSubmission（お問い合わせ）
- 種別（一般/イベント掲載依頼/不具合報告/その他）
- 名前、大学、連絡先、内容
- イベント情報（掲載依頼時）

## 主要機能

### MVP（実装済み）
1. トップページ - キャッチコピー「新しい出会いが、あなたの新しい可能性の扉を開く」+ 安心の3要素 + イベント検索への導線
2. イベント検索 - 大学/団体区分/ジャンル/1人参加しやすさでフィルター
3. イベント詳細 - 情報表示 + レビュー閲覧・投稿
   - 共有ボタン（Web Share API + クリップボードコピー fallback）
   - Googleカレンダーに追加ボタン
   - Google Maps埋め込み（住所クエリで簡易embed）
   - 1人参加しやすさ（団体の過去レビュー平均で算出）
   - 過去のイベントセクション（同団体の過去イベント3件表示）
4. 団体検索 - フィルター機能付き
5. 団体詳細 - 基本情報 + FAQ + 関連イベント + 外部リンク（Instagram/X/LINE）
6. 仲間を探す - 公式LINE誘導 + 安全ガイドライン
7. 記事 - 一覧・詳細ページ
8. お問い合わせ - フォーム（種別選択）+ FAQ accordion

### グローバルナビゲーション（5項目）
1. イベント情報 (/events)
2. 団体紹介 (/groups)
3. 仲間を探す (/buddies)
4. 記事 (/articles)
5. お問い合わせ (/contact)

### 今後追加予定
- 同行募集掲示板
- イベント追加フォーム（運営承認制）
- reCAPTCHA等の高度なスパム対策
- 管理者画面

## デザイン

### カラースキーム
- Primary: 紫 (262 83% 58%) - ワクワク感、若々しさ
- 全体を紫のトーンで統一（星評価も紫色）
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
スクロールで要素が表示領域に入ったタイミングで、テキストが「少し遅れて」「徐々に」「滑らかに」現れる演出。

**使い方**: `data-reveal` 属性を付けるだけで動作

```html
<!-- 文字ごとにstagger -->
<h1 data-reveal="stagger" data-reveal-stagger="30">見出しテキスト</h1>

<!-- 単語ごとにstagger -->
<p data-reveal="stagger-word" data-reveal-stagger="60">本文テキスト</p>

<!-- シンプルなフェード + スライド -->
<div data-reveal="fade" data-reveal-delay="200">コンテンツ</div>
```

**オプション（data属性）**:
- `data-reveal-delay="200"` : アニメーション開始までの遅延（ms）
- `data-reveal-stagger="30"` : 文字/単語間の遅延（ms）
- `data-reveal-once="false"` : falseで再入場時に再アニメーション

**技術詳細**:
- lib/reveal.ts: IntersectionObserver で要素を監視
- Layout.tsx で初期化 + MutationObserver で動的要素も対応
- prefers-reduced-motion 対応（アニメーション無効化）
- CSS: cubic-bezier(0.34, 1.56, 0.64, 1) でバウンス感のあるイージング

## 荒らし対策
- URL・スパムパターンの検出
- 投稿時の注意喚起UI
- 匿名投稿（認証なし）

## 開発メモ
- フロントエンドは0.0.0.0:5000でサーブ
- TanStack Query v5使用（オブジェクト形式のquery関数）
- apiRequestは (method, url, data) の形式
- 外部リンクはrel="noopener noreferrer"で安全に開く

## Notion連携

### 概要
Notionをメインのデータソースとし、PostgreSQLをキャッシュとして使用。

### 環境変数
- `NOTION_EVENT_URL` - イベントDBのURL
- `NOTION_CIRCLENAME_URL` - 団体DBのURL
- `NOTION_CONTACT_URL` - お問い合わせDBのURL
- `NOTION_ARTICLE_URL` - 記事DBのURL

### Notionデータベースの必須プロパティ

**イベントDB**
- イベント名 (Title)
- 団体ID (Text/Relation) - 団体DBのIDを設定
- 日時 (Date) - 必須、日付型で設定（開始時刻）
- 終了時刻 (Text) - オプション、"HH:mm"形式（例: "18:00"）
- 場所 (Text)
- 説明 (Text)
- 持ち物 (Text)
- 初心者歓迎 (Checkbox)
- １人参加しやすさ (Number, 1-5)

**団体DB**
- 名前 (Title)
- 大学 (Select)
- 区分 (Select) - 部活/サークル
- ジャンル (Select)
- 説明 (Text)
- 部員数 (Number)
- 活動日 (Text)
- Instagram/Twitter/LINE (URL)

**記事DB**
- タイトル (Title) - 記事タイトル
- 要約 (Text) - 記事の要約
- 本文 (Text) - 記事本文
- タグ (Multi-select) - タグ（複数選択可）
- 公開日 (Date) - 公開日時

**お問い合わせDB**
- 名前 (Title) - 送信者名
- 種別 (Text) - 一般/イベント掲載依頼
- メール (Email) - 連絡先
- 内容 (Text) - お問い合わせ内容
- 大学 (Text) - 送信者の大学

### 同期API（認証必要）
- `POST /api/notion/sync` - 全データ同期（団体→イベント→記事）
- `POST /api/notion/sync/groups` - 団体のみ同期
- `POST /api/notion/sync/events` - イベントのみ同期
- `POST /api/notion/sync/articles` - 記事のみ同期
- `GET /api/notion/test` - 接続テスト

認証: `X-Admin-Key` ヘッダーに `SESSION_SECRET` の値を設定

### 自動同期
- 毎日午前3時（日本時間）に自動でNotionから同期
- server/scheduler.ts: node-cronによるスケジューラー

### お問い合わせ
Webフォームから送信されると自動でNotionのお問い合わせDBに追加される

## 最近の変更（2026年2月）
- Notion連携機能を追加（server/notion.ts, server/notion-sync.ts）
- PostgreSQLデータベースに移行（データの永続的保存）
- server/db.ts: データベース接続設定
- server/seed.ts: 初期データ投入スクリプト
- server/storage.ts: DatabaseStorageクラスでDB操作

## 最近の変更（2026年1月）
- 5項目ナビゲーションに拡張
- 仲間を探す、記事、お問い合わせページを追加
- ホームページのキャッチコピーを刷新
- 団体詳細に外部SNSリンク表示を追加
- フッターにサイト公式リンクを追加
