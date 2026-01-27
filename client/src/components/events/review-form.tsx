import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, AlertTriangle, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const reviewFormSchema = z.object({
  nickname: z.string().max(20, "20文字以内で入力してください").optional(),
  rating: z.number().min(1).max(5),
  soloFriendlinessRating: z.number().min(1).max(5),
  atmosphereRating: z.number().min(1).max(5),
  content: z.string().min(10, "10文字以上で入力してください").max(500, "500文字以内で入力してください"),
});

type ReviewFormData = z.infer<typeof reviewFormSchema>;

interface ReviewFormProps {
  eventId: string;
}

function StarInput({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
}) {
  const [hover, setHover] = useState(0);

  return (
    <div className="space-y-2">
      <Label className="text-sm text-muted-foreground">{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(i)}
            className="p-1 hover-elevate rounded-lg"
            data-testid={`star-${label}-${i}`}
          >
            <Star
              className={`h-7 w-7 transition-colors ${
                i <= (hover || value)
                  ? "text-primary fill-primary"
                  : "text-muted/40"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export function ReviewForm({ eventId }: ReviewFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      nickname: "",
      rating: 0,
      soloFriendlinessRating: 0,
      atmosphereRating: 0,
      content: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ReviewFormData) => {
      return apiRequest("POST", `/api/events/${eventId}/reviews`, data);
    },
    onSuccess: () => {
      toast({
        title: "レビューを投稿しました",
        description: "ご協力ありがとうございます！",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "reviews"] });
    },
    onError: (error: Error) => {
      toast({
        title: "エラーが発生しました",
        description: error.message || "しばらく待ってから再度お試しください",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ReviewFormData) => {
    if (data.rating === 0 || data.soloFriendlinessRating === 0 || data.atmosphereRating === 0) {
      toast({
        title: "評価を入力してください",
        description: "すべての評価項目に星をつけてください",
        variant: "destructive",
      });
      return;
    }
    mutation.mutate(data);
  };

  return (
    <Card className="rounded-2xl border-0 shadow-sm">
      <CardHeader className="p-6 sm:p-8 pb-0">
        <CardTitle className="text-xl">レビューを投稿</CardTitle>
      </CardHeader>
      <CardContent className="p-6 sm:p-8 pt-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="p-4 bg-muted rounded-xl flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              個人情報（本名、電話番号、住所など）は絶対に書かないでください。
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nickname" className="text-sm text-muted-foreground">
              ニックネーム（任意）
            </Label>
            <Input
              id="nickname"
              placeholder="匿名で投稿されます"
              className="rounded-xl"
              {...form.register("nickname")}
              data-testid="input-nickname"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StarInput
              value={form.watch("rating")}
              onChange={(v) => form.setValue("rating", v)}
              label="総合評価"
            />
            <StarInput
              value={form.watch("soloFriendlinessRating")}
              onChange={(v) => form.setValue("soloFriendlinessRating", v)}
              label="1人参加しやすさ"
            />
            <StarInput
              value={form.watch("atmosphereRating")}
              onChange={(v) => form.setValue("atmosphereRating", v)}
              label="雰囲気"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content" className="text-sm text-muted-foreground">
              レビュー内容
            </Label>
            <Textarea
              id="content"
              placeholder="イベントの感想を教えてください（10〜500文字）"
              rows={4}
              className="rounded-xl resize-none"
              {...form.register("content")}
              data-testid="textarea-review-content"
            />
            {form.formState.errors.content && (
              <p className="text-sm text-destructive">
                {form.formState.errors.content.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full gap-2 rounded-xl"
            disabled={mutation.isPending}
            data-testid="button-submit-review"
          >
            {mutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            レビューを投稿
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
