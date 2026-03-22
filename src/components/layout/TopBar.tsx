"use client";

import { Search, Bell, Bot, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

export default function TopBar() {
  const { theme, toggleTheme } = useTheme();
  return (
    <header
      className="sticky top-0 z-30 h-14 sm:h-16 flex items-center justify-between px-4 sm:px-6 border-b border-divider-dim"
      style={{
        background: "var(--topbar-bg)",
        backdropFilter: "blur(40px) saturate(180%)",
      }}
    >
      {/* Left */}
      <div className="pl-12 lg:pl-0 flex items-center gap-3">
        <div className="hidden lg:flex w-7 h-7 rounded-xl bg-gradient-to-br from-[#00F0FF]/20 to-[#6C63FF]/20 items-center justify-center">
          <Bot className="w-4 h-4 text-[#00F0FF]" />
        </div>
        <div>
          <h1 className="text-base sm:text-lg font-semibold text-heading">clawbot</h1>
          <p className="text-[10px] sm:text-xs text-muted hidden sm:block">
            EC2 Server Dashboard
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Live indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#00FF88]/10 border border-[#00FF88]/20">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00FF88] pulse-dot" />
          <span className="text-[11px] text-[#00FF88] font-medium">Live</span>
        </div>

        {/* Search */}
        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search..."
            className="w-48 xl:w-56 pl-10 pr-4 py-2 rounded-2xl text-sm text-heading placeholder-muted focus:outline-none transition-colors glass-inset"
          />
        </div>

        <button className="p-2 rounded-xl hover:bg-surface transition-colors text-subtle hover:text-heading lg:hidden">
          <Search className="w-5 h-5" />
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl hover:bg-surface transition-colors text-subtle hover:text-heading"
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notification */}
        <button className="relative p-2 rounded-xl hover:bg-surface transition-colors text-subtle hover:text-heading">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF6B6B] rounded-full" />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#00F0FF] flex items-center justify-center text-xs font-bold text-white cursor-pointer shrink-0">
          E
        </div>
      </div>
    </header>
  );
}
