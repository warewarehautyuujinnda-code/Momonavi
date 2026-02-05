import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import type { EventWithGroup } from "@shared/schema";

import sportsImg from "@/assets/images/stock/sports-1.jpg";
import musicImg from "@/assets/images/stock/music-1.jpg";
import cultureImg from "@/assets/images/stock/culture-1.jpg";
import studyImg from "@/assets/images/stock/study-1.jpg";
import volunteerImg from "@/assets/images/stock/volunteer-1.jpg";
import danceImg from "@/assets/images/stock/dance-1.jpg";

interface EventCardProps {
  event: EventWithGroup;
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

function SoloFriendlinessIndicator({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-2">
      <Users className="h-4 w-4 text-muted-foreground" />
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-2 w-4 rounded-full ${
              i <= level ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">1人OK</span>
    </div>
  );
}

export function EventCard({ event }: EventCardProps) {
  const eventDate = new Date(event.date);
  const imageUrl = getImageForGenre(event.group?.genre);

  return (
    <Link href={`/events/${event.id}`} data-testid={`event-card-${event.id}`}>
      <Card className="overflow-hidden hover-elevate active-elevate-2 cursor-pointer rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow">
        <div className="relative h-40 overflow-hidden" data-testid={`event-image-${event.id}`}>
          <img
            src={imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <Badge className="bg-white/90 text-foreground text-xs font-normal rounded-lg shadow-sm">
              {event.group?.university}
            </Badge>
            {event.beginnerWelcome && (
              <Badge className="bg-primary text-primary-foreground text-xs rounded-lg shadow-sm">
                初心者歓迎
              </Badge>
            )}
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="space-y-1">
            <h3 className="font-semibold text-base leading-snug line-clamp-2">
              {event.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {event.group?.name}
            </p>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 shrink-0" />
              <span>
                {format(eventDate, "M月d日(E) HH:mm", { locale: ja })}
                {event.endDate ? `〜${format(new Date(event.endDate), "HH:mm", { locale: ja })}` : ""}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          </div>

          <SoloFriendlinessIndicator level={event.soloFriendliness} />

          {event.atmosphereTags && event.atmosphereTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {event.atmosphereTags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs font-normal rounded-lg border-muted-foreground/20">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
