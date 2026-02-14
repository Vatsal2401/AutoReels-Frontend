"use client";

import React, { createContext, useContext } from "react";
import type { Project } from "./types";

export type SrtCueLike = {
  index: number;
  startSeconds: number;
  endSeconds: number;
  text: string;
};

export type EditorPreviewContextValue = {
  project: Project | null;
  srtCues: SrtCueLike[];
};

const EditorPreviewContext = createContext<EditorPreviewContextValue | null>(null);

export function EditorPreviewProvider({
  project,
  srtCues,
  children,
}: EditorPreviewContextValue & { children: React.ReactNode }) {
  const value = React.useMemo(
    () => ({ project, srtCues: srtCues ?? [] }),
    [project, srtCues]
  );
  return (
    <EditorPreviewContext.Provider value={value}>
      {children}
    </EditorPreviewContext.Provider>
  );
}

export function useEditorPreviewContext(): EditorPreviewContextValue | null {
  return useContext(EditorPreviewContext);
}
