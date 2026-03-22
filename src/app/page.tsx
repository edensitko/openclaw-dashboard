"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Cpu,
  MemoryStick,
  HardDrive,
  Clock,
  Activity,
  Bot,
  Container,
  Globe,
  Zap,
  DollarSign,
  Server,
  Radio,
  ArrowDown,
  ArrowUp,
  Terminal,
  Layers,
  RefreshCw,
} from "lucide-react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useSystemData } from "@/lib/useSystemData";

/* ─── Helpers ─── */
function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

const stagger = (i: number) => ({
  initial: { opacity: 0, y: 14 } as const,
  animate: { opacity: 1, y: 0 } as const,
  transition: { delay: i * 0.05, duration: 0.4 },
});

/* ─── Gauge Ring ─── */
function GaugeRing({ percent, color, size = 64 }: { percent: number; color: string; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <svg width={size} height={size} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--t-surface)" strokeWidth="5" />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: "easeOut" }}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central" fill={color} fontSize="13" fontWeight="700" fontFamily="var(--font-mono)">
        {percent}%
      </text>
    </svg>
  );
}

/* ─── Chart tooltip ─── */
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 text-xs" style={{ background: "var(--tooltip-bg)", border: "1px solid var(--tooltip-border)", color: "var(--tooltip-text)", borderRadius: 12, backdropFilter: "blur(20px)" }}>
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {typeof p.value === "number" && p.value < 1 ? `$${p.value.toFixed(4)}` : `${p.value}%`}</p>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════
   OVERVIEW PAGE
   ═══════════════════════════════════════════ */
