"use client";

import { useMemo } from "react";
import { useUsers } from "@/hooks/useUsers";
import SearchableMultiSelect, {
  type SelectOption,
} from "./SearchableMultiSelect";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface AttendeeSelectProps {
  /** Currently selected attendee display names */
  selectedValues: string[];
  /** Callback when selection changes (values are display names) */
  onChange: (selectedValues: string[]) => void;
}

/**
 * Maps a user display name to a SelectOption.
 * Uses the display name as both value and label since
 * the backend attendees field expects display names.
 */
export function mapUserToOption(displayName: string): SelectOption {
  return { value: displayName, label: displayName };
}

export default function AttendeeSelect({
  selectedValues,
  onChange,
}: AttendeeSelectProps) {
  const { users, isLoading, error } = useUsers();

  const options: SelectOption[] = useMemo(
    () => users.map(mapUserToOption),
    [users],
  );

  return (
    <div className="space-y-1.5" data-testid="attendee-select">
      <SearchableMultiSelect
        options={options}
        selectedValues={selectedValues}
        onChange={onChange}
        placeholder="참석자 검색..."
        label="참석자"
        id="attendee-select"
        disabled={isLoading}
      />

      {isLoading && (
        <p
          className={cn(
            "flex items-center gap-1.5 text-sm text-muted-foreground",
          )}
          data-testid="attendee-loading"
        >
          <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
          사용자 목록을 불러오는 중...
        </p>
      )}

      {error && (
        <p
          className="text-sm text-destructive"
          role="alert"
          data-testid="attendee-error"
        >
          {error}
        </p>
      )}
    </div>
  );
}
