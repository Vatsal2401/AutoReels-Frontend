"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Media } from "@/lib/api/media";
import { getReelStatusConfig, isReelProcessing, canEditReel, canRetryReel } from "@/lib/constants/reel-status";
import { formatRelativeTime, cn } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DownloadButton } from "@/components/video/DownloadButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Pencil,
  ExternalLink,
  Copy,
  Trash2,
  Download,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { mediaApi } from "@/lib/api/media";

interface ReelCardProps {
  reel: Media;
  onDeleteClick: (reel: Media) => void;
  onDuplicateSuccess?: (newId: string) => void;
}

function getTitle(reel: Media): string {
  return (reel.input_config?.topic as string) || "Untitled";
}

function getDuration(reel: Media): string {
  return (reel.input_config?.duration as string) || "30-60";
}

export function ReelCard({ reel, onDeleteClick, onDuplicateSuccess }: ReelCardProps) {
  const router = useRouter();
  const [isDuplicating, setIsDuplicating] = useState(false);
  const config = getReelStatusConfig(reel.status);
  const processing = isReelProcessing(reel.status);
  const completed = reel.status === "completed";
  const canEdit = canEditReel(reel.status);
  const showRetry = canRetryReel(reel.status);
  const title = getTitle(reel);
  const duration = getDuration(reel);

  const handleEdit = () => {
    if (!canEdit) return;
    if (reel.status === "completed") {
      setIsDuplicating(true);
      mediaApi
        .duplicateReel(reel.id)
        .then((dup) => {
          onDuplicateSuccess?.(dup.id);
          router.push(`/editor/${dup.id}`);
        })
        .finally(() => setIsDuplicating(false));
    } else {
      router.push(`/editor/${reel.id}`);
    }
  };

  const handleDuplicate = () => {
    setIsDuplicating(true);
    mediaApi
      .duplicateReel(reel.id)
      .then((dup) => {
        onDuplicateSuccess?.(dup.id);
        router.push(`/editor/${dup.id}`);
      })
      .finally(() => setIsDuplicating(false));
  };

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-300 border-border/60 bg-card hover:border-border hover:shadow-lg flex flex-col h-full",
        reel.status === "failed" && "border-destructive/20 bg-destructive/[0.02]"
      )}
    >
      <div className="relative aspect-[9/16] overflow-hidden bg-muted/30 border-b border-border/40">
        {processing && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 z-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        {reel.thumbnail_url && (
          <img
            src={reel.thumbnail_url}
            alt=""
            className="w-full h-full object-cover"
          />
        )}
        {!reel.thumbnail_url && reel.final_url && completed && (
          <video
            src={reel.final_url}
            className="w-full h-full object-cover"
            muted
            playsInline
            preload="metadata"
          />
        )}
        <div className="absolute top-2 left-2 z-20">
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider backdrop-blur-sm border",
              config.variant === "success" && "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
              config.variant === "destructive" && "bg-destructive/10 text-destructive border-destructive/20",
              config.variant === "secondary" && "bg-background/80 text-muted-foreground border-border"
            )}
          >
            {config.label}
          </span>
        </div>
        <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => (canEdit && !isDuplicating && handleEdit())}
                data-disabled={!canEdit || isDuplicating}
                className={(!canEdit || isDuplicating) ? "pointer-events-none opacity-50" : ""}
              >
                {isDuplicating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Pencil className="mr-2 h-4 w-4" />
                )}
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/videos/${reel.id}`)}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Open
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => !isDuplicating && handleDuplicate()}
                data-disabled={isDuplicating}
                className={isDuplicating ? "pointer-events-none opacity-50" : ""}
              >
                {isDuplicating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Copy className="mr-2 h-4 w-4" />
                )}
                Duplicate
              </DropdownMenuItem>
              {completed && (
                <div
                  className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent/50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DownloadButton
                    videoId={reel.id}
                    topic={title}
                    variant="ghost"
                    className="w-full justify-start font-normal h-auto py-0"
                    showIcon={true}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </DownloadButton>
                </div>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDeleteClick(reel)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <CardContent className="p-3 flex flex-col flex-1 min-h-0">
        <h3 className="text-sm font-medium text-foreground line-clamp-2 leading-snug">
          {title}
        </h3>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-1.5">
          <span>{duration}</span>
          <span className="w-0.5 h-0.5 rounded-full bg-border" />
          <span>{formatRelativeTime(reel.created_at)}</span>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs flex-1 min-w-0"
            onClick={() => (canEdit && !isDuplicating && handleEdit())}
            disabled={!canEdit || isDuplicating}
          >
            {isDuplicating ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Pencil className="h-3 w-3 mr-1" />
            )}
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs flex-1 min-w-0"
            onClick={() => router.push(`/videos/${reel.id}`)}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Open
          </Button>
        </div>
        {showRetry && (
          <Link href={`/videos/${reel.id}`} className="mt-2">
            <Button variant="outline" size="sm" className="h-7 text-xs w-full">
              <RotateCcw className="mr-1.5 h-3 w-3" />
              View details / Retry
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
