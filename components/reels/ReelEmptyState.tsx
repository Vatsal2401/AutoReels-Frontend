"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Video, Plus } from "lucide-react";

interface ReelEmptyStateProps {
  hasFilters?: boolean;
  onClearFilters?: () => void;
}

export function ReelEmptyState({ hasFilters, onClearFilters }: ReelEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 border-2 border-dashed border-border rounded-2xl bg-muted/20">
      <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center mb-6">
        <Video className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">
        {hasFilters ? "No reels match your filters" : "No reels yet"}
      </h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
        {hasFilters
          ? "Try changing search, status, or sort to see more."
          : "Create your first reel from a topic and let AI do the rest."}
      </p>
      {hasFilters && onClearFilters ? (
        <Button variant="outline" onClick={onClearFilters}>
          Clear filters
        </Button>
      ) : (
        <Link href="/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create reel
          </Button>
        </Link>
      )}
    </div>
  );
}
