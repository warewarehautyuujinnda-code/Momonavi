import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearch } from "wouter";
import { Layout } from "@/components/layout/layout";
import { EventCard } from "@/components/events/event-card";
import { EventFiltersComponent, type EventFilters } from "@/components/events/event-filters";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, SearchX } from "lucide-react";
import type { EventWithGroup } from "@shared/schema";

export default function EventsPage() {
  const searchParams = useSearch();
  const urlParams = new URLSearchParams(searchParams);
  const initialUniversity = urlParams.get("university");

  const [filters, setFilters] = useState<EventFilters>({
    university: initialUniversity,
    category: null,
    genre: null,
    minSoloFriendliness: 1,
  });

  const { data: events, isLoading } = useQuery<EventWithGroup[]>({
    queryKey: ["/api/events"],
  });

  const filteredEvents = useMemo(() => {
    if (!events) return [];
    
    return events.filter((event) => {
      if (filters.university && event.group.university !== filters.university) {
        return false;
      }
      if (filters.category && event.group.category !== filters.category) {
        return false;
      }
      if (filters.genre && event.group.genre !== filters.genre) {
        return false;
      }
      if (event.soloFriendliness < filters.minSoloFriendliness) {
        return false;
      }
      return true;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events, filters]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">新歓イベントを探す</h1>
            </div>
            <p className="text-muted-foreground">
              気になるイベントをタップして詳細を見てみよう
            </p>
          </div>

          <EventFiltersComponent 
            filters={filters} 
            onFiltersChange={setFilters} 
          />

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-lg" />
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <SearchX className="h-12 w-12 text-muted-foreground mx-auto" />
              <div className="space-y-2">
                <p className="text-lg font-medium">
                  該当するイベントが見つかりませんでした
                </p>
                <p className="text-muted-foreground">
                  フィルター条件を変更してみてください
                </p>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                {filteredEvents.length}件のイベントが見つかりました
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
