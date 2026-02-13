"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { cn } from "@/lib/utils/format";
import {
  LayoutDashboard,
  Video,
  Plus,
  CreditCard,
  LogOut,
  User,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Create Reel", href: "/create", icon: Plus },
  { name: "My Reels", href: "/reels", icon: Video },
  { name: "Credits", href: "/dashboard?purchase=credits", icon: CreditCard },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: (open: boolean) => void;
}

export function Sidebar({ isOpen: forceOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, logout } = useAuth();
  const [isInternalOpen, setIsInternalOpen] = useState(false);

  const isMobileOpen = forceOpen !== undefined ? forceOpen : isInternalOpen;
  const setIsMobileOpen = onClose || setIsInternalOpen;

  return (
    <>
      {/* Mobile menu button - REMOVED from here, now in TopBar */}

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar with hover-expand logic */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full border-r border-border z-[100] transition-all duration-500 ease-in-out bg-card/95 backdrop-blur-3xl group",
          "lg:w-20 lg:hover:w-64", // Collapsed by default, expands on hover
          isMobileOpen ? "w-52 translate-x-0" : "w-52 -translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col overflow-hidden">
          {/* Logo Section - Clean & Confidence */}
          <div className="flex h-20 items-center border-b border-border shrink-0">
            <div className="flex items-center justify-center w-20 shrink-0">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className={cn(
              "opacity-0 group-hover:opacity-100 transition-all duration-500 whitespace-nowrap overflow-hidden",
              isMobileOpen && "opacity-100"
            )}>
              <h1 className="text-sm font-black tracking-[0.1em] text-foreground uppercase">
                AUTOREELS
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1 h-1 rounded-full bg-primary" />
                <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-black">Studio</p>
              </div>
            </div>
          </div>

          {/* Navigation - Utilitarian Rhythm */}
          <nav className="flex-1 space-y-1 py-8">
            {navigation.map((item) => {
              let isActive = false;
              const purchaseParam = searchParams?.get("purchase");
              
              if (item.href === "/create") {
                isActive = pathname === "/create";
              } else if (item.href === "/dashboard?purchase=credits") {
                isActive = pathname === "/dashboard" && purchaseParam === "credits";
              } else if (item.href === "/dashboard") {
                isActive = pathname === "/dashboard" && !purchaseParam;
              }
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center h-12 transition-all duration-300 group/nav relative",
                    isActive ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  )}
                >
                  {/* Subtle Active Indicator */}
                  {isActive && (
                    <div className="absolute left-0 w-[3px] h-6 bg-primary rounded-r-full shadow-[0_0_15px_hsl(var(--primary)/0.4)] transition-all" />
                  )}

                  <div className="flex items-center justify-center w-20 shrink-0">
                    <item.icon className={cn(
                      "h-[18px] w-[18px] transition-all duration-500",
                      isActive ? "text-primary" : "text-muted-foreground group-hover/nav:text-foreground group-hover/nav:scale-110"
                    )} />
                  </div>
                  <span className={cn(
                    "opacity-0 group-hover:opacity-100 transition-all duration-500 font-bold text-[10px] uppercase tracking-[0.25em] whitespace-nowrap overflow-hidden ml-[-4px]",
                    isActive ? "text-primary" : "text-muted-foreground group-hover/nav:text-foreground",
                    isMobileOpen && "opacity-100"
                  )}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* User & Sign Out Section - Minimalist */}
          <div className="border-t border-border p-4 space-y-4 shrink-0 bg-muted/20">
            {/* User Info */}
            <div className="flex items-center h-10">
              <div className="flex items-center justify-center w-12 shrink-0">
                <div className="w-7 h-7 rounded-lg bg-background border border-border flex items-center justify-center shadow-sm">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </div>
              <div className={cn(
                "ml-1 opacity-0 group-hover:opacity-100 transition-all duration-500 whitespace-nowrap overflow-hidden min-w-0",
                isMobileOpen && "opacity-100"
              )}>
                <p className="text-[10px] font-black truncate text-foreground leading-tight uppercase tracking-tight">{user?.email?.split('@')[0]}</p>
                <p className="text-[8px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">Creator Pro</p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className={cn(
                "flex items-center w-full h-10 transition-all duration-300 group/logout relative rounded-lg",
                "text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              )}
            >
              <div className="flex items-center justify-center w-12 shrink-0">
                <LogOut className="h-4 w-4 transition-transform group-hover/logout:-translate-x-0.5" />
              </div>
              <span className={cn(
                "opacity-0 group-hover:opacity-100 transition-all duration-500 font-black text-[9px] uppercase tracking-[0.2em] whitespace-nowrap overflow-hidden",
                isMobileOpen && "opacity-100"
              )}>
                Sign Out
              </span>
            </button>
          </div>
        </div>
      </aside>

    </>
  );
}
