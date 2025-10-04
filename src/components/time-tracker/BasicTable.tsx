import type { TimeEntry } from "@/types/timesheet";
import { getDurationStrFor } from "@/utils/time";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Play, Square, Trash2, Clock, Timer } from "lucide-react";

interface BasicTableProps {
  entries: TimeEntry[];
  now: Date;
  onNewEntryFrom: (entry: TimeEntry) => void;
  onStopEntry: (id: number) => void;
  onDeleteEntry: (id: number) => void;
}

export function BasicTable({
  entries,
  now,
  onNewEntryFrom,
  onStopEntry,
  onDeleteEntry,
}: BasicTableProps) {
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
    <div className="w-full overflow-x-auto -mx-4 sm:mx-0">
      <div className="inline-block min-w-full align-middle px-4 sm:px-0">
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[150px] sm:w-[40%]">Task</TableHead>
                <TableHead className="min-w-[80px] sm:w-[15%]">Start</TableHead>
                <TableHead className="min-w-[80px] sm:w-[15%] hidden sm:table-cell">
                  Stop
                </TableHead>
                <TableHead className="min-w-[90px] sm:w-[15%]">
                  Duration
                </TableHead>
                <TableHead className="min-w-[140px] sm:w-[15%] text-right">
                  Actions
                </TableHead>
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
                        <span className="truncate max-w-[200px]">
                          {entry.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {entry.start.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap hidden sm:table-cell">
                      {entry.isStopped && entry.stop
                        ? entry.stop.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </TableCell>
                    <TableCell className="font-mono text-sm whitespace-nowrap">
                      {getDurationStrFor(entry, now)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {isRunning ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onStopEntry(entry.id)}
                            className="h-8 px-2 whitespace-nowrap"
                          >
                            <Square className="h-3.5 w-3.5 sm:mr-1" />
                            <span className="hidden sm:inline">Stop</span>
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onNewEntryFrom(entry)}
                            className="h-8 px-2 whitespace-nowrap"
                          >
                            <Play className="h-3.5 w-3.5 sm:mr-1" />
                            <span className="hidden sm:inline">Start</span>
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
      </div>
    </div>
  );
}
