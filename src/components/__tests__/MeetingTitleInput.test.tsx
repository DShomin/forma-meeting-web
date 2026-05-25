import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import MeetingTitleInput, {
  validateTitle,
  TITLE_MIN_LENGTH,
  TITLE_MAX_LENGTH,
} from "../MeetingTitleInput";

afterEach(() => {
  cleanup();
});

describe("MeetingTitleInput", () => {
  it("renders a text input with Korean label", () => {
    const onChange = vi.fn();
    render(<MeetingTitleInput value="" onChange={onChange} />);

    expect(screen.getByText("회의 제목")).toBeInTheDocument();
    const input = screen.getByTestId("meeting-title-input") as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.type).toBe("text");
  });

  it("renders with Korean placeholder text", () => {
    const onChange = vi.fn();
    render(<MeetingTitleInput value="" onChange={onChange} />);

    const input = screen.getByTestId("meeting-title-input") as HTMLInputElement;
    expect(input.placeholder).toBe("회의 제목을 입력하세요");
  });

  it("displays current value from props (controlled component)", () => {
    const onChange = vi.fn();
    render(<MeetingTitleInput value="주간 회의" onChange={onChange} />);

    const input = screen.getByTestId("meeting-title-input") as HTMLInputElement;
    expect(input.value).toBe("주간 회의");
  });

  it("calls onChange when user types in the input", () => {
    const onChange = vi.fn();
    render(<MeetingTitleInput value="" onChange={onChange} />);

    const input = screen.getByTestId("meeting-title-input") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "새 회의" } });

    expect(onChange).toHaveBeenCalledWith("새 회의");
  });

  it("has maxLength attribute set to 200", () => {
    const onChange = vi.fn();
    render(<MeetingTitleInput value="" onChange={onChange} />);

    const input = screen.getByTestId("meeting-title-input") as HTMLInputElement;
    expect(input.maxLength).toBe(200);
  });

  it("does not call onChange when value exceeds 200 characters", () => {
    const onChange = vi.fn();
    render(<MeetingTitleInput value="" onChange={onChange} />);

    const input = screen.getByTestId("meeting-title-input") as HTMLInputElement;
    const longValue = "가".repeat(201);
    fireEvent.change(input, { target: { value: longValue } });

    expect(onChange).not.toHaveBeenCalled();
  });

  it("allows exactly 200 characters", () => {
    const onChange = vi.fn();
    render(<MeetingTitleInput value="" onChange={onChange} />);

    const input = screen.getByTestId("meeting-title-input") as HTMLInputElement;
    const exactValue = "가".repeat(200);
    fireEvent.change(input, { target: { value: exactValue } });

    expect(onChange).toHaveBeenCalledWith(exactValue);
  });

  it("shows character counter with trimmed length", () => {
    const onChange = vi.fn();
    render(<MeetingTitleInput value="테스트 회의" onChange={onChange} />);

    // "테스트 회의" trimmed = "테스트 회의" (6 chars, no leading/trailing whitespace)
    expect(screen.getByText("6/200")).toBeInTheDocument();
  });

  it("shows error after blur when value is empty", () => {
    const onChange = vi.fn();
    render(<MeetingTitleInput value="" onChange={onChange} />);

    const input = screen.getByTestId("meeting-title-input") as HTMLInputElement;
    fireEvent.blur(input);

    expect(
      screen.getByText("회의 제목을 입력해 주세요.")
    ).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("does not show error before input is touched (blur)", () => {
    const onChange = vi.fn();
    render(<MeetingTitleInput value="" onChange={onChange} />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows error after blur when value is only whitespace", () => {
    const onChange = vi.fn();
    render(<MeetingTitleInput value="   " onChange={onChange} />);

    const input = screen.getByTestId("meeting-title-input") as HTMLInputElement;
    fireEvent.blur(input);

    expect(
      screen.getByText("회의 제목을 입력해 주세요.")
    ).toBeInTheDocument();
  });

  it("sets aria-invalid to true when there is an error", () => {
    const onChange = vi.fn();
    render(<MeetingTitleInput value="" onChange={onChange} />);

    const input = screen.getByTestId("meeting-title-input") as HTMLInputElement;
    fireEvent.blur(input);

    expect(input.getAttribute("aria-invalid")).toBe("true");
  });

  it("sets aria-invalid to false when input is valid", () => {
    const onChange = vi.fn();
    render(<MeetingTitleInput value="유효한 제목" onChange={onChange} />);

    const input = screen.getByTestId("meeting-title-input") as HTMLInputElement;
    fireEvent.blur(input);

    expect(input.getAttribute("aria-invalid")).toBe("false");
  });

  it("uses custom id when provided", () => {
    const onChange = vi.fn();
    render(
      <MeetingTitleInput value="" onChange={onChange} id="custom-title" />
    );

    const input = screen.getByTestId("meeting-title-input") as HTMLInputElement;
    expect(input.id).toBe("custom-title");
  });

  it("has label associated with input via htmlFor", () => {
    const onChange = vi.fn();
    render(<MeetingTitleInput value="" onChange={onChange} />);

    const label = screen.getByText("회의 제목");
    expect(label.tagName).toBe("LABEL");
    expect(label.getAttribute("for")).toBe("meeting-title");
  });
});

describe("validateTitle", () => {
  it("returns error for empty string", () => {
    expect(validateTitle("")).toBe("회의 제목을 입력해 주세요.");
  });

  it("returns error for whitespace-only string", () => {
    expect(validateTitle("   ")).toBe("회의 제목을 입력해 주세요.");
  });

  it("returns null for valid 1-character title", () => {
    expect(validateTitle("회")).toBeNull();
  });

  it("returns null for valid 200-character title", () => {
    const title = "가".repeat(200);
    expect(validateTitle(title)).toBeNull();
  });

  it("returns error for title exceeding 200 characters", () => {
    const title = "가".repeat(201);
    expect(validateTitle(title)).toBe(
      "회의 제목은 200자 이내로 입력해 주세요."
    );
  });

  it("returns null for a typical Korean title", () => {
    expect(validateTitle("주간 팀 미팅")).toBeNull();
  });

  it("returns null for an English title", () => {
    expect(validateTitle("Weekly Team Meeting")).toBeNull();
  });

  it("returns null for a mixed-language title", () => {
    expect(validateTitle("Q2 분기 전략 회의")).toBeNull();
  });
});

describe("TITLE_MIN_LENGTH / TITLE_MAX_LENGTH", () => {
  it("has TITLE_MIN_LENGTH of 1", () => {
    expect(TITLE_MIN_LENGTH).toBe(1);
  });

  it("has TITLE_MAX_LENGTH of 200", () => {
    expect(TITLE_MAX_LENGTH).toBe(200);
  });
});
