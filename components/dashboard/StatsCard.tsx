"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils/format";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  className,
}: StatsCardProps) {
  const isCredits = title.toLowerCase().includes("credits") || title.toLowerCase().includes("resources");
  const isLow = isCredits && typeof value === 'number' && value <= 3;

  return (
    <Card
      className={cn(
        "relative overflow-hidden group transition-all duration-300 border-border/40 bg-card backdrop-blur-xl",
        "hover:border-primary/20 hover:bg-card/90 hover:shadow-2xl",
        isLow && "border-amber-500/30 bg-amber-500/[0.05]",
        className
      )}
    >
      <CardContent className="px-3 py-3 sm:px-6 sm:py-6">
        <div className="flex items-center justify-between gap-2 sm:gap-6">
          <div className="flex-1 min-w-0">
            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.3em] text-muted-foreground/70 mb-2 sm:mb-3 leading-tight">
              {title}
            </p>
            <div className="flex items-baseline gap-3">
              <h3 className={cn(
                "text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight transition-colors duration-300",
                isLow ? "text-amber-500" : "text-foreground"
              )}>
                {value}
              </h3>
              {trend && !isLow && (
                <span className="text-[9px] font-black text-emerald-500/80 uppercase tracking-tighter">
                  {trend}
                </span>
              )}
            </div>
            
            {isCredits && typeof value === 'number' && (
              <div className="mt-6 w-full h-[2px] bg-secondary rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(255,255,255,0.05)]",
                    isLow ? "bg-amber-500" : "bg-primary"
                  )} 
                  style={{ width: `${Math.min((value / 10) * 100, 100)}%` }}
                />
              </div>
            )}
          </div>
          
          <div className={cn(
            "flex items-center justify-center w-7 h-7 sm:w-10 sm:h-10 rounded-xl sm:rounded-[14px] transition-all duration-500 shrink-0",
            "bg-secondary/50 border border-border shadow-inner",
            isLow ? "border-amber-500/20 bg-amber-500/10" : "group-hover:border-primary/20 group-hover:bg-primary/10"
          )}>
            <Icon className={cn(
               "h-3.5 w-3.5 sm:h-5 sm:w-5 transition-colors duration-500",
               isLow ? "text-amber-500/80" : "text-muted-foreground group-hover:text-primary"
            )} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
