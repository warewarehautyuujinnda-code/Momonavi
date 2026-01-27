import { Card, CardContent } from "@/components/ui/card";
import { Star, Users, Heart } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import type { Review } from "@shared/schema";

interface ReviewCardProps {
  review: Review;
}

function StarRating({ rating, label }: { rating: number; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${
              i <= rating
                ? "text-yellow-500 fill-yellow-500"
                : "text-muted"
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
    <Card data-testid={`review-card-${review.id}`}>
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">
                {review.nickname ? review.nickname.charAt(0) : "匿"}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium">
                {review.nickname || "匿名"}
              </p>
              <p className="text-xs text-muted-foreground">
                {format(reviewDate, "yyyy年M月d日", { locale: ja })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            <span className="font-semibold">{review.rating}</span>
          </div>
        </div>

        <p className="text-sm leading-relaxed">{review.content}</p>

        <div className="flex flex-wrap gap-4 pt-2 border-t">
          <StarRating rating={review.soloFriendlinessRating} label="1人参加" />
          <StarRating rating={review.atmosphereRating} label="雰囲気" />
        </div>
      </CardContent>
    </Card>
  );
}
