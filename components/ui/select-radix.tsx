"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { cn } from "@/lib/utils/format";
import { ChevronDown, Check } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectRadixProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function SelectRadix({
  value,
  onChange,
  options,
  placeholder = "Select option",
  className,
  disabled = false,
}: SelectRadixProps) {
  return (
    <SelectPrimitive.Root
      value={value}
      onValueChange={onChange}
      disabled={disabled}
    >
      <SelectPrimitive.Trigger
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-lg border border-border bg-background px-4 py-2 text-sm transition-all duration-200 text-left shadow-sm",
          "hover:border-input-hover hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50",
          "focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary",
          "data-[placeholder]:text-muted-foreground",
          className
        )}
      >
        <div className="flex-1 min-w-0 flex items-center">
          <SelectPrimitive.Value placeholder={placeholder}>
            <span className="truncate whitespace-nowrap font-bold">
              {options.find((opt) => opt.value === value)?.label}
            </span>
          </SelectPrimitive.Value>
        </div>
        <SelectPrimitive.Icon asChild>
          <ChevronDown className="h-4 w-4 text-muted-foreground/50 transition-transform duration-200 shrink-0 ml-2 group-data-[state=open]:rotate-180" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className={cn(
            "relative z-50 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-lg",
            "animate-in fade-in zoom-in-95 duration-100"
          )}
          position="popper"
          sideOffset={5}
        >
          <SelectPrimitive.Viewport className="p-1">
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                className={cn(
                  "relative flex w-full cursor-default select-none items-center rounded-md px-4 py-2.5 text-sm outline-none transition-colors",
                  "focus:bg-zinc-100 dark:focus:bg-zinc-800",
                  "data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                )}
              >
                <SelectPrimitive.ItemText>
                  <span className="font-bold tracking-tight">{option.label}</span>
                </SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="ml-3 shrink-0">
                  <Check className="h-3.5 w-3.5" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
