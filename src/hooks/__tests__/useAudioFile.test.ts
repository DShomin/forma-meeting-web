import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  useAudioFile,
  extractMetadata,
  type AudioFileMetadata,
} from "../useAudioFile";

function createMockFile(
  name: string,
  size: number,
  type: string,
  lastModified?: number,
): File {
  const content = new Uint8Array(size);
  const file = new File([content], name, {
    type,
    lastModified: lastModified ?? Date.now(),
  });
  return file;
}

describe("extractMetadata", () => {
  it("extracts name, size, type, and lastModified from a File", () => {
    const now = 1700000000000;
    const file = createMockFile("meeting.m4a", 1024, "audio/x-m4a", now);
    const meta = extractMetadata(file);

    expect(meta).toEqual<AudioFileMetadata>({
      name: "meeting.m4a",
      size: 1024,
      type: "audio/x-m4a",
      lastModified: now,
    });
  });

  it("handles empty MIME type", () => {
    const file = createMockFile("recording.wav", 2048, "");
    const meta = extractMetadata(file);

    expect(meta.type).toBe("");
    expect(meta.name).toBe("recording.wav");
    expect(meta.size).toBe(2048);
  });

  it("handles zero-byte files", () => {
    const file = createMockFile("empty.mp3", 0, "audio/mpeg");
    const meta = extractMetadata(file);

    expect(meta.size).toBe(0);
    expect(meta.name).toBe("empty.mp3");
  });
});

describe("useAudioFile", () => {
  it("initializes with null file and null metadata", () => {
    const { result } = renderHook(() => useAudioFile());

    expect(result.current.file).toBeNull();
    expect(result.current.metadata).toBeNull();
  });

  it("stores file and metadata when handleFileSelect is called with a file", () => {
    const { result } = renderHook(() => useAudioFile());
    const file = createMockFile("meeting.m4a", 5000, "audio/x-m4a", 1700000000000);

    act(() => {
      result.current.handleFileSelect(file);
    });

    expect(result.current.file).toBe(file);
    expect(result.current.metadata).toEqual<AudioFileMetadata>({
      name: "meeting.m4a",
      size: 5000,
      type: "audio/x-m4a",
      lastModified: 1700000000000,
    });
  });

  it("clears file and metadata when handleFileSelect is called with null", () => {
    const { result } = renderHook(() => useAudioFile());
    const file = createMockFile("meeting.m4a", 5000, "audio/x-m4a");

    act(() => {
      result.current.handleFileSelect(file);
    });

    expect(result.current.file).not.toBeNull();

    act(() => {
      result.current.handleFileSelect(null);
    });

    expect(result.current.file).toBeNull();
    expect(result.current.metadata).toBeNull();
  });

  it("clears file and metadata when clearFile is called", () => {
    const { result } = renderHook(() => useAudioFile());
    const file = createMockFile("audio.wav", 8192, "audio/wav");

    act(() => {
      result.current.handleFileSelect(file);
    });

    expect(result.current.file).toBe(file);
    expect(result.current.metadata).not.toBeNull();

    act(() => {
      result.current.clearFile();
    });

    expect(result.current.file).toBeNull();
    expect(result.current.metadata).toBeNull();
  });

  it("updates metadata when a new file is selected", () => {
    const { result } = renderHook(() => useAudioFile());

    const file1 = createMockFile("first.m4a", 1000, "audio/x-m4a", 1700000000000);
    const file2 = createMockFile("second.mp3", 2000, "audio/mpeg", 1700000001000);

    act(() => {
      result.current.handleFileSelect(file1);
    });

    expect(result.current.metadata?.name).toBe("first.m4a");
    expect(result.current.metadata?.size).toBe(1000);

    act(() => {
      result.current.handleFileSelect(file2);
    });

    expect(result.current.file).toBe(file2);
    expect(result.current.metadata).toEqual<AudioFileMetadata>({
      name: "second.mp3",
      size: 2000,
      type: "audio/mpeg",
      lastModified: 1700000001000,
    });
  });

  it("exposes file that can be appended to FormData for submission", () => {
    const { result } = renderHook(() => useAudioFile());
    const file = createMockFile("upload.m4a", 4096, "audio/mp4");

    act(() => {
      result.current.handleFileSelect(file);
    });

    // Verify the file can be used in FormData (the core "exposes for form submission" requirement)
    const formData = new FormData();
    formData.append("audio", result.current.file!);

    const retrieved = formData.get("audio") as File;
    expect(retrieved).toBeInstanceOf(File);
    expect(retrieved.name).toBe("upload.m4a");
    expect(retrieved.size).toBe(4096);
  });

  it("returns stable callback references across renders", () => {
    const { result, rerender } = renderHook(() => useAudioFile());

    const firstHandleFileSelect = result.current.handleFileSelect;
    const firstClearFile = result.current.clearFile;

    rerender();

    expect(result.current.handleFileSelect).toBe(firstHandleFileSelect);
    expect(result.current.clearFile).toBe(firstClearFile);
  });
});