export default function Home() {
  const { data: sysData, history, services, network } = useSystemData(2000);
  const [usage, setUsage] = useState<any>(null);
  const [clawbot, setclawbot] = useState<any>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchExtra = useCallback(async () => {
    const results = await Promise.allSettled([
      fetch("/api-usage.json").then((r) => r.json()),
      fetch("/api/clawsbot", { cache: "no-store" }).then((r) => r.json()),
    ]);
    if (results[0].status === "fulfilled") setUsage(results[0].value);
    if (results[1].status === "fulfilled") setclawbot(results[1].value);
    setLastRefresh(new Date());
  }, []);

  useEffect(() => {
    fetchExtra();
    const id = setInterval(fetchExtra, 10000);
    return () => clearInterval(id);
  }, [fetchExtra]);

  /* Derived */
  const totalCost = (usage?.anthropic?.total?.cost || 0) + (usage?.openai?.total?.cost || 0);
  const todayCostA = usage?.anthropic?.daily?.["2026-03-21"]?.cost || 0;
  const todayCostO = usage?.openai?.daily?.["2026-03-21"]?.cost || 0;
  const todayCost = todayCostA + todayCostO;
  const dockerRunning = services?.docker?.filter((d: any) => d.state === "running").length || 0;
  const totalPorts = services?.listeningPorts?.length || 0;
  const activeConns = network?.activeConnections || 0;

  /* History chart */
  const historySlice = (history || []).slice(-40).map((p: any) => ({
    time: new Date(p.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    CPU: Math.round(p.cpu),
    Memory: Math.round(p.memory),
  }));

  /* Cost chart */
  const dailyDates = [...new Set([
    ...Object.keys(usage?.anthropic?.daily || {}),
    ...Object.keys(usage?.openai?.daily || {}),
  ])].sort();
  const costChart = dailyDates.map((date) => ({
    date: date.slice(5),
    Anthropic: usage?.anthropic?.daily?.[date]?.cost || 0,
    OpenAI: usage?.openai?.daily?.[date]?.cost || 0,
  }));

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ═══════ HEADER ═══════ */}
      <motion.div {...stagger(0)}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#00F0FF] to-[#6C63FF] flex items-center justify-center shadow-lg shadow-[#00F0FF]/20">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-heading">Overview</h1>
              <p className="text-xs text-muted">
                {sysData?.hostname || "loading..."} · Real-time infrastructure dashboard
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="pill bg-success/15 text-success flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success pulse-dot" />
              Live
            </span>
            <span className="pill bg-surface text-muted text-[10px]">{lastRefresh.toLocaleTimeString()}</span>
            <button onClick={fetchExtra} className="p-1.5 rounded-lg hover:bg-surface transition-colors">
              <RefreshCw className="w-3.5 h-3.5 text-muted" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* ═══════ RESOURCE GAUGES ═══════ */}
      {sysData && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: "CPU Usage", value: `${sysData.cpu.usage}%`, gauge: sysData.cpu.usage, sub: `${sysData.cpu.cores} cores · ${sysData.cpu.speed} MHz`, icon: Cpu, color: "#00F0FF" },
            { label: "Memory", value: sysData.memory.used, gauge: sysData.memory.percent, sub: `${sysData.memory.percent}% of ${sysData.memory.total}`, icon: MemoryStick, color: "#6C63FF" },
            { label: "Disk", value: sysData.disk.used, gauge: sysData.disk.percent, sub: `${sysData.disk.percent}% of ${sysData.disk.total}`, icon: HardDrive, color: "#00FF88" },
            { label: "Uptime", value: sysData.uptime, gauge: null, sub: `${sysData.platform} ${sysData.arch}`, icon: Clock, color: "#FFD93D" },
          ].map((item, i) => {
            const Icon = item.icon;
            const gaugeColor = item.gauge !== null
              ? (item.gauge > 85 ? "#FF6B6B" : item.gauge > 65 ? "#FFD93D" : item.color)
              : item.color;
            return (
              <motion.div key={item.label} {...stagger(i + 1)} className="glass rounded-xl p-4 sm:p-5 hover:bg-surface transition-all duration-300">
                <div className="flex items-center gap-3">
                  {item.gauge !== null ? (
                    <GaugeRing percent={item.gauge} color={gaugeColor} />
                  ) : (
                    <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${item.color}15` }}>
                      <Icon className="w-6 h-6" style={{ color: item.color }} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs text-muted">{item.label}</p>
                    <p className="text-xl font-bold text-heading">{item.value}</p>
                    <p className="text-[10px] text-muted truncate">{item.sub}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ═══════ CPU/MEMORY CHART ═══════ */}
      {historySlice.length > 2 && (
        <motion.div {...stagger(5)} className="glass rounded-xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-[#00F0FF]/15">
                <Activity className="w-4 h-4 text-[#00F0FF]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-heading">Resource Monitor</h3>
                <p className="text-[10px] text-muted">Live CPU & Memory usage</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#00F0FF]" /> CPU</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#6C63FF]" /> Memory</span>
            </div>
          </div>
          <div className="h-48 sm:h-60">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={historySlice}>
                <defs>
                  <linearGradient id="gCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00F0FF" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#00F0FF" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gMem" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6C63FF" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#6C63FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" tick={{ fill: "var(--t-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--t-muted)", fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} width={38} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="CPU" stroke="#00F0FF" fill="url(#gCpu)" strokeWidth={2} />
                <Area type="monotone" dataKey="Memory" stroke="#6C63FF" fill="url(#gMem)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* ═══════ INFRA STATS ROW ═══════ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Docker", value: dockerRunning.toString(), sub: "containers", icon: Container, color: "#00F0FF" },
          { label: "Ports", value: totalPorts.toString(), sub: "listening", icon: Radio, color: "#6C63FF" },
          { label: "Connections", value: activeConns.toString(), sub: "active", icon: Globe, color: "#00FF88" },
          { label: "RX", value: network?.totalRx || "—", sub: "downloaded", icon: ArrowDown, color: "#FFD93D" },
          { label: "TX", value: network?.totalTx || "—", sub: "uploaded", icon: ArrowUp, color: "#FF6B6B" },
          { label: "Today Cost", value: `$${todayCost.toFixed(4)}`, sub: "API spend", icon: DollarSign, color: "#D4A373" },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div key={item.label} {...stagger(6 + i)} className="glass rounded-xl p-3 sm:p-4 hover:bg-surface transition-all duration-300">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${item.color}15` }}>
                  <Icon className="w-4 h-4" style={{ color: item.color }} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-muted">{item.label}</p>
                  <p className="text-sm sm:text-base font-bold text-heading">{item.value}</p>
                  <p className="text-[9px] text-muted">{item.sub}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ═══════ clawbot + API COST + SYSTEM INFO ═══════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* clawbot Agent Card */}
        <motion.div {...stagger(12)} className="glass rounded-xl p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#00F0FF] to-[#6C63FF] flex items-center justify-center shadow-lg shadow-[#00F0FF]/20">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-heading">
                {clawbot?.agent?.name || "clawbot"}
                <span className="text-xs font-normal text-muted ml-1.5">v{clawbot?.agent?.version || "..."}</span>
              </h3>
              <p className="text-[10px] text-muted">{clawbot?.agent?.mode || "Loading..."}</p>
            </div>
            {clawbot && (
              <span className="pill bg-[#00FF88]/15 text-[#00FF88] flex items-center gap-1.5 ml-auto">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00FF88] pulse-dot" />
                Online
              </span>
            )}
          </div>
          <div className="space-y-2">
            {[
              { label: "Model", value: clawbot?.agent?.model, icon: Zap, color: "#00F0FF" },
              { label: "Fallback", value: clawbot?.agent?.fallbackModel, icon: Layers, color: "#FFD93D" },
              { label: "Hostname", value: clawbot?.server?.hostname, icon: Globe, color: "#00FF88" },
              { label: "PID", value: clawbot?.server?.pid?.toString(), icon: Terminal, color: "#6C63FF" },
            ].map((row) => {
              const Icon = row.icon;
              return (
                <div key={row.label} className="flex items-center justify-between py-0.5">
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5" style={{ color: row.color }} />
                    <span className="text-xs text-muted">{row.label}</span>
                  </div>
                  <span className="text-xs font-mono text-heading truncate max-w-[150px] text-right">{row.value || "—"}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* API Cost Chart */}
        {costChart.length > 0 && (
          <motion.div {...stagger(13)} className="glass rounded-xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-[#FFD93D]/15">
                  <DollarSign className="w-4 h-4 text-[#FFD93D]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-heading">API Costs</h3>
                  <p className="text-[10px] text-muted">Total: ${totalCost.toFixed(4)}</p>
                </div>
              </div>
            </div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <AreaChart data={costChart}>
                  <defs>
                    <linearGradient id="gcA" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00F0FF" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#00F0FF" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gcO" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6C63FF" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#6C63FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fill: "var(--t-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "var(--t-muted)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} width={40} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="Anthropic" stackId="1" stroke="#00F0FF" fill="url(#gcA)" strokeWidth={2} />
                  <Area type="monotone" dataKey="OpenAI" stackId="1" stroke="#6C63FF" fill="url(#gcO)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs text-muted">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#00F0FF]" /> Anthropic</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#6C63FF]" /> OpenAI</span>
            </div>
          </motion.div>
        )}

        {/* System Info */}
        {sysData && (
          <motion.div {...stagger(14)} className="glass rounded-xl p-5 sm:p-6">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-1.5 rounded-lg bg-[#00FF88]/15">
                <Server className="w-4 h-4 text-[#00FF88]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-heading">System Info</h3>
                <p className="text-[10px] text-muted">{sysData.hostname}</p>
              </div>
            </div>
            <div className="space-y-2">
              {[
                { label: "Platform", value: `${sysData.osType} ${sysData.platform}` },
                { label: "Architecture", value: sysData.arch },
                { label: "CPU", value: sysData.cpu.model?.split("@")[0]?.trim() },
                { label: "Cores", value: sysData.cpu.cores.toString() },
                { label: "Memory", value: `${sysData.memory.used} / ${sysData.memory.total}` },
                { label: "Disk", value: `${sysData.disk.used} / ${sysData.disk.total}` },
                { label: "User", value: sysData.userInfo?.username },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between py-0.5">
                  <span className="text-xs text-muted">{row.label}</span>
                  <span className="text-xs font-mono text-heading truncate max-w-[170px] text-right">{row.value || "—"}</span>
                </div>
              ))}
            </div>

            {/* Load averages */}
            <div className="mt-3 pt-3 border-t border-divider">
              <p className="text-[10px] text-muted uppercase tracking-wider mb-2">Load Average</p>
              <div className="flex gap-3">
                {["1m", "5m", "15m"].map((key) => {
                  const val = sysData.cpu.loadAvg[key as keyof typeof sysData.cpu.loadAvg];
                  const pct = Math.min((parseFloat(val) / sysData.cpu.cores) * 100, 100);
                  const color = pct > 85 ? "#FF6B6B" : pct > 65 ? "#FFD93D" : "#00FF88";
                  return (
                    <div key={key} className="flex-1 glass-inset rounded-lg p-2 text-center">
                      <p className="text-[9px] text-muted">{key}</p>
                      <p className="text-sm font-mono font-bold" style={{ color }}>{val}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* ═══════ PROCESS TABLE ═══════ */}
      {sysData && sysData.processes.length > 0 && (
        <motion.div {...stagger(15)} className="glass rounded-xl overflow-hidden">
          <div className="p-5 border-b border-divider">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-[#FFD93D]/15">
                <Terminal className="w-4 h-4 text-[#FFD93D]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-heading">Top Processes</h3>
                <p className="text-[10px] text-muted">By CPU usage</p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-divider">
                  {["PID", "Process", "CPU %", "MEM %"].map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-muted uppercase tracking-wider px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sysData.processes.slice(0, 8).map((proc: any, i: number) => (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-divider-dim hover:bg-surface-dim transition-colors"
                  >
                    <td className="px-5 py-2.5 text-xs font-mono text-muted">{proc.pid}</td>
                    <td className="px-5 py-2.5 text-xs text-heading">{proc.name}</td>
                    <td className="px-5 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-[#00F0FF] w-10">{proc.cpu}%</span>
                        <div className="flex-1 h-1.5 rounded-full bg-surface-dim overflow-hidden max-w-[80px]">
                          <div className="h-full rounded-full bg-[#00F0FF] transition-all" style={{ width: `${Math.min(parseFloat(proc.cpu), 100)}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-[#6C63FF] w-10">{proc.mem}%</span>
                        <div className="flex-1 h-1.5 rounded-full bg-surface-dim overflow-hidden max-w-[80px]">
                          <div className="h-full rounded-full bg-[#6C63FF] transition-all" style={{ width: `${Math.min(parseFloat(proc.mem), 100)}%` }} />
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* ═══════ FOOTER ═══════ */}
      <motion.div {...stagger(16)} className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-muted border-t border-divider-dim pt-5 gap-2">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5" />
          System refresh 2s · API refresh 10s · {lastRefresh.toLocaleTimeString()}
        </div>
        <div className="flex items-center gap-1.5 opacity-60">
          <span className="w-1.5 h-1.5 rounded-full bg-success pulse-dot" />
          All systems operational
        </div>
      </motion.div>
    </div>
  );
}
