import { useRef, useEffect, ChangeEvent, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play } from "lucide-react";

interface NewEntryFormProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  error?: boolean;
}

export function NewEntryForm({
  value,
  onChange,
  onSubmit,
  error = false,
}: NewEntryFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSubmit();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Entry</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="new-entry-title" className="sr-only">
              Task Name
            </Label>
            <Input
              ref={inputRef}
              id="new-entry-title"
              placeholder="What are you working on?"
              value={value}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              className={error ? "border-destructive" : ""}
            />
            {error && (
              <p className="text-sm text-destructive mt-1">
                Task name is required
              </p>
            )}
          </div>
          <Button onClick={onSubmit}>
            <Play className="mr-2 h-4 w-4" />
            Start
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
