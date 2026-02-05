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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Mail, Send, Loader2, ChevronDown, CheckCircle, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { universities, contactTypes } from "@shared/schema";

const contactFormSchema = z.object({
  type: z.enum(contactTypes),
  name: z.string().max(100).optional(),
  university: z.string().optional(),
  contactMethod: z.string().min(1, "連絡先を入力してください").max(200),
  content: z.string().min(10, "10文字以上で入力してください").max(2000),
  eventName: z.string().max(200).optional(),
  eventDate: z.string().max(100).optional(),
  eventLocation: z.string().max(200).optional(),
  eventDescription: z.string().max(2000).optional(),
  eventImageUrl: z.string().url().optional().or(z.literal("")),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

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
    question: "イベント掲載を依頼したいのですが",
    answer: "上記のお問い合わせフォームから「イベント掲載依頼」を選択し、必要事項を入力してください。内容を確認後、通常1〜3営業日以内に掲載いたします。"
  },
  {
    question: "個人情報はどう扱われますか？",
    answer: "お問い合わせいただいた内容は、返信およびサービス改善の目的でのみ使用します。第三者への提供は行いません。"
  },
  {
    question: "団体のリンク（Instagram等）を追加したいのですが",
    answer: "お問い合わせフォームから団体名とリンクをお知らせください。確認後、団体ページに追加いたします。"
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

export default function ContactPage() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      type: "一般",
      name: "",
      university: "",
      contactMethod: "",
      content: "",
      eventName: "",
      eventDate: "",
      eventLocation: "",
      eventDescription: "",
      eventImageUrl: "",
    },
  });

  const contactType = form.watch("type");
  const selectedUniversity = form.watch("university");

  const mutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      return apiRequest("POST", "/api/contact", data);
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: "送信完了",
        description: "お問い合わせありがとうございます。",
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

  const onSubmit = (data: ContactFormData) => {
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
              <h2 className="text-xl font-bold">送信完了しました</h2>
              <p className="text-muted-foreground">
                お問い合わせありがとうございます。
                内容を確認後、必要に応じてご連絡いたします。
              </p>
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => {
                  setSubmitted(false);
                  form.reset();
                }}
                data-testid="button-new-inquiry"
              >
                新しいお問い合わせ
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
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">お問い合わせ</h1>
          <p className="text-lg text-muted-foreground">
            ご質問やイベント掲載のご依頼はこちらから
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardHeader className="p-6 sm:p-8 pb-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-xl">お問い合わせフォーム</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 pt-6">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="type">お問い合わせ種別</Label>
                  <Select
                    value={form.watch("type")}
                    onValueChange={(value) => form.setValue("type", value as typeof contactTypes[number])}
                  >
                    <SelectTrigger className="rounded-xl" data-testid="select-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {contactTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">お名前 / 団体名（任意）</Label>
                    <Input
                      id="name"
                      placeholder="例: 田中太郎"
                      className="rounded-xl"
                      {...form.register("name")}
                      data-testid="input-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="university">大学（任意）</Label>
                    <Select
                      value={selectedUniversity?.startsWith("その他:") ? "その他" : selectedUniversity || ""}
                      onValueChange={(value) => {
                        if (value === "その他") {
                          form.setValue("university", "その他:");
                        } else {
                          form.setValue("university", value);
                        }
                      }}
                    >
                      <SelectTrigger className="rounded-xl" data-testid="select-university">
                        <SelectValue placeholder="選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        {universities.map((uni) => (
                          <SelectItem key={uni} value={uni}>
                            {uni}
                          </SelectItem>
                        ))}
                        <SelectItem value="その他">その他</SelectItem>
                      </SelectContent>
                    </Select>
                    {selectedUniversity?.startsWith("その他") && (
                      <Input
                        placeholder="大学名を入力してください"
                        className="rounded-xl mt-2"
                        value={selectedUniversity.replace("その他:", "")}
                        onChange={(e) => form.setValue("university", `その他:${e.target.value}`)}
                        data-testid="input-university-other"
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactMethod">連絡先（メール or Instagram）</Label>
                  <Input
                    id="contactMethod"
                    placeholder="例: example@email.com または @instagram_id"
                    className="rounded-xl"
                    {...form.register("contactMethod")}
                    data-testid="input-contact"
                  />
                  {form.formState.errors.contactMethod && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.contactMethod.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">お問い合わせ内容</Label>
                  <Textarea
                    id="content"
                    placeholder="お問い合わせ内容を入力してください"
                    rows={4}
                    className="rounded-xl resize-none"
                    {...form.register("content")}
                    data-testid="textarea-content"
                  />
                  {form.formState.errors.content && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.content.message}
                    </p>
                  )}
                </div>

                {contactType === "イベント掲載依頼" && (
                  <div className="space-y-4 p-4 bg-muted rounded-xl">
                    <p className="text-sm font-medium">イベント情報（任意）</p>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="eventName">イベント名</Label>
                        <Input
                          id="eventName"
                          placeholder="例: 新歓バレーボール体験会"
                          className="rounded-xl"
                          {...form.register("eventName")}
                          data-testid="input-event-name"
                        />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="eventDate">日時</Label>
                          <Input
                            id="eventDate"
                            placeholder="例: 4月10日 14:00-16:00"
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
                    </div>
                  </div>
                )}

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
                  送信する
                </Button>
              </form>
            </CardContent>
          </Card>

          <FAQSection />
        </div>
      </div>
    </Layout>
  );
}
