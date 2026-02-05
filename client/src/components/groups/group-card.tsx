import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, ChevronRight } from "lucide-react";
import type { GroupWithEvents } from "@shared/schema";

import sportsImg from "@/assets/images/stock/sports-1.jpg";
import musicImg from "@/assets/images/stock/music-1.jpg";
import cultureImg from "@/assets/images/stock/culture-1.jpg";
import studyImg from "@/assets/images/stock/study-1.jpg";
import volunteerImg from "@/assets/images/stock/volunteer-1.jpg";
import danceImg from "@/assets/images/stock/dance-1.jpg";

interface GroupCardProps {
  group: GroupWithEvents;
}

const genreImageMap: Record<string, string> = {
  "スポーツ": sportsImg,
  "音楽": musicImg,
  "文化": cultureImg,
  "学術": studyImg,
  "ボランティア": volunteerImg,
  "ダンス": danceImg,
};

function getImageForGenre(genre?: string): string {
  if (!genre) return cultureImg;
  return genreImageMap[genre] || cultureImg;
}

export function GroupCard({ group }: GroupCardProps) {
  const upcomingEvents = group.events?.filter(
    (e) => new Date(e.date) > new Date()
  ).length || 0;
  
  const imageUrl = getImageForGenre(group.genre);

  return (
    <Link href={`/groups/${group.id}`} data-testid={`group-card-${group.id}`}>
      <Card className="overflow-hidden hover-elevate active-elevate-2 cursor-pointer rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow">
        <div className="relative h-36 overflow-hidden">
          <img
            src={imageUrl}
            alt={group.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <Badge className="bg-white/90 text-foreground text-xs font-normal rounded-lg shadow-sm">
              {group.university}
            </Badge>
            <Badge variant="outline" className="bg-white/90 text-foreground text-xs font-normal rounded-lg border-0 shadow-sm">
              {group.category}
            </Badge>
          </div>
        </div>

        <div className="p-5 space-y-3">
          <div className="space-y-1">
            <h3 className="font-semibold text-base leading-snug">
              {group.name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {group.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {group.beginnerFriendly && (
              <Badge className="bg-primary/10 text-primary border-0 text-xs rounded-lg">
                初心者歓迎
              </Badge>
            )}
            <Badge variant="outline" className="text-xs rounded-lg border-muted-foreground/20">
              {group.genre}
            </Badge>
          </div>

          <div className="flex items-center justify-between text-sm pt-1">
            <div className="flex items-center gap-4 text-muted-foreground">
              {group.memberCount && (
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  <span>{group.memberCount}人</span>
                </div>
              )}
              {upcomingEvents > 0 && (
                <div className="flex items-center gap-1.5 text-primary font-medium">
                  <Calendar className="h-4 w-4" />
                  <span>イベント{upcomingEvents}件</span>
                </div>
              )}
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
          </div>
        </div>
      </Card>
    </Link>
  );
}
