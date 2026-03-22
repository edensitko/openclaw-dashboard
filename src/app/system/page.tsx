"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Server,
  Cpu,
  MemoryStick,
  HardDrive,
  Clock,
  Activity,
  Zap,
  Terminal,
  Globe,
  Settings,
  Hash,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  ChevronDown,
  Database,
  Workflow,
  Radio,
  AlertTriangle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useSystemData } from "@/lib/useSystemData";

/* ─── Helpers ─── */
function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function formatAge(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(1)}s`;
  const m = s / 60;
  if (m < 60) return `${m.toFixed(0)}m ${Math.floor(s % 60)}s`;
  const h = m / 60;
  return `${h.toFixed(0)}h ${Math.floor(m % 60)}m`;
}

const stagger = (i: number) => ({
  initial: { opacity: 0, y: 14 } as const,
  animate: { opacity: 1, y: 0 } as const,
  transition: { delay: i * 0.05, duration: 0.4 },
});

/* ─── Gauge Ring ─── */
function GaugeRing({ percent, color, size = 56 }: { percent: number; color: string; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <svg width={size} height={size} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--t-surface)" strokeWidth="5" />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: "easeOut" }}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fill={color}
        fontSize="12"
        fontWeight="700"
        fontFamily="var(--font-mono)"
      >
        {percent}%
      </text>
    </svg>
  );
}

/* ─── Token progress bar ─── */
function TokenBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const width = max > 0 ? Math.max((value / max) * 100, 2) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted">{label}</span>
        <span className="font-mono text-heading">{fmt(value)}</span>
      </div>
      <div className="h-1.5 rounded-full bg-surface-dim overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}

/* ─── Chart tooltip ─── */
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="px-3 py-2 text-xs"
      style={{
        background: "var(--tooltip-bg)",
        border: "1px solid var(--tooltip-border)",
        color: "var(--tooltip-text)",
        borderRadius: 12,
        backdropFilter: "blur(20px)",
      }}
    >
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {p.value}%
        </p>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════ */
export default function SystemPage() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const { data: sysData, history } = useSystemData(3000);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/system-status", { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        if (data.error) {
          setError(data.error);
          setStatus(null);
        } else {
          setStatus(data);
          setError(null);
        }
      } else {
        setError("Failed to connect");
      }
    } catch {
      setError("OpenClaw Control UI unreachable");
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  /* ─── Derived data ─── */
  const sessions = status?.sessions?.recent || [];
  const totalSessions = status?.sessions?.count || 0;
  const totalIn = sessions.reduce((s: number, r: any) => s + (r.inputTokens || 0), 0);
  const totalOut = sessions.reduce((s: number, r: any) => s + (r.outputTokens || 0), 0);
  const totalCache = sessions.reduce((s: number, r: any) => s + (r.cacheRead || 0), 0);
  const totalTokens = totalIn + totalOut + totalCache;
  const maxSessionTokens = Math.max(...sessions.map((s: any) => s.totalTokens || 0), 1);

  /* Session chart data */
  const sessionChart = sessions.map((s: any, i: number) => ({
    name: `S${i + 1}`,
    Input: s.inputTokens || 0,
    Output: s.outputTokens || 0,
    Cache: s.cacheRead || 0,
  }));

  /* CPU/Memory history */
  const historySlice = (history || []).slice(-30).map((p: any) => ({
    time: new Date(p.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    CPU: Math.round(p.cpu),
    Memory: Math.round(p.memory),
  }));

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
        <div className="glass rounded-xl h-64 animate-pulse shimmer" />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ═══════ HEADER ═══════ */}
      <motion.div {...stagger(0)}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#00F0FF] to-[#6C63FF] flex items-center justify-center shadow-lg shadow-[#00F0FF]/20">
              <Server className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-heading">System Status</h1>
              <p className="text-xs text-muted">
                {sysData?.hostname || "localhost"} · OpenClaw session & resource monitoring
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {status ? (
              <span className="pill bg-success/15 text-success flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-success pulse-dot" />
                Connected
              </span>
            ) : (
              <span className="pill bg-[#FF6B6B]/15 text-[#FF6B6B] flex items-center gap-1.5">
                <AlertTriangle className="w-3 h-3" />
                Offline
              </span>
            )}
            <span className="pill bg-surface text-muted text-[10px]">
              {lastRefresh.toLocaleTimeString()}
            </span>
            <button onClick={fetchStatus} className="p-1.5 rounded-lg hover:bg-surface transition-colors">
              <RefreshCw className="w-3.5 h-3.5 text-muted" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* ═══════ ERROR STATE ═══════ */}
      {error && !status && (
        <motion.div {...stagger(1)} className="glass rounded-xl p-8 text-center">
          <AlertTriangle className="w-10 h-10 text-[#FFD93D] mx-auto mb-3 opacity-60" />
          <p className="text-sm text-heading font-semibold mb-1">Cannot reach OpenClaw Control UI</p>
          <p className="text-xs text-muted mb-4">{error}</p>
          <p className="text-[10px] text-muted">
            Make sure OpenClaw is running on <span className="font-mono text-[#00F0FF]">localhost:18789</span>
          </p>
        </motion.div>
      )}

      {/* ═══════ SYSTEM RESOURCE GAUGES ═══════ */}
      {sysData && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "CPU", value: `${sysData.cpu.usage}%`, gauge: sysData.cpu.usage, sub: sysData.cpu.model?.split("@")[0]?.trim(), icon: Cpu, color: "#00F0FF" },
            { label: "Memory", value: sysData.memory.used, gauge: sysData.memory.percent, sub: `${sysData.memory.percent}% of ${sysData.memory.total}`, icon: MemoryStick, color: "#6C63FF" },
            { label: "Disk", value: sysData.disk.used, gauge: sysData.disk.percent, sub: `${sysData.disk.percent}% of ${sysData.disk.total}`, icon: HardDrive, color: "#00FF88" },
            { label: "Uptime", value: sysData.uptime, gauge: null, sub: `${sysData.platform} ${sysData.arch}`, icon: Clock, color: "#FFD93D" },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div key={item.label} {...stagger(i + 1)} className="glass rounded-xl p-4 hover:bg-surface transition-all duration-300">
                <div className="flex items-center gap-3">
                  {item.gauge !== null ? (
                    <GaugeRing percent={item.gauge} color={item.gauge > 85 ? "#FF6B6B" : item.gauge > 65 ? "#FFD93D" : item.color} />
                  ) : (
                    <div className="p-2 rounded-xl" style={{ backgroundColor: `${item.color}15` }}>
                      <Icon className="w-5 h-5" style={{ color: item.color }} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs text-muted">{item.label}</p>
                    <p className="text-lg font-bold text-heading">{item.value}</p>
                    {item.sub && <p className="text-[10px] text-muted truncate">{item.sub}</p>}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ═══════ SESSION KPIs ═══════ */}
      {status && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: "Sessions", value: totalSessions.toString(), sub: `${sessions.length} recent`, icon: Workflow, color: "#00F0FF" },
            { label: "Input Tokens", value: fmt(totalIn), sub: `${totalTokens > 0 ? Math.round((totalIn / totalTokens) * 100) : 0}% of total`, icon: ArrowUpRight, color: "#6C63FF" },
            { label: "Output Tokens", value: fmt(totalOut), sub: `${totalTokens > 0 ? Math.round((totalOut / totalTokens) * 100) : 0}% of total`, icon: ArrowDownRight, color: "#00FF88" },
            { label: "Cache Read", value: fmt(totalCache), sub: "Cached tokens", icon: Database, color: "#FFD93D" },
          ].map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <motion.div key={kpi.label} {...stagger(5 + i)} className="glass rounded-xl p-4 sm:p-5 hover:bg-surface transition-all duration-300">
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
      )}

      {/* ═══════ CHARTS ROW ═══════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* CPU/Memory History */}
        {historySlice.length > 2 && (
          <motion.div {...stagger(9)} className="glass rounded-xl p-5 sm:p-6">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-1.5 rounded-lg bg-[#00F0FF]/15">
                <Activity className="w-4 h-4 text-[#00F0FF]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-heading">Resource Trends</h3>
                <p className="text-[10px] text-muted">CPU & Memory over time</p>
              </div>
            </div>
            <div className="h-48 sm:h-56">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <LineChart data={historySlice}>
                  <XAxis dataKey="time" tick={{ fill: "var(--t-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "var(--t-muted)", fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} width={38} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line type="monotone" dataKey="CPU" stroke="#00F0FF" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Memory" stroke="#6C63FF" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-5 mt-3 text-xs text-muted">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00F0FF]" />
                CPU
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#6C63FF]" />
                Memory
              </span>
            </div>
          </motion.div>
        )}

        {/* Session Token Distribution */}
        {sessionChart.length > 0 && (
          <motion.div {...stagger(10)} className="glass rounded-xl p-5 sm:p-6">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-1.5 rounded-lg bg-[#6C63FF]/15">
                <Zap className="w-4 h-4 text-[#6C63FF]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-heading">Token Distribution</h3>
                <p className="text-[10px] text-muted">Per session breakdown</p>
              </div>
            </div>
            <div className="h-48 sm:h-56">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={sessionChart}>
                  <XAxis dataKey="name" tick={{ fill: "var(--t-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "var(--t-muted)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => fmt(v)} width={45} />
                  <Tooltip
                    content={({ active, payload, label }: any) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="px-3 py-2 text-xs" style={{ background: "var(--tooltip-bg)", border: "1px solid var(--tooltip-border)", color: "var(--tooltip-text)", borderRadius: 12, backdropFilter: "blur(20px)" }}>
                          <p className="font-semibold mb-1">{label}</p>
                          {payload.map((p: any) => (
                            <p key={p.name} style={{ color: p.color }}>{p.name}: {fmt(p.value)}</p>
                          ))}
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="Input" stackId="a" fill="#6C63FF" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Output" stackId="a" fill="#00FF88" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Cache" stackId="a" fill="#FFD93D" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-5 mt-3 text-xs text-muted">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#6C63FF]" /> Input</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#00FF88]" /> Output</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#FFD93D]" /> Cache</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* ═══════ RECENT SESSIONS TABLE ═══════ */}
      {sessions.length > 0 && (
        <motion.div {...stagger(11)} className="glass rounded-xl overflow-hidden">
          <div className="p-5 border-b border-divider">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-[#00F0FF]/15">
                <Terminal className="w-4 h-4 text-[#00F0FF]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-heading">Recent Sessions</h3>
                <p className="text-[10px] text-muted">{sessions.length} sessions loaded</p>
              </div>
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-divider">
                  {["Session ID", "Age", "Input", "Output", "Cache", "Total"].map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-muted uppercase tracking-wider px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sessions.map((session: any, i: number) => {
                  const total = session.totalTokens || 0;
                  const barWidth = maxSessionTokens > 0 ? (total / maxSessionTokens) * 100 : 0;
                  return (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-divider-dim hover:bg-surface-dim transition-colors group"
                    >
                      <td className="px-5 py-3">
                        <span className="text-xs font-mono text-[#00F0FF] truncate block max-w-[180px]">{session.sessionId}</span>
                      </td>
                      <td className="px-5 py-3 text-xs text-muted">{formatAge(session.age || 0)}</td>
                      <td className="px-5 py-3 text-xs font-mono text-[#6C63FF]">{fmt(session.inputTokens || 0)}</td>
                      <td className="px-5 py-3 text-xs font-mono text-[#00FF88]">{fmt(session.outputTokens || 0)}</td>
                      <td className="px-5 py-3 text-xs font-mono text-[#FFD93D]">{fmt(session.cacheRead || 0)}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-heading w-14">{fmt(total)}</span>
                          <div className="flex-1 h-1.5 rounded-full bg-surface-dim overflow-hidden max-w-[100px]">
                            <div className="h-full rounded-full bg-[#00F0FF] transition-all duration-500" style={{ width: `${barWidth}%` }} />
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden p-4 space-y-3">
            {sessions.map((session: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass-inset rounded-xl p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-[#00F0FF] truncate max-w-[180px]">{session.sessionId}</span>
                  <span className="text-[10px] text-muted">{formatAge(session.age || 0)}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-[9px] text-muted">Input</p>
                    <p className="text-xs font-mono text-[#6C63FF]">{fmt(session.inputTokens || 0)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-muted">Output</p>
                    <p className="text-xs font-mono text-[#00FF88]">{fmt(session.outputTokens || 0)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-muted">Cache</p>
                    <p className="text-xs font-mono text-[#FFD93D]">{fmt(session.cacheRead || 0)}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ═══════ SYSTEM CONFIGURATION ═══════ */}
      {(status || sysData) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* OpenClaw Config */}
          {status && (
            <motion.div {...stagger(12)} className="glass rounded-xl p-5 sm:p-6">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="p-1.5 rounded-lg bg-[#6C63FF]/15">
                  <Settings className="w-4 h-4 text-[#6C63FF]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-heading">OpenClaw Configuration</h3>
                  <p className="text-[10px] text-muted">Runtime & session defaults</p>
                </div>
              </div>
              <div className="space-y-2.5">
                {[
                  { label: "Runtime", value: status.runtimeVersion, icon: Terminal, color: "#00F0FF" },
                  { label: "Default Model", value: status.sessions?.defaults?.model, icon: Zap, color: "#6C63FF" },
                  { label: "Context Tokens", value: status.sessions?.defaults?.contextTokens?.toLocaleString(), icon: Hash, color: "#00FF88" },
                  { label: "Heartbeat Agent", value: status.heartbeat?.defaultAgentId, icon: Activity, color: "#FFD93D" },
                  { label: "Total Sessions", value: totalSessions.toString(), icon: Layers, color: "#00F0FF" },
                ].map((row) => {
                  const Icon = row.icon;
                  return (
                    <div key={row.label} className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-3.5 h-3.5" style={{ color: row.color }} />
                        <span className="text-xs text-muted">{row.label}</span>
                      </div>
                      <span className="text-xs font-mono text-heading truncate max-w-[200px] text-right">
                        {row.value || "—"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* System Info */}
          {sysData && (
            <motion.div {...stagger(13)} className="glass rounded-xl p-5 sm:p-6">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="p-1.5 rounded-lg bg-[#00FF88]/15">
                  <Server className="w-4 h-4 text-[#00FF88]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-heading">System Information</h3>
                  <p className="text-[10px] text-muted">Host environment</p>
                </div>
              </div>
              <div className="space-y-2.5">
                {[
                  { label: "Hostname", value: sysData.hostname, icon: Globe, color: "#00F0FF" },
                  { label: "Platform", value: `${sysData.osType} ${sysData.osRelease}`, icon: Server, color: "#6C63FF" },
                  { label: "Architecture", value: sysData.arch, icon: Cpu, color: "#00FF88" },
                  { label: "CPU Cores", value: sysData.cpu.cores.toString(), icon: Cpu, color: "#FFD93D" },
                  { label: "User", value: sysData.userInfo?.username, icon: Terminal, color: "#00F0FF" },
                ].map((row) => {
                  const Icon = row.icon;
                  return (
                    <div key={row.label} className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-3.5 h-3.5" style={{ color: row.color }} />
                        <span className="text-xs text-muted">{row.label}</span>
                      </div>
                      <span className="text-xs font-mono text-heading truncate max-w-[200px] text-right">
                        {row.value || "—"}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Load Averages */}
              <div className="mt-4 pt-3 border-t border-divider">
                <p className="text-[10px] text-muted uppercase tracking-wider mb-3">Load Average</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "1m", value: sysData.cpu.loadAvg["1m"] },
                    { label: "5m", value: sysData.cpu.loadAvg["5m"] },
                    { label: "15m", value: sysData.cpu.loadAvg["15m"] },
                  ].map((load) => {
                    const pct = Math.min((parseFloat(load.value) / sysData.cpu.cores) * 100, 100);
                    const color = pct > 85 ? "#FF6B6B" : pct > 65 ? "#FFD93D" : "#00FF88";
                    return (
                      <div key={load.label} className="glass-inset rounded-lg p-2.5">
                        <div className="flex justify-between text-[10px] mb-1.5">
                          <span className="text-muted">{load.label}</span>
                          <span className="font-mono text-heading">{load.value}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-surface overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.7 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* ═══════ FOOTER ═══════ */}
      <motion.div
        {...stagger(14)}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-muted border-t border-divider-dim pt-5 gap-2"
      >
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5" />
          Auto-refresh 5s · Last: {lastRefresh.toLocaleTimeString()}
        </div>
        <div className="flex items-center gap-3">
          {status && (
            <span className="text-[10px] opacity-60">
              OpenClaw {status.runtimeVersion || ""}
            </span>
          )}
          <div className="flex items-center gap-1.5 opacity-60">
            <span className="w-1.5 h-1.5 rounded-full bg-success pulse-dot" />
            Monitoring active
          </div>
        </div>
      </motion.div>
    </div>
  );
}
