import { Link } from "wouter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, Sparkles, ChevronRight } from "lucide-react";
import type { GroupWithEvents } from "@shared/schema";

interface GroupCardProps {
  group: GroupWithEvents;
}

export function GroupCard({ group }: GroupCardProps) {
  const upcomingEvents = group.events?.filter(
    (e) => new Date(e.date) > new Date()
  ).length || 0;

  return (
    <Link href={`/groups/${group.id}`} data-testid={`group-card-${group.id}`}>
      <Card className="hover-elevate active-elevate-2 cursor-pointer transition-all h-full">
        <CardHeader className="pb-2 space-y-1">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <Badge variant="secondary" className="text-xs font-normal">
              {group.university}
            </Badge>
            <Badge variant="outline" className="text-xs font-normal">
              {group.category}
            </Badge>
          </div>
          <h3 className="font-semibold text-base leading-tight pt-1">
            {group.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {group.description}
          </p>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <div className="flex flex-wrap gap-1">
            {group.beginnerFriendly && (
              <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                初心者歓迎
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {group.genre}
            </Badge>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4 text-muted-foreground">
              {group.memberCount && (
                <div className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  <span>{group.memberCount}人</span>
                </div>
              )}
              {upcomingEvents > 0 && (
                <div className="flex items-center gap-1 text-primary">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>イベント{upcomingEvents}件</span>
                </div>
              )}
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
