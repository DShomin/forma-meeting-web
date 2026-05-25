import { describe, it, expect } from "vitest";
import { ko, containsKorean, KOREAN_CHAR_REGEX } from "@/lib/i18n";
import fs from "fs";
import path from "path";

/**
 * AC: All user-facing text is in Korean.
 *
 * This test suite verifies that every user-facing string in the centralized
 * i18n module (`ko`) contains at least one Korean (Hangul) character, and
 * cross-checks the live component/config files to ensure they use Korean text.
 */

// ────────────────────────────────────────────────────────────────────
// Helper
// ────────────────────────────────────────────────────────────────────

function resolveFile(...segments: string[]): string {
  return path.resolve(__dirname, "..", "..", ...segments);
}

function readFile(...segments: string[]): string {
  return fs.readFileSync(resolveFile(...segments), "utf-8");
}

// ────────────────────────────────────────────────────────────────────
// 1. containsKorean utility
// ────────────────────────────────────────────────────────────────────

describe("containsKorean utility", () => {
  it("returns true for a pure-Korean string", () => {
    expect(containsKorean("회의록")).toBe(true);
  });

  it("returns true for a mixed Korean + Latin string", () => {
    expect(containsKorean("Confluence 회의록")).toBe(true);
  });

  it("returns false for a pure-ASCII string with no Hangul", () => {
    expect(containsKorean("Record Meet")).toBe(false);
  });

  it("returns false for an empty string", () => {
    expect(containsKorean("")).toBe(false);
  });

  it("matches Hangul syllable block range (가-힯)", () => {
    expect(KOREAN_CHAR_REGEX.test("가")).toBe(true);
    expect(KOREAN_CHAR_REGEX.test("힣")).toBe(true);
  });
});

// ────────────────────────────────────────────────────────────────────
// 2. Every static string constant in `ko` contains Korean
// ────────────────────────────────────────────────────────────────────

describe("i18n ko – all static strings contain Korean", () => {
  const staticEntries = Object.entries(ko).filter(
    ([, v]) => typeof v === "string",
  ) as [string, string][];

  it.each(staticEntries)(
    "ko.%s contains at least one Korean character",
    (_key, value) => {
      expect(containsKorean(value)).toBe(true);
    },
  );
});

// ────────────────────────────────────────────────────────────────────
// 3. Template-string functions in `ko` produce Korean output
// ────────────────────────────────────────────────────────────────────

describe("i18n ko – template functions produce Korean strings", () => {
  it("removeAriaLabel returns Korean for a Korean name", () => {
    const text = ko.removeAriaLabel("김철수");
    expect(containsKorean(text)).toBe(true);
    expect(text).toContain("제거");
  });

  it("titleMaxError returns Korean", () => {
    const text = ko.titleMaxError(200);
    expect(containsKorean(text)).toBe(true);
    expect(text).toContain("200");
  });

  it("usersRequestFailed returns Korean", () => {
    const text = ko.usersRequestFailed(500);
    expect(containsKorean(text)).toBe(true);
  });

  it("apiFetchFailed returns Korean", () => {
    const text = ko.apiFetchFailed(502);
    expect(containsKorean(text)).toBe(true);
  });

  it("apiBackendFailed returns Korean", () => {
    const text = ko.apiBackendFailed("timeout");
    expect(containsKorean(text)).toBe(true);
  });
});

// ────────────────────────────────────────────────────────────────────
// 4. Layout metadata is Korean
// ────────────────────────────────────────────────────────────────────

describe("layout.tsx metadata Korean text", () => {
  const layoutSrc = readFile("src", "app", "layout.tsx");

  it("html lang is set to 'ko'", () => {
    expect(layoutSrc).toContain('lang="ko"');
  });

  it("metadata title contains Korean", () => {
    expect(layoutSrc).toContain(ko.metaTitle);
    expect(containsKorean(ko.metaTitle)).toBe(true);
  });

  it("metadata description contains Korean", () => {
    expect(layoutSrc).toContain(ko.metaDescription);
    expect(containsKorean(ko.metaDescription)).toBe(true);
  });
});

// ────────────────────────────────────────────────────────────────────
// 5. manifest.json is Korean-first
// ────────────────────────────────────────────────────────────────────

describe("manifest.json Korean text", () => {
  const manifest = JSON.parse(readFile("public", "manifest.json"));

  it("lang is ko", () => {
    expect(manifest.lang).toBe("ko");
  });

  it("name contains Korean", () => {
    expect(containsKorean(manifest.name)).toBe(true);
  });

  it("description contains Korean", () => {
    expect(containsKorean(manifest.description)).toBe(true);
  });
});

// ────────────────────────────────────────────────────────────────────
// 6. Component source files use Korean labels / placeholders / errors
// ────────────────────────────────────────────────────────────────────

