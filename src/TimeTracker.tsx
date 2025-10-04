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
  ChevronDown,
  Edit,
  FileText,
} from "lucide-react";
import { Badge } from "./components/ui/badge";

// ==================== Types ====================

type TimeEntry = {
  id: number;
  name: string;
  start: Date;
  stop?: Date;
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

// ==================== Utility Functions ====================

function createData(id: number, name: string, start: Date, stop?: Date) {
  return { id, name, start, stop, isStopped: false };
}

function getDurationStrFor(duration: number): string {
  const seconds = Math.floor(duration / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  const h = hours;
  const m = minutes % 60;
  const s = seconds % 60;

  if (hours > 0) {
    return `${h}h ${m}m ${s}s`;
  }
  if (minutes > 0) {
    return `${m}m ${s}s`;
  }
  return `${s}s`;
}

function getDurationStrForDates(start: Date, stop?: Date): string {
  const duration = (stop || new Date()).valueOf() - start.valueOf();
  return getDurationStrFor(duration);
}

function getDurationOf(entry: TimeEntry): number {
  return (entry.stop || new Date()).valueOf() - entry.start.valueOf();
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function formatTimesheetDate(date: Date): string {
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) return "Today";
  if (isYesterday) return "Yesterday";

  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

// ==================== Storage Functions ====================

function loadFromStorage(): TimesheetData {
  try {
    const storedData = localStorage.getItem("timetracker-data");

    // Migration: Check for old single-timesheet format
    if (!storedData) {
      const oldData = localStorage.getItem("timesheet");
      if (oldData) {
        try {
          const oldTimesheet = JSON.parse(oldData) as { entries: TimeEntry[] };
          const migratedTimesheet: Timesheet = {
            id: generateId(),
            name: "My Timesheet",
            createdAt: new Date(),
            entries: oldTimesheet.entries.map((entry) => ({
              ...entry,
              start: new Date(entry.start),
              stop: entry.stop ? new Date(entry.stop) : undefined,
            })),
          };

          // Save in new format and remove old data
          const newData: TimesheetData = {
            timesheets: [migratedTimesheet],
            activeTimesheetId: migratedTimesheet.id,
          };
          saveToStorage(newData);
          localStorage.removeItem("timesheet");

          console.log("✅ Successfully migrated data from old format");
          return newData;
        } catch (migrationError) {
          console.error("Error migrating old data:", migrationError);
          // Fall through to create default timesheet
        }
      }

      // Create a default timesheet
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

    const parsed = JSON.parse(storedData) as TimesheetData;
    return {
      timesheets: parsed.timesheets.map((ts) => ({
        ...ts,
        createdAt: new Date(ts.createdAt),
        entries: ts.entries.map((entry) => ({
          ...entry,
          start: new Date(entry.start),
          stop: entry.stop ? new Date(entry.stop) : undefined,
        })),
      })),
      activeTimesheetId: parsed.activeTimesheetId,
    };
  } catch (error) {
    console.error("Error loading data from localStorage:", error);
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
    const toSave = {
      timesheets: data.timesheets.map((ts) => ({
        ...ts,
        createdAt: ts.createdAt.valueOf(),
        entries: ts.entries.map((entry) => ({
          ...entry,
          start: entry.start.valueOf(),
          stop: entry.stop?.valueOf(),
        })),
      })),
      activeTimesheetId: data.activeTimesheetId,
    };
    localStorage.setItem("timetracker-data", JSON.stringify(toSave));
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
}

// ==================== BasicTable Component ====================

function BasicTable({
  timesheet,
  stopEntryFunc,
  newEntryFrom,
  deleteEntryFunc,
}: {
  timesheet: Timesheet;
  stopEntryFunc: (id: number) => void;
  newEntryFrom: (entry: TimeEntry) => void;
  deleteEntryFunc: (id: number) => void;
}) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    if (isToday) {
      return formatTime(date);
    }
    return (
      date.toLocaleDateString([], { month: "short", day: "numeric" }) +
      " " +
      formatTime(date)
    );
  };

  if (timesheet.entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Time Entries</CardTitle>
        </CardHeader>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center text-center space-y-3">
            <div className="rounded-full bg-muted p-3">
              <Timer className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">No time entries yet</p>
              <p className="text-sm text-muted-foreground">
                Create your first entry to start tracking time
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Time Entries</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>Start</TableHead>
              <TableHead>End</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {timesheet.entries.map((row) => (
              <TableRow
                key={row.id}
                className={!row.isStopped ? "bg-accent/50" : ""}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{row.name}</span>
                    {!row.isStopped && (
                      <Badge variant="secondary" className="gap-1 text-xs">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                        Active
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(row.start)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {row.isStopped ? formatDate(row.stop!) : "—"}
                </TableCell>
                <TableCell className="font-mono text-sm font-medium">
                  {getDurationStrForDates(row.start, row.stop)}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    {!row.isStopped ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => stopEntryFunc(row.id)}
                        className="text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        title="Stop timer"
                      >
                        <Square className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => newEntryFrom(row)}
                        className="text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        title="Start new entry with this name"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteEntryFunc(row.id)}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      title="Delete entry"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ==================== SummaryTable Component ====================

function SummaryTable({ timesheet }: { timesheet: Timesheet }) {
  const rows: {
    name: string;
    durationStr: string;
    durationRaw: number;
    entries: number;
  }[] = [];

  let totalDuration = 0;

  timesheet.entries.forEach((entry) => {
    const index = rows.findIndex((row) => row.name === entry.name);
    const duration = getDurationOf(entry);
    totalDuration += duration;

    if (index === -1) {
      rows.push({
        name: entry.name,
        durationStr: getDurationStrForDates(entry.start, entry.stop),
        durationRaw: duration,
        entries: 1,
      });
    } else {
      rows[index].durationRaw += duration;
      rows[index].durationStr = getDurationStrFor(rows[index].durationRaw);
      rows[index].entries++;
    }
  });

  // Sort by duration descending
  rows.sort((a, b) => b.durationRaw - a.durationRaw);

  if (timesheet.entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center text-center space-y-3">
            <div className="rounded-full bg-muted p-3">
              <Clock className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">No data to summarize</p>
              <p className="text-sm text-muted-foreground">
                Create some time entries to see your summary
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Summary</CardTitle>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Total:</span>
            <span className="font-mono font-semibold">
              {getDurationStrFor(totalDuration)}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead className="text-right">Duration</TableHead>
              <TableHead className="text-right">Entries</TableHead>
              <TableHead className="text-right">Percentage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const percentage = (
                (row.durationRaw / totalDuration) *
                100
              ).toFixed(1);
              return (
                <TableRow key={row.name}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {row.durationStr}
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {row.entries}
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {percentage}%
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ==================== TimesheetSelector Component ====================

function TimesheetSelector({
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="justify-between min-w-[240px] h-auto py-3 px-4"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-primary/10 p-2">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div className="flex flex-col items-start">
              <span className="font-semibold text-sm">
                {activeTimesheet.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatTimesheetDate(activeTimesheet.createdAt)} •{" "}
                {activeTimesheet.entries.length}{" "}
                {activeTimesheet.entries.length === 1 ? "entry" : "entries"}
              </span>
            </div>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[280px]">
        <div className="px-2 py-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Your Timesheets
          </p>
        </div>
        <DropdownMenuSeparator />
        {sortedTimesheets.map((ts) => (
          <DropdownMenuItem
            key={ts.id}
            onClick={() => onSelectTimesheet(ts.id)}
            className="flex items-center justify-between py-3 cursor-pointer"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div
                className={`rounded-md p-1.5 ${
                  ts.id === activeTimesheet.id ? "bg-primary/20" : "bg-muted"
                }`}
              >
                <FileText
                  className={`h-3.5 w-3.5 ${
                    ts.id === activeTimesheet.id
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span
                  className={`text-sm truncate ${
                    ts.id === activeTimesheet.id ? "font-semibold" : ""
                  }`}
                >
                  {ts.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatTimesheetDate(ts.createdAt)} • {ts.entries.length}{" "}
                  {ts.entries.length === 1 ? "entry" : "entries"}
                </span>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onRenameTimesheet(ts.id);
                }}
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
              {data.timesheets.length > 1 && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 hover:text-destructive hover:bg-destructive/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteTimesheet(ts.id);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onCreateTimesheet}
          className="cursor-pointer py-2.5"
        >
          <Plus className="mr-2 h-4 w-4" />
          <span className="font-medium">Create New Timesheet</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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
    const newTimesheet: Timesheet = {
      id: generateId(),
      name: `Timesheet ${data.timesheets.length + 1}`,
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
    if (data.timesheets.length === 1) return; // Don't delete the last timesheet

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
    if (!timesheet) return;
    setRenameTargetId(id);
    setRenameValue(timesheet.name);
    setShowingRenameDialog(true);
  };

  const handleRename = () => {
    if (renameTargetId) {
      renameTimesheet(renameTargetId, renameValue);
      setShowingRenameDialog(false);
      setRenameTargetId(null);
      setRenameValue("");
    }
  };

  const handleDelete = () => {
    if (deleteTargetId) {
      deleteTimesheet(deleteTargetId);
      setShowingDeleteDialog(false);
      setDeleteTargetId(null);
    }
  };

  // Update timer for active entries
  useEffect(() => {
    const interval = setInterval(() => {
      setData((prevData) => ({
        ...prevData,
        timesheets: prevData.timesheets.map((ts) => ({
          ...ts,
          entries: ts.entries.map((entry) => {
            if (entry.isStopped) {
              return entry;
            } else {
              return { ...entry, stop: new Date() };
            }
          }),
        })),
      }));
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    saveToStorage(data);
  }, [data]);

  // Focus rename input when dialog opens
  useEffect(() => {
    if (showingRenameDialog) {
      setTimeout(() => renameInputRef.current?.select(), 0);
    }
  }, [showingRenameDialog]);

  if (!activeTimesheet) {
    return <div>Loading...</div>;
  }

  const deleteTarget = deleteTargetId
    ? data.timesheets.find((ts) => ts.id === deleteTargetId)
    : null;

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex flex-col space-y-8">
        {/* Header with Timesheet Selector */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex flex-col gap-4 w-full lg:w-auto">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Time Tracker
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Track and manage your time entries across multiple timesheets
              </p>
            </div>
            <TimesheetSelector
              data={data}
              activeTimesheet={activeTimesheet}
              onSelectTimesheet={selectTimesheet}
              onCreateTimesheet={createNewTimesheet}
              onRenameTimesheet={openRenameDialog}
              onDeleteTimesheet={openDeleteDialog}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={activeView === "entries" ? "default" : "outline"}
              onClick={() => setActiveView("entries")}
              size="sm"
            >
              <Timer className="mr-2 h-4 w-4" />
              Entries
            </Button>
            <Button
              variant={activeView === "summary" ? "default" : "outline"}
              onClick={() => setActiveView("summary")}
              size="sm"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Summary
            </Button>
          </div>
        </div>

        {/* New Entry Form */}
        <Card className="border-2 border-dashed">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
              <div className="flex-1 w-full">
                <Label
                  htmlFor="entry-name"
                  className={titleIsError ? "text-destructive" : ""}
                >
                  Task Name
                </Label>
                <div className="relative mt-2">
                  <Input
                    ref={inputRef}
                    id="entry-name"
                    type="text"
                    className={
                      titleIsError
                        ? "bg-muted/50 dark:bg-muted border-destructive"
                        : "bg-muted/50 dark:bg-muted"
                    }
                    value={newEntryTitle}
                    onChange={onChangeNewEntryTitle}
                    onKeyPress={handleKeyPress}
                    placeholder="What are you working on?"
                    autoFocus
                  />
                  {titleIsError && (
                    <p className="absolute left-0 top-full text-sm text-destructive mt-1">
                      Please enter a task name
                    </p>
                  )}
                </div>
              </div>
              <Button
                onClick={createNewEntry}
                size="lg"
                className="w-full sm:w-auto"
              >
                <Play className="mr-2 h-4 w-4" />
                Start Timer
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tables */}
        <div className="space-y-4">
          {activeView === "entries" && (
            <BasicTable
              timesheet={activeTimesheet}
              stopEntryFunc={stopEntry}
              newEntryFrom={newEntryFrom}
              deleteEntryFunc={deleteEntry}
            />
          )}

          {activeView === "summary" && (
            <SummaryTable timesheet={activeTimesheet} />
          )}

          {activeTimesheet.entries.length > 0 && (
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowingClearDialog(true)}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All Entries
              </Button>
            </div>
          )}
        </div>

        {/* Clear Timesheet Dialog */}
        <Dialog open={showingClearDialog} onOpenChange={setShowingClearDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Clear all entries?</DialogTitle>
              <DialogDescription>
                This will permanently delete all time entries in "
                {activeTimesheet.name}". This action cannot be undone.
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
                  setShowingClearDialog(false);
                  clearTimesheet();
                }}
              >
                Clear All Entries
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Timesheet Dialog */}
        <Dialog
          open={showingDeleteDialog}
          onOpenChange={setShowingDeleteDialog}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete timesheet?</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{deleteTarget?.name}"? This
                will permanently delete the timesheet and all its entries. This
                action cannot be undone.
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
        <Dialog
          open={showingRenameDialog}
          onOpenChange={setShowingRenameDialog}
        >
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
    </div>
  );
}
