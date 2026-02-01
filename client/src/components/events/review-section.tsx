import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReviewCard } from "./review-card";
import { Star, ChevronDown, X } from "lucide-react";
import type { Review } from "@shared/schema";

interface ReviewSectionProps {
  reviews: Review[];
}

function RatingDistribution({ 
  reviews, 
  selectedRating, 
  onRatingSelect 
}: { 
  reviews: Review[];
  selectedRating: number | null;
  onRatingSelect: (rating: number | null) => void;
}) {
  const distribution = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const rating = Math.round(r.rating) as keyof typeof counts;
      if (counts[rating] !== undefined) {
        counts[rating]++;
      }
    });
    return counts;
  }, [reviews]);

  const total = reviews.length;
  const averageRating = total > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1)
    : "0.0";

  return (
    <Card className="rounded-2xl border-0 shadow-sm">
      <CardContent className="p-6 space-y-5">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary">{averageRating}</div>
            <div className="flex justify-center gap-0.5 mt-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i <= Math.round(parseFloat(averageRating))
                      ? "text-primary fill-primary"
                      : "text-muted/50"
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-muted-foreground mt-1">{total}件のレビュー</div>
          </div>
          
          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = distribution[rating as keyof typeof distribution];
              const percentage = total > 0 ? (count / total) * 100 : 0;
              const isSelected = selectedRating === rating;
              
              return (
                <button
                  key={rating}
                  onClick={() => onRatingSelect(isSelected ? null : rating)}
                  className={`w-full flex items-center gap-2 ${
                    selectedRating !== null && !isSelected ? "opacity-40" : ""
                  }`}
                  data-testid={`button-filter-rating-${rating}`}
                >
                  <span className="text-sm w-8 flex items-center gap-0.5">
                    {rating}
                    <Star className="h-3 w-3 text-primary fill-primary" />
                  </span>
                  <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        isSelected ? "bg-primary" : "bg-primary/70"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-8 text-right">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {selectedRating !== null && (
          <div className="flex items-center gap-2 pt-2 border-t border-border/50">
            <Badge variant="secondary" className="gap-1 rounded-lg">
              <Star className="h-3 w-3 fill-primary text-primary" />
              {selectedRating}のレビューのみ表示中
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRatingSelect(null)}
              className="rounded-lg"
              data-testid="button-clear-filter"
            >
              <X className="h-3 w-3" />
              解除
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ReviewSection({ reviews }: ReviewSectionProps) {
  const [displayCount, setDisplayCount] = useState(3);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  const filteredReviews = useMemo(() => {
    if (selectedRating === null) return reviews;
    return reviews.filter((r) => Math.round(r.rating) === selectedRating);
  }, [reviews, selectedRating]);

  const sortedReviews = useMemo(() => {
    return [...filteredReviews].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [filteredReviews]);

  const displayedReviews = sortedReviews.slice(0, displayCount);
  const hasMore = displayCount < sortedReviews.length;
  const remainingCount = sortedReviews.length - displayCount;

  const handleShowMore = () => {
    setDisplayCount((prev) => prev + 5);
  };

  const handleRatingSelect = (rating: number | null) => {
    setSelectedRating(rating);
    setDisplayCount(3);
  };

  if (reviews.length === 0) {
    return (
      <Card className="rounded-2xl border-0 shadow-sm">
        <CardContent className="py-12 text-center">
          <Star className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">
            まだレビューがありません
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            参加したら感想を投稿してみよう
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <RatingDistribution 
        reviews={reviews} 
        selectedRating={selectedRating}
        onRatingSelect={handleRatingSelect}
      />

      {filteredReviews.length === 0 ? (
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              ★{selectedRating}のレビューはありません
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {displayedReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>

          {hasMore && (
            <div className="text-center">
              <Button
                variant="outline"
                onClick={handleShowMore}
                className="gap-2 rounded-xl"
                data-testid="button-show-more-reviews"
              >
                <ChevronDown className="h-4 w-4" />
                さらに見る（残り{remainingCount}件）
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
