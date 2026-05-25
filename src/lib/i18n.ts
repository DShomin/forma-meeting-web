/**
 * Centralized Korean UI text constants.
 *
 * All user-facing strings are kept here so that:
 * 1. They can be verified to be in Korean via automated tests.
 * 2. Components import from a single source of truth.
 *
 * Convention: group keys by feature / component.
 */

export const ko = {
  // ── Page title & description ─────────────────────────────────
  pageTitle: "회의록 업로드",
  pageDescription:
    "회의 녹음 파일을 업로드하여 Confluence 회의록을 자동으로 생성합니다.",

  // ── Metadata (layout / manifest) ─────────────────────────────
  metaTitle: "FORMA 회의록",
  metaDescription:
    "회의 녹음 파일을 업로드하고 Confluence 회의록을 생성합니다",

  // ── AudioFileInput ───────────────────────────────────────────
  audioLabel: "녹음 파일",
  audioError: "m4a, wav, mp3 파일만 업로드할 수 있습니다.",
  audioSelectedPrefix: "선택된 파일:",

  // ── SearchableMultiSelect ────────────────────────────────────
  searchPlaceholder: "검색...",
  searchNoResults: "검색 결과가 없습니다.",
  removeAriaLabel: (name: string) => `${name} 제거`,

  // ── AttendeeSelect ───────────────────────────────────────────
  attendeeLabel: "참석자",
  attendeePlaceholder: "참석자 검색...",
  attendeeLoading: "사용자 목록을 불러오는 중...",

  // ── MeetingTitleInput ────────────────────────────────────────
  titleLabel: "회의 제목",
  titlePlaceholder: "회의 제목을 입력하세요",
  titleEmptyError: "회의 제목을 입력해 주세요.",
  titleMaxError: (max: number) =>
    `회의 제목은 ${max}자 이내로 입력해 주세요.`,

  // ── MeetingDatePicker ────────────────────────────────────────
  dateLabel: "회의 날짜",
  dateEmptyError: "회의 날짜를 선택해 주세요.",
  dateFormatError: "올바른 날짜 형식이 아닙니다. (YYYY-MM-DD)",
  dateInvalidError: "유효하지 않은 날짜입니다.",

  // ── useUsers hook ────────────────────────────────────────────
  usersRequestFailed: (status: number) =>
    `사용자 목록 요청 실패 (${status})`,
  usersGenericError: "사용자 목록을 불러오는 중 오류가 발생했습니다",

  // ── Upload / Submission ───────────────────────────────────────
  submitButton: "회의록 생성",
  submitting: "업로드 중...",
  uploadProgress: (pct: number) => `업로드 진행률: ${pct}%`,
  uploadSuccess: "회의록이 생성되었습니다!",
  uploadError: "업로드에 실패했습니다. 다시 시도해 주세요.",
  networkError: "네트워크 오류가 발생했습니다.",
  viewConfluence: "Confluence에서 보기",
  uploadAnother: "새 회의록 업로드",
  formValidationError: "모든 필수 항목을 입력해 주세요.",

  // ── API route (server-side, still shown to user) ─────────────
  apiTokenMissing: "서버 인증 토큰이 설정되지 않았습니다",
  apiFetchFailed: (status: number) =>
    `사용자 목록을 불러오지 못했습니다 (${status})`,
  apiUnknownError: "알 수 없는 오류",
  apiBackendFailed: (message: string) => `백엔드 연결 실패: ${message}`,
  meetingUploadFailed: (status: number) =>
    `회의록 생성에 실패했습니다 (${status})`,
} as const;

/**
 * Regular expression that matches at least one Hangul syllable,
 * Hangul Jamo, or Hangul Compatibility Jamo character.
 * Used by tests to assert that a string contains Korean text.
 */
export const KOREAN_CHAR_REGEX = /[가-힯ᄀ-ᇿ㄰-㆏]/;

/**
 * Returns true if the string contains at least one Korean character.
 */
export function containsKorean(text: string): boolean {
  return KOREAN_CHAR_REGEX.test(text);
}
