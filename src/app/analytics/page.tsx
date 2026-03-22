"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Bot,
  BarChart3,
  Clock,
  Coins,
  Activity,
  Cpu,
  MemoryStick,
  HardDrive,
  Server,
  Globe,
  Radio,
  ArrowDown,
  ArrowUp,
  Container,
  CheckCircle,
  XCircle,
  Layers,
  MessageSquare,
  Cloud,
  Key,
  Terminal,
  RefreshCw,
  AlertTriangle,
  CircleDot,
  Hash,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line,
} from "recharts";
import { useChartTheme } from "@/components/ThemeProvider";

/* ─── Helpers ─── */
function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}
function usd(n: number) {
  return `$${n.toFixed(4)}`;
}
function usd2(n: number) {
  return `$${n.toFixed(2)}`;
}
function pct(part: number, total: number) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}
function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

/* ─── Stagger helper ─── */
const stagger = (i: number) => ({
  initial: { opacity: 0, y: 16 } as const,
  animate: { opacity: 1, y: 0 } as const,
  transition: { delay: i * 0.05, duration: 0.4 },
});

/* ─── Tiny reusable components ─── */
function StatBadge({ value, positive }: { value: string; positive?: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-0.5 pill text-[10px]"
      style={{
        backgroundColor: positive ? "rgba(0,255,136,0.12)" : "rgba(255,107,107,0.12)",
        color: positive ? "#00FF88" : "#FF6B6B",
      }}
    >
      {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
      {value}
    </span>
  );
}

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

function SectionHeader({ icon: Icon, title, subtitle, color = "#00F0FF" }: { icon: any; title: string; subtitle?: string; color?: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${color}15` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-heading">{title}</h3>
        {subtitle && <p className="text-[10px] text-muted">{subtitle}</p>}
      </div>
    </div>
  );
}

/* ─── Custom chart tooltip ─── */
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
          {p.name}: {typeof p.value === "number" && p.value < 1 ? usd(p.value) : p.value}
        </p>
      ))}
    </div>
  );
}

/* ─── Skeleton loading card ─── */
function SkeletonCard({ height = "h-24" }: { height?: string }) {
  return <div className={`glass rounded-xl ${height} animate-pulse shimmer`} />;
}

/* ═══════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════ */
export default function AnalyticsPage() {
  const [usage, setUsage] = useState<any>(null);
  const [system, setSystem] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [clawsbot, setClawsbot] = useState<any>(null);
  const [services, setServices] = useState<any>(null);
  const [network, setNetwork] = useState<any>(null);
  const [sessions, setSessions] = useState<any>(null);
  const [claudeUsage, setClaudeUsage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const chart = useChartTheme();

  const fetchAll = useCallback(async () => {
    try {
      const results = await Promise.allSettled([
        fetch("/api-usage.json").then((r) => r.json()),
        fetch("/api/system", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/system/history", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/clawsbot", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/services", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/network", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/system-status", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/claude-usage", { cache: "no-store" }).then((r) => r.json()),
      ]);

      if (results[0].status === "fulfilled") setUsage(results[0].value);
      if (results[1].status === "fulfilled") setSystem(results[1].value);
      if (results[2].status === "fulfilled") setHistory(results[2].value);
      if (results[3].status === "fulfilled") setClawsbot(results[3].value);
      if (results[4].status === "fulfilled") setServices(results[4].value);
      if (results[5].status === "fulfilled") setNetwork(results[5].value);
      if (results[6].status === "fulfilled") setSessions(results[6].value);
      if (results[7].status === "fulfilled") setClaudeUsage(results[7].value);
      setLastRefresh(new Date());
    } catch {
      // partial failure is ok
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const coreInterval = setInterval(fetchAll, 5000);
    return () => clearInterval(coreInterval);
  }, [fetchAll]);

  /* ─── Loading state ─── */
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-16 shimmer rounded-xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <SkeletonCard height="h-64 lg:col-span-2" />
          <SkeletonCard height="h-64" />
        </div>
      </div>
    );
  }

  /* ─── Derived API usage data ─── */
  const anthro = usage?.anthropic || {};
  const oai = usage?.openai || {};
  const aTotal = anthro.total || {};
  const oTotal = oai.total || {};
  const todayA = anthro.daily?.["2026-03-21"] || {};
  const todayO = oai.daily?.["2026-03-21"] || {};
  const yesterdayA = anthro.daily?.["2026-03-20"] || {};
  const yesterdayO = oai.daily?.["2026-03-20"] || {};
  const monthA = anthro.monthly?.["2026-03"] || {};
  const monthO = oai.monthly?.["2026-03"] || {};

  const totalCost = (aTotal.cost || 0) + (oTotal.cost || 0);
  const todayCost = (todayA.cost || 0) + (todayO.cost || 0);
  const yesterdayCost = (yesterdayA.cost || 0) + (yesterdayO.cost || 0);
  const monthlyCost = (monthA.cost || 0) + (monthO.cost || 0);
  const totalTokensAll =
    (aTotal.tokens_in || 0) + (aTotal.tokens_out || 0) + (oTotal.tokens_in || 0) + (oTotal.tokens_out || 0);
  const costDelta = yesterdayCost ? ((todayCost - yesterdayCost) / yesterdayCost) * 100 : 0;

  /* Chart data */
  const dailyDates = [...new Set([...Object.keys(anthro.daily || {}), ...Object.keys(oai.daily || {})])].sort();
  const dailyChart = dailyDates.map((date) => ({
    date: date.slice(5),
    Anthropic: anthro.daily?.[date]?.cost || 0,
    OpenAI: oai.daily?.[date]?.cost || 0,
  }));

  const pieData = [
    { name: "Anthropic", value: aTotal.cost || 0, color: "#00F0FF" },
    { name: "OpenAI", value: oTotal.cost || 0, color: "#6C63FF" },
  ];

  const allModels = [
    ...Object.entries(anthro.models || {}).map(([name, data]: [string, any]) => ({
      name,
      provider: "Anthropic",
      color: "#00F0FF",
      ...data,
    })),
    ...Object.entries(oai.models || {}).map(([name, data]: [string, any]) => ({
      name,
      provider: "OpenAI",
      color: "#6C63FF",
      ...data,
    })),
  ];

  const maxTokens = Math.max(...allModels.map((m) => Math.max(m.tokens_in || 0, m.tokens_out || 0)), 1);

  /* Session data */
  const recentSessions = sessions?.sessions?.recent || [];
  const totalSessions = sessions?.sessions?.count || 0;
  const sessionTokensIn = recentSessions.reduce((s: number, r: any) => s + (r.inputTokens || 0), 0);
  const sessionTokensOut = recentSessions.reduce((s: number, r: any) => s + (r.outputTokens || 0), 0);

  /* Services data */
  const dockerContainers = services?.docker || [];
  const runningDocker = dockerContainers.filter((c: any) => c.state === "running");
  const listeningPorts = services?.listeningPorts || [];

  /* History chart - last 20 points */
  const historySlice = (history || []).slice(-20).map((p: any) => ({
    time: new Date(p.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    CPU: Math.round(p.cpu),
    Memory: Math.round(p.memory),
  }));

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ═══════════ HEADER ═══════════ */}
      <motion.div {...stagger(0)}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#00F0FF] to-[#6C63FF] flex items-center justify-center shadow-lg shadow-[#00F0FF]/20">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-heading">Analytics</h1>
                <p className="text-xs text-muted">
                  Operations command center · {system?.hostname || "loading..."}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="pill bg-success/15 text-success flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success pulse-dot" />
              Live
            </span>
            <span className="pill bg-surface text-muted text-[10px]">
              Updated {lastRefresh.toLocaleTimeString()}
            </span>
            <button
              onClick={fetchAll}
              className="p-1.5 rounded-lg hover:bg-surface transition-colors"
              title="Refresh all data"
            >
              <RefreshCw className="w-3.5 h-3.5 text-muted" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* ═══════════ KPI ROW ═══════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          {
            label: "Total Spend",
            value: usd(totalCost),
            sub: "All time",
            icon: DollarSign,
            color: "#FFD93D",
          },
          {
            label: "Today",
            value: usd(todayCost),
            sub:
              costDelta !== 0 ? (
                <StatBadge value={`${Math.abs(costDelta).toFixed(0)}%`} positive={costDelta < 0} />
              ) : (
                "vs yesterday"
              ),
            icon: TrendingUp,
            color: "#00FF88",
          },
          {
            label: "This Month",
            value: usd(monthlyCost),
            sub: "Mar 2026",
            icon: Coins,
            color: "#6C63FF",
          },
          {
            label: "Total Tokens",
            value: fmt(totalTokensAll),
            sub: `${allModels.length} model${allModels.length !== 1 ? "s" : ""} active`,
            icon: Zap,
            color: "#00F0FF",
          },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            {...stagger(i + 1)}
            className="glass rounded-xl p-4 sm:p-5 hover:bg-surface transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${kpi.color}18` }}>
                <kpi.icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: kpi.color }} />
              </div>
            </div>
            <p className="text-xs sm:text-sm text-muted mb-1">{kpi.label}</p>
            <p className="text-xl sm:text-2xl font-bold text-heading mb-1">{kpi.value}</p>
            <div className="text-[10px] sm:text-xs text-muted">{kpi.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* ═══════════ CHARTS ROW ═══════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Daily Cost Area Chart */}
        <motion.div {...stagger(5)} className="glass rounded-xl p-5 sm:p-6 lg:col-span-2">
          <SectionHeader icon={Activity} title="Daily Cost Breakdown" subtitle="Stacked by provider" />
          <div className="h-48 sm:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyChart}>
                <defs>
                  <linearGradient id="gAnthro" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00F0FF" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#00F0FF" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gOpenai" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6C63FF" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#6C63FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: "var(--t-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--t-muted)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} width={45} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="Anthropic" stackId="1" stroke="#00F0FF" fill="url(#gAnthro)" strokeWidth={2} />
                <Area type="monotone" dataKey="OpenAI" stackId="1" stroke="#6C63FF" fill="url(#gOpenai)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-5 mt-4 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00F0FF]" />
              Anthropic
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#6C63FF]" />
              OpenAI
            </span>
          </div>
        </motion.div>

        {/* Cost Distribution Donut */}
        <motion.div {...stagger(6)} className="glass rounded-xl p-5 sm:p-6">
          <SectionHeader icon={BarChart3} title="Cost Split" subtitle="By provider" color="#6C63FF" />
          <div className="h-40 sm:h-48 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius="58%"
                  outerRadius="82%"
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-lg sm:text-xl font-bold text-heading">{usd(totalCost)}</span>
              <span className="text-[10px] text-muted">total</span>
            </div>
          </div>
          <div className="space-y-2 mt-3">
            {pieData.map((p) => (
              <div key={p.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-muted">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                  {p.name}
                </span>
                <span className="font-mono text-heading">
                  {usd(p.value)} <span className="text-muted">({pct(p.value, totalCost)}%)</span>
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ═══════════ SYSTEM RESOURCES ROW ═══════════ */}
      {system && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "CPU", value: `${system.cpu.usage}%`, gauge: system.cpu.usage, sub: system.cpu.model?.split("@")[0]?.trim(), icon: Cpu, color: "#00F0FF" },
            { label: "Memory", value: system.memory.used, gauge: system.memory.percent, sub: `${system.memory.percent}% of ${system.memory.total}`, icon: MemoryStick, color: "#6C63FF" },
            { label: "Disk", value: system.disk.used, gauge: system.disk.percent, sub: `${system.disk.percent}% of ${system.disk.total}`, icon: HardDrive, color: "#00FF88" },
            { label: "Uptime", value: system.uptime, gauge: null, sub: `${system.platform} ${system.arch}`, icon: Clock, color: "#FFD93D" },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                {...stagger(7 + i)}
                className="glass rounded-xl p-4 hover:bg-surface transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  {item.gauge !== null ? (
                    <GaugeRing
                      percent={item.gauge}
                      color={item.gauge > 85 ? "#FF6B6B" : item.gauge > 65 ? "#FFD93D" : item.color}
                    />
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

      {/* ═══════════ CPU/MEMORY HISTORY + CLAWSBOT ═══════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* CPU/Memory History Chart */}
        {historySlice.length > 2 && (
          <motion.div {...stagger(11)} className="glass rounded-xl p-5 sm:p-6">
            <SectionHeader icon={Activity} title="Resource Trends" subtitle="CPU & Memory over time" />
            <div className="h-44 sm:h-52">
              <ResponsiveContainer width="100%" height="100%">
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

        {/* ClawsBot Agent Status */}
        {clawsbot && (
          <motion.div {...stagger(12)} className="glass rounded-xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#00F0FF] to-[#6C63FF] flex items-center justify-center shadow-lg shadow-[#00F0FF]/20">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-heading">
                    {clawsbot.agent?.name || "ClawsBot"}{" "}
                    <span className="text-xs font-normal text-muted">v{clawsbot.agent?.version || "?"}</span>
                  </h3>
                  <p className="text-[10px] text-muted">
                    {clawsbot.agent?.runtime} {clawsbot.agent?.nodeVersion} · PID {clawsbot.server?.pid}
                  </p>
                </div>
              </div>
              <span className="pill bg-[#00FF88]/15 text-[#00FF88] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00FF88] pulse-dot" />
                {clawsbot.agent?.mode || "Online"}
              </span>
            </div>

            {/* Agent details rows */}
            <div className="space-y-2 mb-4">
              {[
                { label: "Model", value: clawsbot.agent?.model, icon: Zap, color: "#00F0FF" },
                { label: "Fallback", value: clawsbot.agent?.fallbackModel, icon: Layers, color: "#FFD93D" },
                { label: "Hostname", value: clawsbot.server?.hostname, icon: Globe, color: "#00FF88" },
                { label: "Process Uptime", value: clawsbot.server?.processUptime ? formatUptime(clawsbot.server.processUptime) : "—", icon: Clock, color: "#6C63FF" },
              ].map((row) => {
                const Icon = row.icon;
                return (
                  <div key={row.label} className="flex items-center justify-between py-0.5">
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5" style={{ color: row.color }} />
                      <span className="text-xs text-muted">{row.label}</span>
                    </div>
                    <span className="text-xs font-mono text-heading truncate max-w-[180px] text-right">{row.value || "—"}</span>
                  </div>
                );
              })}
            </div>

            {/* Integrations */}
            <div className="border-t border-divider pt-3">
              <p className="text-[10px] text-muted uppercase tracking-wider mb-2">Integrations</p>
              <div className="space-y-2">
                {[
                  { name: "Discord", connected: clawsbot.integrations?.discord, icon: MessageSquare, color: "#5865F2" },
                  { name: "Anthropic", connected: clawsbot.integrations?.anthropic, icon: Cloud, color: "#D4A373" },
                  { name: "OpenAI", connected: clawsbot.integrations?.openai, icon: Zap, color: "#10A37F" },
                ].map((intg) => {
                  const Icon = intg.icon;
                  return (
                    <div key={intg.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5" style={{ color: intg.color }} />
                        <span className="text-xs text-heading">{intg.name}</span>
                      </div>
                      {intg.connected ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-[#00FF88]" />
                          <span className="text-[10px] text-[#00FF88]">Connected</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <XCircle className="w-3 h-3 text-muted" />
                          <span className="text-[10px] text-muted">N/A</span>
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Memory usage */}
            {clawsbot.memory && (
              <div className="border-t border-divider pt-3 mt-3">
                <p className="text-[10px] text-muted uppercase tracking-wider mb-2">Process Memory</p>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: "RSS", value: clawsbot.memory.rss },
                    { label: "Heap", value: clawsbot.memory.heapUsed },
                    { label: "Total", value: clawsbot.memory.heapTotal },
                    { label: "Ext", value: clawsbot.memory.external },
                  ].map((m) => (
                    <div key={m.label} className="glass-inset rounded-lg p-2 text-center">
                      <p className="text-[9px] text-muted">{m.label}</p>
                      <p className="text-[11px] font-mono text-heading">{m.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* ═══════════ PROVIDER DETAIL CARDS ═══════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {[
          { name: "Anthropic", color: "#00F0FF", total: aTotal, today: todayA, month: monthA },
          { name: "OpenAI", color: "#6C63FF", total: oTotal, today: todayO, month: monthO },
        ].map((provider, i) => (
          <motion.div key={provider.name} {...stagger(13 + i)} className="glass rounded-xl p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${provider.color}18` }}>
                <Bot className="w-5 h-5" style={{ color: provider.color }} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-heading">{provider.name}</h3>
                <p className="text-[10px] text-muted">Provider overview</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-lg font-bold" style={{ color: provider.color }}>
                  {usd(provider.total.cost || 0)}
                </p>
                <p className="text-[10px] text-muted">all time</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="glass-inset rounded-lg p-3">
                <p className="text-[10px] text-muted uppercase tracking-wide mb-1">Today</p>
                <p className="text-sm font-bold text-heading">{usd(provider.today.cost || 0)}</p>
              </div>
              <div className="glass-inset rounded-lg p-3">
                <p className="text-[10px] text-muted uppercase tracking-wide mb-1">Month</p>
                <p className="text-sm font-bold text-heading">{usd(provider.month.cost || 0)}</p>
              </div>
              <div className="glass-inset rounded-lg p-3">
                <p className="text-[10px] text-muted uppercase tracking-wide mb-1">% of Total</p>
                <p className="text-sm font-bold text-heading">{pct(provider.total.cost || 0, totalCost)}%</p>
              </div>
            </div>

            <div className="space-y-3">
              <TokenBar label="Input tokens" value={provider.total.tokens_in || 0} max={Math.max(provider.total.tokens_in || 0, provider.total.tokens_out || 0)} color={provider.color} />
              <TokenBar label="Output tokens" value={provider.total.tokens_out || 0} max={Math.max(provider.total.tokens_in || 0, provider.total.tokens_out || 0)} color={provider.color} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* ═══════════ MODEL CARDS ═══════════ */}
      <motion.div {...stagger(15)}>
        <SectionHeader icon={Zap} title="Models Used" subtitle="Per-model token breakdown" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {allModels.map((model, i) => (
            <motion.div
              key={model.name}
              {...stagger(16 + i)}
              className="glass rounded-xl p-4 sm:p-5 hover:bg-surface transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${model.color}18` }}>
                  <Zap className="w-4 h-4" style={{ color: model.color }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-heading truncate">{model.name}</p>
                  <p className="text-[10px] text-muted">{model.provider}</p>
                </div>
                <p className="text-sm font-bold shrink-0" style={{ color: model.color }}>
                  {usd(model.cost || 0)}
                </p>
              </div>
              <div className="space-y-2">
                <TokenBar label="Input" value={model.tokens_in || 0} max={maxTokens} color={model.color} />
                <TokenBar label="Output" value={model.tokens_out || 0} max={maxTokens} color={model.color} />
              </div>
              <div className="mt-3 pt-3 border-t border-divider-dim flex justify-between text-[10px] text-muted">
                <span>{fmt((model.tokens_in || 0) + (model.tokens_out || 0))} total tokens</span>
                <span>{pct(model.cost || 0, totalCost)}% of spend</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ═══════════ CLAUDE CODE USAGE ═══════════ */}
      {claudeUsage && (claudeUsage.session || claudeUsage.weekly_all || claudeUsage.weekly_sonnet) && (
        <motion.div {...stagger(16)} className="glass-heavy rounded-[24px] p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#D4A373] to-[#FFD93D] flex items-center justify-center shadow-lg shadow-[#D4A373]/20">
                <Terminal className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-heading">Claude Code Usage</h3>
                <p className="text-[10px] text-muted">
                  Scraped {claudeUsage.scraped_at ? new Date(claudeUsage.scraped_at).toLocaleString() : "N/A"}
                  {claudeUsage.source === "static" && " (sample data)"}
                </p>
              </div>
            </div>
            {claudeUsage.extra_usage && (
              <span className="pill bg-[#FFD93D]/15 text-[#FFD93D] text-[10px]">
                Extra: {claudeUsage.extra_usage}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Session Usage */}
            {claudeUsage.session && (
              <div className="glass-inset rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] text-muted uppercase tracking-wider">Current Session</p>
                  {claudeUsage.session.resets && (
                    <span className="text-[9px] text-muted">Resets: {claudeUsage.session.resets}</span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <GaugeRing
                    percent={Math.round(claudeUsage.session.percent)}
                    color={claudeUsage.session.percent > 80 ? "#FF6B6B" : claudeUsage.session.percent > 50 ? "#FFD93D" : "#00FF88"}
                    size={64}
                  />
                  <div>
                    <p className="text-2xl font-bold text-heading">{claudeUsage.session.percent}%</p>
                    <p className="text-[10px] text-muted">used this session</p>
                  </div>
                </div>
                <div className="mt-3 h-2 rounded-full bg-surface-dim overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${claudeUsage.session.percent}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{
                      backgroundColor: claudeUsage.session.percent > 80 ? "#FF6B6B" : claudeUsage.session.percent > 50 ? "#FFD93D" : "#00FF88",
                    }}
                  />
                </div>
              </div>
            )}

            {/* Weekly All Models */}
            {claudeUsage.weekly_all && (
              <div className="glass-inset rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] text-muted uppercase tracking-wider">Weekly (All Models)</p>
                  {claudeUsage.weekly_all.resets && (
                    <span className="text-[9px] text-muted">Resets: {claudeUsage.weekly_all.resets}</span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <GaugeRing
                    percent={Math.round(claudeUsage.weekly_all.percent)}
                    color={claudeUsage.weekly_all.percent > 80 ? "#FF6B6B" : claudeUsage.weekly_all.percent > 50 ? "#FFD93D" : "#6C63FF"}
                    size={64}
                  />
                  <div>
                    <p className="text-2xl font-bold text-heading">{claudeUsage.weekly_all.percent}%</p>
                    <p className="text-[10px] text-muted">of weekly limit</p>
                  </div>
                </div>
                <div className="mt-3 h-2 rounded-full bg-surface-dim overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${claudeUsage.weekly_all.percent}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{
                      backgroundColor: claudeUsage.weekly_all.percent > 80 ? "#FF6B6B" : claudeUsage.weekly_all.percent > 50 ? "#FFD93D" : "#6C63FF",
                    }}
                  />
                </div>
              </div>
            )}

            {/* Weekly Sonnet */}
            {claudeUsage.weekly_sonnet && (
              <div className="glass-inset rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] text-muted uppercase tracking-wider">Weekly (Sonnet)</p>
                  {claudeUsage.weekly_sonnet.resets && (
                    <span className="text-[9px] text-muted">Resets: {claudeUsage.weekly_sonnet.resets}</span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <GaugeRing
                    percent={Math.round(claudeUsage.weekly_sonnet.percent)}
                    color={claudeUsage.weekly_sonnet.percent > 80 ? "#FF6B6B" : claudeUsage.weekly_sonnet.percent > 50 ? "#FFD93D" : "#00F0FF"}
                    size={64}
                  />
                  <div>
                    <p className="text-2xl font-bold text-heading">{claudeUsage.weekly_sonnet.percent}%</p>
                    <p className="text-[10px] text-muted">Sonnet quota</p>
                  </div>
                </div>
                <div className="mt-3 h-2 rounded-full bg-surface-dim overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${claudeUsage.weekly_sonnet.percent}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{
                      backgroundColor: claudeUsage.weekly_sonnet.percent > 80 ? "#FF6B6B" : claudeUsage.weekly_sonnet.percent > 50 ? "#FFD93D" : "#00F0FF",
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ═══════════ INFRASTRUCTURE ROW ═══════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Docker Containers */}
        {dockerContainers.length > 0 && (
          <motion.div {...stagger(18)} className="glass rounded-xl p-5 sm:p-6">
            <SectionHeader icon={Container} title="Docker Containers" subtitle={`${runningDocker.length}/${dockerContainers.length} running`} color="#00F0FF" />
            <div className="space-y-2">
              {dockerContainers.map((c: any) => {
                const isRunning = c.state === "running";
                return (
                  <div key={c.name} className="glass-inset rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-mono text-heading">{c.name}</span>
                      <span
                        className={`pill ${
                          isRunning ? "bg-[#00FF88]/15 text-[#00FF88]" : "bg-[#FF6B6B]/15 text-[#FF6B6B]"
                        }`}
                      >
                        {isRunning ? "Running" : "Stopped"}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted truncate">{c.image}</p>
                    {c.ports && <p className="text-[10px] font-mono text-muted mt-0.5">{c.ports}</p>}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Network Overview */}
        {network && (
          <motion.div {...stagger(19)} className="glass rounded-xl p-5 sm:p-6">
            <SectionHeader icon={Globe} title="Network" subtitle={`${network.activeConnections} active connections`} color="#00FF88" />
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="glass-inset rounded-lg p-3 text-center">
                <ArrowDown className="w-4 h-4 mx-auto mb-1 text-[#00FF88]" />
                <p className="text-[10px] text-muted">Download</p>
                <p className="text-sm font-bold text-heading">{network.totalRx}</p>
              </div>
              <div className="glass-inset rounded-lg p-3 text-center">
                <ArrowUp className="w-4 h-4 mx-auto mb-1 text-[#00F0FF]" />
                <p className="text-[10px] text-muted">Upload</p>
                <p className="text-sm font-bold text-heading">{network.totalTx}</p>
              </div>
            </div>
            {network.dnsServers?.length > 0 && (
              <div className="border-t border-divider pt-3">
                <p className="text-[10px] text-muted uppercase tracking-wider mb-2">DNS Servers</p>
                <div className="flex flex-wrap gap-1.5">
                  {network.dnsServers.map((dns: string) => (
                    <span key={dns} className="pill bg-surface text-muted font-mono text-[10px]">
                      {dns}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {network.interfaces?.length > 0 && (
              <div className="border-t border-divider pt-3 mt-3">
                <p className="text-[10px] text-muted uppercase tracking-wider mb-2">Interfaces</p>
                <div className="space-y-1.5">
                  {network.interfaces.slice(0, 4).map((iface: any) => (
                    <div key={iface.interface} className="flex items-center justify-between text-xs">
                      <span className="font-mono text-muted">{iface.interface}</span>
                      <span className="text-heading">
                        <span className="text-[#00FF88]">{iface.rxBytesFormatted}</span>
                        {" / "}
                        <span className="text-[#00F0FF]">{iface.txBytesFormatted}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* OpenClaw Sessions */}
        {sessions && (
          <motion.div {...stagger(20)} className="glass rounded-xl p-5 sm:p-6">
            <SectionHeader icon={Terminal} title="OpenClaw Sessions" subtitle={`${totalSessions} total sessions`} color="#FFD93D" />
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="glass-inset rounded-lg p-3 text-center">
                <p className="text-[10px] text-muted">Input Tokens</p>
                <p className="text-sm font-bold text-[#6C63FF]">{fmt(sessionTokensIn)}</p>
              </div>
              <div className="glass-inset rounded-lg p-3 text-center">
                <p className="text-[10px] text-muted">Output Tokens</p>
                <p className="text-sm font-bold text-[#00FF88]">{fmt(sessionTokensOut)}</p>
              </div>
            </div>
            {recentSessions.length > 0 && (
              <div className="border-t border-divider pt-3">
                <p className="text-[10px] text-muted uppercase tracking-wider mb-2">Recent Sessions</p>
                <div className="space-y-2">
                  {recentSessions.slice(0, 4).map((s: any, i: number) => (
                    <div key={i} className="glass-inset rounded-lg p-2.5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono text-[#00F0FF] truncate max-w-[140px]">
                          {s.sessionId}
                        </span>
                        <span className="text-[10px] text-muted">{s.age}ms</span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px]">
                        <span className="text-[#6C63FF]">{fmt(s.inputTokens || 0)} in</span>
                        <span className="text-[#00FF88]">{fmt(s.outputTokens || 0)} out</span>
                        {s.cacheRead > 0 && <span className="text-[#FFD93D]">{fmt(s.cacheRead)} cached</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {sessions.runtimeVersion && (
              <div className="border-t border-divider pt-3 mt-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted">Runtime</span>
                  <span className="font-mono text-heading">{sessions.runtimeVersion}</span>
                </div>
                {sessions.sessions?.defaults?.model && (
                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className="text-muted">Default Model</span>
                    <span className="font-mono text-heading">{sessions.sessions.defaults.model}</span>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* ═══════════ LISTENING PORTS ═══════════ */}
      {listeningPorts.length > 0 && (
        <motion.div {...stagger(21)} className="glass rounded-xl overflow-hidden">
          <div className="p-5 border-b border-divider">
            <SectionHeader icon={Radio} title="Listening Ports" subtitle={`${listeningPorts.length} active ports`} color="#6C63FF" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-divider">
                  {["Port", "PID", "Process", "Protocol"].map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-muted uppercase tracking-wider px-5 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {listeningPorts.slice(0, 10).map((port: any, i: number) => (
                  <tr key={i} className="border-b border-divider-dim hover:bg-surface-dim transition-colors">
                    <td className="px-5 py-2.5 text-sm font-mono text-[#00F0FF]">{port.port}</td>
                    <td className="px-5 py-2.5 text-sm font-mono text-muted">{port.pid}</td>
                    <td className="px-5 py-2.5 text-sm text-heading">{port.process}</td>
                    <td className="px-5 py-2.5">
                      <span className="pill bg-[#6C63FF]/15 text-[#6C63FF]">{port.protocol}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* ═══════════ FOOTER ═══════════ */}
      <motion.div
        {...stagger(22)}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-muted border-t border-divider-dim pt-5 gap-2"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" />
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
          {system && (
            <span className="text-[10px]">
              {system.hostname} · {system.platform} {system.arch}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 opacity-60">
            <span className="w-1.5 h-1.5 rounded-full bg-success pulse-dot" />
            Auto-refresh 5s
          </div>
          <span className="text-[10px] opacity-40">
            8 data sources · {Object.keys(anthro.daily || {}).length + Object.keys(oai.daily || {}).length} data points
          </span>
        </div>
      </motion.div>
    </div>
  );
}
