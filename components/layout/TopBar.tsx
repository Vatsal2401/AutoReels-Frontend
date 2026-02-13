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
import { LogOut, User, Settings, CreditCard, Sun, Moon, Laptop, Check, Menu } from "lucide-react";
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

  // Get page title based on pathname
  const getPageTitle = () => {
    if (pathname === "/create") return "Create Reel";
    if (pathname === "/reels") return "My Reels";
    if (pathname?.startsWith("/editor/")) return "Editor";
    if (pathname?.startsWith("/videos/")) return "Video Details";
    if (pathname === "/dashboard") {
      if (searchParams?.get("purchase") === "credits") {
        return "Purchase Credits";
      }
      return "Dashboard";
    }
    return "Dashboard";
  };

  return (
    <header className="sticky top-0 z-30 glass-strong border-b border-border">
      <div className="flex h-14 lg:h-16 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden h-9 w-9 text-muted-foreground mr-1"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h2 className="text-sm lg:text-base font-semibold text-foreground leading-tight truncate max-w-[120px] sm:max-w-none">
            {getPageTitle()}
          </h2>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-4">
          <CreditsIndicator />
          
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
