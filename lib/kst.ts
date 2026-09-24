const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

export function kstDateString(d: Date = new Date()): string {
  const shifted = new Date(d.getTime() + KST_OFFSET_MS);
  return shifted.toISOString().slice(0, 10);
}

export function kstDayRange(dateStr: string): { start: Date; end: Date } {
  const start = new Date(`${dateStr}T00:00:00+09:00`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}
