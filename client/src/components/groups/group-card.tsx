import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, ChevronRight } from "lucide-react";
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
      <Card className="hover-elevate active-elevate-2 cursor-pointer h-full rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6 space-y-5">
          <div className="flex items-start justify-between gap-3">
            <Badge variant="secondary" className="text-xs font-normal rounded-lg">
              {group.university}
            </Badge>
            <Badge variant="outline" className="text-xs font-normal rounded-lg border-muted-foreground/20">
              {group.category}
            </Badge>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-lg leading-snug">
              {group.name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {group.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {group.beginnerFriendly && (
              <Badge className="bg-primary/10 text-primary border-0 text-xs rounded-lg">
                初心者歓迎
              </Badge>
            )}
            <Badge variant="outline" className="text-xs rounded-lg border-muted-foreground/20">
              {group.genre}
            </Badge>
          </div>

          <div className="flex items-center justify-between text-sm pt-2">
            <div className="flex items-center gap-5 text-muted-foreground">
              {group.memberCount && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{group.memberCount}人</span>
                </div>
              )}
              {upcomingEvents > 0 && (
                <div className="flex items-center gap-2 text-primary font-medium">
                  <Calendar className="h-4 w-4" />
                  <span>イベント{upcomingEvents}件</span>
                </div>
              )}
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
