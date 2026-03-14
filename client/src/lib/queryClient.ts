import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { eventsWithGroups, groupsWithEvents } from "./staticData";
import { 
  fetchGroupsFromGoogleSheets, 
  fetchEventsFromGoogleSheets,
  createEventsWithGroups,
  createGroupsWithEvents
} from "./googleSheetsFetcher";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";

// キャッシュ用
let cachedGroups: any[] | null = null;
let cachedEvents: any[] | null = null;
let cachedEventsWithGroups: any[] | null = null;
let cachedGroupsWithEvents: any[] | null = null;

/**
 * GitHub Pages用の静的データまたはGoogleスプレッドシートからデータを取得するQueryFunction
 */
export const getStaticQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const path = queryKey.join("/") as string;

    try {
      // グループデータを取得
      if (path === "/api/groups") {
        if (!cachedGroups) {
          cachedGroups = await fetchGroupsFromGoogleSheets();
        }
        if (!cachedGroupsWithEvents) {
          cachedGroupsWithEvents = createGroupsWithEvents(
            cachedGroups,
            cachedEvents || (await fetchEventsFromGoogleSheets())
          );
        }
        return cachedGroupsWithEvents as T;
      }

      // イベントデータを取得
      if (path === "/api/events") {
        if (!cachedEvents) {
          cachedEvents = await fetchEventsFromGoogleSheets();
        }
        if (!cachedGroups) {
          cachedGroups = await fetchGroupsFromGoogleSheets();
        }
        if (!cachedEventsWithGroups) {
          cachedEventsWithGroups = createEventsWithGroups(cachedEvents, cachedGroups);
        }
        return cachedEventsWithGroups as T;
      }

      // 特定のイベント詳細を取得
      if (path.startsWith("/api/events/")) {
        const eventId = path.split("/").pop();
        if (!cachedEvents) {
          cachedEvents = await fetchEventsFromGoogleSheets();
        }
        if (!cachedGroups) {
          cachedGroups = await fetchGroupsFromGoogleSheets();
        }
        const event = cachedEvents.find(e => e.id === eventId);
        if (!event) {
          throw new Error("404: Event not found");
        }
        const group = cachedGroups.find(g => g.id === event.groupId);
        if (!group) {
          throw new Error("404: Group not found for event");
        }
        return { ...event, group } as T;
      }

      // 特定のグループ詳細を取得
      if (path.startsWith("/api/groups/")) {
        const groupId = path.split("/").pop();
        if (!cachedGroups) {
          cachedGroups = await fetchGroupsFromGoogleSheets();
        }
        if (!cachedEvents) {
          cachedEvents = await fetchEventsFromGoogleSheets();
        }
        const group = cachedGroups.find(g => g.id === groupId);
        if (!group) {
          throw new Error("404: Group not found");
        }
        const events = cachedEvents.filter(e => e.groupId === groupId);
        return { ...group, events } as T;
      }

      // その他のエンドポイントはスキップ
      throw new Error(`404: Unknown endpoint: ${path}`);
    } catch (error) {
      console.error("Query error:", error);
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getStaticQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
