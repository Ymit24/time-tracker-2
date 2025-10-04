import { useState } from "react";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader } from "./components/ui/card";
import { Calendar, Timer, Trash2 } from "lucide-react";
import { useTimesheet } from "./hooks/useTimesheet";
import { useNow } from "./hooks/useNow";
import {
  BasicTable,
  SummaryTable,
  TimesheetNavigator,
  NewEntryForm,
  ConfirmDialog,
  RenameDialog,
} from "./components/time-tracker";

type ViewMode = "entries" | "summary";

export default function TimeTracker() {
  const {
    data,
    activeTimesheet,
    createNewTimesheet,
    selectTimesheet,
    deleteTimesheet,
    renameTimesheet,
    createNewEntry,
    stopEntry,
    newEntryFrom,
    deleteEntry,
    clearTimesheet,
  } = useTimesheet();

  const now = useNow();

  // Form state
  const [newEntryTitle, setNewEntryTitle] = useState("");
  const [titleIsError, setTitleIsError] = useState(false);

  // View state
  const [activeView, setActiveView] = useState<ViewMode>("entries");

  // Dialog state
  const [showingClearDialog, setShowingClearDialog] = useState(false);
  const [showingDeleteDialog, setShowingDeleteDialog] = useState(false);
  const [showingRenameDialog, setShowingRenameDialog] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [renameTargetId, setRenameTargetId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  // Form handlers
  const handleNewEntryChange = (value: string) => {
    setNewEntryTitle(value);
    setTitleIsError(false);
  };

  const handleNewEntrySubmit = () => {
    if (newEntryTitle.trim().length === 0) {
      setTitleIsError(true);
      return;
    }
    setTitleIsError(false);
    createNewEntry(newEntryTitle);
    setNewEntryTitle("");
  };

  // Dialog handlers
  const handleOpenDeleteDialog = (id: string) => {
    setDeleteTargetId(id);
    setShowingDeleteDialog(true);
  };

  const handleOpenRenameDialog = (id: string) => {
    const timesheet = data.timesheets.find((ts) => ts.id === id);
    if (timesheet) {
      setRenameTargetId(id);
      setRenameValue(timesheet.name);
      setShowingRenameDialog(true);
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteTargetId) {
      deleteTimesheet(deleteTargetId);
      setDeleteTargetId(null);
    }
  };

  const handleRenameConfirm = () => {
    if (renameTargetId && renameValue.trim()) {
      renameTimesheet(renameTargetId, renameValue);
      setShowingRenameDialog(false);
      setRenameTargetId(null);
      setRenameValue("");
    }
  };

  const handleRenameCancel = () => {
    setShowingRenameDialog(false);
    setRenameTargetId(null);
    setRenameValue("");
  };

  // Loading state
  if (!activeTimesheet) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Timesheet Navigator */}
      <div className="mb-6">
        <TimesheetNavigator
          data={data}
          activeTimesheet={activeTimesheet}
          onSelectTimesheet={selectTimesheet}
          onCreateTimesheet={createNewTimesheet}
          onRenameTimesheet={handleOpenRenameDialog}
          onDeleteTimesheet={handleOpenDeleteDialog}
        />
      </div>

      {/* New Entry Form */}
      <div className="mb-6">
        <NewEntryForm
          value={newEntryTitle}
          onChange={handleNewEntryChange}
          onSubmit={handleNewEntrySubmit}
          error={titleIsError}
        />
      </div>

      {/* Entries / Summary Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant={activeView === "entries" ? "default" : "outline"}
              onClick={() => setActiveView("entries")}
              className="gap-2"
            >
              <Timer className="h-4 w-4" />
              Entries
            </Button>
            <Button
              variant={activeView === "summary" ? "default" : "outline"}
              onClick={() => setActiveView("summary")}
              className="gap-2"
            >
              <Calendar className="h-4 w-4" />
              Summary
            </Button>
          </div>
          {activeView === "entries" && activeTimesheet.entries.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowingClearDialog(true)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {activeView === "entries" ? (
            <BasicTable
              entries={activeTimesheet.entries}
              now={now}
              onNewEntryFrom={newEntryFrom}
              onStopEntry={stopEntry}
              onDeleteEntry={deleteEntry}
            />
          ) : (
            <SummaryTable entries={activeTimesheet.entries} now={now} />
          )}
        </CardContent>
      </Card>

      {/* Clear All Entries Dialog */}
      <ConfirmDialog
        open={showingClearDialog}
        onOpenChange={setShowingClearDialog}
        title="Clear all entries?"
        description={`This will permanently delete all ${activeTimesheet.entries.length} entries in "${activeTimesheet.name}". This action cannot be undone.`}
        confirmText="Clear All Entries"
        onConfirm={clearTimesheet}
        variant="destructive"
      />

      {/* Delete Timesheet Dialog */}
      <ConfirmDialog
        open={showingDeleteDialog}
        onOpenChange={(open) => {
          setShowingDeleteDialog(open);
          if (!open) setDeleteTargetId(null);
        }}
        title="Delete timesheet?"
        description={`Are you sure you want to delete "${data.timesheets.find((ts) => ts.id === deleteTargetId)?.name}"? This will permanently delete the timesheet and all its entries. This action cannot be undone.`}
        confirmText="Delete Timesheet"
        onConfirm={handleDeleteConfirm}
        variant="destructive"
      />

      {/* Rename Timesheet Dialog */}
      <RenameDialog
        open={showingRenameDialog}
        onOpenChange={(open) => {
          if (!open) handleRenameCancel();
        }}
        value={renameValue}
        onChange={setRenameValue}
        onConfirm={handleRenameConfirm}
      />
    </div>
  );
}
