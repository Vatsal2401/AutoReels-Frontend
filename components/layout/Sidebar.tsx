"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useUserSettings } from "@/lib/hooks/useUserSettings";
import { cn } from "@/lib/utils/format";
import {
  LayoutDashboard,
  CreditCard,
  LogOut,
  User,
  Sparkles,
  FolderOpen,
  Palette,
  ChevronDown,
  ChevronRight,
  Share2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { TOOL_REGISTRY, type ToolEntry, type ToolCategory } from "@/lib/studio/tool-registry";
import type { LucideIcon } from "lucide-react";

// ---------------------------------------------------------------------------
// Config: scalable section structure (add items or sections here)
// ---------------------------------------------------------------------------


interface MainNavItem {
  id: string;
  name: string;
  href: string;
  icon: LucideIcon;
  hasSubItems?: boolean;
}

const MAIN_NAV_ITEMS: MainNavItem[] = [
  { id: "dashboard", name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { id: "studio", name: "Studio", href: "/studio", icon: Palette, hasSubItems: true },
  { id: "projects", name: "Projects", href: "/projects", icon: FolderOpen },
  { id: "credits", name: "Credits", href: "/dashboard?purchase=credits", icon: CreditCard },
];

// Optional: separate tool sections (e.g. by category). Currently tools live under Studio only.
type ToolSectionConfig = { label?: string; category?: ToolCategory | null };
const TOOL_SECTIONS: ToolSectionConfig[] = [];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function useIsCollapsed(mobileOpen: boolean, sidebarHovered: boolean) {
  const [isLg, setIsLg] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(min-width: 1024px)");
    setIsLg(m.matches);
    const onChange = () => setIsLg(m.matches);
    m.addEventListener("change", onChange);
    return () => m.removeEventListener("change", onChange);
  }, []);
  return isLg && !sidebarHovered && !mobileOpen;
}

// ---------------------------------------------------------------------------
// Sub-components for clarity and reuse
// ---------------------------------------------------------------------------

function SectionDivider() {
  return (
    <div
      className="my-2 shrink-0 border-t border-border/80"
      aria-hidden
    />
  );
}

