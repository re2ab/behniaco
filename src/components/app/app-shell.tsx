import { useState } from "react";
import type { ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  KanbanSquare,
  FolderKanban,
  CheckSquare,
  Users,
  Mail,
  FileText,
  FileSignature,
  Wallet,
  BarChart3,
  Settings,
  Search,
  Bell,
  Languages,
  Moon,
  Sun,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useI18n, useTheme } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { initials } from "@/lib/domain";

const NAV = [
  { to: "/dashboard", key: "dashboard", icon: LayoutDashboard },
  { to: "/pipeline", key: "pipeline", icon: KanbanSquare },
  { to: "/cases", key: "cases", icon: FolderKanban },
  { to: "/tasks", key: "tasks", icon: CheckSquare },
  { to: "/contacts", key: "contacts", icon: Users },
  { to: "/emails", key: "emails", icon: Mail },
  { to: "/documents", key: "documents", icon: FileText },
  { to: "/proposals", key: "proposals", icon: FileSignature },
  { to: "/finance", key: "finance", icon: Wallet },
  { to: "/reports", key: "reports", icon: BarChart3 },
  { to: "/settings", key: "settings", icon: Settings },
] as const;

function NavList({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const { t } = useI18n();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto scroll-slim px-2 py-3">
      {NAV.map((item) => {
        const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
        const Icon = item.icon;
        const link = (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            aria-label={t(item.key)}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              collapsed && "justify-center px-0",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            )}
          >
            <span className="relative flex items-center">
              {active && (
                <span className="absolute -start-3 h-5 w-0.5 rounded-full bg-sidebar-primary" />
              )}
              <Icon className="size-4.5 shrink-0" />
            </span>
            {!collapsed && <span className="truncate">{t(item.key)}</span>}
          </Link>
        );
        return collapsed ? (
          <Tooltip key={item.to}>
            <TooltipTrigger asChild>{link}</TooltipTrigger>
            <TooltipContent side="left">{t(item.key)}</TooltipContent>
          </Tooltip>
        ) : (
          link
        );
      })}
    </nav>
  );
}

function SidebarInner({
  collapsed,
  onToggle,
  onNavigate,
}: {
  collapsed: boolean;
  onToggle?: () => void;
  onNavigate?: () => void;
}) {
  const { t } = useI18n();
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div
        className={cn(
          "flex items-center gap-2.5 border-b border-sidebar-border px-4 py-4",
          collapsed && "justify-center px-0",
        )}
      >
        <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-sidebar-primary text-sm font-bold text-sidebar-primary-foreground">
          R
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-sidebar-accent-foreground">
              {t("app")}
            </p>
            <p className="truncate text-[11px] text-sidebar-foreground/60">RFQ Core v15</p>
          </div>
        )}
      </div>

      <NavList collapsed={collapsed} onNavigate={onNavigate} />

      {onToggle && (
        <div className="border-t border-sidebar-border p-2">
          <button
            onClick={onToggle}
            aria-label={collapsed ? t("expand") : t("collapse")}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
          >
            {collapsed ? (
              <PanelLeftOpen className="mx-auto size-4.5" />
            ) : (
              <>
                <PanelLeftClose className="size-4.5" />
                <span>{t("collapse")}</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t, lang, setLang } = useI18n();
  const { dark, toggle } = useTheme();
  const { displayName, user } = useAuth();
  const navigate = useNavigate();

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex min-h-screen bg-background">
        <aside
          className={cn(
            "sticky top-0 hidden h-screen shrink-0 transition-[width] duration-200 lg:block",
            collapsed ? "w-[68px]" : "w-64",
          )}
        >
          <SidebarInner collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/85 px-3 backdrop-blur sm:px-5">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label={t("menu")}>
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 border-none p-0">
                <SheetTitle className="sr-only">{t("menu")}</SheetTitle>
                <SidebarInner collapsed={false} onNavigate={() => setMobileOpen(false)} />
              </SheetContent>
            </Sheet>

            <div className="relative hidden min-w-0 flex-1 sm:block sm:max-w-md">
              <Search className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-muted-foreground" />
              <Input
                placeholder={t("search")}
                aria-label={t("search")}
                className="h-9 bg-muted/60 ps-9"
              />
            </div>

            <div className="ms-auto flex items-center gap-1">
              <Button variant="ghost" size="icon" aria-label={t("notifications")}>
                <span className="relative">
                  <Bell className="size-4.5" />
                  <span className="absolute -end-0.5 -top-0.5 size-1.5 rounded-full bg-primary" />
                </span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("language")}
                onClick={() => setLang(lang === "fa" ? "en" : "fa")}
              >
                <Languages className="size-4.5" />
              </Button>
              <Button variant="ghost" size="icon" aria-label={t("theme")} onClick={toggle}>
                {dark ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="ms-1 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={t("profile")}
                  >
                    <Avatar className="size-8">
                      <AvatarFallback className="bg-secondary text-xs">
                        {initials(displayName)}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="truncate">
                    <span className="block text-sm">{displayName}</span>
                    <span className="block text-xs font-normal text-muted-foreground">
                      {user?.email}
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/settings">{t("settings")}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="size-4" />
                    {t("logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="mx-auto w-full max-w-[1600px] flex-1 px-3 py-5 sm:px-6 sm:py-7">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
