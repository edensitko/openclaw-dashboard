"use client";

import CpuMemoryChart from "@/components/dashboard/RequestsChart";
import DiskUsageChart from "@/components/dashboard/ModelUsageChart";
import LoadAverageChart from "@/components/dashboard/LatencyChart";
import { useSystemData } from "@/lib/useSystemData";
import { useChartTheme } from "@/components/ThemeProvider";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AnalyticsPage() {
  const { data, history, network } = useSystemData(3000);
  const chart = useChartTheme();

  const cpuData = history.map((p) => ({
    name: new Date(p.timestamp).toLocaleTimeString([], { minute: "2-digit", second: "2-digit" }),
    value: p.cpu,
  }));

  const memData = history.map((p) => ({
    name: new Date(p.timestamp).toLocaleTimeString([], { minute: "2-digit", second: "2-digit" }),
    value: p.memory,
  }));

  const tooltipStyle = chart.tooltip;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-heading">Analytics</h2>
        <p className="text-sm text-muted">
          Performance metrics — {data?.hostname || "connecting..."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <CpuMemoryChart history={history} />
        <DiskUsageChart data={data} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* CPU chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass p-5">
          <h3 className="text-heading font-semibold mb-1">CPU History</h3>
          <p className="text-xs text-muted mb-4">{data?.cpu.model.split("@")[0].trim() || "—"}</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={cpuData}>
              <defs>
                <linearGradient id="cpuOnly" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00F0FF" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#00F0FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
              <XAxis dataKey="name" tick={{ fill: chart.tick, fontSize: 10 }} tickLine={false} interval="preserveStartEnd" />
              <YAxis domain={[0, 100]} tick={{ fill: chart.tick, fontSize: 12 }} tickLine={false} axisLine={false} unit="%" />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="value" stroke="#00F0FF" strokeWidth={2} fill="url(#cpuOnly)" name="CPU %" isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Memory chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass p-5">
          <h3 className="text-heading font-semibold mb-1">Memory History</h3>
          <p className="text-xs text-muted mb-4">{data ? `${data.memory.used} / ${data.memory.total}` : "—"}</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={memData}>
              <defs>
                <linearGradient id="memOnly" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6C63FF" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#6C63FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
              <XAxis dataKey="name" tick={{ fill: chart.tick, fontSize: 10 }} tickLine={false} interval="preserveStartEnd" />
              <YAxis domain={[0, 100]} tick={{ fill: chart.tick, fontSize: 12 }} tickLine={false} axisLine={false} unit="%" />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="value" stroke="#6C63FF" strokeWidth={2} fill="url(#memOnly)" name="Memory %" isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <LoadAverageChart data={data} />
        <div className="glass p-5">
          <h3 className="text-heading font-semibold mb-1">System Snapshot</h3>
          <p className="text-xs text-muted mb-4">Current state</p>
          <div className="space-y-3">
            {[
              { label: "Hostname", value: data?.hostname ?? "—", color: "#00F0FF" },
              { label: "OS", value: data ? `${data.osType} ${data.osRelease}` : "—", color: "#6C63FF" },
              { label: "Architecture", value: data?.arch ?? "—", color: "#00FF88" },
              { label: "CPU Speed", value: data ? `${data.cpu.speed} MHz` : "—", color: "#FFD93D" },
              { label: "Uptime", value: data?.uptime ?? "—", color: "#FF6B6B" },
              { label: "Connections", value: network?.activeConnections.toString() ?? "—", color: "#9E9EBE" },
              { label: "Network RX", value: network?.totalRx ?? "—", color: "#00FF88" },
              { label: "Network TX", value: network?.totalTx ?? "—", color: "#00F0FF" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-subtle">{item.label}</span>
                </div>
                <span className="text-sm font-mono text-heading">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
