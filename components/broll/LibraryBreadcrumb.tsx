"use client";

import Link from "next/link";
import { ChevronRight, Film } from "lucide-react";

interface Crumb {
  label: string;
  href?: string;
}

interface LibraryBreadcrumbProps {
  crumbs: Crumb[];
}

export function LibraryBreadcrumb({ crumbs }: LibraryBreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <Link href="/studio/broll" className="flex items-center gap-1 hover:text-foreground transition-colors">
        <Film className="w-4 h-4" />
        <span>B-roll Libraries</span>
      </Link>
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          {crumb.href ? (
            <Link href={crumb.href} className="hover:text-foreground transition-colors truncate max-w-[200px]">
              {crumb.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium truncate max-w-[200px]">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
