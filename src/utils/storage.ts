import type { TimesheetData, Timesheet } from "@/types/timesheet";
import { generateId } from "./timesheet";

const STORAGE_KEY = "timetracker-data";
const OLD_STORAGE_KEY = "timesheet";

/**
 * Load timesheet data from localStorage with migration support
 */
export function loadFromStorage(): TimesheetData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    // Migration: Check if old single-timesheet data exists
    if (!stored) {
      const oldData = localStorage.getItem(OLD_STORAGE_KEY);
      if (oldData) {
        try {
          const oldEntries = JSON.parse(oldData);
          // Migrate old data to new structure
          const migratedTimesheet: Timesheet = {
            id: generateId(),
            name: "My Timesheet",
            createdAt: new Date(),
            entries: oldEntries.map((entry: any) => ({
              ...entry,
              start: new Date(entry.start),
              stop: entry.stop ? new Date(entry.stop) : undefined,
            })),
          };

          const migratedData: TimesheetData = {
            timesheets: [migratedTimesheet],
            activeTimesheetId: migratedTimesheet.id,
          };

          // Save migrated data
          saveToStorage(migratedData);

          // Remove old key
          localStorage.removeItem(OLD_STORAGE_KEY);

          return migratedData;
        } catch (error) {
          console.error("Failed to migrate old data:", error);
        }
      }
    }

    if (stored) {
      const parsed = JSON.parse(stored);
      // Deserialize dates
      const data: TimesheetData = {
        ...parsed,
        timesheets: parsed.timesheets.map((ts: any) => ({
          ...ts,
          createdAt: new Date(ts.createdAt),
          entries: ts.entries.map((entry: any) => ({
            ...entry,
            start: new Date(entry.start),
            stop: entry.stop ? new Date(entry.stop) : undefined,
          })),
        })),
      };
      return data;
    }

    // No data found, create default
    return createDefaultData();
  } catch (error) {
    console.error("Failed to load from storage:", error);
    return createDefaultData();
  }
}

/**
 * Save timesheet data to localStorage
 */
export function saveToStorage(data: TimesheetData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save to storage:", error);
  }
}

/**
 * Create default timesheet data
 */
function createDefaultData(): TimesheetData {
  const defaultTimesheet: Timesheet = {
    id: generateId(),
    name: "My Timesheet",
    createdAt: new Date(),
    entries: [],
  };

  return {
    timesheets: [defaultTimesheet],
    activeTimesheetId: defaultTimesheet.id,
  };
}
