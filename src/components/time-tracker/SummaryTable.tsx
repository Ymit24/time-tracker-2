import type { TimeEntry } from "@/types/timesheet";
import { getDurationOf, formatDuration } from "@/utils/time";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar, Clock } from "lucide-react";

interface SummaryTableProps {
  entries: TimeEntry[];
  now: Date;
}

export function SummaryTable({ entries, now }: SummaryTableProps) {
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

  // Group entries by task name
  const byTask = new Map<string, TimeEntry[]>();
  for (const entry of entries) {
    const existing = byTask.get(entry.name);
    if (existing) {
      existing.push(entry);
    } else {
      byTask.set(entry.name, [entry]);
    }
  }

  // Calculate total duration across all entries
  const totalDuration = entries.reduce(
    (total, entry) => total + getDurationOf(entry, now),
    0,
  );

  // Create summary rows with duration and percentage
  const summaryRows = Array.from(byTask.entries()).map(([name, entries]) => {
    const duration = entries.reduce(
      (total, entry) => total + getDurationOf(entry, now),
      0,
    );
    const percentage = ((duration / totalDuration) * 100).toFixed(1);
    return { name, entries, duration, percentage };
  });

  // Sort by duration (highest first)
  summaryRows.sort((a, b) => b.duration - a.duration);

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center justify-center p-8 bg-muted/20 rounded-xl border border-border/50">
        <div className="flex items-center gap-2 mb-2 text-muted-foreground text-sm font-medium uppercase tracking-wider">
            <Clock className="h-4 w-4" />
            Total Time Tracked
        </div>
        <div className="text-4xl sm:text-5xl font-bold font-mono tracking-tight text-foreground">
            {formatDuration(totalDuration)}
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
            Across <span className="font-semibold text-foreground">{entries.length}</span> {entries.length === 1 ? "entry" : "entries"}
        </div>
      </div>

      <div className="w-full">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-border/50">
                <TableHead className="w-[40%] pl-6">
                  Task
                </TableHead>
                <TableHead className="w-[15%]">
                  Entries
                </TableHead>
                <TableHead className="w-[20%]">
                  Duration
                </TableHead>
                <TableHead className="w-[25%] pr-6">
                  Percentage
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summaryRows.map((row) => (
                <TableRow key={row.name} className="hover:bg-muted/30 border-b border-border/40">
                  <TableCell className="font-medium pl-6 py-3">
                    <span className="truncate max-w-[200px] inline-block text-base">
                      {row.name}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs font-mono font-normal bg-muted text-muted-foreground hover:bg-muted">
                      {row.entries.length}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm whitespace-nowrap font-medium">
                    {formatDuration(row.duration)}
                  </TableCell>
                  <TableCell className="pr-6">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-muted/50 rounded-full h-1.5 overflow-hidden min-w-[60px]">
                        <div
                          className="bg-primary h-full rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${row.percentage}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-muted-foreground min-w-[35px] text-right">
                        {Math.round(Number(row.percentage))}%
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
