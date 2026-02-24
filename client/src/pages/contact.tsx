import { ChangeEvent, useState } from "react";
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
import { Mail, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { atmosphereTags, genres, groupCategories, universities } from "@shared/schema";

const generalSchema = z.object({
  name: z.string().max(100).optional(),
  contactMethod: z.string().min(1, "連絡先を入力してください").max(200),
  content: z.string().min(10, "10文字以上で入力してください").max(2000),
});

const groupSchema = z.object({
  name: z.string().min(1).max(200),
  university: z.string().min(1).max(200),
  category: z.string().min(1).max(100),
  genre: z.string().min(1).max(100),
  description: z.string().min(10).max(2000),
  atmosphereTags: z.string(),
  beginnerFriendly: z.boolean().default(true),
  memberCount: z.string().optional(),
  foundedYear: z.string().optional(),
  practiceSchedule: z.string().optional(),
  faqs: z.string().optional(),
  contactInfo: z.string().optional(),
  instagramUrl: z.string().optional(),
  twitterUrl: z.string().optional(),
  lineUrl: z.string().optional(),
  imageUrl: z.string().optional(),
});

const eventSchema = z.object({
  groupId: z.string().min(1).max(36),
  title: z.string().min(1).max(200),
  description: z.string().min(10).max(2000),
  date: z.string().min(1),
  endDate: z.string().optional(),
  location: z.string().min(1).max(200),
  requirements: z.string().optional(),
  atmosphereTags: z.string(),
  participationFlow: z.string().optional(),
  maxParticipants: z.string().optional(),
  imageUrl: z.string().optional(),
  mapUrl: z.string().optional(),
});

type GeneralData = z.infer<typeof generalSchema>;
type GroupData = z.infer<typeof groupSchema>;
type EventData = z.infer<typeof eventSchema>;

export default function ContactPage() {
  const { toast } = useToast();
  const [isUploadingImage, setIsUploadingImage] = useState<"group" | "event" | null>(null);

  const generalForm = useForm<GeneralData>({ resolver: zodResolver(generalSchema), defaultValues: { name: "", contactMethod: "", content: "" } });
  const groupForm = useForm<GroupData>({ resolver: zodResolver(groupSchema), defaultValues: { category: groupCategories[0], genre: genres[0], university: universities[0], beginnerFriendly: true, atmosphereTags: "", imageUrl: "" } });
  const eventForm = useForm<EventData>({ resolver: zodResolver(eventSchema), defaultValues: { atmosphereTags: "", imageUrl: "" } });

  const generalMutation = useMutation({
    mutationFn: (data: GeneralData) => apiRequest("POST", "/api/contact", { type: "一般", ...data, university: null }),
    onSuccess: () => toast({ title: "送信完了", description: "お問い合わせを受け付けました。" }),
    onError: (e: Error) => toast({ title: "送信失敗", description: e.message, variant: "destructive" }),
  });

  const groupMutation = useMutation({
    mutationFn: (data: GroupData) => apiRequest("POST", "/api/submissions/group", {
      ...data,
      atmosphereTags: data.atmosphereTags.split(",").map((v) => v.trim()).filter(Boolean),
      memberCount: data.memberCount ? Number(data.memberCount) : null,
      foundedYear: data.foundedYear ? Number(data.foundedYear) : null,
      instagramUrl: data.instagramUrl || null,
      twitterUrl: data.twitterUrl || null,
      lineUrl: data.lineUrl || null,
      imageUrl: data.imageUrl || null,
    }),
    onSuccess: () => toast({ title: "団体申請を送信しました", description: "Notionで承認後にサイトへ反映されます。" }),
    onError: (e: Error) => toast({ title: "送信失敗", description: e.message, variant: "destructive" }),
  });

  const eventMutation = useMutation({
    mutationFn: (data: EventData) => apiRequest("POST", "/api/submissions/event", {
      ...data,
      date: new Date(data.date).toISOString(),
      endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
      atmosphereTags: data.atmosphereTags.split(",").map((v) => v.trim()).filter(Boolean),
      maxParticipants: data.maxParticipants ? Number(data.maxParticipants) : null,
      mapUrl: data.mapUrl || null,
      imageUrl: data.imageUrl || null,
    }),
    onSuccess: () => toast({ title: "イベント申請を送信しました", description: "Notionで承認後にサイトへ反映されます。" }),
    onError: (e: Error) => toast({ title: "送信失敗", description: e.message, variant: "destructive" }),
  });

  const uploadImage = async (event: ChangeEvent<HTMLInputElement>, target: "group" | "event") => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingImage(target);
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result;
          if (typeof result !== "string") return reject(new Error("画像の読み込みに失敗しました"));
          const payload = result.split(",")[1];
          if (!payload) return reject(new Error("画像変換に失敗しました"));
          resolve(payload);
        };
        reader.onerror = () => reject(new Error("画像の読み込みに失敗しました"));
        reader.readAsDataURL(file);
      });
      const res = await apiRequest("POST", "/api/uploads/event-image", { fileName: file.name, mimeType: file.type, base64Data: base64 });
      const data = await res.json();
      if (target === "group") groupForm.setValue("imageUrl", data.imageUrl, { shouldValidate: true });
      if (target === "event") eventForm.setValue("imageUrl", data.imageUrl, { shouldValidate: true });
      toast({ title: "画像アップロード完了" });
    } catch (e: any) {
      toast({ title: "画像アップロード失敗", description: e.message, variant: "destructive" });
    } finally {
      setIsUploadingImage(null);
      event.target.value = "";
    }
  };

  return (
    <Layout>
      <div className="container-narrow py-12 sm:py-16 space-y-8 relative overflow-hidden">
        <SakuraPetals position="top-left" opacity={0.35} size="md" />
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold">掲載申請 / お問い合わせ</h1>
          <p className="text-muted-foreground">申請内容はNotionに送信され、管理人承認後にサイトへ反映されます。</p>
        </div>

        <Card className="rounded-2xl border-0 shadow-sm">
          <CardHeader><CardTitle className="flex items-center gap-2"><Mail className="h-4 w-4" />一般お問い合わせ</CardTitle></CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={generalForm.handleSubmit((d) => generalMutation.mutate(d))}>
              <Input placeholder="お名前（任意）" {...generalForm.register("name")} />
              <Input placeholder="連絡先（メール or Instagram）" {...generalForm.register("contactMethod")} />
              <Textarea placeholder="内容" rows={4} {...generalForm.register("content")} />
              <Button type="submit" disabled={generalMutation.isPending}>{generalMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}送信</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-sm">
          <CardHeader><CardTitle>団体掲載申請（サイト表示項目を直接入力）</CardTitle></CardHeader>
          <CardContent>
            <form className="grid sm:grid-cols-2 gap-3" onSubmit={groupForm.handleSubmit((d) => groupMutation.mutate(d))}>
              <Input placeholder="団体名" {...groupForm.register("name")} />
              <Input placeholder="大学" {...groupForm.register("university")} />
              <Input placeholder="区分（部活/サークル）" {...groupForm.register("category")} />
              <Input placeholder="ジャンル" {...groupForm.register("genre")} />
              <Input placeholder="雰囲気タグ（カンマ区切り）" {...groupForm.register("atmosphereTags")} className="sm:col-span-2" />
              <Textarea placeholder="説明" rows={4} {...groupForm.register("description")} className="sm:col-span-2" />
              <Input placeholder="部員数" {...groupForm.register("memberCount")} />
              <Input placeholder="設立年" {...groupForm.register("foundedYear")} />
              <Input placeholder="活動日" {...groupForm.register("practiceSchedule")} className="sm:col-span-2" />
              <Textarea placeholder="FAQ" rows={3} {...groupForm.register("faqs")} className="sm:col-span-2" />
              <Input placeholder="連絡先" {...groupForm.register("contactInfo")} className="sm:col-span-2" />
              <Input placeholder="Instagram URL" {...groupForm.register("instagramUrl")} />
              <Input placeholder="Twitter/X URL" {...groupForm.register("twitterUrl")} />
              <Input placeholder="LINE URL" {...groupForm.register("lineUrl")} />
              <div className="sm:col-span-2 space-y-2">
                <Label>画像アップロード</Label>
                <Input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => uploadImage(e, "group")} />
                <Input placeholder="画像URL" {...groupForm.register("imageUrl")} />
              </div>
              <label className="sm:col-span-2 text-sm flex items-center gap-2"><input type="checkbox" {...groupForm.register("beginnerFriendly")} /> 初心者歓迎</label>
              <Button type="submit" className="sm:col-span-2" disabled={groupMutation.isPending || isUploadingImage === "group"}>{groupMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}団体申請を送信</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-sm">
          <CardHeader><CardTitle>イベント掲載申請（サイト表示項目を直接入力）</CardTitle></CardHeader>
          <CardContent>
            <form className="grid sm:grid-cols-2 gap-3" onSubmit={eventForm.handleSubmit((d) => eventMutation.mutate(d))}>
              <Input placeholder="団体ID（既存団体ID）" {...eventForm.register("groupId")} className="sm:col-span-2" />
              <Input placeholder="イベント名" {...eventForm.register("title")} className="sm:col-span-2" />
              <Textarea placeholder="説明" rows={4} {...eventForm.register("description")} className="sm:col-span-2" />
              <Input type="datetime-local" {...eventForm.register("date")} />
              <Input type="datetime-local" {...eventForm.register("endDate")} />
              <Input placeholder="場所" {...eventForm.register("location")} className="sm:col-span-2" />
              <Input placeholder="持ち物" {...eventForm.register("requirements")} className="sm:col-span-2" />
              <Input placeholder="雰囲気タグ（カンマ区切り）" {...eventForm.register("atmosphereTags")} className="sm:col-span-2" />
              <Textarea placeholder="参加の流れ" rows={3} {...eventForm.register("participationFlow")} className="sm:col-span-2" />
              <Input placeholder="定員" {...eventForm.register("maxParticipants")} />
              <Input placeholder="地図URL" {...eventForm.register("mapUrl")} />
              <div className="sm:col-span-2 space-y-2">
                <Label>画像アップロード</Label>
                <Input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => uploadImage(e, "event")} />
                <Input placeholder="画像URL" {...eventForm.register("imageUrl")} />
              </div>
              <Button type="submit" className="sm:col-span-2" disabled={eventMutation.isPending || isUploadingImage === "event"}>{eventMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}イベント申請を送信</Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-sm text-muted-foreground">推奨値: 大学={universities.join(" / ")}・区分={groupCategories.join(" / ")}・ジャンル={genres.join(" / ")}・雰囲気タグ={atmosphereTags.join(" / ")}</p>
      </div>
    </Layout>
  );
}
