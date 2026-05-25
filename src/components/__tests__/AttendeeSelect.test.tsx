import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import AttendeeSelect, { mapUserToOption } from "../AttendeeSelect";

afterEach(() => {
  cleanup();
});

describe("mapUserToOption", () => {
  it("maps a display name to a SelectOption with matching value and label", () => {
    expect(mapUserToOption("김철수")).toEqual({
      value: "김철수",
      label: "김철수",
    });
  });

  it("handles English names", () => {
    expect(mapUserToOption("John Doe")).toEqual({
      value: "John Doe",
      label: "John Doe",
    });
  });
});

describe("AttendeeSelect", () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", mockFetch);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows loading state while users are being fetched", () => {
    // Never-resolving fetch to keep in loading
    mockFetch.mockReturnValue(new Promise(() => {}));

    const onChange = vi.fn();
    render(
      <AttendeeSelect selectedValues={[]} onChange={onChange} />,
    );

    expect(screen.getByTestId("attendee-loading")).toBeInTheDocument();
    expect(screen.getByTestId("attendee-loading").textContent).toBe(
      "사용자 목록을 불러오는 중...",
    );
  });

  it("disables the search input while loading", () => {
    mockFetch.mockReturnValue(new Promise(() => {}));

    const onChange = vi.fn();
    render(
      <AttendeeSelect selectedValues={[]} onChange={onChange} />,
    );

    const input = screen.getByTestId("search-input") as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it("renders attendee options after successful fetch", async () => {
    const mockUsers = ["김철수", "이영희", "박민수"];
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockUsers),
    });

    const onChange = vi.fn();
    render(
      <AttendeeSelect selectedValues={[]} onChange={onChange} />,
    );

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByTestId("attendee-loading")).not.toBeInTheDocument();
    });

    // Input should be enabled
    const input = screen.getByTestId("search-input") as HTMLInputElement;
    expect(input.disabled).toBe(false);

    // Open dropdown and verify options
    fireEvent.focus(input);
    expect(screen.getByText("김철수")).toBeInTheDocument();
    expect(screen.getByText("이영희")).toBeInTheDocument();
    expect(screen.getByText("박민수")).toBeInTheDocument();
  });

  it("shows error message when fetch fails", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    const onChange = vi.fn();
    render(
      <AttendeeSelect selectedValues={[]} onChange={onChange} />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("attendee-error")).toBeInTheDocument();
    });

    expect(screen.getByTestId("attendee-error").textContent).toBe(
      "Network error",
    );
    expect(screen.getByTestId("attendee-error").getAttribute("role")).toBe(
      "alert",
    );
  });

  it("hides loading indicator after successful fetch", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(["김철수"]),
    });

    const onChange = vi.fn();
    render(
      <AttendeeSelect selectedValues={[]} onChange={onChange} />,
    );

    await waitFor(() => {
      expect(screen.queryByTestId("attendee-loading")).not.toBeInTheDocument();
    });
  });

  it("renders label '참석자' on the dropdown", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(["김철수"]),
    });

    const onChange = vi.fn();
    render(
      <AttendeeSelect selectedValues={[]} onChange={onChange} />,
    );

    expect(screen.getByText("참석자")).toBeInTheDocument();
  });

  it("renders placeholder '참석자 검색...' on the search input", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    const onChange = vi.fn();
    render(
      <AttendeeSelect selectedValues={[]} onChange={onChange} />,
    );

    const input = screen.getByTestId("search-input") as HTMLInputElement;
    expect(input.placeholder).toBe("참석자 검색...");
  });

  it("calls onChange when an attendee is selected", async () => {
    const mockUsers = ["김철수", "이영희"];
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockUsers),
    });

    const onChange = vi.fn();
    render(
      <AttendeeSelect selectedValues={[]} onChange={onChange} />,
    );

    await waitFor(() => {
      expect(screen.queryByTestId("attendee-loading")).not.toBeInTheDocument();
    });

    fireEvent.focus(screen.getByTestId("search-input"));
    fireEvent.click(screen.getByTestId("option-김철수"));

    expect(onChange).toHaveBeenCalledWith(["김철수"]);
  });

  it("displays selected attendees as tags", async () => {
    const mockUsers = ["김철수", "이영희", "박민수"];
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockUsers),
    });

    const onChange = vi.fn();
    render(
      <AttendeeSelect
        selectedValues={["김철수", "박민수"]}
        onChange={onChange}
      />,
    );

    await waitFor(() => {
      expect(screen.queryByTestId("attendee-loading")).not.toBeInTheDocument();
    });

    const tags = screen.getByTestId("selected-tags");
    expect(tags.textContent).toContain("김철수");
    expect(tags.textContent).toContain("박민수");
  });

  it("supports searching/filtering attendees", async () => {
    const mockUsers = ["김철수", "이영희", "김민수"];
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockUsers),
    });

    const onChange = vi.fn();
    render(
      <AttendeeSelect selectedValues={[]} onChange={onChange} />,
    );

    await waitFor(() => {
      expect(screen.queryByTestId("attendee-loading")).not.toBeInTheDocument();
    });

    const input = screen.getByTestId("search-input");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "김" } });

    expect(screen.getByText("김철수")).toBeInTheDocument();
    expect(screen.getByText("김민수")).toBeInTheDocument();
    expect(screen.queryByText("이영희")).not.toBeInTheDocument();
  });

  it("has data-testid attendee-select on the container", () => {
    mockFetch.mockReturnValue(new Promise(() => {}));

    const onChange = vi.fn();
    render(
      <AttendeeSelect selectedValues={[]} onChange={onChange} />,
    );

    expect(screen.getByTestId("attendee-select")).toBeInTheDocument();
  });

  it("does not show error when fetch is successful", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(["김철수"]),
    });

    const onChange = vi.fn();
    render(
      <AttendeeSelect selectedValues={[]} onChange={onChange} />,
    );

    await waitFor(() => {
      expect(screen.queryByTestId("attendee-loading")).not.toBeInTheDocument();
    });

    expect(screen.queryByTestId("attendee-error")).not.toBeInTheDocument();
  });
});
