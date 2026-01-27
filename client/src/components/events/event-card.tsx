import { Link } from "wouter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Star, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import type { EventWithGroup } from "@shared/schema";

interface EventCardProps {
  event: EventWithGroup;
}

function SoloFriendlinessIndicator({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-1" title={`1人参加しやすさ: ${level}/5`}>
      <Users className="h-3.5 w-3.5 text-muted-foreground" />
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-1.5 w-3 rounded-full ${
              i <= level ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground ml-1">1人OK</span>
    </div>
  );
}

export function EventCard({ event }: EventCardProps) {
  const eventDate = new Date(event.date);

  return (
    <Link href={`/events/${event.id}`} data-testid={`event-card-${event.id}`}>
      <Card className="hover-elevate active-elevate-2 cursor-pointer transition-all h-full">
        <CardHeader className="pb-2 space-y-1">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <Badge variant="secondary" className="text-xs font-normal">
              {event.group.university}
            </Badge>
            {event.beginnerWelcome && (
              <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                初心者歓迎
              </Badge>
            )}
          </div>
          <h3 className="font-semibold text-base leading-tight line-clamp-2 pt-1">
            {event.title}
          </h3>
          <p className="text-sm text-muted-foreground">
            {event.group.name}
          </p>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <div className="flex flex-col gap-1.5 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              <span>{format(eventDate, "M月d日(E) HH:mm", { locale: ja })}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          </div>

          <SoloFriendlinessIndicator level={event.soloFriendliness} />

          {event.atmosphereTags && event.atmosphereTags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {event.atmosphereTags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs font-normal">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
