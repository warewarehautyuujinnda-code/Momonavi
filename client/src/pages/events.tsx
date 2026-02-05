import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearch } from "wouter";
import { Layout } from "@/components/layout/layout";
import { EventCard } from "@/components/events/event-card";
import { EventFiltersComponent, type EventFilters } from "@/components/events/event-filters";
import { MasonryGrid } from "@/components/ui/masonry-grid";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchX } from "lucide-react";
import type { EventWithGroup } from "@shared/schema";

export default function EventsPage() {
  const searchParams = useSearch();
  const urlParams = new URLSearchParams(searchParams);
  const initialUniversity = urlParams.get("university");

  const [filters, setFilters] = useState<EventFilters>({
    university: initialUniversity,
    category: null,
    atmosphereTag: null,
    minSoloFriendliness: 1,
  });

  const { data: events, isLoading } = useQuery<EventWithGroup[]>({
    queryKey: ["/api/events"],
  });

  // Extract unique filter options from actual event/group data
  const filterOptions = useMemo(() => {
    if (!events) return { universities: [] as string[], categories: [] as string[], atmosphereTags: [] as string[] };
    
    const universities = Array.from(new Set(events.map(e => e.group.university).filter((u): u is string => Boolean(u)))).sort();
    const categories = Array.from(new Set(events.map(e => e.group.category).filter((c): c is string => Boolean(c)))).sort();
    const atmosphereTags = Array.from(new Set(events.flatMap(e => e.group.atmosphereTags || []))).sort();
    
    return { universities, categories, atmosphereTags };
  }, [events]);

  const filteredEvents = useMemo(() => {
    if (!events) return [];
    
    return events.filter((event) => {
      if (filters.university && event.group.university !== filters.university) {
        return false;
      }
      if (filters.category && event.group.category !== filters.category) {
        return false;
      }
      if (filters.atmosphereTag && !(event.group.atmosphereTags || []).includes(filters.atmosphereTag)) {
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
      <div className="container-narrow py-10 sm:py-14">
        <div className="space-y-10">
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-bold">
              イベントを探す
            </h1>
            <p className="text-muted-foreground text-lg">
              気になるイベントをタップして詳細を見よう
            </p>
          </div>

          <EventFiltersComponent 
            filters={filters} 
            onFiltersChange={setFilters}
            filterOptions={filterOptions}
          />

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-72 rounded-2xl" />
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <SearchX className="h-12 w-12 text-muted-foreground/50 mx-auto" />
              <div className="space-y-2">
                <p className="text-lg font-medium">
                  該当するイベントがありません
                </p>
                <p className="text-muted-foreground">
                  条件を変えて探してみてください
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">
                {filteredEvents.length}件のイベント
              </p>
              <div className="hidden lg:block">
                <MasonryGrid columns={3} gap={6}>
                  {filteredEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </MasonryGrid>
              </div>
              <div className="hidden sm:block lg:hidden">
                <MasonryGrid columns={2} gap={5}>
                  {filteredEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </MasonryGrid>
              </div>
              <div className="block sm:hidden">
                <MasonryGrid columns={1} gap={4}>
                  {filteredEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </MasonryGrid>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
