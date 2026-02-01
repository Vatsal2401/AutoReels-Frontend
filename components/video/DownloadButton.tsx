"use client";

import { useState } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { Loader2, Download } from "lucide-react";
import { videosApi } from "@/lib/api/videos";
import { cn } from "@/lib/utils/format";

interface DownloadButtonProps extends ButtonProps {
  videoId: string;
  topic: string;
  showIcon?: boolean;
}

export function DownloadButton({ 
  videoId, 
  topic, 
  className, 
  children, 
  showIcon = true,
  ...props 
}: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const getSanitizedFilename = (text: string) => {
    // Take first 5 words or 40 chars, whichever is shorter
    const truncated = text.split(' ').slice(0, 5).join(' ').substring(0, 40);
    // Remove special chars and ensure valid filename
    const clean = truncated.replace(/[^a-z0-9\s-]/gi, '').trim().replace(/\s+/g, '-');
    return `AI-GEN-REELS-${clean}-${Date.now().toString().slice(-4)}.mp4`;
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isDownloading) return;
    
    setIsDownloading(true);
    try {
      const response = await videosApi.getDownloadUrl(videoId);
      if (response?.url) {
        // Fetch blob to bypass cross-origin restrictions
        const fetchRes = await fetch(response.url);
        const blob = await fetchRes.blob();
        
        const filename = getSanitizedFilename(topic);

        // Try using modern File System Access API for "Save As" dialog
        if ('showSaveFilePicker' in window) {
           try {
             const handle = await (window as any).showSaveFilePicker({
               suggestedName: filename,
               types: [{
                 description: 'MP4 Video',
                 accept: { 'video/mp4': ['.mp4'] },
               }],
             });
             const writable = await handle.createWritable();
             await writable.write(blob);
             await writable.close();
             return; // Success, exit
           } catch (err: any) {
             if (err.name === 'AbortError') return; // User cancelled
             // If other error, fall through to default download
             console.warn('File Picker failed, falling back to auto-download', err);
           }
        }

        // Fallback: Default browser download (Auto-save or Browser setting)
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Download failed", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={isDownloading}
      className={cn("transition-all", className)}
      {...props}
    >
      {isDownloading ? (
        <Loader2 className={cn("animate-spin", showIcon && children ? "mr-2 h-4 w-4" : "")} size={16} />
      ) : showIcon ? (
        <Download className={cn(children ? "mr-2 h-4 w-4" : "")} size={16} />
      ) : null}
      
      {isDownloading && !children ? "Saving..." : children}
    </Button>
  );
}
