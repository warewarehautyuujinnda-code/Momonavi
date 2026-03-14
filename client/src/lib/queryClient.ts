import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { eventsWithGroups, groupsWithEvents } from "./staticData";

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

// GitHub Pages用の静的データを返すQueryFunction
export const getStaticQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const path = queryKey.join("/") as string;

    // 静的データを返す
    if (path === "/api/events") {
      return eventsWithGroups as T;
    }

    if (path === "/api/groups") {
      return groupsWithEvents as T;
    }

    // 特定のイベント詳細を取得
    if (path.startsWith("/api/events/")) {
      const eventId = path.split("/").pop();
      const event = eventsWithGroups.find(e => e.id === eventId);
      if (!event) {
        throw new Error("404: Event not found");
      }
      return event as T;
    }

    // 特定のグループ詳細を取得
    if (path.startsWith("/api/groups/")) {
      const groupId = path.split("/").pop();
      const group = groupsWithEvents.find(g => g.id === groupId);
      if (!group) {
        throw new Error("404: Group not found");
      }
      return group as T;
    }

    // その他のエンドポイントはスキップ
    throw new Error(`404: Unknown endpoint: ${path}`);
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
