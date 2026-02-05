import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout/layout";
import { GroupCard } from "@/components/groups/group-card";
import { MasonryGrid } from "@/components/ui/masonry-grid";
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
import { Filter, X, SearchX } from "lucide-react";
import type { GroupWithEvents } from "@shared/schema";

interface GroupFilters {
  university: string | null;
  category: string | null;
  atmosphereTag: string | null;
}

export default function GroupsPage() {
  const [filters, setFilters] = useState<GroupFilters>({
    university: null,
    category: null,
    atmosphereTag: null,
  });
  const [showFilters, setShowFilters] = useState(false);

  const { data: groups, isLoading } = useQuery<GroupWithEvents[]>({
    queryKey: ["/api/groups"],
  });

  const hasActiveFilters = filters.university || filters.category || filters.atmosphereTag;

  // Extract unique filter options from actual data
  const filterOptions = useMemo(() => {
    if (!groups) return { universities: [] as string[], categories: [] as string[], atmosphereTags: [] as string[] };
    
    const universities = Array.from(new Set(groups.map(g => g.university).filter((u): u is string => Boolean(u)))).sort();
    const categories = Array.from(new Set(groups.map(g => g.category).filter((c): c is string => Boolean(c)))).sort();
    const atmosphereTags = Array.from(new Set(groups.flatMap(g => g.atmosphereTags || []))).sort();
    
    return { universities, categories, atmosphereTags };
  }, [groups]);

  const filteredGroups = useMemo(() => {
    if (!groups) return [];
    
    return groups.filter((group) => {
      if (filters.university && group.university !== filters.university) {
        return false;
      }
      if (filters.category && group.category !== filters.category) {
        return false;
      }
      if (filters.atmosphereTag && !(group.atmosphereTags || []).includes(filters.atmosphereTag)) {
        return false;
      }
      return true;
    });
  }, [groups, filters]);

  const clearFilters = () => {
    setFilters({
      university: null,
      category: null,
      atmosphereTag: null,
    });
  };

  return (
    <Layout>
      <div className="container-narrow py-10 sm:py-14">
        <div className="space-y-10">
          <div className="space-y-3 pb-6 border-b">
            <h1 className="text-3xl sm:text-4xl font-bold">
              団体を探す
            </h1>
            <p className="text-muted-foreground text-lg">
              気になる部活・サークルを見つけよう
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
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

            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 bg-muted/40 rounded-2xl">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">大学</Label>
                  <Select
                    value={filters.university || "all"}
                    onValueChange={(v) =>
                      setFilters({ ...filters, university: v === "all" ? null : v })
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
                      setFilters({ ...filters, category: v === "all" ? null : v })
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
                      setFilters({ ...filters, atmosphereTag: v === "all" ? null : v })
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
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-56 rounded-2xl" />
              ))}
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <SearchX className="h-12 w-12 text-muted-foreground/50 mx-auto" />
              <div className="space-y-2">
                <p className="text-lg font-medium">
                  該当する団体がありません
                </p>
                <p className="text-muted-foreground">
                  条件を変えて探してみてください
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">
                {filteredGroups.length}件の団体
              </p>
              <div className="hidden lg:block">
                <MasonryGrid columns={3} gap={6}>
                  {filteredGroups.map((group) => (
                    <GroupCard key={group.id} group={group} />
                  ))}
                </MasonryGrid>
              </div>
              <div className="hidden sm:block lg:hidden">
                <MasonryGrid columns={2} gap={5}>
                  {filteredGroups.map((group) => (
                    <GroupCard key={group.id} group={group} />
                  ))}
                </MasonryGrid>
              </div>
              <div className="block sm:hidden">
                <MasonryGrid columns={1} gap={4}>
                  {filteredGroups.map((group) => (
                    <GroupCard key={group.id} group={group} />
                  ))}
                </MasonryGrid>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
