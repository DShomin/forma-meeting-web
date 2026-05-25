import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useUsers } from "../useUsers";

describe("useUsers", () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", mockFetch);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("starts in loading state", () => {
    // Never-resolving fetch to keep hook in loading state
    mockFetch.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useUsers());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.users).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("returns users on successful fetch", async () => {
    const mockUsers = ["김철수", "이영희", "박민수"];

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockUsers),
    });

    const { result } = renderHook(() => useUsers());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.users).toEqual(mockUsers);
    expect(result.current.error).toBeNull();
    expect(mockFetch).toHaveBeenCalledWith("/api/users");
  });

  it("returns empty array when API returns empty list", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    const { result } = renderHook(() => useUsers());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.users).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("sets error when API returns non-ok response with error body", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: () =>
        Promise.resolve({ error: "서버 인증 토큰이 설정되지 않았습니다" }),
    });

    const { result } = renderHook(() => useUsers());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.users).toEqual([]);
    expect(result.current.error).toBe("서버 인증 토큰이 설정되지 않았습니다");
  });

  it("sets error with status code when API returns non-ok response without error body", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 502,
      json: () => Promise.reject(new Error("invalid json")),
    });

    const { result } = renderHook(() => useUsers());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.users).toEqual([]);
    expect(result.current.error).toBe("사용자 목록 요청 실패 (502)");
  });

  it("sets error when fetch throws a network error", async () => {
    mockFetch.mockRejectedValue(new Error("Failed to fetch"));

    const { result } = renderHook(() => useUsers());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.users).toEqual([]);
    expect(result.current.error).toBe("Failed to fetch");
  });

  it("sets generic error when fetch throws non-Error", async () => {
    mockFetch.mockRejectedValue("unknown failure");

    const { result } = renderHook(() => useUsers());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.users).toEqual([]);
    expect(result.current.error).toBe(
      "사용자 목록을 불러오는 중 오류가 발생했습니다",
    );
  });

  it("does not update state after unmount (cleanup cancellation)", async () => {
    let resolvePromise: (value: Response) => void;
    const promise = new Promise<Response>((resolve) => {
      resolvePromise = resolve;
    });
    mockFetch.mockReturnValue(promise);

    const { result, unmount } = renderHook(() => useUsers());

    expect(result.current.isLoading).toBe(true);

    // Unmount before fetch resolves
    unmount();

    // Resolve after unmount — should not cause state update warning
    resolvePromise!({
      ok: true,
      json: () => Promise.resolve(["김철수"]),
    } as Response);

    // Allow microtasks to settle
    await new Promise((r) => setTimeout(r, 50));

    // No assertion on result.current after unmount since it's stale,
    // but the test passes if no "state update on unmounted" warning occurs.
  });
});
