import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout/layout";
import { SakuraPetals } from "@/components/decorations/sakura-petals";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Mail, Send, Loader2, ChevronDown, CheckCircle, HelpCircle, Eye, Users,
  Calendar, MapPin, Plus, X, Upload, MessageSquare, ExternalLink, ChevronLeft,
  Clock, PlusCircle, RefreshCw, Sparkles, Search
} from "lucide-react";
import { SiInstagram, SiX, SiLine } from "react-icons/si";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { universities, groupCategories, genres, atmosphereTags as allAtmosphereTags } from "@shared/schema";
import type { GroupWithEvents } from "@shared/schema";

import sportsImg from "@/assets/images/stock/sports-1.jpg";
import musicImg from "@/assets/images/stock/music-1.jpg";
import cultureImg from "@/assets/images/stock/culture-1.jpg";
import studyImg from "@/assets/images/stock/study-1.jpg";
import volunteerImg from "@/assets/images/stock/volunteer-1.jpg";
import danceImg from "@/assets/images/stock/dance-1.jpg";

const genreImageMap: Record<string, string> = {
  "スポーツ": sportsImg, "バレーボール": sportsImg, "バスケットボール": sportsImg,
  "サッカー": sportsImg, "テニス": sportsImg, "野球": sportsImg, "陸上": sportsImg,
  "音楽": musicImg, "軽音": musicImg, "吹奏楽": musicImg,
  "文化": cultureImg, "演劇": cultureImg, "写真": cultureImg, "映画": cultureImg,
  "学術": studyImg, "プログラミング": studyImg,
  "ボランティア": volunteerImg, "国際交流": volunteerImg,
  "ダンス": danceImg,
};

function getImageForGenre(genre?: string): string {
  if (!genre) return cultureImg;
  return genreImageMap[genre] || cultureImg;
}

function formatDateTime(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    return format(new Date(dateStr), "yyyy年M月d日 HH:mm", { locale: ja });
  } catch {
    return dateStr;
  }
}

type SubmissionType = 'new' | 'add_event' | 'update_group';

const submissionFormSchema = z.object({
  submissionType: z.enum(['new', 'add_event', 'update_group']).default('new'),
  targetGroupId: z.string().optional(),
  requesterEmail: z.string().email("有効なメールアドレスを入力してください"),
  requesterName: z.string().max(100).optional(),
  message: z.string().max(2000).optional(),
  groupName: z.string().max(200).optional(),
  groupUniversity: z.string().optional(),
  groupCategory: z.string().optional(),
  groupGenre: z.string().optional(),
  groupDescription: z.string().max(2000).optional(),
  groupAtmosphereTags: z.array(z.string()).optional(),
  groupContactInfo: z.string().max(200).optional(),
  groupInstagramUrl: z.string().url().optional().or(z.literal("")),
  groupTwitterUrl: z.string().url().optional().or(z.literal("")),
  groupLineUrl: z.string().url().optional().or(z.literal("")),
  eventTitle: z.string().max(200).optional(),
  eventDescription: z.string().max(2000).optional(),
  eventDate: z.string().optional(),
  eventEndDate: z.string().optional(),
  eventLocation: z.string().max(200).optional(),
  eventMapUrl: z.string().optional().or(z.literal("")),
  eventBeginnerWelcome: z.boolean().optional(),
  groupImages: z.array(z.string()).optional(),
  eventImages: z.array(z.string()).optional(),
}).superRefine((data, ctx) => {
  if (data.submissionType === 'new' || data.submissionType === 'update_group') {
    if (!data.groupName || data.groupName.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "団体名は必須です", path: ["groupName"] });
    }
    if (!data.groupUniversity || data.groupUniversity.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "大学は必須です", path: ["groupUniversity"] });
    }
    if (!data.groupCategory || data.groupCategory.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "区分は必須です", path: ["groupCategory"] });
    }
    if (!data.groupGenre || data.groupGenre.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "ジャンルは必須です", path: ["groupGenre"] });
    }
    if (!data.groupDescription || data.groupDescription.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "団体説明は必須です", path: ["groupDescription"] });
    }
    if (!data.groupAtmosphereTags || data.groupAtmosphereTags.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "雰囲気タグを1つ以上選択してください", path: ["groupAtmosphereTags"] });
    }
  }
  if (data.submissionType === 'add_event' || data.submissionType === 'update_group') {
    if (!data.targetGroupId || data.targetGroupId.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "対象の団体を選択してください", path: ["targetGroupId"] });
    }
  }
  if (data.submissionType === 'add_event') {
    if (!data.eventTitle || data.eventTitle.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "イベントタイトルは必須です", path: ["eventTitle"] });
    }
    if (!data.eventLocation || data.eventLocation.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "開催場所は必須です", path: ["eventLocation"] });
    }
  }
});

type SubmissionFormData = z.infer<typeof submissionFormSchema>;

const inquiryFormSchema = z.object({
  name: z.string().max(100).optional(),
  email: z.string().email("有効なメールアドレスを入力してください"),
  message: z.string().min(1, "メッセージを入力してください").max(2000),
});
type InquiryFormData = z.infer<typeof inquiryFormSchema>;

