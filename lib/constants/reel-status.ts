/**
 * Centralized reel/media status mapping and guards.
 * Use for Reels list, Editor, and any UI that shows status or gates Edit/Rerender/Retry.
 */

export type ReelApiStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "script_generating"
  | "script_complete"
  | "rendering";

export type ReelDisplayStatus = "draft" | "rendering" | "completed" | "failed";

export interface ReelStatusConfig {
  label: string;
  displayStatus: ReelDisplayStatus;
  variant: "secondary" | "success" | "destructive";
  description: string;
  showRetryIndicator: boolean;
}

const STATUS_CONFIG: Record<string, ReelStatusConfig> = {
  pending: {
    label: "Draft",
    displayStatus: "draft",
    variant: "secondary",
    description: "Not yet started",
    showRetryIndicator: false,
  },
  script_generating: {
    label: "Writing",
    displayStatus: "rendering",
    variant: "secondary",
    description: "Crafting script...",
    showRetryIndicator: false,
  },
  script_complete: {
    label: "Directing",
    displayStatus: "rendering",
    variant: "secondary",
    description: "Sourcing assets...",
    showRetryIndicator: false,
  },
  processing: {
    label: "Rendering",
    displayStatus: "rendering",
    variant: "secondary",
    description: "Creating video...",
    showRetryIndicator: false,
  },
  rendering: {
    label: "Finishing",
    displayStatus: "rendering",
    variant: "secondary",
    description: "Polishing reel...",
    showRetryIndicator: false,
  },
  completed: {
    label: "Completed",
    displayStatus: "completed",
    variant: "success",
    description: "Ready",
    showRetryIndicator: false,
  },
  failed: {
    label: "Failed",
    displayStatus: "failed",
    variant: "destructive",
    description: "Something went wrong",
    showRetryIndicator: true,
  },
};

/** Statuses where the pipeline is actively running (do not allow edit/rerender until done). */
const PROCESSING_STATUSES: Set<string> = new Set([
  "script_generating",
  "script_complete",
  "processing",
  "rendering",
]);

/** Get UI config for a given API status. */
export function getReelStatusConfig(status: string): ReelStatusConfig {
  return (
    STATUS_CONFIG[status] ?? {
      label: status,
      displayStatus: "draft",
      variant: "secondary",
      description: status,
      showRetryIndicator: false,
    }
  );
}

/** True when reel is in a processing/rendering state (do not edit, do not trigger duplicate rerender). */
export function isReelProcessing(status: string): boolean {
  return PROCESSING_STATUSES.has(status) || status === "processing";
}

/**
 * Safe to open in editor (not currently processing).
 * For completed reels: duplicate first then open editor on the new id to avoid overwriting the original.
 */
export function canEditReel(status: string): boolean {
  return !isReelProcessing(status);
}

/** Safe to show "Rerender" / "Export" and trigger POST .../rerender. Disable when processing. */
export function canRerenderReel(status: string): boolean {
  if (isReelProcessing(status)) return false;
  return status === "completed" || status === "failed" || status === "pending";
}

/** Safe to show "Retry" (POST .../retry). Only for failed. */
export function canRetryReel(status: string): boolean {
  return status === "failed";
}
