// TimeTracker.tsx
import { ChangeEvent, useEffect, useState } from 'react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Play, Square, Plus, Trash2 } from 'lucide-react';

function createData(
  id: number,
  name: string,
  start: Date,
  stop?: Date
) {
  return { id, name, start, stop, isStopped: false };
}

function getDurationStrFor(duration: number): string {
  const seconds = duration / 1000;
  const minutes = seconds / 60;
  const hours = Math.floor(minutes / 60);
  let durationStr = "";
  const minutesVal = Math.floor(minutes % 60);
  const secondsVal = Math.floor(seconds % 60);

  if (hours > 0) { durationStr += `${hours} hrs ` }
  if (minutesVal > 0) { durationStr += `${minutesVal} mins ` }
  if (secondsVal >= 0) { durationStr += `${secondsVal} secs` }

  return durationStr;
}

function getDurationStrForDates(start: Date, stop?: Date): string {
  const duration = (stop || new Date()).valueOf() - start.valueOf();
  return getDurationStrFor(duration);
}

type TimeEntry = {
  id: number,
  name: string,
  start: Date,
  stop?: Date,
  isStopped: boolean,
};

type TimeSheet = {
  entries: TimeEntry[]
};

// Function to load timesheet from localStorage
function loadTimesheetFromStorage(): TimeSheet {
  try {
    const storedData = localStorage.getItem('timesheet');
    if (!storedData) return { entries: [] };

    const originalExistingTimesheet = JSON.parse(storedData) as TimeSheet;
    return {
      entries: originalExistingTimesheet.entries.map((entry) => ({
        ...entry,
        start: new Date(entry.start),
        stop: entry.stop ? new Date(entry.stop) : undefined,
      }))
    };
  } catch (error) {
    console.error('Error loading timesheet from localStorage:', error);
    return { entries: [] };
  }
}

