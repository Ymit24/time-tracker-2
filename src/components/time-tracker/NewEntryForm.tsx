import { useRef, useEffect, ChangeEvent, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
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
    <Card className="border-2 border-primary/10 shadow-lg bg-card/50 backdrop-blur-sm">
      <CardContent className="p-4 sm:p-6">
        <div className="flex gap-3 items-center">
          <div className="flex-1 relative">
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
              className={`h-12 text-lg px-4 border-transparent bg-muted/50 focus:bg-background transition-all shadow-inner ${
                  error ? "border-destructive ring-destructive/20" : "focus:border-primary/20"
              }`}
            />
            {error && (
              <p className="absolute -bottom-6 left-1 text-xs font-medium text-destructive animate-in slide-in-from-top-1 fade-in">
                Please enter a task name
              </p>
            )}
          </div>
          <Button 
            onClick={onSubmit} 
            size="lg" 
            className="h-12 px-6 sm:px-8 text-base shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
          >
            <Play className="mr-2 h-5 w-5 fill-current" />
            Start
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
