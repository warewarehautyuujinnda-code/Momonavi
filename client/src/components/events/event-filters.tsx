import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { universities, groupCategories, genres } from "@shared/schema";
import { Filter, X } from "lucide-react";
import { useState } from "react";

export interface EventFilters {
  university: string | null;
  category: string | null;
  genre: string | null;
  minSoloFriendliness: number;
}

interface EventFiltersProps {
  filters: EventFilters;
  onFiltersChange: (filters: EventFilters) => void;
}

export function EventFiltersComponent({ filters, onFiltersChange }: EventFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasActiveFilters =
    filters.university ||
    filters.category ||
    filters.genre ||
    filters.minSoloFriendliness > 1;

  const clearFilters = () => {
    onFiltersChange({
      university: null,
      category: null,
      genre: null,
      minSoloFriendliness: 1,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="gap-2"
          data-testid="button-toggle-filters"
        >
          <Filter className="h-4 w-4" />
          絞り込み
          {hasActiveFilters && (
            <span className="ml-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
              !
            </span>
          )}
        </Button>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="gap-1 text-muted-foreground"
            data-testid="button-clear-filters"
          >
            <X className="h-3 w-3" />
            クリア
          </Button>
        )}
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="space-y-2">
            <Label className="text-sm">大学</Label>
            <Select
              value={filters.university || "all"}
              onValueChange={(v) =>
                onFiltersChange({ ...filters, university: v === "all" ? null : v })
              }
            >
              <SelectTrigger data-testid="select-university">
                <SelectValue placeholder="すべて" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                {universities.map((uni) => (
                  <SelectItem key={uni} value={uni}>
                    {uni}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">団体区分</Label>
            <Select
              value={filters.category || "all"}
              onValueChange={(v) =>
                onFiltersChange({ ...filters, category: v === "all" ? null : v })
              }
            >
              <SelectTrigger data-testid="select-category">
                <SelectValue placeholder="すべて" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                {groupCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">ジャンル</Label>
            <Select
              value={filters.genre || "all"}
              onValueChange={(v) =>
                onFiltersChange({ ...filters, genre: v === "all" ? null : v })
              }
            >
              <SelectTrigger data-testid="select-genre">
                <SelectValue placeholder="すべて" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                {genres.map((genre) => (
                  <SelectItem key={genre} value={genre}>
                    {genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">
              1人参加しやすさ: {filters.minSoloFriendliness}以上
            </Label>
            <Slider
              value={[filters.minSoloFriendliness]}
              onValueChange={([v]) =>
                onFiltersChange({ ...filters, minSoloFriendliness: v })
              }
              min={1}
              max={5}
              step={1}
              className="py-2"
              data-testid="slider-solo-friendliness"
            />
          </div>
        </div>
      )}
    </div>
  );
}
