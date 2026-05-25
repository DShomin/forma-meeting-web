"use client";

import { useState, useCallback } from "react";

/**
 * Metadata extracted from the selected audio file.
 * Stored separately so components can display info without
 * needing direct File object access.
 */
export interface AudioFileMetadata {
  /** Original file name (e.g. "meeting.m4a") */
  name: string;
  /** File size in bytes */
  size: number;
  /** MIME type reported by the browser (may be empty string) */
  type: string;
  /** Last modified timestamp (epoch ms) */
  lastModified: number;
}

/**
 * Return type of the useAudioFile hook.
 */
export interface UseAudioFileReturn {
  /** The raw File object for form submission, or null if none selected */
  file: File | null;
  /** Extracted metadata, or null if no file selected */
  metadata: AudioFileMetadata | null;
  /** Callback to pass to AudioFileInput's onFileSelect prop */
  handleFileSelect: (file: File | null) => void;
  /** Clears the currently selected file and metadata */
  clearFile: () => void;
}

/**
 * Extracts metadata from a File object.
 */
export function extractMetadata(file: File): AudioFileMetadata {
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
  };
}

/**
 * Hook that manages audio file selection state.
 *
 * Stores the selected File object and its metadata, exposing both
 * for UI display and form submission. The `file` reference can be
 * appended to a FormData for multipart upload.
 *
 * @example
 * ```tsx
 * const { file, metadata, handleFileSelect, clearFile } = useAudioFile();
 *
 * // Wire up to AudioFileInput
 * <AudioFileInput onFileSelect={handleFileSelect} />
 *
 * // Access metadata for display
 * {metadata && <p>{metadata.name} ({metadata.size} bytes)</p>}
 *
 * // Use file for form submission
 * const formData = new FormData();
 * if (file) formData.append("audio", file);
 * ```
 */
export function useAudioFile(): UseAudioFileReturn {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<AudioFileMetadata | null>(null);

  const handleFileSelect = useCallback((selectedFile: File | null) => {
    if (selectedFile) {
      setFile(selectedFile);
      setMetadata(extractMetadata(selectedFile));
    } else {
      setFile(null);
      setMetadata(null);
    }
  }, []);

  const clearFile = useCallback(() => {
    setFile(null);
    setMetadata(null);
  }, []);

  return { file, metadata, handleFileSelect, clearFile };
}
