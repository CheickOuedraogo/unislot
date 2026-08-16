import { DAY_LABELS, DAY_LABELS_FULL } from "./constants";

export function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, "0")}`;
}

export function formatDateLabel(date: Date): string {
  return date
    .toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
    .replace(".", "");
}

export function getWeekDays(weekStart: Date): { label: string; date: string; iso: string }[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return {
      label: DAY_LABELS[i],
      date: formatDateLabel(d),
      iso: d.toISOString().slice(0, 10),
    };
  });
}

export function getMonday(date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function parseWeekStart(week?: string): Date {
  if (week && ISO_DATE_RE.test(week)) {
    const d = new Date(`${week}T00:00:00`);
    if (!Number.isNaN(d.getTime())) return getMonday(d);
  }
  return getMonday();
}

export function formatWeekRange(weekStart: Date): string {
  const end = new Date(weekStart);
  end.setDate(weekStart.getDate() + 5);
  const fmt = (d: Date) => formatDateLabel(d);
  return `${fmt(weekStart)} - ${fmt(end)}`;
}

export function minutesOfDay(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function formatDayOfWeek(day: number): string {
  return DAY_LABELS_FULL[day] ?? "";
}
