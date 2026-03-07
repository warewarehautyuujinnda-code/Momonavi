import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearch } from "wouter";
import { Link } from "wouter";
import { Layout } from "@/components/layout/layout";
import { EventCard } from "@/components/events/event-card";
import { EventFiltersComponent, type EventFilters, type ViewMode } from "@/components/events/event-filters";
import { EventCalendarView } from "@/components/events/event-calendar-view";
import { MasonryGrid } from "@/components/ui/masonry-grid";
import { SakuraPetals } from "@/components/decorations/sakura-petals";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { SearchX, ArrowRight, Users } from "lucide-react";
import type { EventWithGroup } from "@shared/schema";
import heroImage from "@assets/image_1770376446693.png";
import momonaviLogo from "@/assets/images/momonavi-logo.png";

export default function EventsPage() {
  const searchParams = useSearch();
  const urlParams = new URLSearchParams(searchParams);
  const initialUniversity = urlParams.get("university");

  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [filters, setFilters] = useState<EventFilters>({
    university: initialUniversity,
    category: null,
    atmosphereTag: null,
    minSoloFriendliness: 1,
    dateRange: undefined,
  });

  const { data: events, isLoading } = useQuery<EventWithGroup[]>({
    queryKey: ["/api/events"],
  });

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
      if (filters.dateRange?.from) {
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);
        const from = new Date(filters.dateRange.from);
        from.setHours(0, 0, 0, 0);
        if (eventDate < from) {
          return false;
        }
        if (filters.dateRange.to) {
          const to = new Date(filters.dateRange.to);
          to.setHours(23, 59, 59, 999);
          if (eventDate > to) {
            return false;
          }
        }
      }
      return true;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events, filters]);

  return (
    <Layout>
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-transparent">
        <div 
          className="absolute inset-0 bg-cover bg-[center_20%] opacity-15"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="relative z-10 container-narrow py-10 sm:py-14">
          <div className="flex flex-col items-center text-center space-y-4">
            <img 
              src={momonaviLogo} 
              alt="MOMONAVI" 
              className="h-20 sm:h-28 w-auto"
              data-testid="hero-logo"
            />
            <p className="text-lg sm:text-xl text-muted-foreground max-w-lg" data-testid="hero-tagline">
              岡山の大学新歓イベントをまとめて検索。
              新しい出会いへの一歩を応援します。
            </p>
            <div className="flex gap-3 pt-2">
              <Link href="/groups">
                <Button variant="outline" className="gap-2 rounded-xl" data-testid="hero-link-groups">
                  <Users className="h-4 w-4" />
                  団体を探す
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" className="gap-2 rounded-xl" data-testid="hero-link-contact">
                  掲載依頼はこちら
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="container-narrow py-10 sm:py-14 relative overflow-hidden">
        <SakuraPetals position="top-right" opacity={0.35} size="md" />
        <div className="space-y-10 relative z-10">
          <div className="space-y-3 pb-6 border-b">
            <h1 className="text-3xl sm:text-4xl font-bold" data-testid="events-heading">
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
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-72 rounded-2xl" />
              ))}
            </div>
          ) : viewMode === "calendar" ? (
            <EventCalendarView events={filteredEvents} />
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
              <p className="text-sm text-muted-foreground" data-testid="events-count">
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
