import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import AudioFileInput, {
  ACCEPTED_EXTENSIONS,
  ACCEPTED_AUDIO_TYPES,
  isAcceptedFile,
  hasValidExtension,
  hasValidMimeType,
} from "../AudioFileInput";

afterEach(() => {
  cleanup();
});

function createMockFile(name: string, type: string): File {
  return new File(["audio-content"], name, { type });
}

describe("AudioFileInput", () => {
  it("renders a file input with correct accept attribute for m4a, wav, mp3", () => {
    const onFileSelect = vi.fn();
    render(<AudioFileInput onFileSelect={onFileSelect} />);

    const input = screen.getByTestId("audio-file-input") as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.type).toBe("file");
    expect(input.accept).toBe(".m4a,.wav,.mp3");
  });

  it("has accept attribute containing all three required extensions", () => {
    expect(ACCEPTED_EXTENSIONS).toContain(".m4a");
    expect(ACCEPTED_EXTENSIONS).toContain(".wav");
    expect(ACCEPTED_EXTENSIONS).toContain(".mp3");
  });

  it("does not include other audio formats in accept attribute", () => {
    expect(ACCEPTED_EXTENSIONS).not.toContain(".ogg");
    expect(ACCEPTED_EXTENSIONS).not.toContain(".flac");
    expect(ACCEPTED_EXTENSIONS).not.toContain(".aac");
  });

  it("renders Korean label text", () => {
    const onFileSelect = vi.fn();
    render(<AudioFileInput onFileSelect={onFileSelect} />);

    expect(screen.getByText("녹음 파일")).toBeInTheDocument();
  });

  it("calls onFileSelect with the file when a valid m4a file is selected", () => {
    const onFileSelect = vi.fn();
    render(<AudioFileInput onFileSelect={onFileSelect} />);

    const input = screen.getByTestId("audio-file-input") as HTMLInputElement;
    const file = createMockFile("meeting.m4a", "audio/x-m4a");

    fireEvent.change(input, { target: { files: [file] } });

    expect(onFileSelect).toHaveBeenCalledWith(file);
    expect(screen.getByText("meeting.m4a")).toBeInTheDocument();
  });

  it("calls onFileSelect with the file when a valid wav file is selected", () => {
    const onFileSelect = vi.fn();
    render(<AudioFileInput onFileSelect={onFileSelect} />);

    const input = screen.getByTestId("audio-file-input") as HTMLInputElement;
    const file = createMockFile("recording.wav", "audio/wav");

    fireEvent.change(input, { target: { files: [file] } });

    expect(onFileSelect).toHaveBeenCalledWith(file);
  });

  it("calls onFileSelect with the file when a valid mp3 file is selected", () => {
    const onFileSelect = vi.fn();
    render(<AudioFileInput onFileSelect={onFileSelect} />);

    const input = screen.getByTestId("audio-file-input") as HTMLInputElement;
    const file = createMockFile("audio.mp3", "audio/mpeg");

    fireEvent.change(input, { target: { files: [file] } });

    expect(onFileSelect).toHaveBeenCalledWith(file);
  });

  it("shows error and calls onFileSelect(null) for invalid file types", () => {
    const onFileSelect = vi.fn();
    render(<AudioFileInput onFileSelect={onFileSelect} />);

    const input = screen.getByTestId("audio-file-input") as HTMLInputElement;
    const file = createMockFile("document.pdf", "application/pdf");

    fireEvent.change(input, { target: { files: [file] } });

    expect(onFileSelect).toHaveBeenCalledWith(null);
    expect(
      screen.getByText("m4a, wav, mp3 파일만 업로드할 수 있습니다.")
    ).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("rejects .ogg files even if they pass through the native picker", () => {
    const onFileSelect = vi.fn();
    render(<AudioFileInput onFileSelect={onFileSelect} />);

    const input = screen.getByTestId("audio-file-input") as HTMLInputElement;
    const file = createMockFile("audio.ogg", "audio/ogg");

    fireEvent.change(input, { target: { files: [file] } });

    expect(onFileSelect).toHaveBeenCalledWith(null);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("rejects a file with valid extension but disallowed MIME type via the component", () => {
    const onFileSelect = vi.fn();
    render(<AudioFileInput onFileSelect={onFileSelect} />);

    const input = screen.getByTestId("audio-file-input") as HTMLInputElement;
    const file = createMockFile("fake.mp3", "text/html");

    fireEvent.change(input, { target: { files: [file] } });

    expect(onFileSelect).toHaveBeenCalledWith(null);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});

describe("isAcceptedFile", () => {
  it("accepts .m4a files", () => {
    expect(isAcceptedFile(createMockFile("test.m4a", "audio/mp4"))).toBe(true);
  });

  it("accepts .wav files", () => {
    expect(isAcceptedFile(createMockFile("test.wav", "audio/wav"))).toBe(true);
  });

  it("accepts .mp3 files", () => {
    expect(isAcceptedFile(createMockFile("test.mp3", "audio/mpeg"))).toBe(true);
  });

  it("accepts files with uppercase extensions", () => {
    expect(isAcceptedFile(createMockFile("test.M4A", "audio/mp4"))).toBe(true);
    expect(isAcceptedFile(createMockFile("test.WAV", "audio/wav"))).toBe(true);
    expect(isAcceptedFile(createMockFile("test.MP3", "audio/mpeg"))).toBe(true);
  });

  it("rejects .ogg files", () => {
    expect(isAcceptedFile(createMockFile("test.ogg", "audio/ogg"))).toBe(false);
  });

  it("rejects .pdf files", () => {
    expect(isAcceptedFile(createMockFile("test.pdf", "application/pdf"))).toBe(
      false
    );
  });

  it("rejects .flac files", () => {
    expect(isAcceptedFile(createMockFile("test.flac", "audio/flac"))).toBe(
      false
    );
  });

  it("rejects a file with valid extension but disallowed MIME type", () => {
    expect(
      isAcceptedFile(createMockFile("fake.mp3", "application/javascript"))
    ).toBe(false);
  });

  it("accepts a file with valid extension and empty MIME type", () => {
    expect(isAcceptedFile(createMockFile("recording.m4a", ""))).toBe(true);
  });

  it("rejects a file with disallowed extension even if MIME type is audio", () => {
    expect(isAcceptedFile(createMockFile("audio.ogg", "audio/mpeg"))).toBe(
      false
    );
  });
});

describe("hasValidExtension", () => {
  it("accepts .m4a extension", () => {
    expect(hasValidExtension("test.m4a")).toBe(true);
  });

  it("accepts .wav extension", () => {
    expect(hasValidExtension("test.wav")).toBe(true);
  });

  it("accepts .mp3 extension", () => {
    expect(hasValidExtension("test.mp3")).toBe(true);
  });

  it("is case-insensitive", () => {
    expect(hasValidExtension("test.M4A")).toBe(true);
    expect(hasValidExtension("test.WAV")).toBe(true);
    expect(hasValidExtension("test.Mp3")).toBe(true);
  });

  it("rejects disallowed extensions", () => {
    expect(hasValidExtension("test.ogg")).toBe(false);
    expect(hasValidExtension("test.flac")).toBe(false);
    expect(hasValidExtension("test.pdf")).toBe(false);
    expect(hasValidExtension("test.exe")).toBe(false);
    expect(hasValidExtension("test.txt")).toBe(false);
  });
});

describe("hasValidMimeType", () => {
  it("accepts empty MIME type (browsers may not provide it)", () => {
    expect(hasValidMimeType("")).toBe(true);
  });

  it("accepts audio/x-m4a MIME type", () => {
    expect(hasValidMimeType("audio/x-m4a")).toBe(true);
  });

  it("accepts audio/mp4 MIME type", () => {
    expect(hasValidMimeType("audio/mp4")).toBe(true);
  });

  it("accepts audio/mpeg MIME type", () => {
    expect(hasValidMimeType("audio/mpeg")).toBe(true);
  });

  it("accepts audio/wav MIME type", () => {
    expect(hasValidMimeType("audio/wav")).toBe(true);
  });

  it("accepts audio/wave MIME type", () => {
    expect(hasValidMimeType("audio/wave")).toBe(true);
  });

  it("accepts audio/x-wav MIME type", () => {
    expect(hasValidMimeType("audio/x-wav")).toBe(true);
  });

  it("rejects disallowed MIME types", () => {
    expect(hasValidMimeType("audio/ogg")).toBe(false);
    expect(hasValidMimeType("audio/flac")).toBe(false);
    expect(hasValidMimeType("application/pdf")).toBe(false);
    expect(hasValidMimeType("text/html")).toBe(false);
    expect(hasValidMimeType("application/javascript")).toBe(false);
  });

  it("lists all expected audio MIME types in ACCEPTED_AUDIO_TYPES", () => {
    expect(ACCEPTED_AUDIO_TYPES).toContain("audio/x-m4a");
    expect(ACCEPTED_AUDIO_TYPES).toContain("audio/mp4");
    expect(ACCEPTED_AUDIO_TYPES).toContain("audio/mpeg");
    expect(ACCEPTED_AUDIO_TYPES).toContain("audio/wav");
    expect(ACCEPTED_AUDIO_TYPES).toContain("audio/wave");
    expect(ACCEPTED_AUDIO_TYPES).toContain("audio/x-wav");
  });
});
