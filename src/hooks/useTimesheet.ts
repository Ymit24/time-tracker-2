import { useState, useEffect } from "react";
import type { TimesheetData, Timesheet, TimeEntry } from "@/types/timesheet";
import { loadFromStorage, saveToStorage } from "@/utils/storage";
import {
  createData,
  generateId,
  getNextEntryId,
  generateTimesheetName,
} from "@/utils/timesheet";

export function useTimesheet() {
  const [data, setData] = useState<TimesheetData>(() => loadFromStorage());

  // Save to storage whenever data changes
  useEffect(() => {
    saveToStorage(data);
  }, [data]);

  // Get the active timesheet
  const activeTimesheet = data.timesheets.find(
    (ts) => ts.id === data.activeTimesheetId,
  );

  // Update a specific timesheet
  const updateTimesheet = (id: string, updates: Partial<Timesheet>) => {
    setData((prev) => ({
      ...prev,
      timesheets: prev.timesheets.map((ts) =>
        ts.id === id ? { ...ts, ...updates } : ts,
      ),
    }));
  };

  // Create a new timesheet
  const createNewTimesheet = () => {
    const existingNames = data.timesheets.map((ts) => ts.name);
    const name = generateTimesheetName(existingNames);

    const newTimesheet: Timesheet = {
      id: generateId(),
      name,
      createdAt: new Date(),
      entries: [],
    };

    setData((prev) => ({
      timesheets: [...prev.timesheets, newTimesheet],
      activeTimesheetId: newTimesheet.id,
    }));
  };

  // Select a timesheet as active
  const selectTimesheet = (id: string) => {
    setData((prev) => ({
      ...prev,
      activeTimesheetId: id,
    }));
  };

  // Delete a timesheet
  const deleteTimesheet = (id: string) => {
    if (data.timesheets.length === 1) return;

    const newTimesheets = data.timesheets.filter((ts) => ts.id !== id);
    const newActiveId =
      id === data.activeTimesheetId
        ? newTimesheets[0].id
        : data.activeTimesheetId;

    setData({
      timesheets: newTimesheets,
      activeTimesheetId: newActiveId,
    });
  };

  // Rename a timesheet
  const renameTimesheet = (id: string, newName: string) => {
    if (newName.trim().length === 0) return;
    updateTimesheet(id, { name: newName.trim() });
  };

  // Create a new entry
  const createNewEntry = (name: string) => {
    if (!activeTimesheet || name.trim().length === 0) return;

    const nextId = getNextEntryId(activeTimesheet.entries);
    const newEntry = createData(nextId, name.trim(), new Date());

    updateTimesheet(activeTimesheet.id, {
      entries: [...activeTimesheet.entries, newEntry],
    });
  };

  // Stop a running entry
  const stopEntry = (entryId: number) => {
    if (!activeTimesheet) return;

    const entry = activeTimesheet.entries.find((x) => x.id === entryId);
    if (!entry) return;

    updateTimesheet(activeTimesheet.id, {
      entries: [
        ...activeTimesheet.entries.filter((x) => x.id !== entryId),
        {
          ...createData(entryId, entry.name, entry.start, new Date()),
          isStopped: true,
        },
      ],
    });
  };

  // Create a new entry from an existing one (restart)
  const newEntryFrom = (entry: TimeEntry) => {
    if (!activeTimesheet) return;

    const nextId = getNextEntryId(activeTimesheet.entries);
    const newEntry = createData(nextId, entry.name, new Date());

    updateTimesheet(activeTimesheet.id, {
      entries: [...activeTimesheet.entries, newEntry],
    });
  };

  // Delete an entry
  const deleteEntry = (entryId: number) => {
    if (!activeTimesheet) return;

    updateTimesheet(activeTimesheet.id, {
      entries: activeTimesheet.entries.filter((entry) => entry.id !== entryId),
    });
  };

  // Clear all entries in the active timesheet
  const clearTimesheet = () => {
    if (!activeTimesheet) return;
    updateTimesheet(activeTimesheet.id, { entries: [] });
  };

  return {
    data,
    activeTimesheet,
    createNewTimesheet,
    selectTimesheet,
    deleteTimesheet,
    renameTimesheet,
    createNewEntry,
    stopEntry,
    newEntryFrom,
    deleteEntry,
    clearTimesheet,
  };
}
