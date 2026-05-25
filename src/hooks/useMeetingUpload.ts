"use client";

import { useState, useCallback, useRef } from "react";

/** Possible states of the upload lifecycle. */
export type UploadStatus = "idle" | "uploading" | "success" | "error";

/** Parameters accepted by the `upload` function. */
export interface UploadParams {
  file: File;
  title: string;
  attendees: string[];
  meetingDate: string;
}

/** Return type of the useMeetingUpload hook. */
export interface UseMeetingUploadReturn {
  /** Initiates a multipart upload to /api/meetings */
  upload: (params: UploadParams) => void;
  /** Upload progress percentage (0–100) */
  progress: number;
  /** Current upload lifecycle status */
  status: UploadStatus;
  /** Confluence page URL returned on success */
  confluenceUrl: string | null;
  /** Human-readable error message (Korean) */
  error: string | null;
  /** Resets the hook back to idle state and aborts any in-flight request */
  reset: () => void;
}

/**
 * Hook that handles multipart form submission to `/api/meetings`
 * with real-time upload progress tracking via XMLHttpRequest.
 *
 * @example
 * ```tsx
 * const { upload, progress, status, confluenceUrl, error, reset } = useMeetingUpload();
 *
 * upload({ file, title: "주간 회의", attendees: ["alice", "bob"], meetingDate: "2025-01-01" });
 * ```
 */
export function useMeetingUpload(): UseMeetingUploadReturn {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [confluenceUrl, setConfluenceUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const reset = useCallback(() => {
    if (xhrRef.current) {
      xhrRef.current.abort();
      xhrRef.current = null;
    }
    setProgress(0);
    setStatus("idle");
    setConfluenceUrl(null);
    setError(null);
  }, []);

  const upload = useCallback(
    ({ file, title, attendees, meetingDate }: UploadParams) => {
      // Reset previous state
      setProgress(0);
      setStatus("uploading");
      setConfluenceUrl(null);
      setError(null);

      const formData = new FormData();
      formData.append("audio", file);
      formData.append("title", title);
      formData.append("meeting_date", meetingDate);
      for (const attendee of attendees) {
        formData.append("attendees", attendee);
      }

      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr;

      xhr.upload.onprogress = (event: ProgressEvent) => {
        if (event.lengthComputable) {
          const pct = Math.round((event.loaded / event.total) * 100);
          setProgress(pct);
        }
      };

      xhr.onload = () => {
        xhrRef.current = null;

        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            setConfluenceUrl(data.confluence_url ?? null);
            setStatus("success");
            setProgress(100);
          } catch {
            setError("서버 응답을 처리하는 중 오류가 발생했습니다.");
            setStatus("error");
          }
        } else {
          let message = `업로드에 실패했습니다 (${xhr.status})`;
          try {
            const body = JSON.parse(xhr.responseText);
            if (body.error) {
              message = body.error;
            }
          } catch {
            // Use the default message
          }
          setError(message);
          setStatus("error");
        }
      };

      xhr.onerror = () => {
        xhrRef.current = null;
        setError("네트워크 오류가 발생했습니다. 연결 상태를 확인해 주세요.");
        setStatus("error");
      };

      xhr.onabort = () => {
        xhrRef.current = null;
        setError("업로드가 취소되었습니다.");
        setStatus("error");
      };

      xhr.open("POST", "/api/meetings");
      xhr.send(formData);
    },
    [],
  );

  return { upload, progress, status, confluenceUrl, error, reset };
}
