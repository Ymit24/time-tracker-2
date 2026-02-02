import type { TimeEntry } from "@/types/timesheet";
import { getDurationStrFor } from "@/utils/time";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Play, Square, Trash2, Clock } from "lucide-react";

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
    <div className="w-full">
        <Table>
        <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-border/50">
            <TableHead className="w-[40%] pl-6">Task</TableHead>
            <TableHead className="w-[15%]">Start</TableHead>
            <TableHead className="w-[15%] hidden sm:table-cell">
                Stop
            </TableHead>
            <TableHead className="w-[15%]">
                Duration
            </TableHead>
            <TableHead className="w-[15%] text-right pr-6">
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
                className={`group transition-all border-b border-border/40 ${
                    isRunning 
                    ? "bg-primary/10 border-primary/20 hover:bg-primary/15" 
                    : "hover:bg-muted/30"
                }`}
                >
                <TableCell className="font-medium pl-6 py-4">
                    <div className="flex items-center gap-3">
                    {isRunning ? (
                        <div className="relative flex h-2.5 w-2.5 shadow-[0_0_8px_rgba(var(--primary),0.5)]">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                        </div>
                    ) : (
                         <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/20"></div>
                    )}
                    <span className={`truncate max-w-[200px] sm:max-w-[300px] text-base ${isRunning ? "text-primary font-semibold" : ""}`}>
                        {entry.name}
                    </span>
                    </div>
                </TableCell>
                <TableCell className={`text-sm whitespace-nowrap font-mono ${isRunning ? "text-primary/80" : "text-muted-foreground"}`}>
                    {entry.start.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    })}
                </TableCell>
                <TableCell className={`text-sm whitespace-nowrap hidden sm:table-cell font-mono ${isRunning ? "text-primary/80" : "text-muted-foreground"}`}>
                    {entry.isStopped && entry.stop
                    ? entry.stop.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        })
                    : "—"}
                </TableCell>
                <TableCell className={`font-mono text-sm font-medium whitespace-nowrap ${isRunning ? "text-primary" : ""}`}>
                    {getDurationStrFor(entry, now)}
                </TableCell>
                <TableCell className="text-right pr-6">
                    <div className="flex justify-end gap-1">
                    {isRunning ? (
                        <Button
                        size="icon"
                        variant="default" 
                        onClick={() => onStopEntry(entry.id)}
                        className="h-8 w-8 shadow-sm"
                        title="Stop"
                        >
                        <Square className="h-3.5 w-3.5 fill-current" />
                        </Button>
                    ) : (
                        <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onNewEntryFrom(entry)}
                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                        title="Resume"
                        >
                        <Play className="h-4 w-4 fill-current" />
                        </Button>
                    )}
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onDeleteEntry(entry.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        title="Delete"
                    >
                        <Trash2 className="h-4 w-4" />
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
