import { format, parseISO } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

const ISRAEL_TIMEZONE = "Asia/Jerusalem";

export function convertToIsraelTime(date: Date | string | number): Date {
  const parsedDate = typeof date === "string" ? parseISO(date) : new Date(date);
  const israelTime = formatInTimeZone(
    parsedDate,
    ISRAEL_TIMEZONE,
    "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
  );
  return new Date(israelTime);
}

export function formatIsraelTime(date: Date | string | number): string {
  const parsedDate = typeof date === "string" ? parseISO(date) : new Date(date);
  return formatInTimeZone(parsedDate, ISRAEL_TIMEZONE, "dd.MM.yyyy, HH:mm:ss");
}
