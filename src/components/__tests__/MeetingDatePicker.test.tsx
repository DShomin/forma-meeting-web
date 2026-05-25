import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import MeetingDatePicker, {
  validateMeetingDate,
  getTodayISO,
} from "../MeetingDatePicker";

afterEach(() => {
  cleanup();
});

describe("MeetingDatePicker", () => {
  it("renders a date input with Korean label", () => {
    const onChange = vi.fn();
    render(<MeetingDatePicker value="" onChange={onChange} />);

    expect(screen.getByText("회의 날짜")).toBeInTheDocument();
    const input = screen.getByTestId("meeting-date-input") as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.type).toBe("date");
  });

  it("displays current value from props (controlled component)", () => {
    const onChange = vi.fn();
    render(<MeetingDatePicker value="2025-03-15" onChange={onChange} />);

    const input = screen.getByTestId("meeting-date-input") as HTMLInputElement;
    expect(input.value).toBe("2025-03-15");
  });

  it("calls onChange with ISO 8601 date string when user selects a date", () => {
    const onChange = vi.fn();
    render(<MeetingDatePicker value="" onChange={onChange} />);

    const input = screen.getByTestId("meeting-date-input") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "2025-06-20" } });

    expect(onChange).toHaveBeenCalledWith("2025-06-20");
  });

  it("shows error after blur when value is empty", () => {
    const onChange = vi.fn();
    render(<MeetingDatePicker value="" onChange={onChange} />);

    const input = screen.getByTestId("meeting-date-input") as HTMLInputElement;
    fireEvent.blur(input);

    expect(
      screen.getByText("회의 날짜를 선택해 주세요.")
    ).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("does not show error before input is touched (blur)", () => {
    const onChange = vi.fn();
    render(<MeetingDatePicker value="" onChange={onChange} />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("does not show error when a valid date is selected and blurred", () => {
    const onChange = vi.fn();
    render(<MeetingDatePicker value="2025-05-25" onChange={onChange} />);

    const input = screen.getByTestId("meeting-date-input") as HTMLInputElement;
    fireEvent.blur(input);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("sets aria-invalid to true when there is an error", () => {
    const onChange = vi.fn();
    render(<MeetingDatePicker value="" onChange={onChange} />);

    const input = screen.getByTestId("meeting-date-input") as HTMLInputElement;
    fireEvent.blur(input);

    expect(input.getAttribute("aria-invalid")).toBe("true");
  });

  it("sets aria-invalid to false when input is valid", () => {
    const onChange = vi.fn();
    render(<MeetingDatePicker value="2025-01-01" onChange={onChange} />);

    const input = screen.getByTestId("meeting-date-input") as HTMLInputElement;
    fireEvent.blur(input);

    expect(input.getAttribute("aria-invalid")).toBe("false");
  });

  it("uses custom id when provided", () => {
    const onChange = vi.fn();
    render(
      <MeetingDatePicker value="" onChange={onChange} id="custom-date" />
    );

    const input = screen.getByTestId("meeting-date-input") as HTMLInputElement;
    expect(input.id).toBe("custom-date");
  });

  it("has label associated with input via htmlFor", () => {
    const onChange = vi.fn();
    render(<MeetingDatePicker value="" onChange={onChange} />);

    const label = screen.getByText("회의 날짜");
    expect(label.tagName).toBe("LABEL");
    expect(label.getAttribute("for")).toBe("meeting-date");
  });

  it("outputs value in ISO 8601 YYYY-MM-DD format", () => {
    const onChange = vi.fn();
    render(<MeetingDatePicker value="" onChange={onChange} />);

    const input = screen.getByTestId("meeting-date-input") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "2025-12-31" } });

    const calledValue = onChange.mock.calls[0][0];
    expect(calledValue).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("validateMeetingDate", () => {
  it("returns error for empty string", () => {
    expect(validateMeetingDate("")).toBe("회의 날짜를 선택해 주세요.");
  });

  it("returns error for whitespace-only string", () => {
    expect(validateMeetingDate("   ")).toBe("회의 날짜를 선택해 주세요.");
  });

  it("returns null for a valid ISO 8601 date", () => {
    expect(validateMeetingDate("2025-05-25")).toBeNull();
  });

  it("returns null for Jan 1st", () => {
    expect(validateMeetingDate("2025-01-01")).toBeNull();
  });

  it("returns null for Dec 31st", () => {
    expect(validateMeetingDate("2025-12-31")).toBeNull();
  });

  it("returns null for a leap year date Feb 29", () => {
    expect(validateMeetingDate("2024-02-29")).toBeNull();
  });

  it("returns error for invalid date format", () => {
    expect(validateMeetingDate("25-05-2025")).toBe(
      "올바른 날짜 형식이 아닙니다. (YYYY-MM-DD)"
    );
  });

  it("returns error for non-date text", () => {
    expect(validateMeetingDate("not-a-date")).toBe(
      "올바른 날짜 형식이 아닙니다. (YYYY-MM-DD)"
    );
  });

  it("returns error for invalid calendar date (Feb 30)", () => {
    expect(validateMeetingDate("2025-02-30")).toBe(
      "유효하지 않은 날짜입니다."
    );
  });

  it("returns error for invalid month (13)", () => {
    expect(validateMeetingDate("2025-13-01")).toBe(
      "유효하지 않은 날짜입니다."
    );
  });

  it("returns error for Feb 29 on a non-leap year", () => {
    expect(validateMeetingDate("2025-02-29")).toBe(
      "유효하지 않은 날짜입니다."
    );
  });
});

describe("getTodayISO", () => {
  it("returns a string in YYYY-MM-DD format", () => {
    const result = getTodayISO();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("returns today's date", () => {
    const result = getTodayISO();
    const now = new Date();
    const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    expect(result).toBe(expected);
  });
});
