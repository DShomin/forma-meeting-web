import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

const FIXTURE_DIR = path.join(__dirname, "fixtures");
const SAMPLE_AUDIO = path.join(FIXTURE_DIR, "sample.m4a");

test.beforeAll(() => {
  fs.mkdirSync(FIXTURE_DIR, { recursive: true });
  if (!fs.existsSync(SAMPLE_AUDIO)) {
    fs.writeFileSync(SAMPLE_AUDIO, Buffer.alloc(1024, 0));
  }
});

test.describe("회의록 업로드 폼", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("페이지가 한국어 제목과 설명을 표시한다", async ({ page }) => {
    await expect(page.getByText("회의록 업로드")).toBeVisible();
    await expect(
      page.getByText("회의 녹음 파일을 업로드하여"),
    ).toBeVisible();
  });

  test("모든 폼 필드가 렌더링된다", async ({ page }) => {
    await expect(page.getByLabel("녹음 파일")).toBeVisible();
    await expect(page.getByLabel("회의 제목")).toBeVisible();
    await expect(page.getByLabel("회의 날짜")).toBeVisible();
    await expect(page.getByTestId("submit-button")).toBeVisible();
  });

  test("제출 버튼이 한국어 텍스트를 표시한다", async ({ page }) => {
    const btn = page.getByTestId("submit-button");
    await expect(btn).toHaveText("회의록 생성");
  });

  test("필수 항목 미입력시 제출 버튼이 비활성화된다", async ({ page }) => {
    const btn = page.getByTestId("submit-button");
    await expect(btn).toBeDisabled();
  });

  test("오디오 파일을 업로드할 수 있다", async ({ page }) => {
    const fileInput = page.getByTestId("audio-file-input");
    await fileInput.setInputFiles(SAMPLE_AUDIO);
    await expect(page.getByText("선택된 파일: sample.m4a")).toBeVisible();
  });

  test("회의 제목을 입력할 수 있다", async ({ page }) => {
    const titleInput = page.getByLabel("회의 제목");
    await titleInput.fill("주간 회의");
    await expect(titleInput).toHaveValue("주간 회의");
  });

  test("회의 날짜를 선택할 수 있다", async ({ page }) => {
    const dateInput = page.getByLabel("회의 날짜");
    await dateInput.fill("2026-05-25");
    await expect(dateInput).toHaveValue("2026-05-25");
  });
});

test.describe("회의록 업로드 - API 연동", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      // Prevent service worker from intercepting requests during E2E tests
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister();
          }
        });
      }
      // Prevent new SW registration
      Object.defineProperty(navigator, "serviceWorker", {
        value: { register: () => Promise.resolve(), getRegistrations: () => Promise.resolve([]) },
        writable: false,
      });
    });
  });

  test("폼을 채운 후 제출 버튼이 활성화된다", async ({ page }) => {
    await page.route("**/api/users", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(["홍길동", "김철수"]),
      }),
    );

    await page.goto("/");

    const fileInput = page.getByTestId("audio-file-input");
    await fileInput.setInputFiles(SAMPLE_AUDIO);
    await page.getByLabel("회의 제목").fill("주간 회의");
    await page.getByLabel("회의 날짜").fill("2026-05-25");

    const listbox = page.getByTestId("options-listbox");
    await page.getByPlaceholder("참석자 검색...").click();
    await expect(listbox).toBeVisible({ timeout: 5000 });
    await page.getByRole("option", { name: "홍길동" }).click();

    const btn = page.getByTestId("submit-button");
    await expect(btn).toBeEnabled();
  });

  test("업로드 성공 시 Confluence URL을 표시한다", async ({ page }) => {
    await page.route("**/api/users", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(["홍길동", "김철수"]),
      }),
    );

    await page.route("**/api/upload-config", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          backendUrl: "https://mock-backend.test",
          token: "test-token",
        }),
      }),
    );

    await page.route("**/mock-backend.test/meetings", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          title: "주간 회의",
          meeting_date: "2026-05-25",
          confluence_url: "https://example.atlassian.net/wiki/page/12345",
        }),
      }),
    );

    await page.goto("/");

    await page.getByTestId("audio-file-input").setInputFiles(SAMPLE_AUDIO);
    await page.getByLabel("회의 제목").fill("주간 회의");
    await page.getByLabel("회의 날짜").fill("2026-05-25");

    await page.getByPlaceholder("참석자 검색...").click();
    await expect(page.getByTestId("options-listbox")).toBeVisible({ timeout: 5000 });
    await page.getByRole("option", { name: "홍길동" }).click();

    await page.getByTestId("submit-button").click();

    await expect(page.getByText("회의록이 생성되었습니다!")).toBeVisible({
      timeout: 15000,
    });
    const link = page.getByTestId("confluence-link");
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute(
      "href",
      "https://example.atlassian.net/wiki/page/12345",
    );
  });

  test("새 회의록 업로드 버튼으로 폼을 초기화할 수 있다", async ({
    page,
  }) => {
    await page.route("**/api/users", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(["홍길동"]),
      }),
    );

    await page.route("**/api/upload-config", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          backendUrl: "https://mock-backend.test",
          token: "test-token",
        }),
      }),
    );

    await page.route("**/mock-backend.test/meetings", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          title: "회의",
          meeting_date: "2026-05-25",
          confluence_url: "https://example.atlassian.net/wiki/page/1",
        }),
      }),
    );

    await page.goto("/");

    await page.getByTestId("audio-file-input").setInputFiles(SAMPLE_AUDIO);
    await page.getByLabel("회의 제목").fill("회의");
    await page.getByLabel("회의 날짜").fill("2026-05-25");

    await page.getByPlaceholder("참석자 검색...").click();
    await expect(page.getByTestId("options-listbox")).toBeVisible({ timeout: 5000 });
    await page.getByRole("option", { name: "홍길동" }).click();

    await page.getByTestId("submit-button").click();

    await expect(page.getByText("회의록이 생성되었습니다!")).toBeVisible({
      timeout: 10000,
    });

    await page.getByText("새 회의록 업로드").click();
    await expect(page.getByText("회의록 업로드")).toBeVisible();
    await expect(page.getByTestId("submit-button")).toBeVisible();
  });
});
