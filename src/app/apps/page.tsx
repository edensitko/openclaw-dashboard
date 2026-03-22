"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AppWindow,
  Globe,
  Zap,
  Database,
  Terminal,
  Activity,
  Code,
  Server,
  Container,
  Bot,
  Monitor,
  RefreshCw,
  Search,
  Filter,
  Circle,
  ExternalLink,
  Cpu,
  MemoryStick,
  Hash,
  Radio,
  Layers,
  ChevronDown,
  ChevronRight,
  X,
} from "lucide-react";

/* ─── Icon mapping from API ─── */
const ICON_MAP: Record<string, any> = {
  globe: Globe,
  zap: Zap,
  database: Database,
  terminal: Terminal,
  activity: Activity,
  code: Code,
  server: Server,
  container: Container,
  bot: Bot,
  monitor: Monitor,
};

/* ─── Helpers ─── */
const stagger = (i: number) => ({
  initial: { opacity: 0, y: 14 } as const,
  animate: { opacity: 1, y: 0 } as const,
  transition: { delay: i * 0.04, duration: 0.35 },
});

/* ─── Types ─── */
interface AppInfo {
  id: string;
  name: string;
  process: string;
  pid: string;
  ports: string[];
  protocol: string;
  category: string;
  categoryColor: string;
  icon: string;
  description: string;
  source: "system" | "docker";
  status: "running" | "stopped" | "unknown";
  cpu?: string;
  mem?: string;
  command?: string;
  dockerImage?: string;
  dockerStatus?: string;
  dockerPorts?: string;
}

interface AppsData {
  apps: AppInfo[];
  summary: {
    totalApps: number;
    totalPorts: number;
    running: number;
    stopped: number;
    byCategory: Record<string, number>;
    dockerContainers: number;
    systemProcesses: number;
  };
  categories: Record<string, string>;
  timestamp: string;
}

/* ─── Port badge ─── */
function PortBadge({ port, color }: { port: string; color: string }) {
  return (
    <span
      className="pill font-mono text-[11px] font-semibold"
      style={{ backgroundColor: `${color}15`, color }}
    >
      :{port}
    </span>
  );
}

/* ─── Category filter pill ─── */
function CategoryPill({
  label,
  count,
  color,
  active,
  onClick,
}: {
  label: string;
  count: number;
  color: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`pill flex items-center gap-1.5 transition-all duration-200 ${
        active ? "ring-1" : "opacity-60 hover:opacity-100"
      }`}
      style={{
        backgroundColor: active ? `${color}20` : "var(--t-surface)",
        color: active ? color : "var(--t-muted)",
        outlineColor: active ? color : undefined,
        ["--tw-ring-color" as string]: active ? `${color}50` : undefined,
      }}
    >
      <Circle className="w-2 h-2" style={{ fill: color, color }} />
      {label}
      <span className="text-[9px] opacity-70">{count}</span>
    </button>
  );
}

