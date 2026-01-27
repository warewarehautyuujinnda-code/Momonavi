import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout/layout";
import { ReviewCard } from "@/components/events/review-card";
import { ReviewForm } from "@/components/events/review-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Sparkles, 
  ChevronLeft,
  Building2,
  Backpack,
  ArrowRight,
  MessageSquare,
  Star
} from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import type { EventWithGroup, Review } from "@shared/schema";

function SoloFriendlinessBar({ level }: { level: number }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">1人参加しやすさ</span>
        <span className="font-medium">{level}/5</span>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded-full ${
              i <= level ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
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
        <div className="container mx-auto px-4 py-8 space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      </Layout>
    );
  }

  if (!event) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-lg text-muted-foreground">
            イベントが見つかりませんでした
          </p>
          <Link href="/events">
            <Button variant="outline" className="mt-4 gap-2">
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
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <Link href="/events">
            <Button variant="ghost" size="sm" className="gap-1 -ml-2" data-testid="button-back">
              <ChevronLeft className="h-4 w-4" />
              イベント一覧
            </Button>
          </Link>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{event.group.university}</Badge>
              <Badge variant="outline">{event.group.category}</Badge>
              {event.beginnerWelcome && (
                <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                  <Sparkles className="h-3 w-3 mr-1" />
                  初心者歓迎
                </Badge>
              )}
              {isPast && (
                <Badge variant="secondary" className="bg-muted">
                  終了済み
                </Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold" data-testid="text-event-title">
              {event.title}
            </h1>

            <Link href={`/groups/${event.groupId}`}>
              <Button variant="ghost" className="gap-2 -ml-2 text-muted-foreground" data-testid="link-group">
                <Building2 className="h-4 w-4" />
                {event.group.name}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">
                      {format(eventDate, "yyyy年M月d日(E)", { locale: ja })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(eventDate, "HH:mm", { locale: ja })}〜
                      {event.endDate && format(new Date(event.endDate), "HH:mm", { locale: ja })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">{event.location}</p>
                  </div>
                </div>

                {event.requirements && (
                  <div className="flex items-start gap-3 sm:col-span-2">
                    <Backpack className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">持ち物</p>
                      <p className="font-medium">{event.requirements}</p>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              <SoloFriendlinessBar level={event.soloFriendliness} />

              {event.atmosphereTags && event.atmosphereTags.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">雰囲気</p>
                    <div className="flex flex-wrap gap-2">
                      {event.atmosphereTags.map((tag) => (
                        <Badge key={tag} variant="outline">
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
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">イベント詳細</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </p>
              </CardContent>
            </Card>
          )}

          {event.participationFlow && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">参加の流れ</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {event.participationFlow}
                </p>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">レビュー</h2>
              {reviews && reviews.length > 0 && (
                <Badge variant="secondary">{reviews.length}件</Badge>
              )}
            </div>

            {reviewsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-32 w-full rounded-lg" />
                <Skeleton className="h-32 w-full rounded-lg" />
              </div>
            ) : reviews && reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <Star className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">
                    まだレビューがありません
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    参加したら感想を投稿してみよう！
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
