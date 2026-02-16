"use client";

import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TOOL_REGISTRY } from "@/lib/studio/tool-registry";
import type { ToolEntry } from "@/lib/studio/tool-registry";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils/format";
import { ArrowRight } from "lucide-react";

// 8pt-based vertical rhythm: icon+title group → description → divider+footer
const CARD_PX = "px-5";
const CARD_PY = "py-5";
const GAP_ICON_TITLE = "gap-2";       // 8px — tight icon + title group
const TITLE_TO_DESC = "mt-3";         // 12px — description block
const DESC_TO_FOOTER = "mt-4";       // 16px — before divider
const DIVIDER_PT = "pt-3";           // 12px — divider to footer content
const FOOTER_PT = "pt-3";            // 12px — footer content

export default function StudioHubPage() {
  const router = useRouter();

  return (
    <DashboardLayout>
      <div className="h-full overflow-y-auto custom-scrollbar bg-muted/20 min-h-full">
        <div className="max-w-6xl mx-auto p-6 sm:p-8 lg:p-14">
          {/* Tool cards — title/subtitle live in TopBar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {TOOL_REGISTRY.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                onSelect={() => !tool.comingSoon && router.push(tool.route)}
              />
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function ToolCard({ tool, onSelect }: { tool: ToolEntry; onSelect: () => void }) {
  const Icon = tool.icon;
  const isReel = tool.id === "reel";
  const isActive = !tool.comingSoon;

  return (
    <Card
      role={isActive ? "button" : undefined}
      tabIndex={isActive ? 0 : undefined}
      onKeyDown={
        isActive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect();
              }
            }
          : undefined
      }
      className={cn(
        "flex flex-col min-h-[260px] overflow-hidden rounded-xl",
        "border border-border/50 bg-card shadow-[0_1px_3px_rgba(0,0,0,0.04)]",
        "transition-all duration-[180ms] ease-out",
        "group/card",
        isActive && [
          "cursor-pointer",
          "hover:border-primary/20 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:shadow-primary/5 hover:-translate-y-0.5",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        ],
        !isActive && "cursor-default",
        isReel && isActive && "ring-1 ring-primary/10 border-primary/15 bg-primary/[0.02]"
      )}
      onClick={isActive ? onSelect : undefined}
    >
      <CardContent
        className={cn(
          CARD_PX,
          CARD_PY,
          "flex flex-col flex-1 min-h-0"
        )}
      >
        {/* Block 1: Icon + Title (tight group) + badge */}
        <div className={cn("flex items-start justify-between", GAP_ICON_TITLE)}>
          <div className={cn("flex items-center gap-2 min-w-0 flex-1")}>
            <div
              className={cn(
                "w-11 h-11 rounded-lg flex items-center justify-center shrink-0 border",
                isReel && isActive
                  ? "bg-primary/10 border-primary/15"
                  : "bg-muted/50 border-border/60"
              )}
            >
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold text-[15px] text-foreground leading-tight truncate pt-0.5">
              {tool.name}
            </h3>
          </div>
          {(isReel && isActive) || tool.comingSoon ? (
            <span
              className={cn(
                "shrink-0 rounded-md px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider",
                isReel && isActive && "bg-primary/10 text-primary",
                tool.comingSoon && "bg-muted/80 text-muted-foreground"
              )}
            >
              {isReel && isActive ? "Popular" : "Coming soon"}
            </span>
          ) : null}
        </div>

        {/* Block 2: Description */}
        <p
          className={cn(
            "flex-1 min-h-0 text-sm text-muted-foreground/80 leading-relaxed line-clamp-3",
            TITLE_TO_DESC
          )}
        >
          {tool.description}
        </p>

        {/* Block 3: Divider + footer (anchored) */}
        <div className={cn("mt-auto border-t border-border/50", DESC_TO_FOOTER, DIVIDER_PT, FOOTER_PT)}>
          <div className="flex items-center justify-between gap-3 min-h-[1.75rem]">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/90">
              {tool.creditCost != null ? `${tool.creditCost} credit${tool.creditCost === 1 ? "" : "s"}` : ""}
            </span>
            {isActive ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary uppercase tracking-wider">
                Open
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/card:translate-x-0.5" />
              </span>
            ) : (
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80">
                Coming soon
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
