"use client";

import { useState, useCallback } from "react";
import AudioFileInput from "@/components/AudioFileInput";
import AttendeeSelect from "@/components/AttendeeSelect";
import MeetingTitleInput from "@/components/MeetingTitleInput";
import MeetingDatePicker from "@/components/MeetingDatePicker";
import UploadProgressBar from "@/components/UploadProgressBar";
import { useMeetingUpload } from "@/hooks/useMeetingUpload";
import { useAudioFile } from "@/hooks/useAudioFile";
import { ko } from "@/lib/i18n";
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ExternalLink } from "lucide-react";

export default function HomePage() {
  const { file, handleFileSelect, clearFile } = useAudioFile();
  const [title, setTitle] = useState("");
  const [attendees, setAttendees] = useState<string[]>([]);
  const [meetingDate, setMeetingDate] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const { upload, progress, status, confluenceUrl, error, reset } =
    useMeetingUpload();

  const isFormValid = file && title.trim().length > 0 && attendees.length > 0 && meetingDate;

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setValidationError(null);

      if (!file || !title.trim() || attendees.length === 0 || !meetingDate) {
        setValidationError(ko.formValidationError);
        return;
      }

      await upload({ file, title: title.trim(), attendees, meetingDate });
    },
    [file, title, attendees, meetingDate, upload],
  );

  const handleReset = useCallback(() => {
    reset();
    clearFile();
    setTitle("");
    setAttendees([]);
    setMeetingDate("");
    setValidationError(null);
  }, [reset, clearFile]);

  if (status === "success" && confluenceUrl) {
    return (
      <main className="flex min-h-[calc(100dvh-3.5rem)] flex-col items-center justify-center px-4 py-8">
        <Card className="w-full max-w-lg text-center">
          <CardContent className="flex flex-col items-center gap-5 py-8">
            <div className="flex size-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2
                className="size-9 text-green-600"
                aria-hidden="true"
              />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              {ko.uploadSuccess}
            </h2>
            <a
              href={confluenceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              data-testid="confluence-link"
            >
              <ExternalLink className="size-4" aria-hidden="true" />
              {ko.viewConfluence}
            </a>
            <Button
              variant="ghost"
              className="h-11 w-full text-sm text-muted-foreground"
              onClick={handleReset}
            >
              {ko.uploadAnother}
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-[calc(100dvh-3.5rem)] flex-col items-center justify-start px-4 py-6">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <h1 className="text-xl font-semibold">{ko.pageTitle}</h1>
          <CardDescription>{ko.pageDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <AudioFileInput onFileSelect={handleFileSelect} />
            <MeetingTitleInput value={title} onChange={setTitle} />
            <AttendeeSelect
              selectedValues={attendees}
              onChange={setAttendees}
            />
            <MeetingDatePicker value={meetingDate} onChange={setMeetingDate} />

            {status === "uploading" && (
              <UploadProgressBar progress={progress} />
            )}

            {(error || validationError) && (
              <div
                className="rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
                role="alert"
              >
                {error || validationError}
              </div>
            )}

            <Button
              type="submit"
              disabled={!isFormValid || status === "uploading"}
              className="h-12 w-full text-sm font-semibold"
              data-testid="submit-button"
            >
              {status === "uploading" ? ko.submitting : ko.submitButton}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
