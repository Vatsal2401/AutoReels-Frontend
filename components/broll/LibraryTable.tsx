"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "./StatusBadge";
import { brollApi, type BrollLibrary } from "@/lib/api/broll";

interface LibraryTableProps {
  libraries: BrollLibrary[];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function LibraryTable({ libraries }: LibraryTableProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { mutate: deleteLib } = useMutation({
    mutationFn: (id: string) => brollApi.deleteLibrary(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["broll-libraries"] });
      toast.success("Library deleted");
    },
    onError: () => toast.error("Failed to delete library"),
  });

  if (libraries.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground text-sm">
        No libraries yet. Create one to get started.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
            <th className="text-right px-4 py-3 font-medium text-muted-foreground">Videos</th>
            <th className="text-right px-4 py-3 font-medium text-muted-foreground">Indexed</th>
            <th className="text-right px-4 py-3 font-medium text-muted-foreground">Scripts</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Created</th>
            <th className="w-10" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {libraries.map((lib) => (
            <tr key={lib.id} className="hover:bg-muted/20 transition-colors">
              <td className="px-4 py-3">
                <Link
                  href={`/studio/broll/${lib.id}`}
                  className="font-medium hover:text-primary transition-colors"
                >
                  {lib.name}
                </Link>
                {lib.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-xs">{lib.description}</p>
                )}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={lib.status} />
              </td>
              <td className="px-4 py-3 text-right tabular-nums">{lib.videoCount}</td>
              <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                {lib.indexedCount}/{lib.videoCount}
              </td>
              <td className="px-4 py-3 text-right tabular-nums">{lib.scriptCount}</td>
              <td className="px-4 py-3 text-muted-foreground">{formatDate(lib.createdAt)}</td>
              <td className="px-4 py-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push(`/studio/broll/${lib.id}`)}>
                      Open
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => {
                        if (confirm(`Delete "${lib.name}" and all its videos and scripts?`)) {
                          deleteLib(lib.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