function SelectWithCustom({
  options,
  value,
  onChange,
  placeholder,
  testId,
}: {
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  testId?: string;
}) {
  const isCustom = !!value && !options.includes(value as never);
  const [showCustom, setShowCustom] = useState(isCustom);
  const [customValue, setCustomValue] = useState(isCustom ? value : "");

  const selectVal = showCustom ? "__custom__" : value || "";

  return (
    <div className="space-y-2">
      <Select
        value={selectVal}
        onValueChange={(v) => {
          if (v === "__custom__") {
            setShowCustom(true);
            onChange(customValue);
          } else {
            setShowCustom(false);
            setCustomValue("");
            onChange(v);
          }
        }}
      >
        <SelectTrigger className="rounded-xl" data-testid={testId}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
          ))}
          <SelectItem value="__custom__">その他（自由入力）</SelectItem>
        </SelectContent>
      </Select>
      {showCustom && (
        <Input
          value={customValue}
          onChange={(e) => {
            setCustomValue(e.target.value);
            onChange(e.target.value);
          }}
          placeholder="自由に入力してください"
          className="rounded-xl"
          data-testid={testId ? `${testId}-custom` : undefined}
        />
      )}
    </div>
  );
}

function MultiImageUpload({
  images,
  onChange,
  label,
  maxImages = 5,
  testId,
}: {
  images: string[];
  onChange: (imgs: string[]) => void;
  label: string;
  maxImages?: number;
  testId?: string;
}) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = maxImages - images.length;
    if (files.length > remaining) {
      toast({ title: `最大${maxImages}枚まで追加できます`, description: `あと${remaining}枚追加可能です` });
    }
    const toProcess = files.slice(0, remaining);
    const newImages: string[] = [];
    let processed = 0;
    if (toProcess.length === 0) return;
    toProcess.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "ファイルが大きすぎます", description: `${file.name} は5MB以下にしてください`, variant: "destructive" });
        processed++;
        if (processed === toProcess.length) onChange([...images, ...newImages]);
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        newImages.push(ev.target?.result as string);
        processed++;
        if (processed === toProcess.length) onChange([...images, ...newImages]);
      };
      reader.readAsDataURL(file);
    });
    if (e.target) e.target.value = "";
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {images.map((src, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
              <img src={src} alt={`画像${i + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                data-testid={`remove-image-${i}`}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      {images.length < maxImages && (
        <div
          className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-5 text-center cursor-pointer hover:border-primary/40 transition-colors"
          onClick={() => fileInputRef.current?.click()}
          data-testid={testId}
        >
          <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground/50" />
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">JPG / PNG / WebP — 1枚5MBまで（最大{maxImages}枚）</p>
          {images.length > 0 && (
            <p className="text-xs text-primary mt-1">{images.length}/{maxImages} 枚追加済み</p>
          )}
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={handleFiles}
      />
    </div>
  );
}

function ImageGallery({ images, fallback }: { images?: string[]; fallback: string }) {
  const [current, setCurrent] = useState(0);
  const imgs = images && images.length > 0 ? images : [fallback];
  const img = imgs[current] || fallback;

  return (
    <div className="space-y-2">
      <div className="w-full aspect-video rounded-2xl overflow-hidden bg-muted">
        <img src={img} alt={`画像${current + 1}`} className="w-full h-full object-cover" />
      </div>
      {imgs.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {imgs.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrent(i)}
              className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${i === current ? "border-primary" : "border-transparent"}`}
            >
              <img src={src} alt={`サムネイル${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function GroupDetailPreviewSheet({ data, open, onClose }: { data: Partial<SubmissionFormData>; open: boolean; onClose: () => void }) {
  const fallbackImg = getImageForGenre(data.groupGenre);
  const hasLinks = data.groupInstagramUrl || data.groupTwitterUrl || data.groupLineUrl;

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-0">
        <SheetHeader className="p-6 pb-0">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit -ml-1 mb-2"
          >
            <ChevronLeft className="h-4 w-4" />
            プレビューを閉じる
          </button>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="secondary" className="rounded-lg">{data.groupUniversity || "大学未設定"}</Badge>
            {data.groupCategory && (
              <Badge variant="outline" className="rounded-lg border-muted-foreground/20">{data.groupCategory}</Badge>
            )}
            {data.groupGenre && (
              <Badge variant="outline" className="rounded-lg border-muted-foreground/20">{data.groupGenre}</Badge>
            )}
            <Badge className="bg-primary/10 text-primary border-0 rounded-lg">初心者歓迎</Badge>
          </div>
          <SheetTitle className="text-2xl font-bold leading-tight">
            {data.groupName || "団体名"}
          </SheetTitle>
        </SheetHeader>

        <div className="p-6 space-y-6">
          <ImageGallery images={data.groupImages} fallback={fallbackImg} />

          <Card className="rounded-2xl border-0 shadow-sm">
            <CardContent className="p-6 space-y-5">
              <p className="text-base leading-relaxed text-muted-foreground">
                {data.groupDescription || "団体の説明がここに表示されます"}
              </p>

              {data.groupAtmosphereTags && data.groupAtmosphereTags.length > 0 && (
                <>
                  <div className="h-px bg-border" />
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">雰囲気</p>
                    <div className="flex flex-wrap gap-2">
                      {data.groupAtmosphereTags.map((tag) => (
                        <Badge key={tag} variant="outline" className="rounded-lg border-muted-foreground/20">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="h-px bg-border" />
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">団体の公式リンク</p>
                {hasLinks ? (
                  <div className="flex flex-wrap gap-3">
                    {data.groupInstagramUrl && (
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-xl text-sm font-medium">
                        <SiInstagram className="h-4 w-4" />
                        Instagram
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      </span>
                    )}
                    {data.groupTwitterUrl && (
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-xl text-sm font-medium">
                        <SiX className="h-4 w-4" />
                        X (Twitter)
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      </span>
                    )}
                    {data.groupLineUrl && (
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-xl text-sm font-medium">
                        <SiLine className="h-4 w-4" />
                        LINE
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">SNSリンクは掲載後に表示されます</p>
                )}
              </div>
            </CardContent>
          </Card>

          <p className="text-xs text-center text-muted-foreground bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl p-3">
            ※ これは掲載後のプレビューです。実際の掲載内容は審査後に確定します。
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function EventDetailPreviewSheet({ data, open, onClose }: { data: Partial<SubmissionFormData>; open: boolean; onClose: () => void }) {
  const fallbackImg = getImageForGenre(data.groupGenre);
  const startLabel = data.eventDate ? formatDateTime(data.eventDate) : "日時未設定";
  const endLabel = data.eventEndDate ? formatDateTime(data.eventEndDate) : null;

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-0">
        <SheetHeader className="p-6 pb-0">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit -ml-1 mb-2"
          >
            <ChevronLeft className="h-4 w-4" />
            プレビューを閉じる
          </button>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Badge variant="secondary" className="rounded-lg">{data.groupUniversity || "大学未設定"}</Badge>
            {data.eventBeginnerWelcome && (
              <Badge className="bg-primary/10 text-primary border-0 rounded-lg">初心者歓迎</Badge>
            )}
          </div>
          <SheetTitle className="text-2xl font-bold leading-tight">
            {data.eventTitle || "イベント名"}
          </SheetTitle>
          <p className="text-sm text-muted-foreground">{data.groupName || "団体名"}</p>
        </SheetHeader>

        <div className="p-6 space-y-6">
          <ImageGallery images={data.eventImages} fallback={fallbackImg} />

          <Card className="rounded-2xl border-0 shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">開始</p>
                    <p className="font-medium text-sm">{startLabel}</p>
                    {endLabel && (
                      <>
                        <p className="text-xs text-muted-foreground mt-1">終了</p>
                        <p className="font-medium text-sm">{endLabel}</p>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">開催場所</p>
                    <p className="font-medium text-sm">{data.eventLocation || "未設定"}</p>
                    {data.eventMapUrl && (
                      <a
                        href={data.eventMapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary mt-1 hover:underline"
                      >
                        <MapPin className="h-3 w-3" />
                        地図で見る
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {data.eventDescription && (
                <>
                  <div className="h-px bg-border" />
                  <p className="text-base leading-relaxed text-muted-foreground">{data.eventDescription}</p>
                </>
              )}

              {data.groupAtmosphereTags && data.groupAtmosphereTags.length > 0 && (
                <>
                  <div className="h-px bg-border" />
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">雰囲気タグ</p>
                    <div className="flex flex-wrap gap-2">
                      {data.groupAtmosphereTags.map((tag) => (
                        <Badge key={tag} variant="outline" className="rounded-lg border-muted-foreground/20">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <p className="text-xs text-center text-muted-foreground bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl p-3">
            ※ これは掲載後のプレビューです。実際の掲載内容は審査後に確定します。
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function GroupPreviewCard({ data, onClick }: { data: Partial<SubmissionFormData>; onClick: () => void }) {
  const imageUrl = (data.groupImages && data.groupImages[0]) || getImageForGenre(data.groupGenre);

  return (
    <Card
      className="overflow-hidden rounded-2xl border-0 shadow-sm cursor-pointer hover-elevate"
      onClick={onClick}
      data-testid="card-group-preview"
    >
      <div className="relative h-36 overflow-hidden">
        <img src={imageUrl} alt={data.groupName || "団体"} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute top-3 right-3">
          <Badge className="bg-black/50 text-white text-xs border-0 gap-1">
            <Eye className="h-3 w-3" />
            プレビュー
          </Badge>
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 flex-wrap">
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
          <Badge className="bg-primary/10 text-primary border-0 text-xs rounded-lg">初心者歓迎</Badge>
          {data.groupGenre && (
            <Badge variant="outline" className="text-xs rounded-lg border-muted-foreground/20">
              {data.groupGenre}
            </Badge>
          )}
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
        <p className="text-xs text-primary font-medium">タップして詳細を確認 →</p>
      </div>
    </Card>
  );
}

function EventPreviewCard({ data, onClick }: { data: Partial<SubmissionFormData>; onClick: () => void }) {
  const imageUrl = (data.eventImages && data.eventImages[0]) || getImageForGenre(data.groupGenre);
  const startLabel = data.eventDate ? formatDateTime(data.eventDate) : "日時未設定";
  const endLabel = data.eventEndDate ? formatDateTime(data.eventEndDate) : null;

  return (
    <Card
      className="overflow-hidden rounded-2xl border-0 shadow-sm cursor-pointer hover-elevate"
      onClick={onClick}
      data-testid="card-event-preview"
    >
      <div className="relative h-40 overflow-hidden">
        <img src={imageUrl} alt={data.eventTitle || "イベント"} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute top-3 right-3">
          <Badge className="bg-black/50 text-white text-xs border-0 gap-1">
            <Eye className="h-3 w-3" />
            プレビュー
          </Badge>
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <Badge className="bg-white/90 text-foreground text-xs font-normal rounded-lg shadow-sm">
            {data.groupUniversity || "大学未設定"}
          </Badge>
        </div>
      </div>
      <div className="p-5 space-y-3">
        <div className="space-y-1">
          <h3 className="font-semibold text-base leading-snug line-clamp-2">
            {data.eventTitle || "イベント名"}
          </h3>
          <p className="text-sm text-muted-foreground">{data.groupName || "団体名"}</p>
        </div>
        <div className="space-y-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>{startLabel}</span>
          </div>
          {endLabel && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 shrink-0" />
              <span>〜 {endLabel}</span>
            </div>
          )}
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
        <p className="text-xs text-primary font-medium">タップして詳細を確認 →</p>
      </div>
    </Card>
  );
}

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
          <Collapsible key={index} open={openItems.has(index)} onOpenChange={() => toggleItem(index)}>
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
                  <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
      </div>
    </section>
  );
}

function InquiryForm() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<InquiryFormData>({
    resolver: zodResolver(inquiryFormSchema),
    defaultValues: { name: "", email: "", message: "" },
  });

  const mutation = useMutation({
    mutationFn: (data: InquiryFormData) => apiRequest("POST", "/api/contact", data),
    onSuccess: () => {
      setSubmitted(true);
      form.reset();
      toast({ title: "送信完了", description: "お問い合わせを受け付けました。" });
    },
    onError: (error: Error) => {
      toast({
        title: "送信に失敗しました",
        description: error.message || "しばらく待ってから再度お試しください",
        variant: "destructive",
      });
    },
  });

  if (submitted) {
    return (
      <Card className="rounded-2xl border-0 shadow-sm max-w-lg mx-auto">
        <CardContent className="p-8 text-center space-y-4">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h2 className="text-xl font-bold" data-testid="text-inquiry-success">送信完了しました</h2>
          <p className="text-muted-foreground">お問い合わせありがとうございます。内容を確認後、ご連絡いたします。</p>
          <Button variant="outline" className="rounded-xl" onClick={() => setSubmitted(false)} data-testid="button-new-inquiry">
            新しいお問い合わせ
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="rounded-2xl border-0 shadow-sm">
        <CardHeader className="p-6 sm:p-8 pb-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-xl">お問い合わせフォーム</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6 sm:p-8 pt-6">
          <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="inquiry-name">お名前（任意）</Label>
              <Input
                id="inquiry-name"
                placeholder="例: 田中太郎"
                className="rounded-xl"
                {...form.register("name")}
                data-testid="input-inquiry-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inquiry-email">メールアドレス <span className="text-destructive">*</span></Label>
              <Input
                id="inquiry-email"
                type="email"
                placeholder="example@email.com"
                className="rounded-xl"
                {...form.register("email")}
                data-testid="input-inquiry-email"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="inquiry-message">メッセージ <span className="text-destructive">*</span></Label>
              <Textarea
                id="inquiry-message"
                placeholder="ご質問やご要望をお書きください"
                rows={5}
                className="rounded-xl resize-none"
                {...form.register("message")}
                data-testid="textarea-inquiry-message"
              />
              {form.formState.errors.message && (
                <p className="text-sm text-destructive">{form.formState.errors.message.message}</p>
              )}
            </div>
            <Button
              type="submit"
              size="lg"
              className="w-full gap-2 rounded-xl"
              disabled={mutation.isPending}
              data-testid="button-inquiry-submit"
            >
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              送信する
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ContactPage() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [customTagInput, setCustomTagInput] = useState("");
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [groupSheetOpen, setGroupSheetOpen] = useState(false);
  const [eventSheetOpen, setEventSheetOpen] = useState(false);
  const [groupSearchQuery, setGroupSearchQuery] = useState("");
  const [currentStep, setCurrentStep] = useState(0);

  const { data: allGroups = [] } = useQuery<GroupWithEvents[]>({
    queryKey: ["/api/groups"],
  });

  const form = useForm<SubmissionFormData>({
    resolver: zodResolver(submissionFormSchema),
    defaultValues: {
      submissionType: 'new',
      targetGroupId: "",
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
      eventMapUrl: "",
      eventBeginnerWelcome: true,
      groupImages: [],
      eventImages: [],
    },
  });

  const submissionType = form.watch("submissionType") as SubmissionType;
  const targetGroupId = form.watch("targetGroupId");
  const isNewSubmission = submissionType === 'new';
  const isAddEvent = submissionType === 'add_event';
  const isUpdateGroup = submissionType === 'update_group';
  const needsGroupSelect = isAddEvent || isUpdateGroup;

  const stepMeta = isAddEvent
    ? [
        { id: 'type' as const, label: '申請タイプ' },
        { id: 'requester' as const, label: '連絡先' },
        { id: 'event' as const, label: 'イベント情報' },
        { id: 'confirm' as const, label: '確認' },
      ]
    : [
        { id: 'type' as const, label: '申請タイプ' },
        { id: 'requester' as const, label: '連絡先' },
        { id: 'group' as const, label: '団体情報' },
        { id: 'event' as const, label: 'イベント情報' },
        { id: 'confirm' as const, label: '確認' },
      ];
  const currentStepId = stepMeta[currentStep]?.id ?? 'type';

  const goNext = async () => {
    let fields: string[] = [];
    if (currentStepId === 'type' && needsGroupSelect) {
      fields = ['targetGroupId'];
    } else if (currentStepId === 'requester') {
      fields = ['requesterEmail'];
    } else if (currentStepId === 'group') {
      fields = ['groupName', 'groupUniversity', 'groupCategory', 'groupGenre', 'groupDescription', 'groupAtmosphereTags'];
    } else if (currentStepId === 'event' && isAddEvent) {
      fields = ['eventTitle', 'eventLocation'];
    }
    const valid = fields.length === 0 || await form.trigger(fields as any);
    if (valid) setCurrentStep(s => Math.min(s + 1, stepMeta.length - 1));
  };

  const goBack = () => setCurrentStep(s => Math.max(s - 1, 0));

  const selectedGroup = allGroups.find(g => g.id === targetGroupId);

  const filteredGroups = allGroups.filter(g =>
    g.name.toLowerCase().includes(groupSearchQuery.toLowerCase()) ||
    g.university.toLowerCase().includes(groupSearchQuery.toLowerCase())
  );

  const handleGroupSelect = (groupId: string) => {
    const group = allGroups.find(g => g.id === groupId);
    form.setValue("targetGroupId", groupId, { shouldValidate: true });
    if (group && isUpdateGroup) {
      form.setValue("groupName", group.name);
      form.setValue("groupUniversity", group.university);
      form.setValue("groupCategory", group.category);
      form.setValue("groupGenre", group.genre);
      form.setValue("groupDescription", group.description);
      form.setValue("groupAtmosphereTags", [...group.atmosphereTags]);
      form.setValue("groupContactInfo", group.contactInfo || "");
      form.setValue("groupInstagramUrl", group.instagramUrl || "");
      form.setValue("groupTwitterUrl", group.twitterUrl || "");
      form.setValue("groupLineUrl", group.lineUrl || "");
    }
  };

  const handleSubmissionTypeChange = (type: SubmissionType) => {
    form.setValue("submissionType", type);
    form.setValue("targetGroupId", "");
    form.setValue("groupName", "");
    form.setValue("groupUniversity", "");
    form.setValue("groupCategory", "");
    form.setValue("groupGenre", "");
    form.setValue("groupDescription", "");
    form.setValue("groupAtmosphereTags", []);
    form.setValue("groupContactInfo", "");
    form.setValue("groupInstagramUrl", "");
    form.setValue("groupTwitterUrl", "");
    form.setValue("groupLineUrl", "");
    setGroupSearchQuery("");
    setCurrentStep(0);
  };

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

  const addCustomTag = () => {
    const trimmed = customTagInput.trim();
    if (!trimmed) return;
    const current = form.getValues("groupAtmosphereTags") || [];
    if (!current.includes(trimmed)) {
      form.setValue("groupAtmosphereTags", [...current, trimmed], { shouldValidate: true });
    }
    setCustomTagInput("");
  };

  const removeTag = (tag: string) => {
    const current = form.getValues("groupAtmosphereTags") || [];
    form.setValue("groupAtmosphereTags", current.filter(t => t !== tag), { shouldValidate: true });
  };

  const mutation = useMutation({
    mutationFn: (data: SubmissionFormData) => apiRequest("POST", "/api/submissions", data),
    onSuccess: () => {
      setSubmitted(true);
      toast({ title: "送信完了", description: "掲載依頼を受け付けました。確認後、メールでご連絡いたします。" });
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
    if (!consentAccepted) {
      toast({ title: "同意が必要です", description: "送信前に同意事項をご確認ください", variant: "destructive" });
      return;
    }
    mutation.mutate(data);
  };

  const successMessages: Record<SubmissionType, string> = {
    new: "掲載依頼ありがとうございます。内容を確認後、ご入力いただいたメールアドレスにご連絡いたします。",
    add_event: "イベント追加申請を受け付けました。確認後、掲載いたします。",
    update_group: "情報更新申請を受け付けました。確認後、情報を更新いたします。",
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
              <h2 className="text-xl font-bold" data-testid="text-submit-success">申請を受け付けました</h2>
              <p className="text-muted-foreground">
                {successMessages[submissionType]}
              </p>
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => {
                  setSubmitted(false);
                  setShowEventFields(false);
                  setConsentAccepted(false);
                  setGroupSearchQuery("");
                  form.reset();
                }}
                data-testid="button-new-submission"
              >
                新しい申請
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
            団体やイベントの掲載をご希望の方、ご質問のある方はこちらから
          </p>
        </div>

        <Tabs defaultValue="submission" className="relative z-10">
          <TabsList className="grid w-full grid-cols-3 rounded-xl">
            <TabsTrigger value="submission" className="rounded-xl" data-testid="tab-submission">掲載依頼</TabsTrigger>
            <TabsTrigger value="inquiry" className="rounded-xl" data-testid="tab-inquiry">お問い合わせ</TabsTrigger>
            <TabsTrigger value="faq" className="rounded-xl" data-testid="tab-faq">よくある質問</TabsTrigger>
          </TabsList>

          {/* ===== 掲載依頼タブ ===== */}
          <TabsContent value="submission" className="mt-8">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

              {/* ステップインジケーター */}
              <div className="flex items-center gap-0">
                {stepMeta.map((step, i) => (
                  <div key={step.id} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center gap-1">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                        i < currentStep
                          ? 'bg-primary text-primary-foreground'
                          : i === currentStep
                          ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {i < currentStep ? <CheckCircle className="h-4 w-4" /> : i + 1}
                      </div>
                      <span className={`text-xs whitespace-nowrap hidden sm:block ${i === currentStep ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                        {step.label}
                      </span>
                    </div>
                    {i < stepMeta.length - 1 && (
                      <div className={`h-px flex-1 mx-2 mb-4 sm:mb-0 transition-colors ${i < currentStep ? 'bg-primary' : 'bg-muted'}`} />
                    )}
                  </div>
                ))}
              </div>

              {/* ===== Step: 申請タイプ ===== */}
              {currentStepId === 'type' && <>

              {/* 申請タイプ選択 */}
              <Card className="rounded-2xl border-0 shadow-sm">
                <CardHeader className="p-6 sm:p-8 pb-0">
                  <CardTitle className="text-xl">申請タイプを選択</CardTitle>
                </CardHeader>
                <CardContent className="p-6 sm:p-8 pt-4 space-y-3">
                  {([
                    { type: 'new' as SubmissionType, icon: Sparkles, label: '新規掲載申請', desc: '新しい団体・イベントを掲載する' },
                    { type: 'add_event' as SubmissionType, icon: PlusCircle, label: 'イベント追加申請', desc: '既存の団体に新しいイベントを追加する' },
                    { type: 'update_group' as SubmissionType, icon: RefreshCw, label: '情報更新申請', desc: '既存の団体情報やイベント情報を更新する' },
                  ]).map(({ type, icon: Icon, label, desc }) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleSubmissionTypeChange(type)}
                      data-testid={`submission-type-${type}`}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-colors ${
                        submissionType === type
                          ? "border-primary bg-primary/5"
                          : "border-muted hover:border-primary/40 bg-background"
                      }`}
                    >
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${submissionType === type ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{label}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                      {submissionType === type && (
                        <CheckCircle className="h-5 w-5 text-primary ml-auto shrink-0" />
                      )}
                    </button>
                  ))}
                </CardContent>
              </Card>

              {/* 対象グループ選択（add_event / update_group のみ） */}
              {needsGroupSelect && (
                <Card className="rounded-2xl border-0 shadow-sm">
                  <CardHeader className="p-6 sm:p-8 pb-0">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Search className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">
                          対象の団体を選択 <span className="text-destructive text-sm font-normal">（必須）</span>
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {isAddEvent ? "イベントを追加する団体を選んでください" : "情報を更新する団体を選んでください"}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 sm:p-8 pt-4 space-y-3">
                    <Input
                      placeholder="団体名・大学名で検索..."
                      value={groupSearchQuery}
                      onChange={(e) => setGroupSearchQuery(e.target.value)}
                      className="rounded-xl"
                      data-testid="input-group-search"
                    />
                    <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                      {filteredGroups.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">見つかりませんでした</p>
                      ) : filteredGroups.map((group) => (
                        <button
                          key={group.id}
                          type="button"
                          onClick={() => handleGroupSelect(group.id)}
                          data-testid={`group-option-${group.id}`}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-colors ${
                            targetGroupId === group.id
                              ? "border-primary bg-primary/5"
                              : "border-muted hover:border-primary/30 bg-background"
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{group.name}</p>
                            <p className="text-xs text-muted-foreground">{group.university} · {group.category} · {group.genre}</p>
                          </div>
                          {targetGroupId === group.id && (
                            <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                    {form.formState.errors.targetGroupId && (
                      <p className="text-sm text-destructive">{form.formState.errors.targetGroupId.message}</p>
                    )}
                    {selectedGroup && (
                      <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-xl">
                        <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                        <p className="text-sm font-medium text-primary">{selectedGroup.name} を選択中</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              </> /* end type step */}

              {/* ===== Step: 申請者情報 ===== */}
              {currentStepId === 'requester' && <>

              {/* 申請者情報 */}
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

              </> /* end requester step */}

              {/* ===== Step: 団体情報 ===== */}
              {currentStepId === 'group' && <>

              {/* 団体情報 */}
              <Card className="rounded-2xl border-0 shadow-sm">
                <CardHeader className="p-6 sm:p-8 pb-0">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">
                        {isUpdateGroup ? "更新後の団体情報" : "団体情報"}
                        {" "}<span className="text-destructive text-sm font-normal">（必須）</span>
                      </CardTitle>
                      {isUpdateGroup && (
                        <p className="text-sm text-muted-foreground mt-0.5">選択した団体の現在の情報をプリフィルしました。変更したい項目を修正してください。</p>
                      )}
                    </div>
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
                      <SelectWithCustom
                        options={universities}
                        value={form.watch("groupUniversity") || ""}
                        onChange={(v) => form.setValue("groupUniversity", v, { shouldValidate: true })}
                        placeholder="選択してください"
                        testId="select-university"
                      />
                      {form.formState.errors.groupUniversity && (
                        <p className="text-sm text-destructive">{form.formState.errors.groupUniversity.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>区分 <span className="text-destructive">*</span></Label>
                      <SelectWithCustom
                        options={groupCategories}
                        value={form.watch("groupCategory") || ""}
                        onChange={(v) => form.setValue("groupCategory", v, { shouldValidate: true })}
                        placeholder="選択してください"
                        testId="select-category"
                      />
                      {form.formState.errors.groupCategory && (
                        <p className="text-sm text-destructive">{form.formState.errors.groupCategory.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>ジャンル <span className="text-destructive">*</span></Label>
                    <SelectWithCustom
                      options={genres}
                      value={form.watch("groupGenre") || ""}
                      onChange={(v) => form.setValue("groupGenre", v, { shouldValidate: true })}
                      placeholder="選択してください"
                      testId="select-genre"
                    />
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

                  {/* 雰囲気タグ */}
                  <div className="space-y-3">
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

                    {/* カスタムタグ追加 */}
                    <div className="flex gap-2">
                      <Input
                        value={customTagInput}
                        onChange={(e) => setCustomTagInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomTag(); } }}
                        placeholder="カスタムタグを追加..."
                        className="rounded-xl text-sm"
                        data-testid="input-custom-tag"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addCustomTag}
                        className="rounded-xl shrink-0 gap-1"
                        data-testid="button-add-tag"
                      >
                        <Plus className="h-4 w-4" />
                        追加
                      </Button>
                    </div>

                    {/* カスタムタグ表示 */}
                    {selectedTags.filter(t => !allAtmosphereTags.includes(t as never)).length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedTags.filter(t => !allAtmosphereTags.includes(t as never)).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg bg-primary text-primary-foreground"
                          >
                            {tag}
                            <button type="button" onClick={() => removeTag(tag)} data-testid={`remove-tag-${tag}`}>
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

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

                  <div className="space-y-2">
                    <Label>団体の写真（任意）</Label>
                    <MultiImageUpload
                      images={form.watch("groupImages") || []}
                      onChange={(imgs) => form.setValue("groupImages", imgs)}
                      label="クリックして団体の写真を追加"
                      maxImages={5}
                      testId="dropzone-group-images"
                    />
                    <p className="text-xs text-muted-foreground">活動の様子や団体の雰囲気が伝わる写真を追加できます</p>
                  </div>
                </CardContent>
              </Card>

              </> /* end group step */}

              {/* ===== Step: イベント情報 ===== */}
              {currentStepId === 'event' && <>

              {/* イベント情報 */}
              <Card className="rounded-2xl border-0 shadow-sm">
                <CardHeader className="p-6 sm:p-8 pb-0">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">
                        イベント情報
                        {isAddEvent
                          ? <span className="text-destructive text-sm font-normal ml-2">（必須）</span>
                          : <span className="text-muted-foreground text-sm font-normal ml-2">（任意）</span>
                        }
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {isAddEvent ? "追加するイベントの情報を入力してください" : "イベントも同時に掲載する場合はご記入ください"}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                    <CardContent className="p-6 sm:p-8 pt-6 space-y-4">
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

                      {/* 開始・終了時間 */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="eventDate">開始日時</Label>
                          <Input
                            id="eventDate"
                            type="datetime-local"
                            className="rounded-xl"
                            {...form.register("eventDate")}
                            data-testid="input-event-date"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="eventEndDate">終了日時</Label>
                          <Input
                            id="eventEndDate"
                            type="datetime-local"
                            className="rounded-xl"
                            {...form.register("eventEndDate")}
                            data-testid="input-event-end-date"
                          />
                        </div>
                      </div>

                      {/* 開催場所 + マップURL */}
                      <div className="space-y-2">
                        <Label htmlFor="eventLocation">開催場所</Label>
                        <Input
                          id="eventLocation"
                          placeholder="例: 岡山大学体育館"
                          className="rounded-xl"
                          {...form.register("eventLocation")}
                          data-testid="input-event-location"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="eventMapUrl">開催場所のマップURL（任意）</Label>
                        <Input
                          id="eventMapUrl"
                          placeholder="https://maps.google.com/..."
                          className="rounded-xl"
                          {...form.register("eventMapUrl")}
                          data-testid="input-event-map-url"
                        />
                        <p className="text-xs text-muted-foreground">Google マップなどのURLを入力してください</p>
                      </div>

                      {/* 画像アップロード */}
                      <div className="space-y-2">
                        <Label>イベント画像（任意）</Label>
                        <MultiImageUpload
                          images={form.watch("eventImages") || []}
                          onChange={(imgs) => form.setValue("eventImages", imgs)}
                          label="クリックしてイベントの写真を追加"
                          maxImages={5}
                          testId="dropzone-event-images"
                        />
                      </div>
                    </CardContent>
              </Card>

              {/* その他メッセージ */}
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
                </CardContent>
              </Card>

              </> /* end event step */}

              {/* ===== Step: 確認・送信 ===== */}
              {currentStepId === 'confirm' && <>

              {/* 同意文 */}
              <Card className="rounded-2xl border-0 shadow-sm bg-muted/40">
                <CardContent className="p-6 sm:p-8 space-y-4">
                  <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                    <p>
                      本アンケートで提供いただいた団体情報（文章・画像等）は、
                      サークル紹介サイトおよび関連するSNS（Instagram等）で紹介・掲載する場合があります。
                    </p>
                    <p>
                      また、掲載の際には読みやすさ向上のため、内容の趣旨を変えない範囲で文章の修正や要約を行うことがあります。
                    </p>
                    <p>
                      アンケートの送信をもって、上記内容に同意いただいたものとみなします。
                    </p>
                  </div>

                  <div className="rounded-xl bg-primary/5 border border-primary/15 p-4 space-y-2 text-sm">
                    <p className="font-medium text-foreground">運営からのお願い</p>
                    <p className="text-muted-foreground leading-relaxed">
                      本サイトは非営利で運営しています。サービスをより多くの方に届けるため、
                      もしよろしければ公式Instagramのフォローをお願いいたします（任意です）。
                      また、新入生や団体の知り合いにこのサイト・Instagramアカウントを紹介していただけると、とても励みになります。
                    </p>
                    <a
                      href="https://www.instagram.com/momonavi.okayama"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-primary font-medium hover:underline"
                    >
                      <SiInstagram className="h-3.5 w-3.5" />
                      @momonavi.okayama をフォローする
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="consent"
                      checked={consentAccepted}
                      onCheckedChange={(checked) => setConsentAccepted(checked === true)}
                      data-testid="checkbox-consent"
                    />
                    <Label htmlFor="consent" className="text-sm font-medium cursor-pointer">
                      上記内容に同意します <span className="text-destructive">*</span>
                    </Label>
                  </div>
                </CardContent>
              </Card>

              {/* プレビュー */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  <span className="font-medium">掲載後のプレビュー</span>
                  <span className="text-xs">— カードをクリックして詳細を確認</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {!isAddEvent && (
                    <GroupPreviewCard data={watchedData} onClick={() => setGroupSheetOpen(true)} />
                  )}
                  <EventPreviewCard
                    data={isAddEvent && selectedGroup ? {
                      ...watchedData,
                      groupName: selectedGroup.name,
                      groupGenre: selectedGroup.genre,
                      groupUniversity: selectedGroup.university,
                    } : watchedData}
                    onClick={() => setEventSheetOpen(true)}
                  />
                </div>
                {isAddEvent && !watchedData.eventTitle && (
                  <p className="text-xs text-muted-foreground text-center">イベント情報を入力するとプレビューが表示されます</p>
                )}
              </div>

              </> /* end confirm step */}

              {/* ===== ナビゲーションボタン ===== */}
              <div className="flex gap-3 pt-2">
                {currentStep > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="gap-2 rounded-xl"
                    onClick={goBack}
                    data-testid="button-back"
                  >
                    ← 戻る
                  </Button>
                )}
                {currentStepId !== 'confirm' ? (
                  <Button
                    type="button"
                    size="lg"
                    className="flex-1 gap-2 rounded-xl"
                    onClick={goNext}
                    data-testid="button-next"
                  >
                    次へ →
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    size="lg"
                    className="flex-1 gap-2 rounded-xl"
                    disabled={mutation.isPending || !consentAccepted}
                    data-testid="button-submit"
                  >
                    {mutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    掲載依頼を送信する
                  </Button>
                )}
              </div>
            </form>

            {/* Preview Sheets (outside form but inside tab) */}
            <GroupDetailPreviewSheet
              data={watchedData}
              open={groupSheetOpen}
              onClose={() => setGroupSheetOpen(false)}
            />
            <EventDetailPreviewSheet
              data={watchedData}
              open={eventSheetOpen}
              onClose={() => setEventSheetOpen(false)}
            />
          </TabsContent>

          {/* ===== お問い合わせタブ ===== */}
          <TabsContent value="inquiry" className="mt-8">
            <InquiryForm />
          </TabsContent>

          {/* ===== よくある質問タブ ===== */}
          <TabsContent value="faq" className="mt-8">
            <FAQSection />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
