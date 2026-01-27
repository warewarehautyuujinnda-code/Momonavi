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
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(i)}
            className="p-0.5 hover-elevate rounded"
            data-testid={`star-${label}-${i}`}
          >
            <Star
              className={`h-6 w-6 transition-colors ${
                i <= (hover || value)
                  ? "text-yellow-500 fill-yellow-500"
                  : "text-muted"
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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">レビューを投稿する</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="p-3 bg-yellow-500/10 rounded-lg flex items-start gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
            <p className="text-yellow-800 dark:text-yellow-200">
              個人情報（本名、電話番号、住所など）は絶対に書かないでください。
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="nickname" className="text-sm">
              ニックネーム（任意）
            </Label>
            <Input
              id="nickname"
              placeholder="匿名で投稿されます"
              {...form.register("nickname")}
              data-testid="input-nickname"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

          <div className="space-y-1.5">
            <Label htmlFor="content" className="text-sm">
              レビュー内容
            </Label>
            <Textarea
              id="content"
              placeholder="イベントの感想を教えてください（10〜500文字）"
              rows={4}
              {...form.register("content")}
              data-testid="textarea-review-content"
            />
            {form.formState.errors.content && (
              <p className="text-xs text-destructive">
                {form.formState.errors.content.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full gap-2"
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
