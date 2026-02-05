// Notion Sync - Fetch data from Notion and sync to PostgreSQL
import { getNotionClient, extractDatabaseId } from "./notion";
import { db } from "./db";
import { groups, events, articles } from "@shared/schema";
import { eq } from "drizzle-orm";

// Helper to get text from Notion property
function getNotionText(prop: any): string {
  if (!prop) return "";
  if (prop.type === "title") {
    return prop.title?.[0]?.plain_text || "";
  }
  if (prop.type === "rich_text") {
    return prop.rich_text?.map((t: any) => t.plain_text).join("") || "";
  }
  if (prop.type === "select") {
    return prop.select?.name || "";
  }
  if (prop.type === "url") {
    return prop.url || "";
  }
  if (prop.type === "email") {
    return prop.email || "";
  }
  if (prop.type === "phone_number") {
    return prop.phone_number || "";
  }
  return "";
}

// Helper to get number from Notion property
function getNotionNumber(prop: any): number | null {
  if (!prop || prop.type !== "number") return null;
  return prop.number;
}

// Helper to get boolean from Notion property
function getNotionCheckbox(prop: any): boolean {
  if (!prop || prop.type !== "checkbox") return false;
  return prop.checkbox || false;
}

// Helper to get date from Notion property
function getNotionDate(prop: any): Date | null {
  if (!prop || prop.type !== "date" || !prop.date) return null;
  return new Date(prop.date.start);
}

// Helper to get multi-select as array
function getNotionMultiSelect(prop: any): string[] {
  if (!prop || prop.type !== "multi_select") return [];
  return prop.multi_select?.map((s: any) => s.name) || [];
}

// Fetch and sync groups from Notion
export async function syncGroupsFromNotion(): Promise<{ synced: number; errors: string[] }> {
  const notion = await getNotionClient();
  const dbId = extractDatabaseId(process.env.NOTION_CIRCLENAME_URL!);
  
  const errors: string[] = [];
  let synced = 0;
  
  try {
    const response = await notion.databases.query({
      database_id: dbId,
    });
    
    console.log(`Found ${response.results.length} groups in Notion`);
    
    for (const page of response.results) {
      try {
        const props = (page as any).properties;
        const notionId = page.id.replace(/-/g, "");
        
        // Log available properties for debugging
        if (synced === 0) {
          console.log("Group properties:", Object.keys(props));
        }
        
        const groupData = {
          id: notionId,
          name: getNotionText(props["名前"] || props["Name"] || props["団体名"]) || "Unknown",
          university: getNotionText(props["大学"] || props["University"]) || "岡山大学",
          category: getNotionText(props["区分"] || props["Category"] || props["種別"]) || "サークル",
          genre: getNotionText(props["ジャンル"] || props["Genre"]) || "その他文化系",
          description: getNotionText(props["説明"] || props["Description"] || props["紹介文"]) || "",
          atmosphereTags: getNotionMultiSelect(props["雰囲気タグ"] || props["Atmosphere"]) || [],
          beginnerFriendly: getNotionCheckbox(props["初心者歓迎"] || props["Beginner"]),
          memberCount: getNotionNumber(props["部員数"] || props["Members"]),
          foundedYear: getNotionNumber(props["設立年"] || props["Founded"]),
          practiceSchedule: getNotionText(props["活動日"] || props["Schedule"]) || null,
          faqs: getNotionText(props["FAQ"] || props["よくある質問"]) || null,
          contactInfo: getNotionText(props["連絡先"] || props["Contact"]) || null,
          instagramUrl: getNotionText(props["Instagram"] || props["InstagramURL"]) || null,
          twitterUrl: getNotionText(props["Twitter"] || props["X"] || props["TwitterURL"]) || null,
          lineUrl: getNotionText(props["LINE"] || props["LineURL"]) || null,
        };
        
        // Upsert: try to update, if not exists, insert
        const existing = await db.select().from(groups).where(eq(groups.id, notionId));
        
        if (existing.length > 0) {
          await db.update(groups).set(groupData).where(eq(groups.id, notionId));
        } else {
          await db.insert(groups).values(groupData);
        }
        
        synced++;
      } catch (err: any) {
        errors.push(`Group ${page.id}: ${err.message}`);
      }
    }
  } catch (err: any) {
    errors.push(`Database query failed: ${err.message}`);
  }
  
  return { synced, errors };
}

