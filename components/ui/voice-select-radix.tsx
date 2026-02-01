"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { cn } from "@/lib/utils/format";
import { ChevronDown, Check } from "lucide-react";

export interface VoiceSelectOption {
  value: string;
  label: string;
  meta: string;
  description?: string;
}

export interface VoiceSelectRadixProps {
  value: string;
  onChange: (value: string) => void;
  options: VoiceSelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function VoiceSelectRadix({
  value,
  onChange,
  options,
  placeholder = "Select a voice",
  className,
  disabled = false,
}: VoiceSelectRadixProps) {
  return (
    <SelectPrimitive.Root
      value={value}
      onValueChange={onChange}
      disabled={disabled}
    >
      <SelectPrimitive.Trigger
        className={cn(
          "flex min-h-[56px] w-full items-center justify-between rounded-lg border border-border bg-background px-4 py-2 text-sm transition-all duration-200 text-left shadow-sm",
          "hover:border-input-hover hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50",
          "focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary",
          "data-[placeholder]:text-muted-foreground",
          className
        )}
      >
        <div className="flex-1 min-w-0">
          <SelectPrimitive.Value placeholder={placeholder}>
            <span className="font-bold">{options.find((opt) => opt.value === value)?.label}</span>
          </SelectPrimitive.Value>
          {value && options.find((opt) => opt.value === value) && (
             <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">
               {options.find((opt) => opt.value === value)?.meta}
             </p>
          )}
        </div>
        <SelectPrimitive.Icon asChild>
          <ChevronDown className="h-4 w-4 text-muted-foreground/50 transition-transform duration-200 shrink-0 ml-2 group-data-[state=open]:rotate-180" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className={cn(
            "relative z-50 min-w-[var(--radix-select-trigger-width)] max-h-[300px] overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-lg",
            "animate-in fade-in zoom-in-95 duration-100"
          )}
          position="popper"
          sideOffset={5}
        >
          <SelectPrimitive.Viewport className="p-1 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800 scrollbar-track-transparent">
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                className={cn(
                  "relative flex w-full cursor-default select-none items-center rounded-md px-3 py-2 text-sm outline-none transition-colors",
                  "focus:bg-zinc-100 dark:focus:bg-zinc-800",
                  "data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                )}
              >
                <div className="flex-1 min-w-0 flex flex-col">
                  <SelectPrimitive.ItemText>
                    <span className="font-bold tracking-tight leading-tight">{option.label}</span>
                  </SelectPrimitive.ItemText>
                  <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5 opacity-80">
                    {option.meta}
                  </p>
                </div>
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
