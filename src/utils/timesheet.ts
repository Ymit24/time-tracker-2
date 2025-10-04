import type { TimeEntry } from "@/types/timesheet";

/**
 * Generate a unique ID using timestamp and random number
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Create a new TimeEntry object
 */
export function createData(
  id: number,
  name: string,
  start: Date,
  stop?: Date,
): TimeEntry {
  return { id, name, start, stop, isStopped: false };
}

/**
 * Get the next available entry ID for a list of entries
 */
export function getNextEntryId(entries: TimeEntry[]): number {
  if (entries.length === 0) return 0;
  const highestEntry = entries.reduce((acc, entry) =>
    entry.id > acc.id ? entry : acc,
  );
  return highestEntry.id + 1;
}

/**
 * Generate a unique timesheet name based on current date
 */
export function generateTimesheetName(existingNames: string[]): string {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const year = now.getFullYear();
  const baseDate = `${month}-${day}-${year}`;

  if (!existingNames.includes(baseDate)) {
    return baseDate;
  }

  // Find the highest number suffix for this date
  let counter = 2;
  while (existingNames.includes(`${baseDate} ${counter}`)) {
    counter++;
  }
  return `${baseDate} ${counter}`;
}
