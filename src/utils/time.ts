import type { TimeEntry } from "@/types/timesheet";

/**
 * Get the duration of a time entry as a formatted string (HH:MM:SS)
 */
export function getDurationStrFor(entry: TimeEntry, now: Date): string {
  const endAt = entry.isStopped && entry.stop ? entry.stop : now;
  const duration = endAt.getTime() - entry.start.getTime();
  const hours = Math.floor(duration / 1000 / 60 / 60);
  const minutes = Math.floor(duration / 1000 / 60) % 60;
  const seconds = Math.floor(duration / 1000) % 60;

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Get the duration of a time entry in milliseconds
 */
export function getDurationOf(entry: TimeEntry, now: Date): number {
  const endAt = entry.isStopped && entry.stop ? entry.stop : now;
  return endAt.getTime() - entry.start.getTime();
}

/**
 * Format duration in milliseconds as HH:MM:SS string
 */
export function formatDuration(ms: number): string {
  const hours = Math.floor(ms / 1000 / 60 / 60);
  const minutes = Math.floor(ms / 1000 / 60) % 60;
  const seconds = Math.floor(ms / 1000) % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Format a date as "Today", "Yesterday", or a locale date string
 */
export function formatTimesheetDate(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const entryDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );

  if (entryDate.getTime() === today.getTime()) {
    return "Today";
  } else if (entryDate.getTime() === yesterday.getTime()) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString();
  }
}
