import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/lt";

dayjs.extend(relativeTime);
dayjs.locale("lt");

export function formatMatchTime(time: string): string {
  return dayjs(time).format("MM-DD HH:mm");
}

export function timeFromNow(time: string): string {
  return dayjs(time).fromNow();
}

export function isMatchStarted(time: string): boolean {
  return dayjs(time).isBefore(dayjs());
}

export function formatDate(time: string): string {
  return dayjs(time).format("YYYY-MM-DD HH:mm");
}

export type Urgency = "plenty" | "soon" | "urgent" | "started";

export function getMatchUrgency(time: string): Urgency {
  const diff = dayjs(time).diff(dayjs(), "minute");
  if (diff <= 0) return "started";
  if (diff <= 60) return "urgent";
  if (diff <= 180) return "soon";
  return "plenty";
}

export function getCountdown(time: string): string {
  const now = dayjs();
  const match = dayjs(time);
  const diff = match.diff(now, "minute");

  if (diff <= 0) return "Prasidėjo";
  if (diff < 60) return `${diff} min.`;
  if (diff < 1440) {
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    return mins > 0 ? `${hours}h ${mins}min.` : `${hours}h`;
  }
  const days = Math.floor(diff / 1440);
  const hours = Math.floor((diff % 1440) / 60);
  return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
}

export function isToday(time: string): boolean {
  return dayjs(time).isSame(dayjs(), "day");
}

export function isTomorrow(time: string): boolean {
  return dayjs(time).isSame(dayjs().add(1, "day"), "day");
}

export function getDateKey(time: string): string {
  return dayjs(time).format("YYYY-MM-DD");
}

export function formatDayHeader(time: string): string {
  const d = dayjs(time);
  if (d.isSame(dayjs(), "day")) return "Šiandien";
  if (d.isSame(dayjs().add(1, "day"), "day")) return "Rytoj";
  if (d.isSame(dayjs().subtract(1, "day"), "day")) return "Vakar";
  return d.format("MMMM D, dddd"); // e.g. "birželio 14, šeštadienis"
}

export function formatTimeOnly(time: string): string {
  return dayjs(time).format("HH:mm");
}

/**
 * Converts a datetime-local input value (e.g. "2026-06-11T19:00")
 * to a proper ISO string with timezone, so the backend stores it as UTC correctly.
 * The browser's local timezone is used automatically.
 */
export function localTimeToISO(datetimeLocal: string): string {
  return new Date(datetimeLocal).toISOString();
}

export { dayjs };
