import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout/layout";
import { ReviewSection } from "@/components/events/review-section";
import { ReviewForm } from "@/components/events/review-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, 
  MapPin, 
  Users, 
  ChevronLeft,
  Backpack,
  ArrowRight,
  Share2,
  CalendarPlus,
  ExternalLink,
  History
} from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import type { EventWithGroup, Review, Event } from "@shared/schema";

function SoloFriendlinessBar({ level, eventCount, hasData }: { level: number; eventCount?: number; hasData: boolean }) {
  if (!hasData) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">1人参加しやすさ</span>
          <span className="text-sm text-muted-foreground">過去データなし</span>
        </div>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-2.5 flex-1 rounded-full bg-muted"
            />
          ))}
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          この団体のイベントデータがまだありません
        </p>
      </div>
    );
  }

  const displayLevel = Math.round(level * 10) / 10;
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          1人参加しやすさ
          {eventCount !== undefined && eventCount > 0 && (
            <span className="ml-1 text-xs">（過去{eventCount}件のイベントの平均）</span>
          )}
        </span>
        <span className="text-lg font-semibold text-primary">{displayLevel}/5</span>
      </div>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((i) => {
          const fillPercentage = Math.min(1, Math.max(0, level - (i - 1))) * 100;
          return (
            <div
              key={i}
              className="h-2.5 flex-1 rounded-full bg-muted overflow-hidden"
            >
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${fillPercentage}%` }}
              />
            </div>
          );
        })}
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {level >= 4
          ? "1人での参加者が多く、とても参加しやすい雰囲気です"
          : level >= 3
          ? "1人でも参加しやすいイベントです"
          : level >= 2
          ? "友達と一緒の参加がおすすめです"
          : "グループでの参加が多いイベントです"}
      </p>
    </div>
  );
}

function generateGoogleCalendarUrl(event: EventWithGroup): string {
  const startDate = new Date(event.date);
  let endDate: Date;
  
  if (event.endDate) {
    endDate = new Date(event.endDate);
  } else {
    // Default: 2 hours after start if no end time specified
    endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
  }
  
  // Format as YYYYMMDDTHHmmssZ (UTC format for Google Calendar)
  const formatDateForCalendar = (date: Date): string => {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
  };
  
  const dates = `${formatDateForCalendar(startDate)}/${formatDateForCalendar(endDate)}`;
  const details = `${event.description || ''}\n\nイベントページ: ${window.location.href}`;
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: dates,
    details: details,
    location: event.location || '',
  });
  
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function PastEventCard({ event }: { event: Event }) {
  const eventDate = new Date(event.date);
  return (
    <Link href={`/events/${event.id}`}>
      <Card className="rounded-xl border-0 shadow-sm hover-elevate cursor-pointer" data-testid={`past-event-${event.id}`}>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-1">
            {format(eventDate, "yyyy年M月d日", { locale: ja })}
          </p>
          <p className="font-medium text-sm line-clamp-2">{event.title}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  const { data: event, isLoading: eventLoading } = useQuery<EventWithGroup>({
    queryKey: ["/api/events", id],
  });

  const { data: reviews, isLoading: reviewsLoading } = useQuery<Review[]>({
    queryKey: ["/api/events", id, "reviews"],
  });

  const { data: groupEventStats } = useQuery<{ averageSoloFriendliness: number; eventCount: number }>({
    queryKey: ["/api/groups", event?.groupId, "review-stats"],
    enabled: !!event?.groupId,
  });

  const { data: pastEvents } = useQuery<Event[]>({
    queryKey: ["/api/groups", event?.groupId, "past-events"],
    enabled: !!event?.groupId,
  });

  const handleShare = async () => {
    const shareData = {
      title: event?.title || '',
      text: event?.description || `${event?.group.name}のイベント`,
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "URLをコピーしました",
          description: "友だちにリンクを共有しましょう",
        });
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "URLをコピーしました",
          description: "友だちにリンクを共有しましょう",
        });
      }
    }
  };

  const handleAddToCalendar = () => {
    if (event) {
      window.open(generateGoogleCalendarUrl(event), '_blank', 'noopener,noreferrer');
    }
  };

  if (eventLoading) {
    return (
      <Layout>
        <div className="container-narrow py-10 space-y-8">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      </Layout>
    );
  }

  if (!event) {
    return (
      <Layout>
        <div className="container-narrow py-20 text-center">
          <p className="text-lg text-muted-foreground mb-6">
            イベントが見つかりませんでした
          </p>
          <Link href="/events">
            <Button variant="outline" className="gap-2 rounded-xl">
              <ChevronLeft className="h-4 w-4" />
              イベント一覧に戻る
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const eventDate = new Date(event.date);
  const isPast = eventDate < new Date();

  return (
    <Layout>
      <div className="container-narrow py-10 sm:py-14">
        <div className="space-y-8">
          <Link href="/events">
            <Button variant="ghost" className="gap-2 -ml-4 rounded-xl" data-testid="button-back">
              <ChevronLeft className="h-4 w-4" />
              イベント一覧
            </Button>
          </Link>

          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="rounded-lg">{event.group.university}</Badge>
              <Badge variant="outline" className="rounded-lg border-muted-foreground/20">{event.group.category}</Badge>
              {event.beginnerWelcome && (
                <Badge className="bg-primary/10 text-primary border-0 rounded-lg">
                  初心者歓迎
                </Badge>
              )}
              {isPast && (
                <Badge variant="secondary" className="bg-muted rounded-lg">
                  終了済み
                </Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold leading-tight" data-testid="text-event-title">
              {event.title}
            </h1>

            <Link href={`/groups/${event.groupId}`}>
              <Button variant="ghost" className="gap-2 -ml-4 text-muted-foreground rounded-xl" data-testid="link-group">
                {event.group.name}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <Card className="rounded-2xl border-0 shadow-sm">
            <CardContent className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">
                      {format(eventDate, "yyyy年M月d日(E)", { locale: ja })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(eventDate, "HH:mm", { locale: ja })}
                      {event.endDate ? `〜${format(new Date(event.endDate), "HH:mm", { locale: ja })}` : "〜"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 sm:col-span-2">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold">{event.location}</p>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                        data-testid="link-google-maps"
                      >
                        Googleマップで開く
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    {event.location && (
                      <div className="rounded-xl overflow-hidden border">
                        <iframe
                          src={`https://maps.google.com/maps?q=${encodeURIComponent(event.location)}&output=embed&hl=ja`}
                          width="100%"
                          height="200"
                          style={{ border: 0 }}
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title="開催場所"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {event.requirements && (
                  <div className="flex items-start gap-4 sm:col-span-2">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Backpack className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">持ち物</p>
                      <p className="font-semibold">{event.requirements}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  className="gap-2 rounded-xl flex-1 sm:flex-none"
                  onClick={handleShare}
                  data-testid="button-share"
                >
                  <Share2 className="h-4 w-4" />
                  友だちに共有
                </Button>
                <Button
                  variant="outline"
                  className="gap-2 rounded-xl flex-1 sm:flex-none"
                  onClick={handleAddToCalendar}
                  data-testid="button-calendar"
                >
                  <CalendarPlus className="h-4 w-4" />
                  Googleカレンダーに追加
                </Button>
              </div>

              <div className="h-px bg-border" />

              <SoloFriendlinessBar 
                level={groupEventStats?.eventCount ? groupEventStats.averageSoloFriendliness : 0} 
                eventCount={groupEventStats?.eventCount}
                hasData={!!groupEventStats?.eventCount}
              />

              {event.atmosphereTags && event.atmosphereTags.length > 0 && (
                <>
                  <div className="h-px bg-border" />
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">雰囲気</p>
                    <div className="flex flex-wrap gap-2">
                      {event.atmosphereTags.map((tag) => (
                        <Badge key={tag} variant="outline" className="rounded-lg border-muted-foreground/20">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {event.description && (
            <Card className="rounded-2xl border-0 shadow-sm">
              <CardHeader className="p-6 sm:p-8 pb-0">
                <CardTitle className="text-xl">イベント詳細</CardTitle>
              </CardHeader>
              <CardContent className="p-6 sm:p-8 pt-4">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </p>
              </CardContent>
            </Card>
          )}

          {event.participationFlow && (
            <Card className="rounded-2xl border-0 shadow-sm">
              <CardHeader className="p-6 sm:p-8 pb-0">
                <CardTitle className="text-xl">参加の流れ</CardTitle>
              </CardHeader>
              <CardContent className="p-6 sm:p-8 pt-4">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {event.participationFlow}
                </p>
              </CardContent>
            </Card>
          )}

          {pastEvents && pastEvents.filter(e => e.id !== event.id).length > 0 && (
            <Card className="rounded-2xl border-0 shadow-sm">
              <CardHeader className="p-6 sm:p-8 pb-0">
                <CardTitle className="text-xl flex items-center gap-2">
                  <History className="h-5 w-5" />
                  過去のイベント
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 sm:p-8 pt-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {pastEvents.filter(e => e.id !== event.id).slice(0, 3).map((pastEvent) => (
                    <PastEventCard key={pastEvent.id} event={pastEvent} />
                  ))}
                </div>
                {pastEvents.filter(e => e.id !== event.id).length > 3 && (
                  <Link href={`/groups/${event.groupId}`}>
                    <Button variant="ghost" className="w-full gap-2 rounded-xl" data-testid="link-more-events">
                      もっと見る
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}

          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">レビュー</h2>
              {reviews && reviews.length > 0 && (
                <Badge variant="secondary" className="rounded-lg">{reviews.length}件</Badge>
              )}
            </div>

            {reviewsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-36 w-full rounded-2xl" />
                <Skeleton className="h-36 w-full rounded-2xl" />
              </div>
            ) : (
              <ReviewSection reviews={reviews || []} />
            )}

            <ReviewForm eventId={id!} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
