import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import type { Review } from "@shared/schema";

interface ReviewCardProps {
  review: Review;
}

function StarRating({ rating, label }: { rating: number; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`h-3.5 w-3.5 ${
              i <= rating
                ? "text-primary fill-primary"
                : "text-muted/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export function ReviewCard({ review }: ReviewCardProps) {
  const reviewDate = new Date(review.createdAt);

  return (
    <Card className="rounded-2xl border-0 shadow-sm" data-testid={`review-card-${review.id}`}>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="text-base font-semibold text-primary">
                {review.nickname ? review.nickname.charAt(0) : "匿"}
              </span>
            </div>
            <div>
              <p className="font-medium">
                {review.nickname || "匿名"}
              </p>
              <p className="text-sm text-muted-foreground">
                {format(reviewDate, "yyyy年M月d日", { locale: ja })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-xl">
            <Star className="h-4 w-4 text-primary fill-primary" />
            <span className="font-bold text-primary">{review.rating}</span>
          </div>
        </div>

        <p className="leading-relaxed text-muted-foreground">{review.content}</p>

        <div className="flex flex-wrap gap-5 pt-3 border-t border-border/50">
          <StarRating rating={review.soloFriendlinessRating} label="1人参加" />
          <StarRating rating={review.atmosphereRating} label="雰囲気" />
        </div>
      </CardContent>
    </Card>
  );
}
