"use client";

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
import type { HistoryPoint } from "@/lib/useSystemData";
import { useChartTheme } from "@/components/ThemeProvider";

interface Props {
  history: HistoryPoint[];
}

export default function CpuMemoryChart({ history }: Props) {
  const chart = useChartTheme();
  const chartData = history.map((p, i) => ({
    name: new Date(p.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    cpu: p.cpu,
    memory: p.memory,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="glass rounded-xl p-4 sm:p-5 lg:col-span-2"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-heading font-semibold">CPU & Memory Over Time</h3>
          <p className="text-xs text-muted">Live — updates every 3s</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 rounded bg-[#00F0FF]" />
            <span className="text-muted">CPU</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 rounded bg-[#6C63FF]" />
            <span className="text-muted">Memory</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00F0FF" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#00F0FF" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6C63FF" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#6C63FF" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
          <XAxis
            dataKey="name"
            tick={{ fill: chart.tick, fontSize: 10 }}
            axisLine={{ stroke: chart.axis }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: chart.tick, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            domain={[0, 100]}
            unit="%"
          />
          <Tooltip
            contentStyle={chart.tooltip}
            formatter={(value) => [`${value}%`, ""]}
          />
          <Area
            type="monotone"
            dataKey="cpu"
            stroke="#00F0FF"
            strokeWidth={2}
            fill="url(#cpuGrad)"
            name="CPU"
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="memory"
            stroke="#6C63FF"
            strokeWidth={2}
            fill="url(#memGrad)"
            name="Memory"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
