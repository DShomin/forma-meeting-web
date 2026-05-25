"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Search, X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface SelectOption {
  /** Unique identifier for the option */
  value: string;
  /** Display label shown in the dropdown */
  label: string;
}

export interface SearchableMultiSelectProps {
  /** Available options to choose from */
  options: SelectOption[];
  /** Currently selected values */
  selectedValues: string[];
  /** Callback when selection changes */
  onChange: (selectedValues: string[]) => void;
  /** Placeholder text for the search input */
  placeholder?: string;
  /** Label text displayed above the component */
  label?: string;
  /** Optional id for the search input element */
  id?: string;
  /** Whether the component is disabled */
  disabled?: boolean;
}

export default function SearchableMultiSelect({
  options,
  selectedValues,
  onChange,
  placeholder = "검색...",
  label,
  id = "searchable-multi-select",
  disabled = false,
}: SearchableMultiSelectProps) {
  const [searchText, setSearchText] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter options based on search text
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchText.toLowerCase()),
  );

  const handleToggleOption = useCallback(
    (value: string) => {
      if (selectedValues.includes(value)) {
        onChange(selectedValues.filter((v) => v !== value));
      } else {
        onChange([...selectedValues, value]);
      }
    },
    [selectedValues, onChange],
  );

  const handleRemoveSelected = useCallback(
    (value: string) => {
      onChange(selectedValues.filter((v) => v !== value));
    },
    [selectedValues, onChange],
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchText(e.target.value);
      if (!isOpen) {
        setIsOpen(true);
      }
    },
    [isOpen],
  );

  const handleInputFocus = useCallback(() => {
    if (!disabled) {
      setIsOpen(true);
    }
  }, [disabled]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // Get label for a selected value
  const getOptionLabel = useCallback(
    (value: string): string => {
      return options.find((o) => o.value === value)?.label ?? value;
    },
    [options],
  );

  return (
    <div className="space-y-2" ref={containerRef}>
      {label && <Label htmlFor={id}>{label}</Label>}

      {/* Selected tags */}
      {selectedValues.length > 0 && (
        <div
          className="flex flex-wrap gap-1.5"
          data-testid="selected-tags"
        >
          {selectedValues.map((value) => (
            <Badge
              key={value}
              variant="secondary"
              className="h-7 gap-1 pl-2.5 pr-1 text-sm"
            >
              {getOptionLabel(value)}
              <button
                type="button"
                onClick={() => handleRemoveSelected(value)}
                className="ml-0.5 inline-flex size-5 items-center justify-center rounded-full transition-colors hover:bg-muted-foreground/20"
                aria-label={`${getOptionLabel(value)} 제거`}
                disabled={disabled}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          type="text"
          value={searchText}
          onChange={handleSearchChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          disabled={disabled}
          className="h-11 pl-9 text-base"
          data-testid="search-input"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={`${id}-listbox`}
          autoComplete="off"
        />

        {/* Dropdown list */}
        {isOpen && (
          <ul
            id={`${id}-listbox`}
            role="listbox"
            aria-multiselectable="true"
            className="absolute z-10 mt-1.5 max-h-60 w-full overflow-auto overscroll-contain rounded-xl border border-border bg-card py-1 shadow-lg"
            data-testid="options-listbox"
          >
            {filteredOptions.length === 0 ? (
              <li className="px-4 py-3 text-center text-sm text-muted-foreground">
                검색 결과가 없습니다.
              </li>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = selectedValues.includes(option.value);
                return (
                  <li
                    key={option.value}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleToggleOption(option.value)}
                    className={cn(
                      "flex min-h-[44px] cursor-pointer items-center gap-3 px-4 py-2.5 text-sm transition-colors active:bg-muted",
                      isSelected
                        ? "bg-primary/5 font-medium text-foreground"
                        : "text-foreground hover:bg-muted/50",
                    )}
                    data-testid={`option-${option.value}`}
                  >
                    <span
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input",
                      )}
                    >
                      {isSelected && <Check className="size-3.5" />}
                    </span>
                    <span className="truncate">{option.label}</span>
                  </li>
                );
              })
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
