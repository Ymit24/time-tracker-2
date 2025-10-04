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
import { Play, Square, Plus, Trash2, Clock, Timer } from "lucide-react";
import { Badge } from "./components/ui/badge";

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

type TimeEntry = {
  id: number;
  name: string;
  start: Date;
  stop?: Date;
  isStopped: boolean;
};

type TimeSheet = {
  entries: TimeEntry[];
};

// Function to load timesheet from localStorage
function loadTimesheetFromStorage(): TimeSheet {
  try {
    const storedData = localStorage.getItem("timesheet");
    if (!storedData) return { entries: [] };

    const originalExistingTimesheet = JSON.parse(storedData) as TimeSheet;
    return {
      entries: originalExistingTimesheet.entries.map((entry) => ({
        ...entry,
        start: new Date(entry.start),
        stop: entry.stop ? new Date(entry.stop) : undefined,
      })),
    };
  } catch (error) {
    console.error("Error loading timesheet from localStorage:", error);
    return { entries: [] };
  }
}

// BasicTable Component
function BasicTable({
  timeSheet,
  stopEntryFunc,
  newEntryFrom,
  deleteEntryFunc,
}: {
  timeSheet: TimeSheet;
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

  if (timeSheet.entries.length === 0) {
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
            {timeSheet.entries.map((row) => (
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

// SummaryTable Component
function SummaryTable({ timeSheet }: { timeSheet: TimeSheet }) {
  const rows: {
    name: string;
    durationStr: string;
    durationRaw: number;
    entries: number;
  }[] = [];

  let totalDuration = 0;

  timeSheet.entries.forEach((entry) => {
    const index = rows.findIndex((row) => row.name == entry.name);
    const duration = getDurationOf(entry);
    totalDuration += duration;

    if (index == -1) {
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

  if (timeSheet.entries.length === 0) {
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

function getDurationOf(entry: TimeEntry): number {
  return (entry.stop || new Date()).valueOf() - entry.start.valueOf();
}

// Main TimeTracker Component
export default function TimeTracker() {
  // Initialize state with data from localStorage using lazy initialization
  const [timesheet, setTimesheet] = useState<TimeSheet>(() =>
    loadTimesheetFromStorage(),
  );
  const [titleIsError, setTitleIsError] = useState(false);
  const [newEntryTitle, setNewEntryTitle] = useState("");
  const [activeView, setActiveView] = useState<"entries" | "summary">(
    "entries",
  );
  const [showingClearDialog, setShowingClearDialog] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onChangeNewEntryTitle = (e: ChangeEvent<HTMLInputElement>) => {
    setNewEntryTitle(e.target.value);
    setTitleIsError(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      createNewEntry();
    }
  };

  const getNextId = () => {
    if (timesheet.entries.length == 0) return 0;
    const highestEntryId = timesheet.entries.reduce((acc, entry) =>
      entry.id > acc.id ? entry : acc,
    );
    return highestEntryId.id + 1;
  };

  const createNewEntry = () => {
    if (newEntryTitle.length == 0) {
      setTitleIsError(true);
      inputRef.current?.focus();
      return;
    }
    setTitleIsError(false);
    setTimesheet({
      entries: [
        ...timesheet.entries,
        createData(getNextId(), newEntryTitle, new Date()),
      ],
    });
    setNewEntryTitle("");
    inputRef.current?.focus();
  };

  const stopEntry = (entryId: number) => {
    const entry = timesheet.entries.find((x) => x.id == entryId);
    if (!entry) return;
    setTimesheet({
      entries: [
        ...timesheet.entries.filter((x) => x.id != entryId),
        {
          ...createData(entryId, entry.name, entry.start, new Date()),
          isStopped: true,
        },
      ],
    });
  };

  const newEntryFrom = (entry: TimeEntry) => {
    setTimesheet({
      entries: [
        ...timesheet.entries,
        createData(getNextId(), entry.name, new Date()),
      ],
    });
  };

  const deleteEntry = (entryId: number) => {
    setTimesheet({
      entries: [...timesheet.entries.filter((entry) => entry.id != entryId)],
    });
  };

  const clearTimesheet = () => {
    setTimesheet({ entries: [] });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimesheet((prevTimesheet) => ({
        entries: prevTimesheet.entries.map((entry) => {
          if (entry.isStopped) {
            return entry;
          } else return { ...entry, stop: new Date() };
        }),
      }));
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []); // Removed dependency on timesheet.entries to prevent re-creating the interval

  useEffect(() => {
    const toSave = {
      entries: timesheet.entries.map((entry) => ({
        ...entry,
        start: entry.start.valueOf(),
        stop: entry.stop?.valueOf(),
      })),
    };
    localStorage.setItem("timesheet", JSON.stringify(toSave));
  }, [timesheet]);

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex flex-col space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Time Tracker</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track and manage your time entries
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={activeView === "entries" ? "default" : "outline"}
              onClick={() => setActiveView("entries")}
              size="sm"
            >
              Entries
            </Button>
            <Button
              variant={activeView === "summary" ? "default" : "outline"}
              onClick={() => setActiveView("summary")}
              size="sm"
            >
              Summary
            </Button>
          </div>
        </div>

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
                className={titleIsError ? "border-destructive" : ""}
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

        <div className="space-y-4">
          {activeView == "entries" && (
            <BasicTable
              timeSheet={timesheet}
              stopEntryFunc={stopEntry}
              newEntryFrom={newEntryFrom}
              deleteEntryFunc={deleteEntry}
            />
          )}

          {activeView == "summary" && <SummaryTable timeSheet={timesheet} />}

          {timesheet.entries.length > 0 && (
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

        <Dialog open={showingClearDialog} onOpenChange={setShowingClearDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Clear this timesheet?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete all
                your time entries.
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
                Clear
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
