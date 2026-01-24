"use client";

import { useCredits } from "@/lib/hooks/useCredits";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/format";

export function CreditsIndicator() {
  const { credits, isPaid, isLoading } = useCredits();

  if (isLoading) {
    return (
      <Badge variant="secondary" className="glass">
        <Sparkles className="mr-1.5 h-3 w-3 animate-pulse" />
        Loading...
      </Badge>
    );
  }

  if (isPaid) {
    return (
      <Badge
        variant="success"
        className="glass border-primary/30"
      >
        <Sparkles className="mr-1.5 h-3 w-3" />
        Unlimited
      </Badge>
    );
  }

  const hasCredits = credits && credits > 0;

  return (
    <Badge
      variant={hasCredits ? "default" : "destructive"}
      className={cn(
        "glass gap-1.5",
        hasCredits && "border-primary/30"
      )}
    >
      <CreditCard className="h-3 w-3" />
      <span>
        {credits} {credits === 1 ? "credit" : "credits"}
      </span>
    </Badge>
  );
}
