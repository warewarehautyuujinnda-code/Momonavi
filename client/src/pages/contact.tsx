import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Layout } from "@/components/layout/layout";
import { SakuraPetals } from "@/components/decorations/sakura-petals";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Send, Loader2, ChevronDown, CheckCircle, HelpCircle, Eye, Users, Calendar, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { universities, groupCategories, genres, atmosphereTags as allAtmosphereTags } from "@shared/schema";

import sportsImg from "@/assets/images/stock/sports-1.jpg";
import musicImg from "@/assets/images/stock/music-1.jpg";
import cultureImg from "@/assets/images/stock/culture-1.jpg";
import studyImg from "@/assets/images/stock/study-1.jpg";
import volunteerImg from "@/assets/images/stock/volunteer-1.jpg";
import danceImg from "@/assets/images/stock/dance-1.jpg";

const genreImageMap: Record<string, string> = {
  "スポーツ": sportsImg,
  "音楽": musicImg,
  "文化": cultureImg,
  "学術": studyImg,
  "ボランティア": volunteerImg,
  "ダンス": danceImg,
};

function getImageForGenre(genre?: string): string {
  if (!genre) return cultureImg;
  return genreImageMap[genre] || cultureImg;
}

const submissionFormSchema = z.object({
  requesterEmail: z.string().email("有効なメールアドレスを入力してください"),
  requesterName: z.string().max(100).optional(),
  message: z.string().max(2000).optional(),
  groupName: z.string().min(1, "団体名は必須です").max(200),
  groupUniversity: z.string().min(1, "大学は必須です"),
  groupCategory: z.string().min(1, "区分は必須です"),
  groupGenre: z.string().min(1, "ジャンルは必須です"),
  groupDescription: z.string().min(1, "団体説明は必須です").max(2000),
  groupAtmosphereTags: z.array(z.string()).min(1, "雰囲気タグを1つ以上選択してください"),
  groupContactInfo: z.string().max(200).optional(),
  groupInstagramUrl: z.string().url().optional().or(z.literal("")),
  groupTwitterUrl: z.string().url().optional().or(z.literal("")),
  groupLineUrl: z.string().url().optional().or(z.literal("")),
  eventTitle: z.string().max(200).optional(),
  eventDescription: z.string().max(2000).optional(),
  eventDate: z.string().optional(),
  eventEndDate: z.string().optional(),
  eventLocation: z.string().max(200).optional(),
  eventImageUrl: z.string().url().optional().or(z.literal("")),
  eventBeginnerWelcome: z.boolean().optional(),
  eventSoloFriendliness: z.number().min(1).max(5).optional(),
});

type SubmissionFormData = z.infer<typeof submissionFormSchema>;

const faqs = [
  {
    question: "掲載基準はありますか？",
    answer: "岡山大学・岡山理科大学・ノートルダム清心女子大学の公認団体、または学生が主体となって活動している団体のイベントを掲載しています。営利目的や宗教勧誘を主とする団体は掲載をお断りする場合があります。"
  },
  {
    question: "どの大学が対象ですか？",
    answer: "現在は岡山大学、岡山理科大学、ノートルダム清心女子大学の3大学を対象としています。今後対象大学を拡大する可能性もあります。"
  },
  {
    question: "掲載依頼の流れは？",
    answer: "掲載依頼フォームから団体情報（必須）とイベント情報（任意）を送信してください。運営チームで内容を確認後、承認されるとサイトに掲載されます。掲載確定時にメールでお知らせします。"
  },
  {
    question: "個人情報はどう扱われますか？",
    answer: "お問い合わせいただいた内容は、返信およびサービス改善の目的でのみ使用します。第三者への提供は行いません。"
  },
  {
    question: "団体のリンク（Instagram等）を追加したいのですが",
    answer: "掲載依頼フォームからSNSリンクを含めて送信してください。確認後、団体ページに追加いたします。"
  }
];

function FAQSection() {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (openItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <HelpCircle className="h-5 w-5 text-primary" />
        </div>
        <h2 className="text-xl font-bold">よくある質問</h2>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <Collapsible
            key={index}
            open={openItems.has(index)}
            onOpenChange={() => toggleItem(index)}
          >
            <Card className="rounded-2xl border-0 shadow-sm">
              <CollapsibleTrigger asChild>
                <button
                  className="w-full p-5 flex items-center justify-between text-left hover-elevate rounded-2xl"
                  data-testid={`faq-trigger-${index}`}
                >
                  <span className="font-medium pr-4">{faq.question}</span>
                  <ChevronDown className={`h-5 w-5 text-muted-foreground shrink-0 transition-transform ${openItems.has(index) ? 'rotate-180' : ''}`} />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-5 pb-5 pt-0">
                  <p className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
      </div>
    </section>
  );
}

