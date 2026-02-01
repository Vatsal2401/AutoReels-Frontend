"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils/format";
import { ChevronDown, Check } from "lucide-react";

export interface VoiceSelectOption {
  value: string;
  label: string;
  meta: string;
  description?: string;
}

export interface VoiceSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: VoiceSelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
}

export function VoiceSelect({
  value,
  onChange,
  options,
  placeholder = "Select a voice",
  className,
  disabled = false,
  id,
  name,
}: VoiceSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [focusedIndex, setFocusedIndex] = React.useState(-1);
  const [mounted, setMounted] = React.useState(false);
  const [dropdownPosition, setDropdownPosition] = React.useState<{
    top?: number;
    bottom?: number;
    left: number;
    width: number;
    maxHeight: number;
  }>({ left: 0, width: 0, maxHeight: 320 });
  const selectRef = React.useRef<HTMLDivElement>(null);
  const optionsRef = React.useRef<HTMLDivElement>(null);
  
  /** ✅ SINGLE SOURCE OF TRUTH - Always derive from value prop */
  const selectedOption = React.useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value]
  );
  const currentIndex = React.useMemo(
    () => options.findIndex((opt) => opt.value === value),
    [options, value]
  );

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate dropdown position when opening
  React.useEffect(() => {
    if (isOpen && selectRef.current) {
      const rect = selectRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      const maxDropdownHeight = 280;
      
      // Position above if not enough space below
      const shouldPositionAbove = spaceBelow < maxDropdownHeight && spaceAbove > spaceBelow;
      
      // Calculate actual max height based on available space
      const availableSpace = shouldPositionAbove ? spaceAbove - 8 : spaceBelow - 8;
      const maxHeight = Math.min(maxDropdownHeight, availableSpace);
      
      if (shouldPositionAbove) {
        setDropdownPosition({
          bottom: viewportHeight - rect.top,
          left: rect.left,
          width: rect.width,
          maxHeight: maxHeight
        });
      } else {
        setDropdownPosition({
          top: rect.bottom,
          left: rect.left,
          width: rect.width,
          maxHeight: maxHeight
        });
      }
    }
  }, [isOpen]);

  // Close dropdown on click outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(currentIndex >= 0 ? currentIndex : 0);
        } else if (focusedIndex >= 0) {
          handleSelect(options[focusedIndex].value);
        }
        break;
      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(currentIndex >= 0 ? currentIndex : 0);
        } else {
          setFocusedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (isOpen) {
          setFocusedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
    }
  };

  // Scroll focused item into view
  React.useEffect(() => {
    if (isOpen && focusedIndex >= 0 && optionsRef.current) {
      const optionElement = optionsRef.current.children[focusedIndex] as HTMLElement;
      if (optionElement) {
        optionElement.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [focusedIndex, isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  return (
    <div ref={selectRef} className={cn("relative w-full", className)}>
      {/* Trigger Button */}
      <button
        type="button"
        id={id}
        name={name}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={cn(
          "group flex min-h-[56px] w-full items-center justify-between rounded-lg border border-border bg-background px-4 py-2 text-sm transition-all duration-200 text-left shadow-sm",
          "hover:border-input-hover hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50",
          "focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary",
          "disabled:cursor-not-allowed disabled:opacity-50",
          isOpen && "border-primary ring-1 ring-primary bg-background",
          className
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={selectedOption ? `Voice: ${selectedOption.label}` : placeholder}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className={cn(
              "text-sm font-semibold tracking-tight truncate",
              selectedOption ? "text-foreground" : "text-muted-foreground"
            )}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground/50 transition-transform duration-200 shrink-0 ml-2",
                isOpen && "transform rotate-180 text-foreground"
              )}
            />
          </div>
          {selectedOption && (
            <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">
              {selectedOption.meta}
            </p>
          )}
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && mounted && createPortal(
        <>
          <div
            className="fixed inset-0 z-[100]"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div
            className={cn(
              "fixed z-[110] rounded-lg border border-border bg-popover shadow-lg overflow-hidden",
              "animate-in fade-in slide-in-from-top-1 duration-150 ease-out"
            )}
            style={{
              top: dropdownPosition.top !== undefined ? `${dropdownPosition.top + 2}px` : 'auto',
              bottom: dropdownPosition.bottom !== undefined ? `${dropdownPosition.bottom + 2}px` : 'auto',
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`
            }}
            role="listbox"
          >
            <div 
              ref={optionsRef} 
              className="overflow-auto py-1 custom-scrollbar"
              style={{ maxHeight: `${dropdownPosition.maxHeight}px` }}
            >
              {options.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground font-medium">
                  No voices found
                </div>
              ) : (
                options.map((option, index) => {
                  const isSelected = value === option.value;
                  const isFocused = focusedIndex === index;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(option.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleSelect(option.value);
                        }
                      }}
                      onMouseEnter={() => setFocusedIndex(index)}
                      className={cn(
                        "relative flex w-full cursor-pointer select-none items-center px-4 py-2.5 outline-none transition-colors",
                        isFocused && "bg-zinc-100 dark:bg-zinc-800",
                        isSelected && "bg-zinc-50 dark:bg-zinc-900",
                      )}
                    >
                      <div className="flex-1 min-w-0 text-left flex flex-col">
                        <span className={cn(
                          "text-sm font-semibold tracking-tight transition-colors truncate",
                          isSelected ? "text-foreground" : "text-foreground/90"
                        )}>
                          {option.label}
                        </span>
                        <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">
                          {option.meta}
                        </p>
                      </div>

                      {isSelected && (
                        <Check className="h-3.5 w-3.5 text-foreground shrink-0 ml-3" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
