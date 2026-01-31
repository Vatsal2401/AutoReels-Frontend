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
        "relative overflow-hidden group transition-all duration-300 border-white/5 bg-zinc-900/40 backdrop-blur-xl",
        "hover:border-white/10 hover:bg-zinc-900/50 hover:shadow-2xl",
        isLow && "border-amber-500/10 bg-amber-500/[0.02]",
        className
      )}
    >
      <CardContent className="px-8 pb-8 pt-8">
        <div className="flex items-center justify-between gap-6">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-3">
              {title}
            </p>
            <div className="flex items-baseline gap-3">
              <h3 className={cn(
                "text-3xl font-bold tracking-tight transition-colors duration-300",
                isLow ? "text-amber-500/90" : "text-zinc-200"
              )}>
                {value}
              </h3>
              {trend && !isLow && (
                <span className="text-[9px] font-black text-emerald-500/60 uppercase tracking-tighter">
                  {trend}
                </span>
              )}
            </div>
            
            {isCredits && typeof value === 'number' && (
              <div className="mt-6 w-full h-[2px] bg-white/5 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(255,255,255,0.05)]",
                    isLow ? "bg-amber-500/60" : "bg-primary/60"
                  )} 
                  style={{ width: `${Math.min((value / 10) * 100, 100)}%` }}
                />
              </div>
            )}
          </div>
          
          <div className={cn(
            "flex items-center justify-center w-12 h-12 rounded-[18px] transition-all duration-500 shrink-0",
            "bg-black/40 border border-white/5 shadow-inner",
            isLow ? "border-amber-500/10 bg-amber-500/5" : "group-hover:border-primary/20 group-hover:bg-primary/10"
          )}>
            <Icon className={cn(
               "h-5 w-5 transition-colors duration-500",
               isLow ? "text-amber-500/40" : "text-zinc-700 group-hover:text-primary/60"
            )} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