function GroupPreviewCard({ data }: { data: Partial<SubmissionFormData> }) {
  const imageUrl = getImageForGenre(data.groupGenre);
  
  return (
    <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
      <div className="relative h-36 overflow-hidden">
        <img src={imageUrl} alt={data.groupName || "団体"} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <Badge className="bg-white/90 text-foreground text-xs font-normal rounded-lg shadow-sm">
            {data.groupUniversity || "大学未設定"}
          </Badge>
          {data.groupCategory && (
            <Badge variant="outline" className="bg-white/90 text-foreground text-xs font-normal rounded-lg border-0 shadow-sm">
              {data.groupCategory}
            </Badge>
          )}
        </div>
      </div>
      <div className="p-5 space-y-3">
        <div className="space-y-1">
          <h3 className="font-semibold text-base leading-snug">
            {data.groupName || "団体名"}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {data.groupDescription || "団体の説明がここに表示されます"}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Badge className="bg-primary/10 text-primary border-0 text-xs rounded-lg">
            初心者歓迎
          </Badge>
          {data.groupGenre && (
            <Badge variant="outline" className="text-xs rounded-lg border-muted-foreground/20">
              {data.groupGenre}
            </Badge>
          )}
        </div>
        {data.groupAtmosphereTags && data.groupAtmosphereTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {data.groupAtmosphereTags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs font-normal rounded-lg border-muted-foreground/20">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            <span>--人</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

function EventPreviewCard({ data }: { data: Partial<SubmissionFormData> }) {
  const imageUrl = data.eventImageUrl || getImageForGenre(data.groupGenre);
  
  return (
    <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
      <div className="relative h-40 overflow-hidden">
        <img src={imageUrl} alt={data.eventTitle || "イベント"} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <Badge className="bg-white/90 text-foreground text-xs font-normal rounded-lg shadow-sm">
            {data.groupUniversity || "大学未設定"}
          </Badge>
        </div>
      </div>
      <div className="p-5 space-y-4">
        <div className="space-y-1">
          <h3 className="font-semibold text-base leading-snug line-clamp-2">
            {data.eventTitle || "イベント名"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {data.groupName || "団体名"}
          </p>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>{data.eventDate || "日時未設定"}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate">{data.eventLocation || "場所未設定"}</span>
          </div>
        </div>
        {data.groupAtmosphereTags && data.groupAtmosphereTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {data.groupAtmosphereTags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs font-normal rounded-lg border-muted-foreground/20">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

export default function ContactPage() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [showEventFields, setShowEventFields] = useState(false);

  const form = useForm<SubmissionFormData>({
    resolver: zodResolver(submissionFormSchema),
    defaultValues: {
      requesterEmail: "",
      requesterName: "",
      message: "",
      groupName: "",
      groupUniversity: "",
      groupCategory: "",
      groupGenre: "",
      groupDescription: "",
      groupAtmosphereTags: [],
      groupContactInfo: "",
      groupInstagramUrl: "",
      groupTwitterUrl: "",
      groupLineUrl: "",
      eventTitle: "",
      eventDescription: "",
      eventDate: "",
      eventEndDate: "",
      eventLocation: "",
      eventImageUrl: "",
      eventBeginnerWelcome: true,
      eventSoloFriendliness: 3,
    },
  });

  const watchedData = form.watch();
  const selectedTags = form.watch("groupAtmosphereTags") || [];

  const toggleTag = (tag: string) => {
    const current = form.getValues("groupAtmosphereTags") || [];
    if (current.includes(tag)) {
      form.setValue("groupAtmosphereTags", current.filter(t => t !== tag), { shouldValidate: true });
    } else {
      form.setValue("groupAtmosphereTags", [...current, tag], { shouldValidate: true });
    }
  };

  const mutation = useMutation({
    mutationFn: async (data: SubmissionFormData) => {
      return apiRequest("POST", "/api/submissions", data);
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: "送信完了",
        description: "掲載依頼を受け付けました。確認後、メールでご連絡いたします。",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "送信に失敗しました",
        description: error.message || "しばらく待ってから再度お試しください",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SubmissionFormData) => {
    mutation.mutate(data);
  };

  if (submitted) {
    return (
      <Layout>
        <div className="container-narrow py-16">
          <Card className="rounded-2xl border-0 shadow-sm max-w-lg mx-auto">
            <CardContent className="p-8 text-center space-y-4">
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <h2 className="text-xl font-bold" data-testid="text-submit-success">送信完了しました</h2>
              <p className="text-muted-foreground">
                掲載依頼ありがとうございます。
                内容を確認後、ご入力いただいたメールアドレスにご連絡いたします。
              </p>
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => {
                  setSubmitted(false);
                  setShowEventFields(false);
                  form.reset();
                }}
                data-testid="button-new-inquiry"
              >
                新しい掲載依頼
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-narrow py-12 sm:py-16 space-y-12 relative overflow-hidden">
        <SakuraPetals position="top-left" opacity={0.35} size="md" />
        <div className="text-center space-y-4 pb-6 border-b relative z-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight" data-testid="page-title">お問い合わせ＆掲載依頼</h1>
          <p className="text-lg text-muted-foreground">
            団体やイベントの掲載をご希望の方はこちらから
          </p>
        </div>

        <Tabs defaultValue="submission" className="relative z-10">
          <TabsList className="grid w-full grid-cols-2 rounded-xl">
            <TabsTrigger value="submission" className="rounded-xl" data-testid="tab-submission">掲載依頼</TabsTrigger>
            <TabsTrigger value="faq" className="rounded-xl" data-testid="tab-faq">よくある質問</TabsTrigger>
          </TabsList>

          <TabsContent value="submission" className="mt-8">
            <div className="grid lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <Card className="rounded-2xl border-0 shadow-sm">
                    <CardHeader className="p-6 sm:p-8 pb-0">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Mail className="h-5 w-5 text-primary" />
                        </div>
                        <CardTitle className="text-xl">申請者情報</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 sm:p-8 pt-6 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="requesterEmail">メールアドレス <span className="text-destructive">*</span></Label>
                        <Input
                          id="requesterEmail"
                          type="email"
                          placeholder="example@email.com"
                          className="rounded-xl"
                          {...form.register("requesterEmail")}
                          data-testid="input-email"
                        />
                        {form.formState.errors.requesterEmail && (
                          <p className="text-sm text-destructive">{form.formState.errors.requesterEmail.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="requesterName">お名前 / 担当者名（任意）</Label>
                        <Input
                          id="requesterName"
                          placeholder="例: 田中太郎"
                          className="rounded-xl"
                          {...form.register("requesterName")}
                          data-testid="input-name"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl border-0 shadow-sm">
                    <CardHeader className="p-6 sm:p-8 pb-0">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <CardTitle className="text-xl">団体情報 <span className="text-destructive text-sm font-normal">（必須）</span></CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 sm:p-8 pt-6 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="groupName">団体名 <span className="text-destructive">*</span></Label>
                        <Input
                          id="groupName"
                          placeholder="例: 岡大バレーボールサークル"
                          className="rounded-xl"
                          {...form.register("groupName")}
                          data-testid="input-group-name"
                        />
                        {form.formState.errors.groupName && (
                          <p className="text-sm text-destructive">{form.formState.errors.groupName.message}</p>
                        )}
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>大学 <span className="text-destructive">*</span></Label>
                          <Select
                            value={form.watch("groupUniversity") || ""}
                            onValueChange={(v) => form.setValue("groupUniversity", v, { shouldValidate: true })}
                          >
                            <SelectTrigger className="rounded-xl" data-testid="select-university">
                              <SelectValue placeholder="選択してください" />
                            </SelectTrigger>
                            <SelectContent>
                              {universities.map((uni) => (
                                <SelectItem key={uni} value={uni}>{uni}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {form.formState.errors.groupUniversity && (
                            <p className="text-sm text-destructive">{form.formState.errors.groupUniversity.message}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label>区分 <span className="text-destructive">*</span></Label>
                          <Select
                            value={form.watch("groupCategory") || ""}
                            onValueChange={(v) => form.setValue("groupCategory", v, { shouldValidate: true })}
                          >
                            <SelectTrigger className="rounded-xl" data-testid="select-category">
                              <SelectValue placeholder="選択してください" />
                            </SelectTrigger>
                            <SelectContent>
                              {groupCategories.map((cat) => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {form.formState.errors.groupCategory && (
                            <p className="text-sm text-destructive">{form.formState.errors.groupCategory.message}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>ジャンル <span className="text-destructive">*</span></Label>
                        <Select
                          value={form.watch("groupGenre") || ""}
                          onValueChange={(v) => form.setValue("groupGenre", v, { shouldValidate: true })}
                        >
                          <SelectTrigger className="rounded-xl" data-testid="select-genre">
                            <SelectValue placeholder="選択してください" />
                          </SelectTrigger>
                          <SelectContent>
                            {genres.map((g) => (
                              <SelectItem key={g} value={g}>{g}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {form.formState.errors.groupGenre && (
                          <p className="text-sm text-destructive">{form.formState.errors.groupGenre.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="groupDescription">団体説明 <span className="text-destructive">*</span></Label>
                        <Textarea
                          id="groupDescription"
                          placeholder="活動内容や魅力を教えてください"
                          rows={3}
                          className="rounded-xl resize-none"
                          {...form.register("groupDescription")}
                          data-testid="textarea-group-description"
                        />
                        {form.formState.errors.groupDescription && (
                          <p className="text-sm text-destructive">{form.formState.errors.groupDescription.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>雰囲気タグ <span className="text-destructive">*</span></Label>
                        <div className="flex flex-wrap gap-2">
                          {allAtmosphereTags.map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => toggleTag(tag)}
                              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                                selectedTags.includes(tag)
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "bg-background border-muted-foreground/20 hover:border-primary/50"
                              }`}
                              data-testid={`tag-${tag}`}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                        {form.formState.errors.groupAtmosphereTags && (
                          <p className="text-sm text-destructive">{form.formState.errors.groupAtmosphereTags.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="groupContactInfo">連絡先（任意）</Label>
                        <Input
                          id="groupContactInfo"
                          placeholder="例: example@email.com"
                          className="rounded-xl"
                          {...form.register("groupContactInfo")}
                          data-testid="input-group-contact"
                        />
                      </div>

                      <div className="grid sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="groupInstagramUrl">Instagram URL</Label>
                          <Input
                            id="groupInstagramUrl"
                            placeholder="https://..."
                            className="rounded-xl"
                            {...form.register("groupInstagramUrl")}
                            data-testid="input-instagram"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="groupTwitterUrl">X (Twitter) URL</Label>
                          <Input
                            id="groupTwitterUrl"
                            placeholder="https://..."
                            className="rounded-xl"
                            {...form.register("groupTwitterUrl")}
                            data-testid="input-twitter"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="groupLineUrl">LINE URL</Label>
                          <Input
                            id="groupLineUrl"
                            placeholder="https://..."
                            className="rounded-xl"
                            {...form.register("groupLineUrl")}
                            data-testid="input-line"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl border-0 shadow-sm">
                    <Collapsible open={showEventFields} onOpenChange={setShowEventFields}>
                      <CollapsibleTrigger asChild>
                        <button
                          type="button"
                          className="w-full p-6 sm:p-8 flex items-center justify-between text-left hover-elevate rounded-2xl"
                          data-testid="toggle-event-section"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                              <Calendar className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="text-xl font-semibold">イベント情報</h3>
                              <p className="text-sm text-muted-foreground">任意 - イベントも同時に掲載する場合</p>
                            </div>
                          </div>
                          <ChevronDown className={`h-5 w-5 text-muted-foreground shrink-0 transition-transform ${showEventFields ? 'rotate-180' : ''}`} />
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent className="p-6 sm:p-8 pt-0 space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="eventTitle">イベント名</Label>
                            <Input
                              id="eventTitle"
                              placeholder="例: 新歓バレーボール体験会"
                              className="rounded-xl"
                              {...form.register("eventTitle")}
                              data-testid="input-event-title"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="eventDescription">イベント説明</Label>
                            <Textarea
                              id="eventDescription"
                              placeholder="イベントの詳細を入力してください"
                              rows={3}
                              className="rounded-xl resize-none"
                              {...form.register("eventDescription")}
                              data-testid="textarea-event-description"
                            />
                          </div>
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="eventDate">日時</Label>
                              <Input
                                id="eventDate"
                                placeholder="例: 2026-04-10T14:00"
                                type="datetime-local"
                                className="rounded-xl"
                                {...form.register("eventDate")}
                                data-testid="input-event-date"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="eventLocation">場所</Label>
                              <Input
                                id="eventLocation"
                                placeholder="例: 岡山大学体育館"
                                className="rounded-xl"
                                {...form.register("eventLocation")}
                                data-testid="input-event-location"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="eventImageUrl">画像URL（任意）</Label>
                            <Input
                              id="eventImageUrl"
                              placeholder="https://..."
                              className="rounded-xl"
                              {...form.register("eventImageUrl")}
                              data-testid="input-event-image"
                            />
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>

                  <Card className="rounded-2xl border-0 shadow-sm">
                    <CardContent className="p-6 sm:p-8 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="message">その他メッセージ（任意）</Label>
                        <Textarea
                          id="message"
                          placeholder="ご質問やご要望があればお書きください"
                          rows={3}
                          className="rounded-xl resize-none"
                          {...form.register("message")}
                          data-testid="textarea-message"
                        />
                      </div>
                      <Button
                        type="submit"
                        size="lg"
                        className="w-full gap-2 rounded-xl"
                        disabled={mutation.isPending}
                        data-testid="button-submit"
                      >
                        {mutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                        掲載依頼を送信する
                      </Button>
                    </CardContent>
                  </Card>
                </form>
              </div>

              <div className="lg:col-span-2">
                <div className="sticky top-24 space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Eye className="h-4 w-4" />
                    <span>掲載後のプレビュー</span>
                  </div>
                  <GroupPreviewCard data={watchedData} />
                  {showEventFields && watchedData.eventTitle && (
                    <EventPreviewCard data={watchedData} />
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="faq" className="mt-8">
            <FAQSection />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
