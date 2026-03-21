"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  BarChart3,
  Server,
  Settings,
  Network,
  Activity,
  Bot,
  Menu,
  X,
  Container,
  Globe,
  KanbanSquare,
  Bell,
  Sparkles,
} from "lucide-react";

const navItems = [
  { label: "Overview", href: "/", icon: LayoutDashboard, group: "Dashboard" },
  { label: "API Usage 💰", href: "/analytics", icon: BarChart3, group: "Dashboard" },
  { label: "ClawsBot", href: "/clawsbot", icon: Bot, group: "Dashboard" },
  { label: "Projects", href: "/projects", icon: KanbanSquare, group: "Dashboard" },
  { label: "Reminders", href: "/reminders", icon: Bell, group: "Dashboard" },
  { label: "Agent", href: "/agent", icon: Sparkles, group: "Dashboard" },
  { label: "Server", href: "/servers", icon: Server, group: "Infrastructure" },
  { label: "Services", href: "/services", icon: Container, group: "Infrastructure" },
  { label: "Network", href: "/network", icon: Globe, group: "Infrastructure" },
  { label: "Tailscale", href: "/tailscale", icon: Network, group: "Network" },
  { label: "Logs", href: "/logs", icon: Activity, group: "System" },
  { label: "Settings", href: "/settings", icon: Settings, group: "System" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const groups = [...new Set(navItems.map((i) => i.group))];

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const sidebarContent = (isMobile: boolean) => (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between gap-3 px-4 h-16 border-b border-divider">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#00F0FF] to-[#6C63FF] flex items-center justify-center shrink-0 shadow-lg shadow-[#00F0FF]/20">
            <Bot className="w-5 h-5 text-white" />
          </div>
          {(!collapsed || isMobile) && (
            <span className="text-lg font-semibold tracking-wide text-heading">
              Claws<span className="text-[#00F0FF]">Bot</span>
            </span>
          )}
        </div>
        {isMobile && (
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-xl hover:bg-surface text-muted hover:text-heading transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2.5">
        {groups.map((group) => (
          <div key={group} className="mb-5">
            {(!collapsed || isMobile) && (
              <p className="px-3 mb-2 text-[10px] uppercase tracking-[0.15em] text-muted font-medium">
                {group}
              </p>
            )}
            {navItems
              .filter((i) => i.group === group)
              .map((item) => {
                const isActive =
                  item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl mb-1 transition-all duration-200 ${
                      isActive
                        ? "bg-[#00F0FF]/10 text-[#00F0FF] shadow-sm shadow-[#00F0FF]/10"
                        : "text-subtle hover:bg-surface-dim hover:text-heading"
                    }`}
                  >
                    <Icon className="w-[18px] h-[18px] shrink-0" />
                    {(!collapsed || isMobile) && (
                      <span className="text-[13px] font-medium">{item.label}</span>
                    )}
                  </Link>
                );
              })}
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-divider p-3">
        {(!collapsed || isMobile) && (
          <div className="flex items-center gap-3 mb-2 px-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#00F0FF] flex items-center justify-center text-xs font-bold text-white">
              E
            </div>
            <div>
              <p className="text-sm font-medium text-heading">Eden</p>
              <p className="text-[10px] text-muted">Admin</p>
            </div>
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-3.5 left-3.5 z-50 p-2.5 rounded-2xl lg:hidden glass-light"
      >
        <Menu className="w-5 h-5 text-heading" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed left-0 top-0 h-screen z-50 flex flex-col w-[270px] transition-transform duration-300 lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background: "var(--sidebar-mobile-bg)",
          borderRight: "0.5px solid var(--sidebar-border)",
          backdropFilter: "blur(40px) saturate(180%)",
        }}
      >
        {sidebarContent(true)}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen z-40 hidden lg:flex flex-col transition-all duration-300 ${
          collapsed ? "w-16" : "w-[240px]"
        }`}
        style={{
          background: "var(--sidebar-bg)",
          borderRight: "0.5px solid var(--sidebar-border)",
          backdropFilter: "blur(40px) saturate(180%)",
        }}
      >
        {sidebarContent(false)}
      </aside>
    </>
  );
}
