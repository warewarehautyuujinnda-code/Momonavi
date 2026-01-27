import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import type { EventWithGroup } from "@shared/schema";

interface EventCardProps {
  event: EventWithGroup;
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

  return (
    <Link href={`/events/${event.id}`} data-testid={`event-card-${event.id}`}>
      <Card className="hover-elevate active-elevate-2 cursor-pointer h-full rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6 space-y-5">
          <div className="flex items-start justify-between gap-3">
            <Badge variant="secondary" className="text-xs font-normal rounded-lg">
              {event.group.university}
            </Badge>
            {event.beginnerWelcome && (
              <Badge className="bg-primary/10 text-primary border-0 text-xs rounded-lg">
                初心者歓迎
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-lg leading-snug line-clamp-2">
              {event.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {event.group.name}
            </p>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 shrink-0" />
              <span>{format(eventDate, "M月d日(E) HH:mm", { locale: ja })}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          </div>

          <SoloFriendlinessIndicator level={event.soloFriendliness} />

          {event.atmosphereTags && event.atmosphereTags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {event.atmosphereTags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs font-normal rounded-lg border-muted-foreground/20">
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
