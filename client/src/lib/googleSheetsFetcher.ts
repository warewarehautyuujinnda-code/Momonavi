import type { EventWithGroup, Group, Event } from "@shared/schema";
import { sampleGroups, sampleEvents, eventsWithGroups, groupsWithEvents } from "./staticData";

/**
 * Googleスプレッドシートから公開されたJSONデータを取得する
 * 
 * 使用方法：
 * 1. Googleスプレッドシートを作成
 * 2. Google Apps Scriptで以下のコードをデプロイ：
 *    function doGet() {
 *      const sheet = SpreadsheetApp.getActiveSheet();
 *      const data = sheet.getDataRange().getValues();
 *      return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
 *    }
 * 3. 公開URLを環境変数 VITE_GOOGLE_SHEETS_URL に設定
 */

// 環境変数からスプレッドシートURLを取得
const GOOGLE_SHEETS_GROUPS_URL = import.meta.env.VITE_GOOGLE_SHEETS_GROUPS_URL as string | undefined;
const GOOGLE_SHEETS_EVENTS_URL = import.meta.env.VITE_GOOGLE_SHEETS_EVENTS_URL as string | undefined;

interface GoogleSheetRow {
  [key: string]: any;
}

/**
 * Googleスプレッドシートからデータを取得（CORS対応）
 */
async function fetchFromGoogleSheets(url: string): Promise<GoogleSheetRow[]> {
  if (!url) {
    return [];
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      console.warn(`Failed to fetch from Google Sheets: ${response.status}`);
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn("Error fetching from Google Sheets:", error);
    return [];
  }
}

/**
 * スプレッドシートの行データをGroup型に変換
 */
function parseGroupFromSheet(row: GoogleSheetRow, index: number): Group | null {
  try {
    // スプレッドシートのカラムマッピング（1行目がヘッダーと仮定）
    // id, name, university, category, genre, description, atmosphereTags, beginnerFriendly, memberCount, foundedYear, practiceSchedule, faqs, instagramUrl, twitterUrl, lineUrl, contactInfo
    
    if (!row.name || !row.university || !row.category || !row.genre || !row.description) {
      return null;
    }

    const atmosphereTags = typeof row.atmosphereTags === "string" 
      ? row.atmosphereTags.split(",").map((t: string) => t.trim())
      : Array.isArray(row.atmosphereTags) ? row.atmosphereTags : [];

    return {
      id: row.id || `g${index}`,
      name: String(row.name),
      university: String(row.university),
      category: String(row.category),
      genre: String(row.genre),
      description: String(row.description),
      atmosphereTags,
      beginnerFriendly: row.beginnerFriendly !== "false" && row.beginnerFriendly !== false,
      memberCount: row.memberCount ? parseInt(String(row.memberCount), 10) : undefined,
      foundedYear: row.foundedYear ? parseInt(String(row.foundedYear), 10) : undefined,
      practiceSchedule: row.practiceSchedule ? String(row.practiceSchedule) : undefined,
      faqs: row.faqs ? String(row.faqs) : undefined,
      instagramUrl: row.instagramUrl ? String(row.instagramUrl) : undefined,
      twitterUrl: row.twitterUrl ? String(row.twitterUrl) : undefined,
      lineUrl: row.lineUrl ? String(row.lineUrl) : undefined,
      contactInfo: row.contactInfo ? String(row.contactInfo) : undefined,
      createdAt: new Date(),
    };
  } catch (error) {
    console.warn(`Error parsing group from sheet row ${index}:`, error);
    return null;
  }
}

/**
 * スプレッドシートの行データをEvent型に変換
 */
function parseEventFromSheet(row: GoogleSheetRow, index: number): Event | null {
  try {
    if (!row.groupId || !row.title || !row.description || !row.date || !row.location) {
      return null;
    }

    const atmosphereTags = typeof row.atmosphereTags === "string"
      ? row.atmosphereTags.split(",").map((t: string) => t.trim())
      : Array.isArray(row.atmosphereTags) ? row.atmosphereTags : [];

    return {
      id: row.id || `e${index}`,
      groupId: String(row.groupId),
      title: String(row.title),
      description: String(row.description),
      date: new Date(String(row.date)),
      endDate: row.endDate ? new Date(String(row.endDate)) : undefined,
      location: String(row.location),
      requirements: row.requirements ? String(row.requirements) : undefined,
      beginnerWelcome: row.beginnerWelcome !== "false" && row.beginnerWelcome !== false,
      soloFriendliness: row.soloFriendliness ? parseInt(String(row.soloFriendliness), 10) : 3,
      atmosphereTags,
      participationFlow: row.participationFlow ? String(row.participationFlow) : undefined,
      maxParticipants: row.maxParticipants ? parseInt(String(row.maxParticipants), 10) : undefined,
      imageUrl: row.imageUrl ? String(row.imageUrl) : undefined,
      mapUrl: row.mapUrl ? String(row.mapUrl) : undefined,
      status: row.status ? String(row.status) : "approved",
      // 繰り返し設定: repeatDaysはカンマ区切りの曜日番号文字列 (e.g. "1,3,5")
      repeatDays: row.repeatDays ? String(row.repeatDays) : null,
      repeatEndDate: row.repeatEndDate ? new Date(String(row.repeatEndDate)) : null,
      createdAt: new Date(),
    };
  } catch (error) {
    console.warn(`Error parsing event from sheet row ${index}:`, error);
    return null;
  }
}

/**
 * Googleスプレッドシートからグループデータを取得
 */
export async function fetchGroupsFromGoogleSheets(): Promise<Group[]> {
  if (!GOOGLE_SHEETS_GROUPS_URL) {
    return sampleGroups;
  }

  const rows = await fetchFromGoogleSheets(GOOGLE_SHEETS_GROUPS_URL);
  if (rows.length === 0) {
    return sampleGroups;
  }

  // 最初の行がヘッダーと仮定してスキップ
  const dataRows = rows.slice(1);
  const groups = dataRows
    .map((row, index) => parseGroupFromSheet(row, index))
    .filter((g): g is Group => g !== null);

  return groups.length > 0 ? groups : sampleGroups;
}

/**
 * Googleスプレッドシートからイベントデータを取得
 */
export async function fetchEventsFromGoogleSheets(): Promise<Event[]> {
  if (!GOOGLE_SHEETS_EVENTS_URL) {
    return sampleEvents;
  }

  const rows = await fetchFromGoogleSheets(GOOGLE_SHEETS_EVENTS_URL);
  if (rows.length === 0) {
    return sampleEvents;
  }

  // 最初の行がヘッダーと仮定してスキップ
  const dataRows = rows.slice(1);
  const events = dataRows
    .map((row, index) => parseEventFromSheet(row, index))
    .filter((e): e is Event => e !== null);

  return events.length > 0 ? events : sampleEvents;
}

/**
 * EventWithGroup型のデータを作成
 */
export function createEventsWithGroups(events: Event[], groups: Group[]): EventWithGroup[] {
  return events.map(event => {
    const group = groups.find(g => g.id === event.groupId);
    if (!group) {
      console.warn(`Group not found for event ${event.id}`);
      return null;
    }
    return {
      ...event,
      group,
    };
  }).filter((e): e is EventWithGroup => e !== null);
}

/**
 * GroupWithEvents型のデータを作成
 */
export function createGroupsWithEvents(groups: Group[], events: Event[]) {
  return groups.map(group => ({
    ...group,
    events: events.filter(e => e.groupId === group.id),
  }));
}
