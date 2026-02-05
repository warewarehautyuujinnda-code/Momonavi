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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Filter, X, CalendarIcon, CalendarDays } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import type { DateRange } from "react-day-picker";

export interface EventFilters {
  university: string | null;
  category: string | null;
  atmosphereTag: string | null;
  minSoloFriendliness: number;
  dateRange: DateRange | undefined;
}

export interface FilterOptions {
  universities: string[];
  categories: string[];
  atmosphereTags: string[];
}

export type ViewMode = "list" | "calendar";

interface EventFiltersProps {
  filters: EventFilters;
  onFiltersChange: (filters: EventFilters) => void;
  filterOptions: FilterOptions;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function EventFiltersComponent({ filters, onFiltersChange, filterOptions, viewMode, onViewModeChange }: EventFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const hasActiveFilters =
    filters.university ||
    filters.category ||
    filters.atmosphereTag ||
    filters.minSoloFriendliness > 1 ||
    filters.dateRange?.from;

  const clearFilters = () => {
    onFiltersChange({
      university: null,
      category: null,
      atmosphereTag: null,
      minSoloFriendliness: 1,
      dateRange: undefined,
    });
  };

  const formatDateRange = () => {
    if (!filters.dateRange?.from) return "日付を選択";
    if (!filters.dateRange.to) {
      return format(filters.dateRange.from, "M/d", { locale: ja });
    }
    return `${format(filters.dateRange.from, "M/d", { locale: ja })} - ${format(filters.dateRange.to, "M/d", { locale: ja })}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
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
          <Button
            variant={viewMode === "calendar" ? "default" : "outline"}
            onClick={() => onViewModeChange(viewMode === "calendar" ? "list" : "calendar")}
            className="gap-2 rounded-xl"
            data-testid="button-calendar-view"
          >
            <CalendarDays className="h-4 w-4" />
            カレンダー
          </Button>
        </div>
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
        <div className="space-y-4 p-6 bg-muted/40 rounded-2xl">
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">日付</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal rounded-xl"
                  data-testid="button-date-range"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formatDateRange()}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={filters.dateRange}
                  onSelect={(range) => onFiltersChange({ ...filters, dateRange: range })}
                  numberOfMonths={isMobile ? 1 : 2}
                  locale={ja}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
        </div>
      )}
    </div>
  );
}