// Fetch and sync events from Notion
export async function syncEventsFromNotion(): Promise<{ synced: number; errors: string[] }> {
  const notion = await getNotionClient();
  const dbId = extractDatabaseId(process.env.NOTION_EVENT_URL!);
  
  const errors: string[] = [];
  let synced = 0;
  
  try {
    const response = await notion.databases.query({
      database_id: dbId,
    });
    
    console.log(`Found ${response.results.length} events in Notion`);
    
    for (const page of response.results) {
      try {
        const props = (page as any).properties;
        const notionId = page.id.replace(/-/g, "");
        
        // Log available properties for debugging
        if (synced === 0) {
          console.log("Event properties:", Object.keys(props));
        }
        
        // Get groupId - might be a relation or text
        let groupId = "";
        const groupProp = props["団体ID"] || props["団体"] || props["GroupID"] || props["Group"];
        if (groupProp?.type === "relation" && groupProp.relation?.[0]) {
          groupId = groupProp.relation[0].id.replace(/-/g, "");
        } else if (groupProp?.type === "rollup" && groupProp.rollup?.array?.[0]) {
          groupId = getNotionText(groupProp.rollup.array[0]) || "";
        } else {
          groupId = getNotionText(groupProp) || "";
        }
        
        // Log groupId for debugging
        console.log(`Event ${notionId}: groupProp type=${groupProp?.type}, groupId="${groupId}"`);
        
        // If no groupId, skip this event (requires valid group)
        if (!groupId) {
          errors.push(`Event ${notionId}: No groupId found, skipping (団体IDを設定してください)`);
          continue;
        }
        
        // Verify group exists in database
        const existingGroup = await db.select().from(groups).where(eq(groups.id, groupId));
        if (existingGroup.length === 0) {
          errors.push(`Event ${notionId}: Group "${groupId}" not found in database, skipping (先に団体を同期してください)`);
          continue;
        }
        
        // Parse date property
        const dateProp = props["日時"] || props["Date"] || props["開催日"];
        console.log(`Event ${notionId}: dateProp type=${dateProp?.type}`);
        
        const eventDate = getNotionDate(dateProp);
        if (!eventDate) {
          errors.push(`Event ${notionId}: Missing or invalid date, skipping (日時を日付形式で設定してください)`);
          continue;
        }
        
        // Parse end time - can be a date property or a text property (HH:mm format)
        let endDateValue: Date | null = null;
        const endDateProp = props["終了日時"] || props["EndDate"];
        const endTimeProp = props["終了時刻"] || props["EndTime"];
        
        if (endDateProp) {
          endDateValue = getNotionDate(endDateProp);
        } else if (endTimeProp) {
          // If end time is a text like "18:00", combine with event date
          const endTimeText = getNotionText(endTimeProp);
          if (endTimeText && eventDate) {
            const timeMatch = endTimeText.match(/^(\d{1,2}):(\d{2})$/);
            if (timeMatch) {
              endDateValue = new Date(eventDate);
              endDateValue.setHours(parseInt(timeMatch[1], 10), parseInt(timeMatch[2], 10), 0, 0);
            }
          }
        }
        
        const eventData = {
          id: notionId,
          groupId: groupId,
          title: getNotionText(props["イベント名"] || props["タイトル"] || props["Title"]) || "Unknown Event",
          description: getNotionText(props["説明"] || props["Description"] || props["内容"]) || "",
          date: eventDate,
          endDate: endDateValue,
          location: getNotionText(props["場所"] || props["Location"] || props["開催場所"]) || "",
          requirements: getNotionText(props["持ち物"] || props["Requirements"]) || null,
          beginnerWelcome: getNotionCheckbox(props["初心者歓迎"] || props["Beginner"]),
          soloFriendliness: getNotionNumber(props["１人参加しやすさ"] || props["1人参加しやすさ"] || props["SoloFriendliness"]) || 3,
          atmosphereTags: getNotionMultiSelect(props["雰囲気タグ"] || props["Atmosphere"]) || [],
          participationFlow: getNotionText(props["参加の流れ"] || props["Flow"]) || null,
          maxParticipants: getNotionNumber(props["定員"] || props["MaxParticipants"]) || null,
          imageUrl: getNotionText(props["画像URL"] || props["Image"]) || null,
          status: getNotionText(props["承認状態"] || props["Status"]) || "approved",
        };
        
        // Upsert
        const existing = await db.select().from(events).where(eq(events.id, notionId));
        
        if (existing.length > 0) {
          await db.update(events).set(eventData).where(eq(events.id, notionId));
        } else {
          await db.insert(events).values(eventData);
        }
        
        synced++;
      } catch (err: any) {
        errors.push(`Event ${page.id}: ${err.message}`);
      }
    }
  } catch (err: any) {
    errors.push(`Database query failed: ${err.message}`);
  }
  
  return { synced, errors };
}

