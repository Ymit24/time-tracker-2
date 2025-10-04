export type TimeEntry = {
  id: number;
  name: string;
  start: Date;
  stop: Date | undefined;
  isStopped: boolean;
};

export type Timesheet = {
  id: string;
  name: string;
  createdAt: Date;
  entries: TimeEntry[];
};

export type TimesheetData = {
  timesheets: Timesheet[];
  activeTimesheetId: string | null;
};
