"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils/format";
import { ChevronDown, Check, User } from "lucide-react";

export interface VoiceSelectOption {
  value: string;
  name: string;
  accent: string;
  gender: "Male" | "Female" | "Neutral";
  style?: string;
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
  const selectedOption = options.find((opt) => opt.value === value);
  const currentIndex = options.findIndex((opt) => opt.value === value);

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
      const maxDropdownHeight = 320;
      
      // Position above if not enough space below
      const shouldPositionAbove = spaceBelow < maxDropdownHeight && spaceAbove > spaceBelow;
      
      // Calculate actual max height based on available space
      const availableSpace = shouldPositionAbove ? spaceAbove - 16 : spaceBelow - 16;
      const maxHeight = Math.min(maxDropdownHeight, availableSpace);
      
      if (shouldPositionAbove) {
        setDropdownPosition({
          bottom: viewportHeight - rect.top, // Perfectly flush
          left: rect.left,
          width: rect.width,
          maxHeight: maxHeight
        });
      } else {
        setDropdownPosition({
          top: rect.bottom, // Perfectly flush
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
  };

  const formatMetadata = (option: VoiceSelectOption): string => {
    return option.style 
      ? `${option.accent} ${option.gender} • ${option.style}` 
      : `${option.accent} ${option.gender}`;
  };

  return (
    <div ref={selectRef} className={cn("relative w-full", className)}>
      {/* Trigger Button */}
      <div className="relative group">
        <button
          type="button"
          id={id}
          name={name}
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          className={cn(
            "flex w-full items-start gap-2 text-left transition-all duration-200",
            "focus:outline-none focus:ring-0",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label={selectedOption ? `Voice: ${selectedOption.name}` : placeholder}
        >
          {/* Voice Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-base font-medium leading-tight",
                selectedOption ? "text-foreground" : "text-muted-foreground"
              )}>
                {selectedOption ? selectedOption.name : placeholder}
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform duration-200 shrink-0",
                  isOpen && "transform rotate-180"
                )}
              />
            </div>
            {selectedOption && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate leading-tight">
                {formatMetadata(selectedOption)}
              </p>
            )}
          </div>
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && mounted && createPortal(
        <>
          <div
            className="fixed inset-0 z-[60]"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div
            className="fixed z-[70] rounded-lg border border-border bg-card shadow-xl backdrop-blur-sm animate-fade-in"
            style={{
              top: dropdownPosition.top !== undefined ? `${dropdownPosition.top}px` : 'auto',
              bottom: dropdownPosition.bottom !== undefined ? `${dropdownPosition.bottom}px` : 'auto',
              left: `${dropdownPosition.left}px`,
              width: `${Math.max(dropdownPosition.width, 240)}px`
            }}
            role="listbox"
          >
            <div 
              ref={optionsRef} 
              className="overflow-auto p-1.5 custom-scrollbar"
              style={{ maxHeight: `${dropdownPosition.maxHeight}px` }}
            >
              {options.map((option, index) => {
                const isSelected = value === option.value;
                const isFocused = focusedIndex === index;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(option.value)}
                    onMouseEnter={() => setFocusedIndex(index)}
                    className={cn(
                      "relative flex w-full cursor-pointer select-none items-start gap-2.5 rounded-md px-2 py-2.5 outline-none transition-all duration-150",
                      "hover:bg-accent/60 hover:text-accent-foreground",
                      isFocused && "bg-accent/40",
                      isSelected && "bg-primary/10 text-primary",
                      "focus:outline-none focus:ring-0"
                    )}
                  >
                    {/* Voice Icon */}
                    <div className={cn(
                      "h-7 w-7 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                      isSelected ? "bg-primary/20 text-primary" : "bg-muted/50 text-muted-foreground"
                    )}>
                      <User size={13} />
                    </div>

                    {/* Voice Details */}
                    <div className="flex-1 min-w-0 py-0.5">
                      <span className={cn(
                        "text-sm font-medium leading-tight block",
                        isSelected && "font-semibold"
                      )}>
                        {option.name}
                      </span>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight opacity-80">
                        {formatMetadata(option)}
                      </p>
                    </div>

                    {/* Check Icon */}
                    {isSelected && (
                      <Check className="h-4 w-4 text-primary shrink-0 mt-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
