"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils/format";

export type ReelStatusFilter = "all" | "draft" | "rendering" | "completed" | "failed";
export type ReelSort = "newest" | "oldest" | "duration";

interface ReelFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  statusFilter: ReelStatusFilter;
  onStatusFilterChange: (v: ReelStatusFilter) => void;
  sort: ReelSort;
  onSortChange: (v: ReelSort) => void;
  className?: string;
}

export function ReelFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sort,
  onSortChange,
  className,
}: ReelFiltersProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row gap-4", className)}>
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by title..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select value={statusFilter} onValueChange={(v) => onStatusFilterChange(v as ReelStatusFilter)}>
        <SelectTrigger className="w-full sm:w-[160px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="rendering">Rendering</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="failed">Failed</SelectItem>
        </SelectContent>
      </Select>
      <Select value={sort} onValueChange={(v) => onSortChange(v as ReelSort)}>
        <SelectTrigger className="w-full sm:w-[160px]">
          <SelectValue placeholder="Sort" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest first</SelectItem>
          <SelectItem value="oldest">Oldest first</SelectItem>
          <SelectItem value="duration">Duration</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
