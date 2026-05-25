"use client";

import { useState, useCallback } from "react";
import { Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface MeetingDatePickerProps {
  /** Current date value in ISO 8601 format (YYYY-MM-DD), or empty string */
  value: string;
  /** Callback when the date value changes (ISO 8601 YYYY-MM-DD string) */
  onChange: (value: string) => void;
  /** Optional id for the input element */
  id?: string;
}

/**
 * Validates a meeting date string.
 * Returns null if valid, or a Korean error message string if invalid.
 */
export function validateMeetingDate(value: string): string | null {
  if (!value || value.trim().length === 0) {
    return "회의 날짜를 선택해 주세요.";
  }

  // Validate ISO 8601 date format (YYYY-MM-DD)
  const iso8601Regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!iso8601Regex.test(value)) {
    return "올바른 날짜 형식이 아닙니다. (YYYY-MM-DD)";
  }

  // Validate the date is a real calendar date
  const parsed = new Date(value + "T00:00:00");
  if (isNaN(parsed.getTime())) {
    return "유효하지 않은 날짜입니다.";
  }

  // Verify the parsed date matches the input (catches e.g. Feb 30)
  const [year, month, day] = value.split("-").map(Number);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() + 1 !== month ||
    parsed.getDate() !== day
  ) {
    return "유효하지 않은 날짜입니다.";
  }

  return null;
}

/**
 * Returns today's date in ISO 8601 YYYY-MM-DD format.
 */
export function getTodayISO(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function MeetingDatePicker({
  value,
  onChange,
  id = "meeting-date",
}: MeetingDatePickerProps) {
  const [touched, setTouched] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange],
  );

  const handleBlur = useCallback(() => {
    setTouched(true);
  }, []);

  const error = touched ? validateMeetingDate(value) : null;

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="flex items-center gap-1.5">
        <Calendar className="size-4 text-muted-foreground" />
        회의 날짜
      </Label>
      <Input
        id={id}
        type="date"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        className={cn(
          "h-11 text-base",
          error && "border-destructive ring-destructive/20",
          !value && "text-muted-foreground",
        )}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${id}-error` : undefined}
        data-testid="meeting-date-input"
      />
      {error && (
        <p
          id={`${id}-error`}
          className="text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
