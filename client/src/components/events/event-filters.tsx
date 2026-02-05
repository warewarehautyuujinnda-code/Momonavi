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
import { Filter, X } from "lucide-react";
import { useState } from "react";

export interface EventFilters {
  university: string | null;
  category: string | null;
  atmosphereTag: string | null;
  minSoloFriendliness: number;
}

export interface FilterOptions {
  universities: string[];
  categories: string[];
  atmosphereTags: string[];
}

interface EventFiltersProps {
  filters: EventFilters;
  onFiltersChange: (filters: EventFilters) => void;
  filterOptions: FilterOptions;
}

export function EventFiltersComponent({ filters, onFiltersChange, filterOptions }: EventFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasActiveFilters =
    filters.university ||
    filters.category ||
    filters.atmosphereTag ||
    filters.minSoloFriendliness > 1;

  const clearFilters = () => {
    onFiltersChange({
      university: null,
      category: null,
      atmosphereTag: null,
      minSoloFriendliness: 1,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className="gap-2 rounded-xl"
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
            onClick={clearFilters}
            className="gap-2 text-muted-foreground rounded-xl"
            data-testid="button-clear-filters"
          >
            <X className="h-4 w-4" />
            クリア
          </Button>
        )}
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-muted/40 rounded-2xl">
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">大学</Label>
            <Select
              value={filters.university || "all"}
              onValueChange={(v) =>
                onFiltersChange({ ...filters, university: v === "all" ? null : v })
              }
            >
              <SelectTrigger className="rounded-xl" data-testid="select-university">
                <SelectValue placeholder="すべて" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                {filterOptions.universities.map((uni) => (
                  <SelectItem key={uni} value={uni}>
                    {uni}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">団体区分</Label>
            <Select
              value={filters.category || "all"}
              onValueChange={(v) =>
                onFiltersChange({ ...filters, category: v === "all" ? null : v })
              }
            >
              <SelectTrigger className="rounded-xl" data-testid="select-category">
                <SelectValue placeholder="すべて" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                {filterOptions.categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">雰囲気</Label>
            <Select
              value={filters.atmosphereTag || "all"}
              onValueChange={(v) =>
                onFiltersChange({ ...filters, atmosphereTag: v === "all" ? null : v })
              }
            >
              <SelectTrigger className="rounded-xl" data-testid="select-atmosphere">
                <SelectValue placeholder="すべて" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                {filterOptions.atmosphereTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-sm text-muted-foreground">
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
