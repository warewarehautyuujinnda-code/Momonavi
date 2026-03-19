import type { EventWithGroup } from "@shared/schema";

/**
 * 繰り返しイベントを個別の日付インスタンスに展開する
 *
 * repeatDays: "1,3,5" のようなカンマ区切りの曜日番号文字列
 *   0=日, 1=月, 2=火, 3=水, 4=木, 5=金, 6=土
 * repeatEndDate: 繰り返し終了日
 *
 * 元のイベントの date は「最初の開催日」として扱い、
 * その日以降の指定曜日ごとに仮想イベントを生成する。
 */
export function expandRepeatEvents(events: EventWithGroup[]): EventWithGroup[] {
  const result: EventWithGroup[] = [];

  for (const event of events) {
    // 繰り返し設定がない場合はそのまま追加
    if (!event.repeatDays || !event.repeatEndDate) {
      result.push(event);
      continue;
    }

    // 繰り返し曜日をパース
    const repeatDayNumbers = event.repeatDays
      .split(",")
      .map((d) => parseInt(d.trim(), 10))
      .filter((d) => !isNaN(d) && d >= 0 && d <= 6);

    if (repeatDayNumbers.length === 0) {
      result.push(event);
      continue;
    }

    const startDate = new Date(event.date);
    const endDate = new Date(event.repeatEndDate);

    // 開始時刻・終了時刻の差分（ミリ秒）を計算
    const durationMs = event.endDate
      ? new Date(event.endDate).getTime() - startDate.getTime()
      : 0;

    // 開始日から終了日まで1日ずつ走査して、指定曜日に一致する日付を収集
    const current = new Date(startDate);
    // 時刻は元のイベントの時刻を維持するため、日付部分だけ変えていく
    current.setHours(
      startDate.getHours(),
      startDate.getMinutes(),
      startDate.getSeconds(),
      0
    );

    let instanceIndex = 0;

    while (current <= endDate) {
      const dayOfWeek = current.getDay(); // 0=日〜6=土

      if (repeatDayNumbers.includes(dayOfWeek)) {
        const instanceDate = new Date(current);
        const instanceEndDate = durationMs > 0
          ? new Date(instanceDate.getTime() + durationMs)
          : undefined;

        // 仮想インスタンスを生成（IDに日付サフィックスを付与して一意にする）
        const dateStr = instanceDate.toISOString().slice(0, 10).replace(/-/g, "");
        const instanceId = `${event.id}_repeat_${dateStr}`;

        result.push({
          ...event,
          id: instanceId,
          date: instanceDate,
          endDate: instanceEndDate ?? event.endDate,
          // 繰り返しインスタンスであることを示すフラグ（表示用）
          _repeatParentId: event.id,
          _repeatIndex: instanceIndex,
        } as EventWithGroup & { _repeatParentId: string; _repeatIndex: number });

        instanceIndex++;
      }

      // 翌日へ
      current.setDate(current.getDate() + 1);
    }

    // 繰り返しインスタンスが1件も生成されなかった場合は元のイベントを追加
    if (instanceIndex === 0) {
      result.push(event);
    }
  }

  return result;
}

/**
 * 繰り返しイベントかどうかを判定する
 */
export function isRepeatEvent(event: EventWithGroup): boolean {
  return !!(event as any)._repeatParentId;
}

/**
 * 繰り返し設定の曜日番号を日本語の曜日名に変換する
 */
export const DAY_NAMES_JA = ["日", "月", "火", "水", "木", "金", "土"] as const;

export function formatRepeatDays(repeatDays: string): string {
  return repeatDays
    .split(",")
    .map((d) => parseInt(d.trim(), 10))
    .filter((d) => !isNaN(d) && d >= 0 && d <= 6)
    .map((d) => `${DAY_NAMES_JA[d]}曜`)
    .join("・");
}
