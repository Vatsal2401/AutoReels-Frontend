"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { CreditsIndicator } from "./CreditsIndicator";
import { LogOut, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/format";

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  
  // Landing page should always show public header for SEO
  const isLandingPage = pathname === "/";
  const showPublicHeader = isLandingPage;

  return (
    <header className="sticky top-0 z-50 glass-strong border-b border-border">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link
          href={isAuthenticated && !showPublicHeader ? "/dashboard" : "/"}
          className="flex items-center gap-2 group"
          aria-label="AI Reels - Home"
        >
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-ai transition-all group-hover:scale-105" aria-hidden="true">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            AI Reels
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {isAuthenticated && !showPublicHeader ? (
            <>
              <CreditsIndicator />
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-sm text-muted-foreground">
                  {user?.email}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="hover:text-destructive"
                  aria-label="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="sr-only">Sign out</span>
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log In
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
