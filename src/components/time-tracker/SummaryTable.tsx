import type { TimeEntry } from "@/types/timesheet";
import { getDurationOf, formatDuration } from "@/utils/time";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