// Write contact submission to Notion
export async function writeContactToNotion(contact: {
  type: string;
  name: string | null;
  university: string | null;
  contactMethod: string;
  content: string;
  eventName?: string | null;
  eventDate?: string | null;
  eventLocation?: string | null;
  eventDescription?: string | null;
}): Promise<{ success: boolean; pageId?: string; error?: string }> {
  try {
    const notion = await getNotionClient();
    const dbId = extractDatabaseId(process.env.NOTION_CONTACT_URL!);
    
    const properties: any = {
      "名前": { title: [{ text: { content: contact.name || "匿名" } }] },
      "種別": { rich_text: [{ text: { content: contact.type } }] },
      "メール": { email: contact.contactMethod },
      "内容": { rich_text: [{ text: { content: contact.content.slice(0, 2000) } }] },
    };
    
    // Add optional fields
    if (contact.university) {
      properties["大学"] = { rich_text: [{ text: { content: contact.university } }] };
    }
    if (contact.eventName) {
      properties["イベント名"] = { rich_text: [{ text: { content: contact.eventName } }] };
    }
    if (contact.eventDate) {
      properties["イベント日時"] = { rich_text: [{ text: { content: contact.eventDate } }] };
    }
    if (contact.eventLocation) {
      properties["開催場所"] = { rich_text: [{ text: { content: contact.eventLocation } }] };
    }
    
    const response = await notion.pages.create({
      parent: { database_id: dbId },
      properties,
    });
    
    return { success: true, pageId: response.id };
  } catch (err: any) {
    console.error("Failed to write contact to Notion:", err);
    return { success: false, error: err.message };
  }
}

// Fetch and sync articles from Notion
export async function syncArticlesFromNotion(): Promise<{ synced: number; errors: string[] }> {
  if (!process.env.NOTION_ARTICLE_URL) {
    return { synced: 0, errors: ["NOTION_ARTICLE_URL is not set"] };
  }
  
  const notion = await getNotionClient();
  const dbId = extractDatabaseId(process.env.NOTION_ARTICLE_URL);
  
  const errors: string[] = [];
  let synced = 0;
  
  try {
    const response = await notion.databases.query({
      database_id: dbId,
    });
    
    console.log(`Found ${response.results.length} articles in Notion`);
    
    for (const page of response.results) {
      try {
        const props = (page as any).properties;
        const notionId = page.id.replace(/-/g, "");
        
        // Log available properties for debugging
        if (synced === 0) {
          console.log("Article properties:", Object.keys(props));
        }
        
        // Parse published date
        const publishedDate = getNotionDate(props["公開日"] || props["PublishedAt"] || props["Date"]);
        if (!publishedDate) {
          errors.push(`Article ${notionId}: Missing published date, skipping (公開日を設定してください)`);
          continue;
        }
        
        const articleData = {
          id: notionId,
          title: getNotionText(props["タイトル"] || props["Title"] || props["名前"]) || "Untitled",
          summary: getNotionText(props["要約"] || props["Summary"]) || "",
          content: getNotionText(props["本文"] || props["Content"]) || "",
          category: "",
          tags: getNotionMultiSelect(props["タグ"] || props["Tags"]) || [],
          imageUrl: getNotionText(props["画像URL"] || props["Image"]) || null,
          publishedAt: publishedDate,
        };
        
        // Upsert
        const existing = await db.select().from(articles).where(eq(articles.id, notionId));
        
        if (existing.length > 0) {
          await db.update(articles).set(articleData).where(eq(articles.id, notionId));
        } else {
          await db.insert(articles).values(articleData);
        }
        
        synced++;
      } catch (err: any) {
        errors.push(`Article ${page.id}: ${err.message}`);
      }
    }
  } catch (err: any) {
    errors.push(`Database query failed: ${err.message}`);
  }
  
  return { synced, errors };
}

// Sync all data from Notion
export async function syncAllFromNotion(): Promise<{
  groups: { synced: number; errors: string[] };
  events: { synced: number; errors: string[] };
  articles: { synced: number; errors: string[] };
}> {
  console.log("Starting Notion sync...");
  
  const groupsResult = await syncGroupsFromNotion();
  console.log(`Groups sync: ${groupsResult.synced} synced, ${groupsResult.errors.length} errors`);
  
  const eventsResult = await syncEventsFromNotion();
  console.log(`Events sync: ${eventsResult.synced} synced, ${eventsResult.errors.length} errors`);
  
  const articlesResult = await syncArticlesFromNotion();
  console.log(`Articles sync: ${articlesResult.synced} synced, ${articlesResult.errors.length} errors`);
  
  return {
    groups: groupsResult,
    events: eventsResult,
    articles: articlesResult,
  };
}