/* ─── App card component ─── */
function AppCard({ app, index }: { app: AppInfo; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = ICON_MAP[app.icon] || Server;
  const isRunning = app.status === "running";
  const isDocker = app.source === "docker";

  return (
    <motion.div
      {...stagger(index)}
      layout
      className="glass rounded-xl overflow-hidden hover:bg-surface transition-all duration-300 group"
    >
      {/* Main row */}
      <div
        className="p-4 sm:p-5 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className="p-2.5 rounded-xl shrink-0"
            style={{ backgroundColor: `${app.categoryColor}15` }}
          >
            <Icon className="w-5 h-5" style={{ color: app.categoryColor }} />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold text-heading truncate">
                {app.name}
              </h3>
              {isDocker && (
                <span className="pill bg-[#00F0FF]/10 text-[#00F0FF] text-[9px] flex items-center gap-1">
                  <Container className="w-2.5 h-2.5" />
                  Docker
                </span>
              )}
              {!isDocker && (
                <span className="pill bg-[#00FF88]/10 text-[#00FF88] text-[9px]">
                  System
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-muted font-mono">{app.process}</span>
              {app.pid && (
                <span className="text-[10px] text-muted">PID {app.pid}</span>
              )}
            </div>

            {/* Ports */}
            <div className="flex flex-wrap gap-1.5">
              {app.ports.map((port) => (
                <PortBadge key={port} port={port} color={app.categoryColor} />
              ))}
              {app.ports.length === 0 && (
                <span className="text-[10px] text-muted italic">No exposed ports</span>
              )}
            </div>
          </div>

          {/* Right side: status + expand */}
          <div className="flex items-center gap-2 shrink-0">
            {/* CPU/MEM badges */}
            {app.cpu && (
              <div className="hidden sm:flex items-center gap-3 mr-2">
                <span className="text-[10px] font-mono text-[#00F0FF]">
                  <Cpu className="w-3 h-3 inline mr-0.5" />
                  {app.cpu}%
                </span>
                <span className="text-[10px] font-mono text-[#6C63FF]">
                  <MemoryStick className="w-3 h-3 inline mr-0.5" />
                  {app.mem}%
                </span>
              </div>
            )}

            {/* Status */}
            <span
              className={`pill flex items-center gap-1.5 ${
                isRunning
                  ? "bg-[#00FF88]/15 text-[#00FF88]"
                  : "bg-[#FF6B6B]/15 text-[#FF6B6B]"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isRunning ? "bg-[#00FF88] pulse-dot" : "bg-[#FF6B6B]"
                }`}
              />
              {isRunning ? "Running" : "Stopped"}
            </span>

            {/* Expand icon */}
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-muted"
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0 border-t border-divider-dim">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                {/* Category */}
                <div className="glass-inset rounded-lg p-3">
                  <p className="text-[10px] text-muted uppercase tracking-wider mb-1">Category</p>
                  <p className="text-sm font-semibold" style={{ color: app.categoryColor }}>
                    {app.category}
                  </p>
                </div>

                {/* Protocol */}
                <div className="glass-inset rounded-lg p-3">
                  <p className="text-[10px] text-muted uppercase tracking-wider mb-1">Protocol</p>
                  <p className="text-sm font-semibold text-heading">{app.protocol}</p>
                </div>

                {/* CPU/MEM for system processes */}
                {app.cpu && (
                  <>
                    <div className="glass-inset rounded-lg p-3">
                      <p className="text-[10px] text-muted uppercase tracking-wider mb-1">CPU Usage</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-[#00F0FF]">{app.cpu}%</p>
                        <div className="flex-1 h-1.5 rounded-full bg-surface-dim overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(parseFloat(app.cpu), 100)}%` }}
                            transition={{ duration: 0.6 }}
                            className="h-full rounded-full bg-[#00F0FF]"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="glass-inset rounded-lg p-3">
                      <p className="text-[10px] text-muted uppercase tracking-wider mb-1">Memory Usage</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-[#6C63FF]">{app.mem}%</p>
                        <div className="flex-1 h-1.5 rounded-full bg-surface-dim overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(parseFloat(app.mem || "0"), 100)}%` }}
                            transition={{ duration: 0.6 }}
                            className="h-full rounded-full bg-[#6C63FF]"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Docker details */}
                {isDocker && app.dockerImage && (
                  <>
                    <div className="glass-inset rounded-lg p-3">
                      <p className="text-[10px] text-muted uppercase tracking-wider mb-1">Image</p>
                      <p className="text-xs font-mono text-heading truncate">{app.dockerImage}</p>
                    </div>
                    <div className="glass-inset rounded-lg p-3">
                      <p className="text-[10px] text-muted uppercase tracking-wider mb-1">Status</p>
                      <p className="text-xs text-heading">{app.dockerStatus}</p>
                    </div>
                  </>
                )}
                {isDocker && app.dockerPorts && (
                  <div className="glass-inset rounded-lg p-3 sm:col-span-2">
                    <p className="text-[10px] text-muted uppercase tracking-wider mb-1">Port Mapping</p>
                    <p className="text-xs font-mono text-heading break-all">{app.dockerPorts}</p>
                  </div>
                )}
              </div>

              {/* Command */}
              {app.command && (
                <div className="glass-inset rounded-lg p-3 mt-3">
                  <p className="text-[10px] text-muted uppercase tracking-wider mb-1">Command</p>
                  <p className="text-[11px] font-mono text-muted break-all leading-relaxed">{app.command}</p>
                </div>
              )}

              {/* Quick access link */}
              {app.ports.length > 0 && isRunning && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {app.ports.map((port) => (
                    <a
                      key={port}
                      href={`http://localhost:${port}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pill bg-surface hover:bg-surface-dim text-muted hover:text-heading transition-all flex items-center gap-1.5 text-[11px]"
                    >
                      <ExternalLink className="w-3 h-3" />
                      localhost:{port}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════ */
export default function AppsPage() {
  const [data, setData] = useState<AppsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set());
  const [sourceFilter, setSourceFilter] = useState<"all" | "system" | "docker">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "running" | "stopped">("all");
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/apps", { cache: "no-store" });
      if (res.ok) {
        setData(await res.json());
        setLastRefresh(new Date());
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 8000);
    return () => clearInterval(id);
  }, [fetchData]);

  const toggleCategory = (cat: string) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  /* Filtered apps */
  const filteredApps = (data?.apps || []).filter((app) => {
    if (search) {
      const q = search.toLowerCase();
      const match =
        app.name.toLowerCase().includes(q) ||
        app.process.toLowerCase().includes(q) ||
        app.ports.some((p) => p.includes(q)) ||
        app.category.toLowerCase().includes(q) ||
        app.description?.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (activeCategories.size > 0 && !activeCategories.has(app.category)) return false;
    if (sourceFilter !== "all" && app.source !== sourceFilter) return false;
    if (statusFilter !== "all" && app.status !== statusFilter) return false;
    return true;
  });

  const sortedApps = [...filteredApps].sort((a, b) => {
    // Running first, then by port number
    if (a.status !== b.status) return a.status === "running" ? -1 : 1;
    const aPort = parseInt(a.ports[0] || "99999");
    const bPort = parseInt(b.ports[0] || "99999");
    return aPort - bPort;
  });

  /* Category stats */
  const categoryStats = Object.entries(data?.categories || {})
    .map(([cat, color]) => ({
      cat,
      color: color as string,
      count: (data?.apps || []).filter((a) => a.category === cat).length,
    }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);

  /* Port map - all unique ports */
  const allPorts = [...new Set((data?.apps || []).flatMap((a) => a.ports))]
    .filter((p) => /^\d+$/.test(p))
    .map(Number)
    .sort((a, b) => a - b);

  /* ─── Loading ─── */
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-16 shimmer rounded-xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass rounded-xl h-24 animate-pulse shimmer" />
          ))}
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="glass rounded-xl h-20 animate-pulse shimmer" />
          ))}
        </div>
      </div>
    );
  }

  const summary = data?.summary;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ─── Header ─── */}
      <motion.div {...stagger(0)}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#6C63FF] to-[#00F0FF] flex items-center justify-center shadow-lg shadow-[#6C63FF]/20">
              <AppWindow className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-heading">Apps & Ports</h1>
              <p className="text-xs text-muted">
                All applications listening on ports across the server
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="pill bg-success/15 text-success flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success pulse-dot" />
              Live
            </span>
            <span className="pill bg-surface text-muted text-[10px]">
              {lastRefresh.toLocaleTimeString()}
            </span>
            <button
              onClick={fetchData}
              className="p-1.5 rounded-lg hover:bg-surface transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-3.5 h-3.5 text-muted" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* ─── KPI Row ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          {
            label: "Total Apps",
            value: summary?.totalApps?.toString() || "0",
            sub: "Detected on server",
            icon: AppWindow,
            color: "#6C63FF",
          },
          {
            label: "Open Ports",
            value: summary?.totalPorts?.toString() || "0",
            sub: "TCP listening",
            icon: Radio,
            color: "#00F0FF",
          },
          {
            label: "Running",
            value: summary?.running?.toString() || "0",
            sub: `${summary?.stopped || 0} stopped`,
            icon: Activity,
            color: "#00FF88",
          },
          {
            label: "Docker",
            value: summary?.dockerContainers?.toString() || "0",
            sub: `${summary?.systemProcesses || 0} system`,
            icon: Container,
            color: "#FFD93D",
          },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.label}
              {...stagger(i + 1)}
              className="glass rounded-xl p-4 sm:p-5 hover:bg-surface transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${kpi.color}18` }}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: kpi.color }} />
                </div>
              </div>
              <p className="text-xs sm:text-sm text-muted mb-1">{kpi.label}</p>
              <p className="text-xl sm:text-2xl font-bold text-heading mb-1">{kpi.value}</p>
              <p className="text-[10px] sm:text-xs text-muted">{kpi.sub}</p>
            </motion.div>
          );
        })}
      </div>

      {/* ─── Port Map ─── */}
      {allPorts.length > 0 && (
        <motion.div {...stagger(5)} className="glass rounded-xl p-5 sm:p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="p-1.5 rounded-lg bg-[#00F0FF]/15">
              <Hash className="w-4 h-4 text-[#00F0FF]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-heading">Port Map</h3>
              <p className="text-[10px] text-muted">All listening ports on this server</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {allPorts.map((port) => {
              const app = data?.apps.find((a) => a.ports.includes(port.toString()));
              const color = app?.categoryColor || "#7A7A9E";
              const isRunning = app?.status === "running";
              return (
                <div
                  key={port}
                  className="glass-inset rounded-lg px-3 py-2 flex items-center gap-2 hover:bg-surface transition-all cursor-default"
                  title={`${app?.name || "Unknown"} - ${app?.process || ""} (${app?.category || "unknown"})`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${isRunning ? "pulse-dot" : ""}`}
                    style={{ backgroundColor: isRunning ? "#00FF88" : "#FF6B6B" }}
                  />
                  <span className="font-mono text-sm font-bold" style={{ color }}>
                    {port}
                  </span>
                  <span className="text-[10px] text-muted hidden sm:inline">
                    {app?.name || "?"}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ─── Filters ─── */}
      <motion.div {...stagger(6)} className="space-y-3">
        {/* Search + source/status toggles */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search apps, ports, processes..."
              className="w-full glass-inset rounded-xl pl-10 pr-4 py-2.5 text-sm text-heading placeholder:text-muted outline-none focus:ring-1 focus:ring-[#00F0FF]/30 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-heading"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex gap-2">
            {/* Source filter */}
            {(["all", "system", "docker"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSourceFilter(s)}
                className={`pill transition-all ${
                  sourceFilter === s
                    ? "bg-[#6C63FF]/20 text-[#6C63FF] ring-1 ring-[#6C63FF]/30"
                    : "bg-surface text-muted hover:text-heading"
                }`}
              >
                {s === "all" ? "All Sources" : s === "docker" ? "Docker" : "System"}
              </button>
            ))}

            {/* Status filter */}
            {(["all", "running", "stopped"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`pill transition-all ${
                  statusFilter === s
                    ? s === "running"
                      ? "bg-[#00FF88]/20 text-[#00FF88] ring-1 ring-[#00FF88]/30"
                      : s === "stopped"
                      ? "bg-[#FF6B6B]/20 text-[#FF6B6B] ring-1 ring-[#FF6B6B]/30"
                      : "bg-[#FFD93D]/20 text-[#FFD93D] ring-1 ring-[#FFD93D]/30"
                    : "bg-surface text-muted hover:text-heading"
                }`}
              >
                {s === "all" ? "Any Status" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Category pills */}
        {categoryStats.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-[10px] text-muted uppercase tracking-wider self-center mr-1">
              Categories:
            </span>
            {categoryStats.map((c) => (
              <CategoryPill
                key={c.cat}
                label={c.cat}
                count={c.count}
                color={c.color}
                active={activeCategories.has(c.cat)}
                onClick={() => toggleCategory(c.cat)}
              />
            ))}
            {activeCategories.size > 0 && (
              <button
                onClick={() => setActiveCategories(new Set())}
                className="pill bg-surface text-muted hover:text-heading text-[10px]"
              >
                Clear
              </button>
            )}
          </div>
        )}
      </motion.div>

      {/* ─── Results count ─── */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted">
          Showing {sortedApps.length} of {data?.apps.length || 0} apps
        </p>
        {(search || activeCategories.size > 0 || sourceFilter !== "all" || statusFilter !== "all") && (
          <button
            onClick={() => {
              setSearch("");
              setActiveCategories(new Set());
              setSourceFilter("all");
              setStatusFilter("all");
            }}
            className="text-xs text-[#00F0FF] hover:underline"
          >
            Reset all filters
          </button>
        )}
      </div>

      {/* ─── App List ─── */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {sortedApps.map((app, i) => (
            <AppCard key={app.id} app={app} index={i} />
          ))}
        </AnimatePresence>

        {sortedApps.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass rounded-xl p-12 flex flex-col items-center justify-center text-center"
          >
            <AppWindow className="w-10 h-10 text-muted opacity-40 mb-3" />
            <p className="text-sm text-muted">No apps match your filters</p>
            <p className="text-xs text-muted mt-1">Try adjusting your search or category filters</p>
          </motion.div>
        )}
      </div>

      {/* ─── Footer ─── */}
      <motion.div
        {...stagger(30)}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-muted border-t border-divider-dim pt-5 gap-2"
      >
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5" />
          Auto-refresh every 8s · {lastRefresh.toLocaleTimeString()}
        </div>
        <div className="flex items-center gap-1.5 opacity-60">
          <span className="w-1.5 h-1.5 rounded-full bg-success pulse-dot" />
          {summary?.systemProcesses || 0} system · {summary?.dockerContainers || 0} docker · {summary?.totalPorts || 0} ports
        </div>
      </motion.div>
    </div>
  );
}
