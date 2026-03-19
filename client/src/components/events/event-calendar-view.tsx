import { useState, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EventCard } from "./event-card";
import { format, isSameDay } from "date-fns";
import { ja } from "date-fns/locale";
import { CalendarDays, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EventWithGroup } from "@shared/schema";
import { isRepeatEvent, formatRepeatDays } from "@/lib/repeatEvents";

interface EventCalendarViewProps {
  events: EventWithGroup[];
}

export function EventCalendarView({ events }: EventCalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // 日付ごとのイベントマップを構築（繰り返しイベントの展開済みインスタンスを含む）
  const eventDates = useMemo(() => {
    const dates = new Map<string, EventWithGroup[]>();
    events.forEach((event) => {
      const dateKey = format(new Date(event.date), "yyyy-MM-dd");
      if (!dates.has(dateKey)) {
        dates.set(dateKey, []);
      }
      dates.get(dateKey)!.push(event);
    });
    return dates;
  }, [events]);

  // 選択日のイベントを取得
  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    return events.filter((event) =>
      isSameDay(new Date(event.date), selectedDate)
    );
  }, [events, selectedDate]);

  const hasEventsOnDate = (date: Date) => {
    const dateKey = format(date, "yyyy-MM-dd");
    return eventDates.has(dateKey);
  };

  // 選択日に繰り返しイベントが含まれているか
  const hasRepeatEventsOnSelectedDate = useMemo(() => {
    return selectedDateEvents.some((e) => isRepeatEvent(e));
  }, [selectedDateEvents]);

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              イベントカレンダー
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  const prev = new Date(currentMonth);
                  prev.setMonth(prev.getMonth() - 1);
                  setCurrentMonth(prev);
                }}
                data-testid="button-prev-month"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[100px] text-center">
                {format(currentMonth, "yyyy年M月", { locale: ja })}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  const next = new Date(currentMonth);
                  next.setMonth(next.getMonth() + 1);
                  setCurrentMonth(next);
                }}
                data-testid="button-next-month"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            locale={ja}
            className="rounded-xl mx-auto"
            modifiers={{
              hasEvents: (date) => hasEventsOnDate(date),
            }}
            modifiersClassNames={{
              hasEvents: "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1 after:w-1 after:rounded-full after:bg-primary",
            }}
            classNames={{
              day: "h-10 w-10 p-0 font-normal aria-selected:opacity-100 rounded-md hover:bg-muted",
              day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
              cell: "h-10 w-10 text-center text-sm p-0 relative",
              head_cell: "text-muted-foreground w-10 font-normal text-xs",
              row: "flex w-full mt-1",
              head_row: "flex",
              table: "w-full border-collapse",
            }}
          />
          <div className="mt-4 flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary" />
              イベントあり
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="h-3 w-3 text-primary/70" />
              繰り返しイベント
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedDate && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-semibold">
              {format(selectedDate, "M月d日（E）", { locale: ja })}のイベント
            </h3>
            <div className="flex items-center gap-2">
              {hasRepeatEventsOnSelectedDate && (
                <Badge variant="outline" className="rounded-xl flex items-center gap-1 text-xs border-primary/30 text-primary">
                  <RefreshCw className="h-3 w-3" />
                  繰り返し
                </Badge>
              )}
              <Badge variant="secondary" className="rounded-xl">
                {selectedDateEvents.length}件
              </Badge>
            </div>
          </div>
          {selectedDateEvents.length === 0 ? (
            <Card className="rounded-2xl border-0 shadow-sm">
              <CardContent className="py-8 text-center text-muted-foreground">
                この日のイベントはありません
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {selectedDateEvents.map((event) => (
                <div key={event.id} className="relative">
                  {isRepeatEvent(event) && (
                    <div className="absolute top-2 right-2 z-10">
                      <Badge
                        variant="secondary"
                        className="rounded-lg flex items-center gap-1 text-xs bg-primary/10 text-primary border-0 shadow-sm"
                      >
                        <RefreshCw className="h-2.5 w-2.5" />
                        {(event as any)._repeatParentId &&
                          (() => {
                            const parent = events.find(
                              (e) => e.id === (event as any)._repeatParentId
                            );
                            return parent?.repeatDays
                              ? `毎週${formatRepeatDays(parent.repeatDays)}`
                              : "繰り返し";
                          })()}
                      </Badge>
                    </div>
                  )}
                  <EventCard event={event} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!selectedDate && (
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardContent className="py-8 text-center text-muted-foreground">
            日付を選択してイベントを表示
          </CardContent>
        </Card>
      )}
    </div>
  );
}