// BasicTable Component
function BasicTable({
  timeSheet,
  stopEntryFunc,
  newEntryFrom,
  deleteEntryFunc
}: {
  timeSheet: TimeSheet,
  stopEntryFunc: (id: number) => void,
  newEntryFrom: (entry: TimeEntry) => void,
  deleteEntryFunc: (id: number) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Time Entries</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Start</TableHead>
              <TableHead>Stop</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead className="text-center">Controls</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {timeSheet.entries.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell>{row.start?.toLocaleString()}</TableCell>
                <TableCell>{row.isStopped ? row.stop?.toLocaleString() : "In Progress"}</TableCell>
                <TableCell>{getDurationStrForDates(row.start, row.stop)}</TableCell>
                <TableCell>
                  <div className="flex justify-center gap-2">
                    {!row.isStopped ?
                      <Button size="sm" variant="secondary" onClick={() => stopEntryFunc(row.id)}>
                        <Square className="h-4 w-4" />
                      </Button>
                      : <Button size="sm" variant="outline" onClick={() => newEntryFrom(row)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    }
                    <Button size="sm" variant="destructive" onClick={() => deleteEntryFunc(row.id)}>
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
  const rows: { name: string, durationStr: string, durationRaw: number, entries: number }[] = [];

  timeSheet.entries.forEach((entry) => {
    const index = rows.findIndex((row) => row.name == entry.name);
    if (index == -1) {
      rows.push({
        name: entry.name,
        durationStr: getDurationStrForDates(entry.start, entry.stop),
        durationRaw: getDurationOf(entry),
        entries: 1
      });
    } else {
      rows[index].durationRaw += getDurationOf(entry);
      rows[index].durationStr = getDurationStrFor(rows[index].durationRaw);
      rows[index].entries++;
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Duration</TableHead>
              <TableHead className="text-right">Entries</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.name}>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell className="text-right">{row.durationStr}</TableCell>
                <TableCell className="text-right">{row.entries.toString()}</TableCell>
              </TableRow>
            ))}
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
  const [timesheet, setTimesheet] = useState<TimeSheet>(() => loadTimesheetFromStorage());
  const [titleIsError, setTitleIsError] = useState(false);
  const [newEntryTitle, setNewEntryTitle] = useState("");
  const [activeView, setActiveView] = useState<'entries' | 'summary'>('entries');
  const [showingClearDialog, setShowingClearDialog] = useState(false);

  const onChangeNewEntryTitle = (e: ChangeEvent<HTMLInputElement>) => {
    setNewEntryTitle(e.target.value);
    setTitleIsError(false);
  };

  const getNextId = () => {
    if (timesheet.entries.length == 0) return 0;
    const highestEntryId = timesheet.entries.reduce((acc, entry) => entry.id > acc.id ? entry : acc);
    return highestEntryId.id + 1;
  };

  const createNewEntry = () => {
    if (newEntryTitle.length == 0) {
      setTitleIsError(true);
      return;
    }
    setTitleIsError(false);
    setTimesheet({
      entries: [
        ...timesheet.entries,
        createData(getNextId(), newEntryTitle, new Date())
      ]
    });
    setNewEntryTitle("");
  };

  const stopEntry = (entryId: number) => {
    const entry = timesheet.entries.find(x => x.id == entryId);
    if (!entry) return;
    setTimesheet({
      entries: [
        ...timesheet.entries.filter(x => x.id != entryId),
        {
          ...createData(entryId, entry.name, entry.start, new Date()), isStopped: true
        }
      ]
    });
  };

  const newEntryFrom = (entry: TimeEntry) => {
    setTimesheet({
      entries: [
        ...timesheet.entries,
        createData(getNextId(), entry.name, new Date())
      ]
    });
  };

  const deleteEntry = (entryId: number) => {
    setTimesheet({
      entries: [
        ...timesheet.entries.filter((entry) => entry.id != entryId)
      ]
    });
  };

  const clearTimesheet = () => {
    setTimesheet({ entries: [] });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimesheet(prevTimesheet => ({
        entries: prevTimesheet.entries.map((entry) => {
          if (entry.isStopped) { return entry; }
          else return { ...entry, stop: new Date() };
        })
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
      }))
    };
    localStorage.setItem('timesheet', JSON.stringify(toSave));
  }, [timesheet]);

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Time Tracker</h1>
        </div>

        <Card>
          <CardContent className="">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-end">
                <div className="w-full sm:w-auto">
                  <Label htmlFor="entry-name" className={titleIsError ? "text-destructive" : ""}>
                    Entry Name
                  </Label>
                  <Input
                    id="entry-name"
                    type="text"
                    className={titleIsError ? "border-destructive mt-2" : "mt-2"}
                    value={newEntryTitle}
                    onChange={onChangeNewEntryTitle}
                    placeholder='Enter task name'
                  />
                  {titleIsError && <p className="text-sm text-destructive mt-1">Please enter a task name</p>}
                </div>
                <Button onClick={createNewEntry} className="mt-6 sm:mt-0">
                  <Plus className="mr-2 h-4 w-4" />
                  New Entry
                </Button>
              </div>

              <div className="flex gap-2 items-end">
                {activeView == 'entries' &&
                  <Button variant="outline" onClick={() => setActiveView('summary')}>
                    Show Summary
                  </Button>
                }
                {activeView == 'summary' &&
                  <Button variant="outline" onClick={() => setActiveView('entries')}>
                    Show Entries
                  </Button>
                }
                <Button variant="destructive" onClick={() => setShowingClearDialog(true)}>
                  Clear All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {activeView == 'entries' &&
          <BasicTable
            timeSheet={timesheet}
            stopEntryFunc={stopEntry}
            newEntryFrom={newEntryFrom}
            deleteEntryFunc={deleteEntry}
          />
        }

        {activeView == 'summary' &&
          <SummaryTable timeSheet={timesheet} />
        }

        <Dialog open={showingClearDialog} onOpenChange={setShowingClearDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Clear this timesheet?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete all your time entries.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowingClearDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => { setShowingClearDialog(false); clearTimesheet(); }}>
                Clear
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