describe("component source files contain Korean UI text", () => {
  it("AudioFileInput.tsx has Korean label '녹음 파일'", () => {
    const src = readFile("src", "components", "AudioFileInput.tsx");
    expect(src).toContain(ko.audioLabel);
  });

  it("AudioFileInput.tsx has Korean error message", () => {
    const src = readFile("src", "components", "AudioFileInput.tsx");
    expect(src).toContain(ko.audioError);
  });

  it("AudioFileInput.tsx has Korean selected-file prefix or uses i18n ref", () => {
    const src = readFile("src", "components", "AudioFileInput.tsx");
    expect(
      src.includes(ko.audioSelectedPrefix) || src.includes("ko.audioSelectedPrefix") || src.includes("파일")
    ).toBe(true);
  });

  it("SearchableMultiSelect.tsx has Korean default placeholder", () => {
    const src = readFile("src", "components", "SearchableMultiSelect.tsx");
    expect(src).toContain(ko.searchPlaceholder);
  });

  it("SearchableMultiSelect.tsx has Korean no-results text", () => {
    const src = readFile("src", "components", "SearchableMultiSelect.tsx");
    expect(src).toContain(ko.searchNoResults);
  });

  it("SearchableMultiSelect.tsx has Korean remove aria-label pattern", () => {
    const src = readFile("src", "components", "SearchableMultiSelect.tsx");
    expect(src).toContain("제거");
  });

  it("AttendeeSelect.tsx has Korean label '참석자'", () => {
    const src = readFile("src", "components", "AttendeeSelect.tsx");
    expect(src).toContain(ko.attendeeLabel);
  });

  it("AttendeeSelect.tsx has Korean placeholder", () => {
    const src = readFile("src", "components", "AttendeeSelect.tsx");
    expect(src).toContain(ko.attendeePlaceholder);
  });

  it("AttendeeSelect.tsx has Korean loading text", () => {
    const src = readFile("src", "components", "AttendeeSelect.tsx");
    expect(src).toContain(ko.attendeeLoading);
  });

  it("MeetingTitleInput.tsx has Korean label '회의 제목'", () => {
    const src = readFile("src", "components", "MeetingTitleInput.tsx");
    expect(src).toContain(ko.titleLabel);
  });

  it("MeetingTitleInput.tsx has Korean placeholder", () => {
    const src = readFile("src", "components", "MeetingTitleInput.tsx");
    expect(src).toContain(ko.titlePlaceholder);
  });

  it("MeetingTitleInput.tsx has Korean empty-title error", () => {
    const src = readFile("src", "components", "MeetingTitleInput.tsx");
    expect(src).toContain(ko.titleEmptyError);
  });

  it("MeetingDatePicker.tsx has Korean label '회의 날짜'", () => {
    const src = readFile("src", "components", "MeetingDatePicker.tsx");
    expect(src).toContain(ko.dateLabel);
  });

  it("MeetingDatePicker.tsx has Korean empty-date error", () => {
    const src = readFile("src", "components", "MeetingDatePicker.tsx");
    expect(src).toContain(ko.dateEmptyError);
  });

  it("MeetingDatePicker.tsx has Korean format error", () => {
    const src = readFile("src", "components", "MeetingDatePicker.tsx");
    expect(src).toContain(ko.dateFormatError);
  });

  it("MeetingDatePicker.tsx has Korean invalid-date error", () => {
    const src = readFile("src", "components", "MeetingDatePicker.tsx");
    expect(src).toContain(ko.dateInvalidError);
  });

  it("page.tsx has Korean heading text", () => {
    const src = readFile("src", "app", "page.tsx");
    expect(src.includes(ko.pageTitle) || src.includes("ko.pageTitle")).toBe(true);
  });

  it("page.tsx has Korean description text", () => {
    const src = readFile("src", "app", "page.tsx");
    expect(src.includes(ko.pageDescription) || src.includes("ko.pageDescription")).toBe(true);
  });
});

// ────────────────────────────────────────────────────────────────────
// 7. API route error messages are in Korean
// ────────────────────────────────────────────────────────────────────

describe("API route error messages are in Korean", () => {
  const routeSrc = readFile("src", "app", "api", "users", "route.ts");

  it("token-missing error is in Korean", () => {
    expect(routeSrc).toContain(ko.apiTokenMissing);
    expect(containsKorean(ko.apiTokenMissing)).toBe(true);
  });

  it("fetch-failed error pattern is in Korean", () => {
    expect(routeSrc).toContain("사용자 목록을 불러오지 못했습니다");
  });

  it("unknown-error fallback is in Korean", () => {
    expect(routeSrc).toContain(ko.apiUnknownError);
    expect(containsKorean(ko.apiUnknownError)).toBe(true);
  });

  it("backend-connection-failed prefix is in Korean", () => {
    expect(routeSrc).toContain("백엔드 연결 실패");
    expect(containsKorean("백엔드 연결 실패")).toBe(true);
  });
});

// ────────────────────────────────────────────────────────────────────
// 8. useUsers hook error messages are in Korean
// ────────────────────────────────────────────────────────────────────

describe("useUsers hook error messages are in Korean", () => {
  const hookSrc = readFile("src", "hooks", "useUsers.ts");

  it("request-failed error contains Korean", () => {
    expect(hookSrc).toContain("사용자 목록 요청 실패");
  });

  it("generic error message is in Korean", () => {
    expect(hookSrc).toContain(ko.usersGenericError);
    expect(containsKorean(ko.usersGenericError)).toBe(true);
  });
});
