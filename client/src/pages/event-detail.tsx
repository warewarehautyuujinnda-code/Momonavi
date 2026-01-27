import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout/layout";
import { ReviewCard } from "@/components/events/review-card";
import { ReviewForm } from "@/components/events/review-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Calendar, 
  MapPin, 
  Users, 
  ChevronLeft,
  Backpack,
  ArrowRight,
  Star
} from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import type { EventWithGroup, Review } from "@shared/schema";

function SoloFriendlinessBar({ level }: { level: number }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">1人参加しやすさ</span>
        <span className="text-lg font-semibold text-primary">{level}/5</span>
      </div>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-2.5 flex-1 rounded-full ${
              i <= level ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
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

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: event, isLoading: eventLoading } = useQuery<EventWithGroup>({
    queryKey: ["/api/events", id],
  });

  const { data: reviews, isLoading: reviewsLoading } = useQuery<Review[]>({
    queryKey: ["/api/events", id, "reviews"],
  });

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
                      {format(eventDate, "HH:mm", { locale: ja })}〜
                      {event.endDate && format(new Date(event.endDate), "HH:mm", { locale: ja })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{event.location}</p>
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

              <div className="h-px bg-border" />

              <SoloFriendlinessBar level={event.soloFriendliness} />

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
            ) : reviews && reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            ) : (
              <Card className="rounded-2xl border-0 shadow-sm">
                <CardContent className="py-12 text-center">
                  <Star className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">
                    まだレビューがありません
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    参加したら感想を投稿してみよう
                  </p>
                </CardContent>
              </Card>
            )}

            <ReviewForm eventId={id!} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
