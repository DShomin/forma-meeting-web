"use client";

import { useRef, useState, useCallback, type DragEvent } from "react";
import { Upload, FileAudio, X, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

const ACCEPTED_AUDIO_TYPES = [
  "audio/x-m4a",
  "audio/mp4",
  "audio/mpeg",
  "audio/wav",
  "audio/wave",
  "audio/x-wav",
] as const;

const ACCEPTED_EXTENSIONS = ".m4a,.wav,.mp3";

export interface AudioFileInputProps {
  onFileSelect: (file: File | null) => void;
  /** Optional id for the input element */
  id?: string;
}

function hasValidExtension(name: string): boolean {
  const lower = name.toLowerCase();
  return lower.endsWith(".m4a") || lower.endsWith(".wav") || lower.endsWith(".mp3");
}

function hasValidMimeType(type: string): boolean {
  // Empty MIME type is allowed (browsers may not always provide it)
  if (!type) return true;
  return (ACCEPTED_AUDIO_TYPES as readonly string[]).includes(type);
}

function isAcceptedFile(file: File): boolean {
  return hasValidExtension(file.name) && hasValidMimeType(file.type);
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export default function AudioFileInput({
  onFileSelect,
  id = "audio-file",
}: AudioFileInputProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    (file: File | null) => {
      setError(null);

      if (file && !isAcceptedFile(file)) {
        setError("m4a, wav, mp3 파일만 업로드할 수 있습니다.");
        setSelectedFile(null);
        onFileSelect(null);
        if (inputRef.current) {
          inputRef.current.value = "";
        }
        return;
      }

      setSelectedFile(file);
      onFileSelect(file);
    },
    [onFileSelect],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;
      processFile(file);
    },
    [processFile],
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const file = e.dataTransfer.files?.[0] ?? null;
      processFile(file);
    },
    [processFile],
  );

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    setError(null);
    onFileSelect(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, [onFileSelect]);

  const handleZoneClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>녹음 파일</Label>
        <Link
          href="/guide"
          className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="음성 메모 업로드 가이드"
        >
          <Info className="size-3.5" />
          업로드 방법
        </Link>
      </div>

      {/* Hidden native file input */}
      <Input
        ref={inputRef}
        id={id}
        type="file"
        accept={ACCEPTED_EXTENSIONS}
        onChange={handleChange}
        className="sr-only"
        data-testid="audio-file-input"
      />

      {/* Drag-and-drop zone */}
      {!selectedFile && (
        <div
          role="button"
          tabIndex={0}
          onClick={handleZoneClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleZoneClick();
            }
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "flex min-h-[120px] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 transition-colors",
            isDragOver
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 bg-muted/30 hover:border-primary/50 hover:bg-muted/50",
          )}
        >
          <Upload
            className={cn(
              "size-8 transition-colors",
              isDragOver ? "text-primary" : "text-muted-foreground",
            )}
          />
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              파일을 드래그하거나 탭하여 선택
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              M4A, WAV, MP3 지원
            </p>
          </div>
        </div>
      )}

      {/* Selected file display */}
      {selectedFile && (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <FileAudio className="size-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {selectedFile.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(selectedFile.size)}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRemoveFile}
            aria-label="파일 제거"
            className="size-9 shrink-0"
          >
            <X className="size-4" />
          </Button>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export { ACCEPTED_EXTENSIONS, ACCEPTED_AUDIO_TYPES, isAcceptedFile, hasValidExtension, hasValidMimeType };
