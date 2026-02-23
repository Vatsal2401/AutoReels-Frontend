"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TOOL_REGISTRY } from "@/lib/studio/tool-registry";
import { cn } from "@/lib/utils/format";

export function ToolsMenu() {
  return (
    <Popover>
      <PopoverTrigger className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors outline-none">
        Tools
        <ChevronDown className="h-3.5 w-3.5 mt-px" />
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={8}
        className="w-72 p-2"
      >
        <p className="px-2 pt-1 pb-2 text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
          AI Studio Tools
        </p>

        <div className="flex flex-col gap-0.5">
          {TOOL_REGISTRY.map((tool) => {
            const Icon = tool.icon;
            const isFree = !tool.creditCost || tool.creditCost === 0;

            return (
              <Link
                key={tool.id}
                href="/signup"
                className="flex items-start gap-3 rounded-lg px-2 py-2.5 hover:bg-muted/60 transition-colors group"
              >
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/8 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground leading-tight">
                      {tool.name}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0",
                        isFree
                          ? "bg-green-100 text-green-700"
                          : "bg-primary/10 text-primary"
                      )}
                    >
                      {isFree ? "Free" : `${tool.creditCost} cr`}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-snug mt-0.5 line-clamp-2">
                    {tool.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-2 pt-2 border-t border-border/50 px-2 pb-1">
          <Link
            href="/signup"
            className="text-xs font-semibold text-primary hover:underline"
          >
            Get started free →
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