function NavItemContent({
  icon: Icon,
  label,
  isActive,
  showLabel,
  showChevron,
  chevronDown,
  className,
}: {
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  showLabel: boolean;
  showChevron?: boolean;
  chevronDown?: boolean;
  className?: string;
}) {
  return (
    <>
      <span
        className={cn(
          "flex items-center justify-center w-9 h-9 shrink-0 rounded-lg transition-colors duration-[150ms] ease-out flex-none",
          isActive ? "text-primary" : "text-muted-foreground group-hover/nav:text-foreground",
          !isActive && "group-hover/nav:bg-muted/40",
          className
        )}
      >
        <Icon className="h-[1.125rem] w-[1.125rem] shrink-0" />
      </span>
      <span
        className={cn(
          "flex-1 text-xs font-medium uppercase tracking-wider truncate min-w-0 transition-opacity duration-[150ms]",
          "lg:w-0 lg:overflow-hidden lg:group-hover:w-auto lg:group-hover:min-w-0",
          "opacity-0 group-hover:opacity-100",
          showLabel && "opacity-100 w-auto",
          isActive ? "text-primary" : "text-muted-foreground group-hover/nav:text-foreground"
        )}
      >
        {label}
      </span>
      {showChevron && (
        <span
          className={cn(
            "shrink-0 opacity-0 transition-opacity duration-[150ms] lg:w-0 lg:overflow-hidden lg:group-hover:w-auto lg:group-hover:opacity-100",
            "group-hover:opacity-100",
            showLabel && "opacity-100 w-auto"
          )}
        >
          {chevronDown ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </span>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------

interface SidebarProps {
  isOpen?: boolean;
  onClose?: (open: boolean) => void;
}

export function Sidebar({ isOpen: forceOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, logout } = useAuth();
  const { socialSchedulerEnabled } = useUserSettings();
  const [isInternalOpen, setIsInternalOpen] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  const isMobileOpen = forceOpen !== undefined ? forceOpen : isInternalOpen;
  const setIsMobileOpen = onClose ?? setIsInternalOpen;
  const isCollapsed = useIsCollapsed(isMobileOpen, isSidebarHovered);

  const isStudioSectionActive =
    pathname === "/studio" || pathname?.startsWith("/studio/");
  const activeSubTool = TOOL_REGISTRY.find(
    (t) =>
      pathname === t.route ||
      (t.route.startsWith("/studio/") && pathname?.startsWith(t.route))
  );
  const isStudioHubActive = pathname === "/studio" && !activeSubTool;

  const isMainNavActive = (item: MainNavItem): boolean => {
    if (item.href === "/studio") return isStudioSectionActive;
    if (item.href === "/projects")
      return pathname === "/projects" || pathname?.startsWith("/projects/");
    if (item.href === "/dashboard?purchase=credits")
      return pathname === "/dashboard" && searchParams?.get("purchase") === "credits";
    if (item.href === "/dashboard")
      return pathname === "/dashboard" && searchParams?.get("purchase") !== "credits";
    return false;
  };

  const isToolActive = (tool: ToolEntry) =>
    pathname === tool.route ||
    (tool.route.startsWith("/studio/") && pathname?.startsWith(tool.route));

  return (
    <>
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden
        />
      )}

      <aside
        data-expanded={isMobileOpen}
        data-collapsed={isCollapsed}
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
        className={cn(
          "fixed left-0 top-0 h-full border-r border-border z-[100] bg-card shadow-sm group overflow-x-hidden",
          "transition-[width] duration-200 ease-out",
          "lg:w-[4.75rem] lg:hover:w-[280px]",
          isMobileOpen ? "w-[280px] translate-x-0" : "w-[280px] -translate-x-full lg:translate-x-0"
        )}
      >
        <div className="h-full flex flex-col min-h-0 w-full min-w-0 overflow-hidden">
          {/* ----- Header ----- */}
          <header
            className={cn(
              "flex h-16 items-center gap-3 border-b border-border shrink-0",
              "px-3 lg:pl-3 lg:pr-2 lg:justify-start lg:group-hover:justify-start group-hover:gap-3"
            )}
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 shrink-0">
              <Sparkles className="h-5 w-5 text-primary shrink-0" />
            </div>
            <div
              className={cn(
                "opacity-0 transition-opacity duration-200 whitespace-nowrap overflow-hidden min-w-0",
                "lg:w-0 lg:group-hover:w-auto lg:group-hover:opacity-100",
                "group-hover:opacity-100",
                isMobileOpen && "opacity-100 w-auto"
              )}
            >
              <h1 className="text-sm font-bold tracking-tight text-foreground truncate">
                AUTOREELS
              </h1>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium truncate mt-0.5">
                Studio
              </p>
            </div>
          </header>

          <div
            className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden flex flex-col min-w-0"
          >
            {/* ----- Main navigation ----- */}
            <nav
              className={cn(
                "py-3 flex flex-col gap-1.5 min-w-0",
                "px-2 lg:pl-3 lg:pr-2 lg:group-hover:px-2"
              )}
              aria-label="Main navigation"
            >
              {MAIN_NAV_ITEMS.map((item) => {
                const isStudio = item.href === "/studio";
                const isActive = isMainNavActive(item);
                const parentHasActiveChild = isStudio && !!activeSubTool;

                return (
                  <div key={item.id} className="flex flex-col gap-0.5 shrink-0">
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      title={item.name}
                      className={cn(
                        "relative flex items-center h-10 rounded-lg transition-colors duration-[150ms] ease-out group/nav",
                        "lg:justify-start lg:gap-0 lg:px-0 lg:w-full lg:max-w-full",
                        "group-hover:justify-start group-hover:gap-3 group-hover:pl-2.5 group-hover:pr-2",
                        "gap-3 pl-2.5 pr-2 min-w-0",
                        parentHasActiveChild && !isStudioHubActive
                          ? "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                          : isActive
                            ? "text-primary hover:bg-primary/5"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                      )}
                    >
                      {/* Subtle vertical accent for active (no heavy background) */}
                      {!isStudio && isActive && (
                        <div
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full"
                          aria-hidden
                        />
                      )}
                      <NavItemContent
                        icon={item.icon}
                        label={item.name}
                        isActive={isActive && !parentHasActiveChild}
                        showLabel={isMobileOpen}
                        showChevron={false}
                        chevronDown={isStudioSectionActive}
                      />
                      {/* Tooltip when collapsed */}
                      {isCollapsed && (
                        <span
                          className={cn(
                            "pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1.5",
                            "rounded-md border border-border bg-popover text-popover-foreground text-xs font-medium shadow-md",
                            "opacity-0 group-hover/nav:opacity-100 transition-opacity duration-150 z-[110] whitespace-nowrap"
                          )}
                          role="tooltip"
                        >
                          {item.name}
                        </span>
                      )}
                    </Link>

                    {/* Studio tools sub-section (expandable) */}
                    {isStudio && item.hasSubItems && (
                      <div
                        className={cn(
                          "overflow-hidden transition-all duration-200 ease-out",
                          "max-h-0 opacity-0 pl-0",
                          "group-hover:max-h-[12rem] group-hover:opacity-100 group-hover:pl-4",
                          "group-data-[expanded=true]:max-h-[12rem] group-data-[expanded=true]:opacity-100 group-data-[expanded=true]:pl-4",
                          "flex flex-col gap-0.5"
                        )}
                      >
                        {TOOL_REGISTRY.map((tool) => (
                          <ToolLink
                            key={tool.id}
                            tool={tool}
                            isActive={isToolActive(tool)}
                            onClick={() => setIsMobileOpen(false)}
                            isCollapsed={isCollapsed}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Social nav item — only when feature flag is enabled */}
            {socialSchedulerEnabled && (
              <>
                <SectionDivider />
                <nav
                  className={cn(
                    "py-1 flex flex-col gap-1.5 min-w-0",
                    "px-2 lg:pl-3 lg:pr-2 lg:group-hover:px-2"
                  )}
                  aria-label="Social navigation"
                >
                  {([
                    { id: "social-accounts", name: "Accounts", href: "/social/accounts" },
                    { id: "social-posts", name: "Posts", href: "/social/posts" },
                  ] as const).map((item) => {
                    const isActive =
                      pathname === item.href || pathname?.startsWith(item.href + '/');
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => setIsMobileOpen(false)}
                        title={item.name}
                        className={cn(
                          "relative flex items-center h-10 rounded-lg transition-colors duration-[150ms] ease-out group/nav",
                          "lg:justify-start lg:gap-0 lg:px-0 lg:w-full lg:max-w-full",
                          "group-hover:justify-start group-hover:gap-3 group-hover:pl-2.5 group-hover:pr-2",
                          "gap-3 pl-2.5 pr-2 min-w-0",
                          isActive
                            ? "text-primary hover:bg-primary/5"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                        )}
                      >
                        {isActive && (
                          <div
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full"
                            aria-hidden
                          />
                        )}
                        <NavItemContent
                          icon={Share2}
                          label={item.name}
                          isActive={isActive}
                          showLabel={isMobileOpen}
                        />
                        {isCollapsed && (
                          <span
                            className={cn(
                              "pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1.5",
                              "rounded-md border border-border bg-popover text-popover-foreground text-xs font-medium shadow-md",
                              "opacity-0 group-hover/nav:opacity-100 transition-opacity duration-150 z-[110] whitespace-nowrap"
                            )}
                            role="tooltip"
                          >
                            Social · {item.name}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </>
            )}

            <SectionDivider />
          </div>

          {/* ----- Account section ----- */}
          <div
            className={cn(
              "border-t border-border shrink-0 min-w-0 overflow-hidden",
              "bg-muted/20 py-2.5 flex flex-col gap-0.5",
              "px-2 lg:pl-3 lg:pr-2 lg:group-hover:px-2"
            )}
          >
            <div
              className={cn(
                "flex items-center gap-2.5 h-11 min-w-0 rounded-lg transition-colors duration-150 hover:bg-muted/40",
                "px-2 lg:px-0 lg:group-hover:px-2",
                "lg:justify-start"
              )}
            >
              <div className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center shrink-0 flex-none">
                <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              </div>
              <div
                className={cn(
                  "min-w-0 flex-1 overflow-hidden truncate opacity-0 transition-opacity duration-150",
                  "lg:w-0 lg:group-hover:w-auto lg:group-hover:opacity-100 group-hover:opacity-100",
                  isMobileOpen && "opacity-100 w-auto"
                )}
              >
                <p className="text-xs font-medium truncate text-foreground">
                  {user?.email?.split("@")[0]}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider truncate">
                  Creator Pro
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              title="Sign out"
              className={cn(
                "relative group/btn flex items-center h-10 gap-2.5 px-2 rounded-lg min-w-0 transition-colors duration-150",
                "lg:justify-start lg:gap-0 lg:px-0 lg:w-full",
                "group-hover:justify-start group-hover:gap-2.5 group-hover:px-2",
                "text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              )}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0 flex-none">
                <LogOut className="h-3.5 w-3.5 shrink-0" />
              </div>
              <span
                className={cn(
                  "opacity-0 transition-opacity duration-150 text-xs font-medium uppercase tracking-wider truncate min-w-0 overflow-hidden",
                  "lg:w-0 lg:group-hover:w-auto lg:group-hover:opacity-100 group-hover:opacity-100",
                  isMobileOpen && "opacity-100 w-auto"
                )}
              >
                Sign Out
              </span>
              {isCollapsed && (
                <span
                  className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1.5 rounded-md border border-border bg-popover text-popover-foreground text-xs font-medium shadow-md opacity-0 group-hover/btn:opacity-100 transition-opacity duration-150 z-[110] whitespace-nowrap"
                  role="tooltip"
                >
                  Sign Out
                </span>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

// Tool link (used under Studio and in optional tool sections)
function ToolLink({
  tool,
  isActive,
  onClick,
  isCollapsed,
}: {
  tool: ToolEntry;
  isActive: boolean;
  onClick: () => void;
  isCollapsed: boolean;
}) {
  const Icon = tool.icon;
  return (
    <Link
      href={tool.route}
      onClick={onClick}
      title={tool.name}
      className={cn(
        "relative flex items-center h-9 rounded-lg transition-colors duration-[150ms] ease-out text-xs font-medium group/tool",
        "pl-3 pr-3 gap-2.5",
        isActive
          ? "text-primary bg-primary/5 border-l-2 border-primary -ml-px pl-[11px]"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
      )}
    >
      <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "text-current")} />
      <span className="truncate min-w-0 uppercase tracking-wider">{tool.name}</span>
      {isCollapsed && (
        <span
          className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1.5 rounded-md border border-border bg-popover text-popover-foreground text-xs font-medium shadow-md opacity-0 group-hover/tool:opacity-100 transition-opacity duration-150 z-[110] whitespace-nowrap"
          role="tooltip"
        >
          {tool.name}
        </span>
      )}
    </Link>
  );
}
