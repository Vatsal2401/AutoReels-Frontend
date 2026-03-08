"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { brollApi } from "@/lib/api/broll";
import { toast } from "sonner";

interface ExportMenuProps {
  libraryId: string;
  scriptId: string;
  scriptName: string;
}

export function ExportMenu({ libraryId, scriptId, scriptName }: ExportMenuProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: "csv" | "json" | "edl") => {
    setIsExporting(true);
    try {
      const data = await brollApi.exportScript(libraryId, scriptId, format);
      const ext = format === "json" ? "json" : format === "edl" ? "edl" : "csv";
      const mimeTypes = { csv: "text/csv", json: "application/json", edl: "text/plain" };
      const blob = new Blob([data.content], { type: mimeTypes[format] });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${scriptName.replace(/\s+/g, "-").toLowerCase()}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5" disabled={isExporting}>
          {isExporting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport("csv")}>CSV</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("json")}>JSON Timeline</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("edl")}>EDL</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
