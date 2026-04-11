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

export { dayjs };
