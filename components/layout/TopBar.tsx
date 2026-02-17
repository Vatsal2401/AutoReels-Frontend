"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { CreditsIndicator } from "./CreditsIndicator";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Settings, CreditCard, Sun, Moon, Laptop, Check, Menu, Calendar } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";

interface TopBarProps {
  onMenuClick?: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Page header: label (small), title, subtitle — so TopBar shows section context instead of always "Dashboard"
  const getPageLabel = (): string | null => {
    if (pathname === "/projects") return "Your creations";
    if (pathname === "/studio") return "Tools";
    return null;
  };
  const getPageTitle = (): string => {
    if (pathname === "/studio/reel") return "Create Reel";
    if (pathname?.startsWith("/videos/")) return "Video Details";
    if (pathname === "/projects") return "Projects";
    if (pathname === "/studio") return "AI Creative Studio";
    if (pathname === "/dashboard") {
      if (searchParams?.get("purchase") === "credits") return "Purchase Credits";
      return "Studio Dashboard";
    }
    return "Dashboard";
  };
  const getPageSubtitle = (): string | null => {
    if (pathname === "/projects") return "All your generated reels and other outputs in one place.";
    if (pathname === "/studio") return "Choose a tool below to start creating. Each tool uses credits from your balance.";
    return null;
  };

  const label = getPageLabel();
  const title = getPageTitle();
  const subtitle = getPageSubtitle();

  return (
    <header className="sticky top-0 z-30 glass-strong border-b border-border">
      <div className="flex min-h-14 lg:min-h-[4.5rem] py-3 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden h-9 w-9 text-muted-foreground mr-1 shrink-0"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="min-w-0 flex-1 py-1.5 space-y-0.5">
            {label && (
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/90">
                {label}
              </p>
            )}
            <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-foreground leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[13px] text-muted-foreground/90 leading-snug max-w-xl">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          <CreditsIndicator />
          <Link
            href="https://calendly.com/nirajsheladiya/15min"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-background/80 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
          >
            <Calendar className="h-3 w-3" />
            <span className="hidden sm:inline">Book demo</span>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-ai">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <span className="hidden sm:inline-block text-sm">
                  {user?.email?.split("@")[0]}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-strong w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-tight">{user?.email}</p>
                  <p className="text-xs text-muted-foreground leading-tight">Free Plan</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/dashboard?purchase=credits")}>
                <CreditCard className="mr-2 h-4 w-4" />
                Buy Credits
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => window.open('https://calendly.com/nirajsheladiya/15min', '_blank', 'noopener,noreferrer')}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Book your demo call
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground pt-1">Theme</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setTheme("light")} className="justify-between">
                <div className="flex items-center">
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Light</span>
                </div>
                {theme === "light" && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")} className="justify-between">
                <div className="flex items-center">
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Dark</span>
                </div>
                {theme === "dark" && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")} className="justify-between">
                <div className="flex items-center">
                  <Laptop className="mr-2 h-4 w-4" />
                  <span>System</span>
                </div>
                {theme === "system" && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
