import { useRef, useEffect, ChangeEvent, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface RenameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  onChange: (value: string) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

export function RenameDialog({
  open,
  onOpenChange,
  value,
  onChange,
  onConfirm,
  title = "Rename timesheet",
  description = "Choose a new name for your timesheet",
}: RenameDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      // Select all text when dialog opens
      setTimeout(() => {
        inputRef.current?.select();
      }, 0);
    }
  }, [open]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && value.trim().length > 0) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] p-6">
        <DialogHeader className="gap-2">
          <DialogTitle className="text-xl">{title}</DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">{description}</DialogDescription>
        </DialogHeader>
        <div className="py-6">
          <Label htmlFor="rename-input" className="sr-only">Timesheet Name</Label>
          <Input
            ref={inputRef}
            id="rename-input"
            type="text"
            value={value}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            placeholder="Enter timesheet name"
            className="h-11 text-lg"
          />
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleCancel} className="h-10">
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={value.trim().length === 0} className="h-10 px-6">
            Rename
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
