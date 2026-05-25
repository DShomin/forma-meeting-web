"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/** Minimum number of characters for a valid title */
export const TITLE_MIN_LENGTH = 1;
/** Maximum number of characters for a valid title */
export const TITLE_MAX_LENGTH = 200;

export interface MeetingTitleInputProps {
  /** Current title value (controlled component) */
  value: string;
  /** Callback when the value changes */
  onChange: (value: string) => void;
  /** Optional id for the input element */
  id?: string;
}

/**
 * Validates a meeting title string.
 * Returns null if valid, or a Korean error message string if invalid.
 */
export function validateTitle(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return "회의 제목을 입력해 주세요.";
  }
  if (trimmed.length > TITLE_MAX_LENGTH) {
    return `회의 제목은 ${TITLE_MAX_LENGTH}자 이내로 입력해 주세요.`;
  }
  return null;
}

export default function MeetingTitleInput({
  value,
  onChange,
  id = "meeting-title",
}: MeetingTitleInputProps) {
  const [touched, setTouched] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      // Prevent typing beyond max length
      if (newValue.length > TITLE_MAX_LENGTH) {
        return;
      }
      onChange(newValue);
    },
    [onChange],
  );

  const handleBlur = useCallback(() => {
    setTouched(true);
  }, []);

  const error = touched ? validateTitle(value) : null;
  const charCount = value.trim().length;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>회의 제목</Label>
        <span
          className={cn(
            "text-xs tabular-nums",
            charCount > TITLE_MAX_LENGTH * 0.9
              ? "text-destructive"
              : "text-muted-foreground",
          )}
        >
          {charCount}/{TITLE_MAX_LENGTH}
        </span>
      </div>
      <Input
        id={id}
        type="text"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="회의 제목을 입력하세요"
        maxLength={TITLE_MAX_LENGTH}
        className={cn(
          "h-11 text-base",
          error && "border-destructive ring-destructive/20",
        )}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${id}-error` : undefined}
        data-testid="meeting-title-input"
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
