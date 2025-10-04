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
import { ModeToggle } from "@/components/mode-toggle";

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
    <div className="flex items-center gap-2 w-full">
      {/* Navigation Arrows */}
      <Button
        variant="outline"
        size="icon"
        onClick={goToPrevious}
        disabled={!hasPrevious}
        className="h-10 w-10 shrink-0"
        title="Previous timesheet"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Timesheet Info Card */}
      <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 border rounded-md bg-card flex-1 min-w-0">
        <div className="rounded-md bg-primary/10 p-1.5 sm:p-2 shrink-0">
          <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <span className="font-semibold text-xs sm:text-sm leading-tight truncate">
            {activeTimesheet.name}
          </span>
          <span className="text-[10px] sm:text-xs text-muted-foreground truncate">
            <span className="hidden sm:inline">
              {formatTimesheetDate(activeTimesheet.createdAt)} •{" "}
            </span>
            {activeTimesheet.entries.length}{" "}
            {activeTimesheet.entries.length === 1 ? "entry" : "entries"}
          </span>
        </div>
        <div className="text-[10px] sm:text-xs text-muted-foreground font-medium whitespace-nowrap shrink-0">
          {currentIndex + 1}/{sortedTimesheets.length}
        </div>
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={goToNext}
        disabled={!hasNext}
        className="h-10 w-10 shrink-0"
        title="Next timesheet"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Actions Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="h-10 w-10 shrink-0">
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

      {/* Theme Toggle */}
      <ModeToggle />
    </div>
  );
}
