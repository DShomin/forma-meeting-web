"use client";

import { Loader2 } from "lucide-react";
import { Progress as ProgressPrimitive } from "@base-ui/react/progress";
import {
  ProgressTrack,
  ProgressIndicator,
} from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export interface UploadProgressBarProps {
  /** Upload progress percentage (0-100) */
  progress: number;
}

/**
 * A real-time upload progress bar with percentage text in Korean.
 *
 * @example
 * ```tsx
 * <UploadProgressBar progress={45} />
 * ```
 */
export default function UploadProgressBar({
  progress,
}: UploadProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, Math.round(progress)));
  const isComplete = clamped === 100;

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="파일 업로드 진행률"
      data-testid="upload-progress-bar"
      className="space-y-2"
    >
      <ProgressPrimitive.Root
        value={clamped}
        data-slot="progress"
        className="flex flex-wrap gap-2"
      >
        <ProgressPrimitive.Label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
          {!isComplete && (
            <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
          )}
          {isComplete ? "업로드 완료" : "업로드 중..."}
        </ProgressPrimitive.Label>
        <ProgressPrimitive.Value className="ml-auto text-sm tabular-nums text-muted-foreground">
          {() => `${clamped}%`}
        </ProgressPrimitive.Value>
        <ProgressTrack
          className={cn(
            "h-2.5 rounded-full",
            isComplete && "bg-primary/20",
          )}
        >
          <ProgressIndicator
            className="rounded-full transition-all duration-300 ease-in-out"
          />
        </ProgressTrack>
      </ProgressPrimitive.Root>
    </div>
  );
}
