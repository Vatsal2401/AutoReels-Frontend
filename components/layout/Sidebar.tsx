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
  { name: "My Reels", href: "/dashboard", icon: Video },
  { name: "Credits", href: "/dashboard?purchase=credits", icon: CreditCard },
];

export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="glass"
        >
          {isMobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

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
          "fixed left-0 top-0 h-full border-r border-white/5 z-[100] transition-all duration-500 ease-in-out bg-black/40 backdrop-blur-3xl group",
          "lg:w-20 lg:hover:w-64", // Collapsed by default, expands on hover
          isMobileOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col overflow-hidden">
          {/* Logo Section - Clean & Confidence */}
          <div className="flex h-20 items-center border-b border-white/[0.03] shrink-0">
            <div className="flex items-center justify-center w-20 shrink-0">
              <Sparkles className="h-5 w-5 text-primary/60" />
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 whitespace-nowrap overflow-hidden">
              <h1 className="text-sm font-black tracking-[0.1em] text-zinc-200 uppercase">
                AI REELS
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1 h-1 rounded-full bg-primary/40" />
                <p className="text-[9px] text-zinc-600 uppercase tracking-widest font-black">Studio</p>
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
                    isActive ? "text-zinc-100" : "text-zinc-600 hover:text-zinc-300"
                  )}
                >
                  {/* Subtle Active Indicator */}
                  {isActive && (
                    <div className="absolute left-0 w-[3px] h-6 bg-primary rounded-r-full shadow-[0_0_10px_rgba(124,58,237,0.3)] transition-all" />
                  )}

                  <div className="flex items-center justify-center w-20 shrink-0">
                    <item.icon className={cn(
                      "h-[18px] w-[18px] transition-all duration-500",
                      isActive ? "text-primary/90" : "group-hover/nav:scale-110"
                    )} />
                  </div>
                  <span className={cn(
                    "opacity-0 group-hover:opacity-100 transition-all duration-500 font-bold text-[10px] uppercase tracking-[0.25em] whitespace-nowrap overflow-hidden ml-[-4px]",
                    isActive ? "text-zinc-200" : "text-zinc-500 group-hover/nav:text-zinc-300"
                  )}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* User & Sign Out Section - Minimalist */}
          <div className="border-t border-white/[0.03] p-4 space-y-4 shrink-0 bg-black/20">
            {/* User Info */}
            <div className="flex items-center h-10">
              <div className="flex items-center justify-center w-12 shrink-0">
                <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center">
                  <User className="h-3.5 w-3.5 text-zinc-600" />
                </div>
              </div>
              <div className="ml-1 opacity-0 group-hover:opacity-100 transition-all duration-500 whitespace-nowrap overflow-hidden min-w-0">
                <p className="text-[10px] font-black truncate text-zinc-400 leading-tight uppercase tracking-tight">{user?.email?.split('@')[0]}</p>
                <p className="text-[8px] text-zinc-700 font-black uppercase tracking-widest mt-0.5">Creator Pro</p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className={cn(
                "flex items-center w-full h-10 transition-all duration-300 group/logout relative rounded-lg",
                "text-zinc-700 hover:bg-red-500/5 hover:text-red-500/80"
              )}
            >
              <div className="flex items-center justify-center w-12 shrink-0">
                <LogOut className="h-4 w-4 transition-transform group-hover/logout:-translate-x-0.5" />
              </div>
              <span className="opacity-0 group-hover:opacity-100 transition-all duration-500 font-black text-[9px] uppercase tracking-[0.2em] whitespace-nowrap overflow-hidden">
                Sign Out
              </span>
            </button>
          </div>
        </div>
      </aside>

    </>
  );
}
