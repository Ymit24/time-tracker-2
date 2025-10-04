import type { TimesheetData, Timesheet } from "@/types/timesheet";
import { formatTimesheetDate } from "@/utils/time";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  FileText,
  MoreVertical,
} from "lucide-react";

interface TimesheetNavigatorProps {
  data: TimesheetData;
  activeTimesheet: Timesheet;
  onSelectTimesheet: (id: string) => void;
  onCreateTimesheet: () => void;
  onRenameTimesheet: (id: string) => void;
  onDeleteTimesheet: (id: string) => void;
}

export function TimesheetNavigator({
  data,
  activeTimesheet,
  onSelectTimesheet,
  onCreateTimesheet,
  onRenameTimesheet,
  onDeleteTimesheet,
}: TimesheetNavigatorProps) {
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
