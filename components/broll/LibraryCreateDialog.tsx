"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { brollApi } from "@/lib/api/broll";

interface LibraryCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LibraryCreateDialog({ open, onOpenChange }: LibraryCreateDialogProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: () => brollApi.createLibrary({ name: name.trim(), description: description.trim() || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["broll-libraries"] });
      toast.success("Library created");
      setName("");
      setDescription("");
      onOpenChange(false);
    },
    onError: () => toast.error("Failed to create library"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create B-roll Library</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Agency Hero Reel"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Description <span className="text-muted-foreground font-normal">(optional)</span></label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What kind of footage is in this library?"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => mutate()} disabled={!name.trim() || isPending}>
            {isPending ? "Creating…" : "Create Library"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
