# Googleスプレッドシート連携セットアップガイド

MomonaviはGoogleスプレッドシートからデータを取得して、GitHub Pagesで表示することができます。このガイドに従って設定してください。

## 概要

1. Googleスプレッドシートにグループ・イベント情報を入力
2. Google Apps Scriptで公開エンドポイントを作成
3. 公開URLを環境変数に設定
4. GitHub Pagesで自動デプロイ

## ステップ1：Googleスプレッドシートの作成

### グループ情報シート

[Google Sheets](https://sheets.google.com)で新しいスプレッドシートを作成し、以下のカラムを設定します：

| カラム名 | 説明 | 必須 | 例 |
|---------|------|------|-----|
| id | グループID（ユニーク） | ○ | g1 |
| name | グループ名 | ○ | 岡山大学バレーボール部 |
| university | 大学名 | ○ | 岡山大学 |
| category | 団体区分 | ○ | 部活 / サークル |
| genre | ジャンル | ○ | バレーボール |
| description | 説明 | ○ | バレーボールを通じて... |
| atmosphereTags | 雰囲気タグ（カンマ区切り） | ○ | アットホーム,初心者歓迎,男女比良好 |
| beginnerFriendly | 初心者向け（true/false） | × | true |
| memberCount | メンバー数 | × | 45 |
| foundedYear | 設立年 | × | 1965 |
| practiceSchedule | 練習スケジュール | × | 週3回（月・水・金） |
| faqs | FAQ（JSON形式） | × | [{"question":"未経験でも入れますか？","answer":"もちろんです！"}] |
| instagramUrl | InstagramURL | × | https://instagram.com/example |
| twitterUrl | TwitterURL | × | https://twitter.com/example |
| lineUrl | LINE URL | × | https://line.me/example |
| contactInfo | 連絡先情報 | × | example@example.com |

### イベント情報シート

別のシートまたは別のスプレッドシートで、以下のカラムを設定します：

| カラム名 | 説明 | 必須 | 例 |
|---------|------|------|-----|
| id | イベントID（ユニーク） | ○ | e1 |
| groupId | グループID（グループシートのidと対応） | ○ | g1 |
| title | イベント名 | ○ | 春の新歓練習会 |
| description | 説明 | ○ | 初心者大歓迎！気軽に... |
| date | 開催日時（ISO 8601形式） | ○ | 2026-03-22T14:00:00Z |
| endDate | 終了日時（ISO 8601形式） | × | 2026-03-22T16:00:00Z |
| location | 開催場所 | ○ | 岡山大学 総合体育館 |
| requirements | 持ち物・服装 | × | 運動できる服装、室内シューズ |
| beginnerWelcome | 初心者歓迎（true/false） | × | true |
| soloFriendliness | ソロ参加しやすさ（1-5） | × | 5 |
| atmosphereTags | 雰囲気タグ（カンマ区切り） | × | アットホーム,初心者歓迎 |
| participationFlow | 参加フロー | × | 1. 受付\n2. 準備運動\n3. 基礎練習 |
| maxParticipants | 最大参加者数 | × | 50 |
| imageUrl | イベント画像URL | × | https://example.com/image.jpg |
| mapUrl | 地図URL | × | https://maps.google.com/... |
| status | ステータス | × | approved |

## ステップ2：Google Apps Scriptの設定

### スクリプトの作成

1. Google Sheetsで「拡張機能」→「Apps Script」をクリック
2. 以下のコードを貼り付けます：

```javascript
const GROUPS_SHEET_NAME = "グループ"; // グループ情報シート名
const EVENTS_SHEET_NAME = "イベント"; // イベント情報シート名

function doGet(e) {
  const type = e.parameter.type || "groups";
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  
  let data = [];
  if (type === "groups") {
    const groupsSheet = sheet.getSheetByName(GROUPS_SHEET_NAME);
    data = getSheetData(groupsSheet);
  } else if (type === "events") {
    const eventsSheet = sheet.getSheetByName(EVENTS_SHEET_NAME);
    data = getSheetData(eventsSheet);
  }
  
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader("Access-Control-Allow-Origin", "*")
    .setHeader("Access-Control-Allow-Methods", "GET")
    .setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function getSheetData(sheet) {
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  if (data.length === 0) return [];
  
  const headers = data[0];
  const rows = data.slice(1);
  
  return rows.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
}
```

3. 「デプロイ」→「新しいデプロイ」をクリック
4. 「タイプを選択」で「ウェブアプリ」を選択
5. 以下の設定をします：
   - 実行者：自分
   - アクセス権：全員
6. 「デプロイ」をクリック
7. 公開URLをコピー（例：`https://script.google.com/macros/d/{SCRIPT_ID}/usercontent/exec`）

## ステップ3：環境変数の設定

### ローカル開発の場合

`.env.local`ファイルを作成し、以下を設定します：

```
VITE_GOOGLE_SHEETS_GROUPS_URL=https://script.google.com/macros/d/{SCRIPT_ID}/usercontent/exec?type=groups
VITE_GOOGLE_SHEETS_EVENTS_URL=https://script.google.com/macros/d/{SCRIPT_ID}/usercontent/exec?type=events
```

`{SCRIPT_ID}`は、ステップ2で取得した公開URLから抽出します。

### GitHub Pagesでの設定

1. GitHubリポジトリの「Settings」→「Secrets and variables」→「Actions」
2. 「New repository secret」で以下を追加：
   - `VITE_GOOGLE_SHEETS_GROUPS_URL`
   - `VITE_GOOGLE_SHEETS_EVENTS_URL`

3. `.github/workflows/deploy.yml`に以下を追加（既存ファイルがあれば修正）：

```yaml
env:
  VITE_GOOGLE_SHEETS_GROUPS_URL: ${{ secrets.VITE_GOOGLE_SHEETS_GROUPS_URL }}
  VITE_GOOGLE_SHEETS_EVENTS_URL: ${{ secrets.VITE_GOOGLE_SHEETS_EVENTS_URL }}
```

## ステップ4：デプロイ

### ローカルでテスト

```bash
npm install
npm run build:pages
npm run preview
```

### GitHubにプッシュ

```bash
git add .
git commit -m "feat: add Google Sheets integration"
git push origin main
```

GitHub Actionsが自動的にビルドしてGitHub Pagesにデプロイします。

## トラブルシューティング

### データが表示されない

1. Google Apps Scriptの公開URLが正しいか確認
2. ブラウザのコンソールでエラーを確認
3. Googleスプレッドシートのカラム名が正確か確認

### CORSエラーが出る

Google Apps Scriptのレスポンスヘッダーに以下が含まれているか確認：
```
Access-Control-Allow-Origin: *
```

### データが古い

ブラウザのキャッシュをクリアするか、以下のコマンドでハードリロード：
```
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

## 注意事項

- Googleスプレッドシートは**公開**する必要があります（リンク共有で「閲覧可能」以上）
- 日付はISO 8601形式（`YYYY-MM-DDTHH:MM:SSZ`）で指定してください
- JSONフィールド（faqs等）は有効なJSON形式である必要があります
- 環境変数は`VITE_`プレフィックスが必須です（Viteで使用するため）

## サンプルデータ

環境変数が設定されていない場合、自動的にサンプルデータが表示されます。
これにより、セットアップ前でもサイトの動作確認ができます。
