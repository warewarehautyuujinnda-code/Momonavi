import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout/layout";
import { GroupCard } from "@/components/groups/group-card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Filter, X, SearchX } from "lucide-react";
import { universities, groupCategories, genres } from "@shared/schema";
import type { GroupWithEvents } from "@shared/schema";

interface GroupFilters {
  university: string | null;
  category: string | null;
  genre: string | null;
}

export default function GroupsPage() {
  const [filters, setFilters] = useState<GroupFilters>({
    university: null,
    category: null,
    genre: null,
  });
  const [showFilters, setShowFilters] = useState(false);

  const { data: groups, isLoading } = useQuery<GroupWithEvents[]>({
    queryKey: ["/api/groups"],
  });

  const hasActiveFilters = filters.university || filters.category || filters.genre;

  const filteredGroups = useMemo(() => {
    if (!groups) return [];
    
    return groups.filter((group) => {
      if (filters.university && group.university !== filters.university) {
        return false;
      }
      if (filters.category && group.category !== filters.category) {
        return false;
      }
      if (filters.genre && group.genre !== filters.genre) {
        return false;
      }
      return true;
    });
  }, [groups, filters]);

  const clearFilters = () => {
    setFilters({
      university: null,
      category: null,
      genre: null,
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">団体を探す</h1>
            </div>
            <p className="text-muted-foreground">
              気になる部活・サークルを見つけよう
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
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

            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="space-y-2">
                  <Label className="text-sm">大学</Label>
                  <Select
                    value={filters.university || "all"}
                    onValueChange={(v) =>
                      setFilters({ ...filters, university: v === "all" ? null : v })
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
                      setFilters({ ...filters, category: v === "all" ? null : v })
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
                      setFilters({ ...filters, genre: v === "all" ? null : v })
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
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-lg" />
              ))}
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <SearchX className="h-12 w-12 text-muted-foreground mx-auto" />
              <div className="space-y-2">
                <p className="text-lg font-medium">
                  該当する団体が見つかりませんでした
                </p>
                <p className="text-muted-foreground">
                  フィルター条件を変更してみてください
                </p>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                {filteredGroups.length}件の団体が見つかりました
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredGroups.map((group) => (
                  <GroupCard key={group.id} group={group} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
