import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout/layout";
import { EventCard } from "@/components/events/event-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  ChevronLeft,
  Users,
  Calendar,
  Sparkles,
  Clock,
  HelpCircle,
  CalendarDays
} from "lucide-react";
import type { GroupWithEvents, EventWithGroup } from "@shared/schema";

interface FAQ {
  question: string;
  answer: string;
}

const defaultFAQs: FAQ[] = [
  {
    question: "未経験でも入れますか？",
    answer: "はい、未経験者も大歓迎です！先輩が丁寧に教えますので、安心してご参加ください。",
  },
  {
    question: "新入生はどのくらいいますか？",
    answer: "毎年多くの新入生が入会しています。同期の仲間と一緒に活動を始められます。",
  },
  {
    question: "活動に必要な費用は？",
    answer: "部費や活動に必要な道具代などは、新歓イベントで詳しくお伝えします。",
  },
];

export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: group, isLoading: groupLoading } = useQuery<GroupWithEvents>({
    queryKey: ["/api/groups", id],
  });

  const { data: events, isLoading: eventsLoading } = useQuery<EventWithGroup[]>({
    queryKey: ["/api/groups", id, "events"],
  });

  if (groupLoading) {
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

  if (!group) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-lg text-muted-foreground">
            団体が見つかりませんでした
          </p>
          <Link href="/groups">
            <Button variant="outline" className="mt-4 gap-2">
              <ChevronLeft className="h-4 w-4" />
              団体一覧に戻る
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const upcomingEvents = events?.filter(
    (e) => new Date(e.date) > new Date()
  ) || [];

  const parsedFAQs: FAQ[] = group.faqs 
    ? JSON.parse(group.faqs) 
    : defaultFAQs;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <Link href="/groups">
            <Button variant="ghost" size="sm" className="gap-1 -ml-2" data-testid="button-back">
              <ChevronLeft className="h-4 w-4" />
              団体一覧
            </Button>
          </Link>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{group.university}</Badge>
              <Badge variant="outline">{group.category}</Badge>
              <Badge variant="outline">{group.genre}</Badge>
              {group.beginnerFriendly && (
                <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                  <Sparkles className="h-3 w-3 mr-1" />
                  初心者歓迎
                </Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold" data-testid="text-group-name">
              {group.name}
            </h1>
          </div>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <p className="leading-relaxed">{group.description}</p>

              <Separator />

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {group.memberCount && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">部員数</p>
                      <p className="font-medium">{group.memberCount}人</p>
                    </div>
                  </div>
                )}

                {group.foundedYear && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">設立</p>
                      <p className="font-medium">{group.foundedYear}年</p>
                    </div>
                  </div>
                )}

                {group.practiceSchedule && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">活動日</p>
                      <p className="font-medium">{group.practiceSchedule}</p>
                    </div>
                  </div>
                )}
              </div>

              {group.atmosphereTags && group.atmosphereTags.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">雰囲気</p>
                    <div className="flex flex-wrap gap-2">
                      {group.atmosphereTags.map((tag) => (
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

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary" />
                よくある質問
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Accordion type="single" collapsible className="w-full">
                {parsedFAQs.map((faq, index) => (
                  <AccordionItem key={index} value={`faq-${index}`}>
                    <AccordionTrigger className="text-left text-sm">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">開催予定のイベント</h2>
              {upcomingEvents.length > 0 && (
                <Badge variant="secondary">{upcomingEvents.length}件</Badge>
              )}
            </div>

            {eventsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Skeleton className="h-48 rounded-lg" />
                <Skeleton className="h-48 rounded-lg" />
              </div>
            ) : upcomingEvents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {upcomingEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">
                    現在予定されているイベントはありません
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    新しいイベントが追加されるのをお待ちください
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
