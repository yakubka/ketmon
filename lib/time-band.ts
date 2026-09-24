export type TimeBand = "morning" | "midday" | "evening" | "night";

export const TIME_BANDS: TimeBand[] = ["morning", "midday", "evening", "night"];

export function bandForHour(hour: number): TimeBand {
  if (hour < 11) return "morning";
  if (hour < 15) return "midday";
  if (hour < 19) return "evening";
  return "night";
}

export function bandForDate(date: Date): TimeBand {
  return bandForHour(date.getHours());
}
