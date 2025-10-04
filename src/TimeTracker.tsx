// TimeTracker.tsx
import { ChangeEvent, useEffect, useState, useRef } from "react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./components/ui/dropdown-menu";
import {
  Play,
  Square,
  Plus,
  Trash2,
  Clock,
  Timer,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Edit,
  FileText,
  MoreVertical,
} from "lucide-react";
import { Badge } from "./components/ui/badge";

// ==================== Types ====================

type TimeEntry = {
  id: number;
  name: string;
  start: Date;
  stop: Date | undefined;
  isStopped: boolean;
};

type Timesheet = {
  id: string;
  name: string;
  createdAt: Date;
  entries: TimeEntry[];
};

type TimesheetData = {
  timesheets: Timesheet[];
  activeTimesheetId: string | null;
};

// ==================== Data & Helper Functions ====================

function createData(
  id: number,
  name: string,
  start: Date,
  stop?: Date,
): TimeEntry {
  return { id, name, start, stop, isStopped: false };
}

function getDurationStrFor(entry: TimeEntry, now: Date) {
  const endAt = entry.isStopped && entry.stop ? entry.stop : now;
  const duration = endAt.getTime() - entry.start.getTime();
  const hours = Math.floor(duration / 1000 / 60 / 60);
  const minutes = Math.floor(duration / 1000 / 60) % 60;
  const seconds = Math.floor(duration / 1000) % 60;

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

function getDurationOf(entry: TimeEntry, now: Date) {
  const endAt = entry.isStopped && entry.stop ? entry.stop : now;
  return endAt.getTime() - entry.start.getTime();
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatTimesheetDate(date: Date): string {
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

// ==================== Storage Functions ====================

function loadFromStorage(): TimesheetData {
  try {
    const stored = localStorage.getItem("timetracker-data");

    // Migration: Check if old single-timesheet data exists
    if (!stored) {
      const oldData = localStorage.getItem("timesheet");
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
          localStorage.removeItem("timesheet");

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
  } catch (error) {
    console.error("Failed to load from storage:", error);
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
}

function saveToStorage(data: TimesheetData) {
  try {
    localStorage.setItem("timetracker-data", JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save to storage:", error);
  }
}

// ==================== BasicTable Component ====================

function BasicTable({
  entries,
  now,
  onNewEntryFrom,
  onStopEntry,
  onDeleteEntry,
}: {
  entries: TimeEntry[];
  now: Date;
  onNewEntryFrom: (entry: TimeEntry) => void;
  onStopEntry: (id: number) => void;
  onDeleteEntry: (id: number) => void;
}) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Clock className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-1">No entries yet</h3>
        <p className="text-sm text-muted-foreground">
          Create your first time entry to get started
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Task</TableHead>
            <TableHead className="w-[15%]">Start</TableHead>
            <TableHead className="w-[15%]">Stop</TableHead>
            <TableHead className="w-[15%]">Duration</TableHead>
            <TableHead className="w-[15%] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => {
            const isRunning = !entry.isStopped;
            return (
              <TableRow
                key={entry.id}
                className={isRunning ? "bg-primary/5" : ""}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {isRunning && (
                      <Badge
                        variant="default"
                        className="px-1.5 py-0 h-5 text-[10px] animate-pulse"
                      >
                        <Timer className="h-3 w-3" />
                      </Badge>
                    )}
                    <span>{entry.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {entry.start.toLocaleTimeString()}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {entry.isStopped && entry.stop
                    ? entry.stop.toLocaleTimeString()
                    : "—"}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {getDurationStrFor(entry, now)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    {isRunning ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onStopEntry(entry.id)}
                        className="h-8 px-2"
                      >
                        <Square className="h-3.5 w-3.5 mr-1" />
                        Stop
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onNewEntryFrom(entry)}
                        className="h-8 px-2"
                      >
                        <Play className="h-3.5 w-3.5 mr-1" />
                        Start
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDeleteEntry(entry.id)}
                      className="h-8 w-8 p-0 hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

// ==================== SummaryTable Component ====================

function SummaryTable({ entries, now }: { entries: TimeEntry[]; now: Date }) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Calendar className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-1">No data to summarize</h3>
        <p className="text-sm text-muted-foreground">
          Start tracking time to see your summary
        </p>
      </div>
    );
  }

  const byTask = new Map<string, TimeEntry[]>();
  for (const entry of entries) {
    const existing = byTask.get(entry.name);
    if (existing) {
      existing.push(entry);
    } else {
      byTask.set(entry.name, [entry]);
    }
  }

  const totalDuration = entries.reduce(
    (total, entry) => total + getDurationOf(entry, now),
    0,
  );

  const summaryRows = Array.from(byTask.entries()).map(([name, entries]) => {
    const duration = entries.reduce(
      (total, entry) => total + getDurationOf(entry, now),
      0,
    );
    const percentage = ((duration / totalDuration) * 100).toFixed(1);
    return { name, entries, duration, percentage };
  });

  summaryRows.sort((a, b) => b.duration - a.duration);

  const formatDuration = (ms: number) => {
    const hours = Math.floor(ms / 1000 / 60 / 60);
    const minutes = Math.floor(ms / 1000 / 60) % 60;
    const seconds = Math.floor(ms / 1000) % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Total Time Tracked
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold font-mono">
            {formatDuration(totalDuration)}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Across {entries.length} {entries.length === 1 ? "entry" : "entries"}
          </p>
        </CardContent>
      </Card>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Task</TableHead>
              <TableHead className="w-[15%]">Entries</TableHead>
              <TableHead className="w-[20%]">Duration</TableHead>
              <TableHead className="w-[25%]">Percentage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {summaryRows.map((row) => (
              <TableRow key={row.name}>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{row.entries.length}</Badge>
                </TableCell>
                <TableCell className="font-mono">
                  {formatDuration(row.duration)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full transition-all"
                        style={{ width: `${row.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium min-w-[45px] text-right">
                      {row.percentage}%
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ==================== TimesheetNavigator Component ====================

function TimesheetNavigator({
  data,
  activeTimesheet,
  onSelectTimesheet,
  onCreateTimesheet,
  onRenameTimesheet,
  onDeleteTimesheet,
}: {
  data: TimesheetData;
  activeTimesheet: Timesheet;
  onSelectTimesheet: (id: string) => void;
  onCreateTimesheet: () => void;
  onRenameTimesheet: (id: string) => void;
  onDeleteTimesheet: (id: string) => void;
}) {
  const sortedTimesheets = [...data.timesheets].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );

  const currentIndex = sortedTimesheets.findIndex(
    (ts) => ts.id === activeTimesheet.id,
  );
  const hasPrevious = currentIndex < sortedTimesheets.length - 1;
  const hasNext = currentIndex > 0;

  const goToPrevious = () => {
    if (hasPrevious) {
      onSelectTimesheet(sortedTimesheets[currentIndex + 1].id);
    }
  };

  const goToNext = () => {
    if (hasNext) {
      onSelectTimesheet(sortedTimesheets[currentIndex - 1].id);
    }
  };

  return (
    <div className="flex items-center gap-2 justify-between w-full">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={goToPrevious}
          disabled={!hasPrevious}
          className="h-10 w-10"
          title="Previous timesheet"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-3 px-4 py-2 border rounded-md bg-card min-w-[280px]">
          <div className="rounded-md bg-primary/10 p-2">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <div className="flex flex-col flex-1">
            <span className="font-semibold text-sm leading-tight">
              {activeTimesheet.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatTimesheetDate(activeTimesheet.createdAt)} •{" "}
              {activeTimesheet.entries.length}{" "}
              {activeTimesheet.entries.length === 1 ? "entry" : "entries"}
            </span>
          </div>
          <div className="text-xs text-muted-foreground font-medium">
            {currentIndex + 1} / {sortedTimesheets.length}
          </div>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={goToNext}
          disabled={!hasNext}
          className="h-10 w-10"
          title="Next timesheet"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="h-10 w-10">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[220px]">
          <DropdownMenuItem
            onClick={onCreateTimesheet}
            className="cursor-pointer"
          >
            <Plus className="mr-2 h-4 w-4" />
            <span>Create New Timesheet</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onRenameTimesheet(activeTimesheet.id)}
            className="cursor-pointer"
          >
            <Edit className="mr-2 h-4 w-4" />
            <span>Rename Timesheet</span>
          </DropdownMenuItem>
          {data.timesheets.length > 1 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDeleteTimesheet(activeTimesheet.id)}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete Timesheet</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// ==================== Main TimeTracker Component ====================

export default function TimeTracker() {
  const [data, setData] = useState<TimesheetData>(() => loadFromStorage());
  const [titleIsError, setTitleIsError] = useState(false);
  const [newEntryTitle, setNewEntryTitle] = useState("");
  const [activeView, setActiveView] = useState<"entries" | "summary">(
    "entries",
  );
  const [showingClearDialog, setShowingClearDialog] = useState(false);
  const [showingDeleteDialog, setShowingDeleteDialog] = useState(false);
  const [showingRenameDialog, setShowingRenameDialog] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [renameTargetId, setRenameTargetId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  const activeTimesheet = data.timesheets.find(
    (ts) => ts.id === data.activeTimesheetId,
  );

  const onChangeNewEntryTitle = (e: ChangeEvent<HTMLInputElement>) => {
    setNewEntryTitle(e.target.value);
    setTitleIsError(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      createNewEntry();
    }
  };

  const handleRenameKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleRename();
    }
  };

  const getNextId = () => {
    if (!activeTimesheet || activeTimesheet.entries.length === 0) return 0;
    const highestEntryId = activeTimesheet.entries.reduce((acc, entry) =>
      entry.id > acc.id ? entry : acc,
    );
    return highestEntryId.id + 1;
  };

  const createNewEntry = () => {
    if (!activeTimesheet) return;
    if (newEntryTitle.length === 0) {
      setTitleIsError(true);
      inputRef.current?.focus();
      return;
    }
    setTitleIsError(false);
    updateTimesheet(activeTimesheet.id, {
      entries: [
        ...activeTimesheet.entries,
        createData(getNextId(), newEntryTitle, new Date()),
      ],
    });
    setNewEntryTitle("");
    inputRef.current?.focus();
  };

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

  const newEntryFrom = (entry: TimeEntry) => {
    if (!activeTimesheet) return;
    updateTimesheet(activeTimesheet.id, {
      entries: [
        ...activeTimesheet.entries,
        createData(getNextId(), entry.name, new Date()),
      ],
    });
  };

  const deleteEntry = (entryId: number) => {
    if (!activeTimesheet) return;
    updateTimesheet(activeTimesheet.id, {
      entries: [
        ...activeTimesheet.entries.filter((entry) => entry.id !== entryId),
      ],
    });
  };

  const clearTimesheet = () => {
    if (!activeTimesheet) return;
    updateTimesheet(activeTimesheet.id, { entries: [] });
  };

  const updateTimesheet = (id: string, updates: Partial<Timesheet>) => {
    setData((prev) => ({
      ...prev,
      timesheets: prev.timesheets.map((ts) =>
        ts.id === id ? { ...ts, ...updates } : ts,
      ),
    }));
  };

  const createNewTimesheet = () => {
    const now = new Date();
    const month = now.getMonth() + 1; // getMonth() returns 0-11
    const day = now.getDate();
    const year = now.getFullYear();
    const baseDate = `${month}-${day}-${year}`;

    // Check if a timesheet with this date already exists
    let dateName = baseDate;
    const existingNames = data.timesheets.map((ts) => ts.name);

    if (existingNames.includes(baseDate)) {
      // Find the highest number suffix for this date
      let counter = 2;
      while (existingNames.includes(`${baseDate} ${counter}`)) {
        counter++;
      }
      dateName = `${baseDate} ${counter}`;
    }

    const newTimesheet: Timesheet = {
      id: generateId(),
      name: dateName,
      createdAt: new Date(),
      entries: [],
    };
    setData((prev) => ({
      timesheets: [...prev.timesheets, newTimesheet],
      activeTimesheetId: newTimesheet.id,
    }));
  };

  const selectTimesheet = (id: string) => {
    setData((prev) => ({
      ...prev,
      activeTimesheetId: id,
    }));
  };

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

  const renameTimesheet = (id: string, newName: string) => {
    if (newName.trim().length === 0) return;
    updateTimesheet(id, { name: newName.trim() });
  };

  const openDeleteDialog = (id: string) => {
    setDeleteTargetId(id);
    setShowingDeleteDialog(true);
  };

  const openRenameDialog = (id: string) => {
    const timesheet = data.timesheets.find((ts) => ts.id === id);
    if (timesheet) {
      setRenameTargetId(id);
      setRenameValue(timesheet.name);
      setShowingRenameDialog(true);
    }
  };

  const handleDelete = () => {
    if (deleteTargetId) {
      deleteTimesheet(deleteTargetId);
      setShowingDeleteDialog(false);
      setDeleteTargetId(null);
    }
  };

  const handleRename = () => {
    if (renameTargetId && renameValue.trim()) {
      renameTimesheet(renameTargetId, renameValue);
      setShowingRenameDialog(false);
      setRenameTargetId(null);
      setRenameValue("");
    }
  };

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    saveToStorage(data);
  }, [data]);

  useEffect(() => {
    if (showingRenameDialog) {
      setTimeout(() => {
        renameInputRef.current?.select();
      }, 0);
    }
  }, [showingRenameDialog]);

  if (!activeTimesheet) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-6">
        <TimesheetNavigator
          data={data}
          activeTimesheet={activeTimesheet}
          onSelectTimesheet={selectTimesheet}
          onCreateTimesheet={createNewTimesheet}
          onRenameTimesheet={openRenameDialog}
          onDeleteTimesheet={openDeleteDialog}
        />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>New Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="new-entry-title" className="sr-only">
                Task Name
              </Label>
              <Input
                ref={inputRef}
                id="new-entry-title"
                placeholder="What are you working on?"
                value={newEntryTitle}
                onChange={onChangeNewEntryTitle}
                onKeyPress={handleKeyPress}
                className={titleIsError ? "border-destructive" : ""}
              />
              {titleIsError && (
                <p className="text-sm text-destructive mt-1">
                  Task name is required
                </p>
              )}
            </div>
            <Button onClick={createNewEntry}>
              <Play className="mr-2 h-4 w-4" />
              Start
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant={activeView === "entries" ? "default" : "outline"}
              onClick={() => setActiveView("entries")}
              className="gap-2"
            >
              <Timer className="h-4 w-4" />
              Entries
            </Button>
            <Button
              variant={activeView === "summary" ? "default" : "outline"}
              onClick={() => setActiveView("summary")}
              className="gap-2"
            >
              <Calendar className="h-4 w-4" />
              Summary
            </Button>
          </div>
          {activeView === "entries" && activeTimesheet.entries.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowingClearDialog(true)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {activeView === "entries" ? (
            <BasicTable
              entries={activeTimesheet.entries}
              now={now}
              onNewEntryFrom={newEntryFrom}
              onStopEntry={stopEntry}
              onDeleteEntry={deleteEntry}
            />
          ) : (
            <SummaryTable entries={activeTimesheet.entries} now={now} />
          )}
        </CardContent>
      </Card>

      {/* Clear All Entries Dialog */}
      <Dialog open={showingClearDialog} onOpenChange={setShowingClearDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear all entries?</DialogTitle>
            <DialogDescription>
              This will permanently delete all {activeTimesheet.entries.length}{" "}
              entries in "{activeTimesheet.name}". This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowingClearDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                clearTimesheet();
                setShowingClearDialog(false);
              }}
            >
              Clear All Entries
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Timesheet Dialog */}
      <Dialog open={showingDeleteDialog} onOpenChange={setShowingDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete timesheet?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "
              {data.timesheets.find((ts) => ts.id === deleteTargetId)?.name}
              "? This will permanently delete the timesheet and all its entries.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowingDeleteDialog(false);
                setDeleteTargetId(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Timesheet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Timesheet Dialog */}
      <Dialog open={showingRenameDialog} onOpenChange={setShowingRenameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename timesheet</DialogTitle>
            <DialogDescription>
              Choose a new name for your timesheet
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="rename-input">Timesheet Name</Label>
            <Input
              ref={renameInputRef}
              id="rename-input"
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyPress={handleRenameKeyPress}
              placeholder="Enter timesheet name"
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowingRenameDialog(false);
                setRenameTargetId(null);
                setRenameValue("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRename}
              disabled={renameValue.trim().length === 0}
            >
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
