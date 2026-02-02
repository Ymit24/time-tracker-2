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
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-4">
        {/* Title & Info */}
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
             <h1 className="text-2xl font-bold tracking-tight text-foreground">{activeTimesheet.name}</h1>
             <div className="flex items-center gap-1">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRenameTimesheet(activeTimesheet.id)}
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    title="Rename timesheet"
                >
                    <Edit className="h-3.5 w-3.5" />
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground">
                        <MoreVertical className="h-3.5 w-3.5" />
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[220px]">
                    <DropdownMenuItem
                        onClick={onCreateTimesheet}
                        className="cursor-pointer"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        <span>Create New Timesheet</span>
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
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{formatTimesheetDate(activeTimesheet.createdAt)}</span>
            <span>•</span>
            <span>{activeTimesheet.entries.length} entries</span>
            <span>•</span>
            <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded-sm">
                 {sortedTimesheets.length - currentIndex}/{sortedTimesheets.length}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
         {/* Navigation Arrows */}
        <div className="flex items-center bg-muted/50 rounded-lg p-1">
            <Button
                variant="ghost"
                size="icon"
                onClick={goToPrevious}
                disabled={!hasPrevious}
                className="h-8 w-8 shrink-0 rounded-md"
                title="Previous timesheet"
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={goToNext}
                disabled={!hasNext}
                className="h-8 w-8 shrink-0 rounded-md"
                title="Next timesheet"
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>

        {/* Theme Toggle */}
        <ModeToggle />
        
        {/* Create New Timesheet */}
        <Button
            variant="outline"
            size="icon"
            onClick={onCreateTimesheet}
            className="h-9 w-9"
            title="Create new timesheet"
        >
            <Plus className="h-[1.2rem] w-[1.2rem]" />
        </Button>
      </div>
    </div>
  );
}
