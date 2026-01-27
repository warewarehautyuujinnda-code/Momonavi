import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout/layout";
import { EventCard } from "@/components/events/event-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  Clock,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { SiInstagram, SiX, SiLine } from "react-icons/si";
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
        <div className="container-narrow py-10 space-y-8">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      </Layout>
    );
  }

  if (!group) {
    return (
      <Layout>
        <div className="container-narrow py-20 text-center">
          <p className="text-lg text-muted-foreground mb-6">
            団体が見つかりませんでした
          </p>
          <Link href="/groups">
            <Button variant="outline" className="gap-2 rounded-xl">
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

  const hasExternalLinks = group.instagramUrl || group.twitterUrl || group.lineUrl;

  return (
    <Layout>
      <div className="container-narrow py-10 sm:py-14">
        <div className="space-y-8">
          <Link href="/groups">
            <Button variant="ghost" className="gap-2 -ml-4 rounded-xl" data-testid="button-back">
              <ChevronLeft className="h-4 w-4" />
              団体一覧
            </Button>
          </Link>

          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="rounded-lg">{group.university}</Badge>
              <Badge variant="outline" className="rounded-lg border-muted-foreground/20">{group.category}</Badge>
              <Badge variant="outline" className="rounded-lg border-muted-foreground/20">{group.genre}</Badge>
              {group.beginnerFriendly && (
                <Badge className="bg-primary/10 text-primary border-0 rounded-lg">
                  初心者歓迎
                </Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold leading-tight" data-testid="text-group-name">
              {group.name}
            </h1>
          </div>

          <Card className="rounded-2xl border-0 shadow-sm">
            <CardContent className="p-6 sm:p-8 space-y-6">
              <p className="text-lg leading-relaxed text-muted-foreground">{group.description}</p>

              <div className="h-px bg-border" />

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {group.memberCount && (
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">部員数</p>
                      <p className="font-semibold">{group.memberCount}人</p>
                    </div>
                  </div>
                )}

                {group.foundedYear && (
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">設立</p>
                      <p className="font-semibold">{group.foundedYear}年</p>
                    </div>
                  </div>
                )}

                {group.practiceSchedule && (
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">活動日</p>
                      <p className="font-semibold">{group.practiceSchedule}</p>
                    </div>
                  </div>
                )}
              </div>

              {group.atmosphereTags && group.atmosphereTags.length > 0 && (
                <>
                  <div className="h-px bg-border" />
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">雰囲気</p>
                    <div className="flex flex-wrap gap-2">
                      {group.atmosphereTags.map((tag) => (
                        <Badge key={tag} variant="outline" className="rounded-lg border-muted-foreground/20">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {hasExternalLinks && (
                <>
                  <div className="h-px bg-border" />
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">団体の公式リンク</p>
                    <div className="flex flex-wrap gap-3">
                      {group.instagramUrl && (
                        <a
                          href={group.instagramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-muted hover-elevate rounded-xl text-sm font-medium"
                          data-testid="link-instagram"
                        >
                          <SiInstagram className="h-4 w-4" />
                          Instagram
                          <ExternalLink className="h-3 w-3 text-muted-foreground" />
                        </a>
                      )}
                      {group.twitterUrl && (
                        <a
                          href={group.twitterUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-muted hover-elevate rounded-xl text-sm font-medium"
                          data-testid="link-twitter"
                        >
                          <SiX className="h-4 w-4" />
                          X (Twitter)
                          <ExternalLink className="h-3 w-3 text-muted-foreground" />
                        </a>
                      )}
                      {group.lineUrl && (
                        <a
                          href={group.lineUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-muted hover-elevate rounded-xl text-sm font-medium"
                          data-testid="link-line"
                        >
                          <SiLine className="h-4 w-4" />
                          LINE
                          <ExternalLink className="h-3 w-3 text-muted-foreground" />
                        </a>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-0 shadow-sm">
            <CardHeader className="p-6 sm:p-8 pb-0">
              <CardTitle className="text-xl flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <HelpCircle className="h-5 w-5 text-primary" />
                </div>
                よくある質問
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 pt-4">
              <Accordion type="single" collapsible className="w-full">
                {parsedFAQs.map((faq, index) => (
                  <AccordionItem key={index} value={`faq-${index}`} className="border-b-0">
                    <AccordionTrigger className="text-left hover:no-underline py-4">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">開催予定イベント</h2>
              {upcomingEvents.length > 0 && (
                <Badge variant="secondary" className="rounded-lg">{upcomingEvents.length}件</Badge>
              )}
            </div>

            {eventsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Skeleton className="h-56 rounded-2xl" />
                <Skeleton className="h-56 rounded-2xl" />
              </div>
            ) : upcomingEvents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {upcomingEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <Card className="rounded-2xl border-0 shadow-sm">
                <CardContent className="py-12 text-center">
                  <Calendar className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">
                    現在予定されているイベントはありません
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
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
