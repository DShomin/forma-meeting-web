import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import SearchableMultiSelect, {
  type SelectOption,
} from "../SearchableMultiSelect";

afterEach(() => {
  cleanup();
});

const mockOptions: SelectOption[] = [
  { value: "user-1", label: "김철수" },
  { value: "user-2", label: "이영희" },
  { value: "user-3", label: "박지민" },
  { value: "user-4", label: "최수진" },
  { value: "user-5", label: "정민호" },
];

describe("SearchableMultiSelect", () => {
  it("renders the search input with placeholder", () => {
    const onChange = vi.fn();
    render(
      <SearchableMultiSelect
        options={mockOptions}
        selectedValues={[]}
        onChange={onChange}
      />,
    );

    const input = screen.getByTestId("search-input") as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.placeholder).toBe("검색...");
  });

  it("renders a custom placeholder when provided", () => {
    const onChange = vi.fn();
    render(
      <SearchableMultiSelect
        options={mockOptions}
        selectedValues={[]}
        onChange={onChange}
        placeholder="참석자 검색..."
      />,
    );

    const input = screen.getByTestId("search-input") as HTMLInputElement;
    expect(input.placeholder).toBe("참석자 검색...");
  });

  it("renders a label when provided", () => {
    const onChange = vi.fn();
    render(
      <SearchableMultiSelect
        options={mockOptions}
        selectedValues={[]}
        onChange={onChange}
        label="참석자"
      />,
    );

    expect(screen.getByText("참석자")).toBeInTheDocument();
  });

  it("opens the dropdown when input is focused", () => {
    const onChange = vi.fn();
    render(
      <SearchableMultiSelect
        options={mockOptions}
        selectedValues={[]}
        onChange={onChange}
      />,
    );

    const input = screen.getByTestId("search-input");
    fireEvent.focus(input);

    const listbox = screen.getByTestId("options-listbox");
    expect(listbox).toBeInTheDocument();
    expect(listbox.getAttribute("role")).toBe("listbox");
  });

  it("displays all options when dropdown is open with no search text", () => {
    const onChange = vi.fn();
    render(
      <SearchableMultiSelect
        options={mockOptions}
        selectedValues={[]}
        onChange={onChange}
      />,
    );

    fireEvent.focus(screen.getByTestId("search-input"));

    for (const option of mockOptions) {
      expect(screen.getByText(option.label)).toBeInTheDocument();
    }
  });

  it("filters options based on search text", () => {
    const onChange = vi.fn();
    render(
      <SearchableMultiSelect
        options={mockOptions}
        selectedValues={[]}
        onChange={onChange}
      />,
    );

    const input = screen.getByTestId("search-input");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "김" } });

    expect(screen.getByText("김철수")).toBeInTheDocument();
    expect(screen.queryByText("이영희")).not.toBeInTheDocument();
    expect(screen.queryByText("박지민")).not.toBeInTheDocument();
  });

  it("filters case-insensitively for latin characters", () => {
    const options: SelectOption[] = [
      { value: "a", label: "Alice" },
      { value: "b", label: "Bob" },
    ];
    const onChange = vi.fn();
    render(
      <SearchableMultiSelect
        options={options}
        selectedValues={[]}
        onChange={onChange}
      />,
    );

    const input = screen.getByTestId("search-input");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "alice" } });

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.queryByText("Bob")).not.toBeInTheDocument();
  });

  it("shows '검색 결과가 없습니다.' when no options match the search", () => {
    const onChange = vi.fn();
    render(
      <SearchableMultiSelect
        options={mockOptions}
        selectedValues={[]}
        onChange={onChange}
      />,
    );

    const input = screen.getByTestId("search-input");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "없는이름" } });

    expect(screen.getByText("검색 결과가 없습니다.")).toBeInTheDocument();
  });

  it("calls onChange with the selected value when an option is clicked", () => {
    const onChange = vi.fn();
    render(
      <SearchableMultiSelect
        options={mockOptions}
        selectedValues={[]}
        onChange={onChange}
      />,
    );

    fireEvent.focus(screen.getByTestId("search-input"));
    fireEvent.click(screen.getByTestId("option-user-1"));

    expect(onChange).toHaveBeenCalledWith(["user-1"]);
  });

  it("adds to existing selection when clicking another option", () => {
    const onChange = vi.fn();
    render(
      <SearchableMultiSelect
        options={mockOptions}
        selectedValues={["user-1"]}
        onChange={onChange}
      />,
    );

    fireEvent.focus(screen.getByTestId("search-input"));
    fireEvent.click(screen.getByTestId("option-user-2"));

    expect(onChange).toHaveBeenCalledWith(["user-1", "user-2"]);
  });

  it("removes from selection when clicking an already-selected option", () => {
    const onChange = vi.fn();
    render(
      <SearchableMultiSelect
        options={mockOptions}
        selectedValues={["user-1", "user-2"]}
        onChange={onChange}
      />,
    );

    fireEvent.focus(screen.getByTestId("search-input"));
    fireEvent.click(screen.getByTestId("option-user-1"));

    expect(onChange).toHaveBeenCalledWith(["user-2"]);
  });

  it("displays selected values as tags", () => {
    const onChange = vi.fn();
    render(
      <SearchableMultiSelect
        options={mockOptions}
        selectedValues={["user-1", "user-3"]}
        onChange={onChange}
      />,
    );

    const tags = screen.getByTestId("selected-tags");
    expect(tags).toBeInTheDocument();
    expect(tags.textContent).toContain("김철수");
    expect(tags.textContent).toContain("박지민");
  });

  it("removes a selected tag when its remove button is clicked", () => {
    const onChange = vi.fn();
    render(
      <SearchableMultiSelect
        options={mockOptions}
        selectedValues={["user-1", "user-2"]}
        onChange={onChange}
      />,
    );

    const removeButton = screen.getByLabelText("김철수 제거");
    fireEvent.click(removeButton);

    expect(onChange).toHaveBeenCalledWith(["user-2"]);
  });

  it("marks selected options with aria-selected=true", () => {
    const onChange = vi.fn();
    render(
      <SearchableMultiSelect
        options={mockOptions}
        selectedValues={["user-2"]}
        onChange={onChange}
      />,
    );

    fireEvent.focus(screen.getByTestId("search-input"));

    const selectedOption = screen.getByTestId("option-user-2");
    expect(selectedOption.getAttribute("aria-selected")).toBe("true");

    const unselectedOption = screen.getByTestId("option-user-1");
    expect(unselectedOption.getAttribute("aria-selected")).toBe("false");
  });

  it("closes the dropdown when clicking outside", () => {
    const onChange = vi.fn();
    render(
      <div>
        <div data-testid="outside">Outside area</div>
        <SearchableMultiSelect
          options={mockOptions}
          selectedValues={[]}
          onChange={onChange}
        />
      </div>,
    );

    fireEvent.focus(screen.getByTestId("search-input"));
    expect(screen.getByTestId("options-listbox")).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByTestId("outside"));
    expect(screen.queryByTestId("options-listbox")).not.toBeInTheDocument();
  });

  it("does not open dropdown when disabled", () => {
    const onChange = vi.fn();
    render(
      <SearchableMultiSelect
        options={mockOptions}
        selectedValues={[]}
        onChange={onChange}
        disabled={true}
      />,
    );

    const input = screen.getByTestId("search-input") as HTMLInputElement;
    expect(input.disabled).toBe(true);

    fireEvent.focus(input);
    expect(screen.queryByTestId("options-listbox")).not.toBeInTheDocument();
  });

  it("has combobox role with aria-expanded attribute", () => {
    const onChange = vi.fn();
    render(
      <SearchableMultiSelect
        options={mockOptions}
        selectedValues={[]}
        onChange={onChange}
      />,
    );

    const input = screen.getByTestId("search-input");
    expect(input.getAttribute("role")).toBe("combobox");
    expect(input.getAttribute("aria-expanded")).toBe("false");

    fireEvent.focus(input);
    expect(input.getAttribute("aria-expanded")).toBe("true");
  });

  it("does not show selected-tags container when nothing is selected", () => {
    const onChange = vi.fn();
    render(
      <SearchableMultiSelect
        options={mockOptions}
        selectedValues={[]}
        onChange={onChange}
      />,
    );

    expect(screen.queryByTestId("selected-tags")).not.toBeInTheDocument();
  });

  it("supports selecting multiple options", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <SearchableMultiSelect
        options={mockOptions}
        selectedValues={[]}
        onChange={onChange}
      />,
    );

    fireEvent.focus(screen.getByTestId("search-input"));
    fireEvent.click(screen.getByTestId("option-user-1"));
    expect(onChange).toHaveBeenCalledWith(["user-1"]);

    // Simulate parent re-rendering with updated state
    rerender(
      <SearchableMultiSelect
        options={mockOptions}
        selectedValues={["user-1"]}
        onChange={onChange}
      />,
    );

    fireEvent.focus(screen.getByTestId("search-input"));
    fireEvent.click(screen.getByTestId("option-user-3"));
    expect(onChange).toHaveBeenCalledWith(["user-1", "user-3"]);
  });

  it("opens the dropdown when typing into search", () => {
    const onChange = vi.fn();
    render(
      <SearchableMultiSelect
        options={mockOptions}
        selectedValues={[]}
        onChange={onChange}
      />,
    );

    const input = screen.getByTestId("search-input");
    // Don't focus first — just type
    fireEvent.change(input, { target: { value: "김" } });

    expect(screen.getByTestId("options-listbox")).toBeInTheDocument();
  });
});
