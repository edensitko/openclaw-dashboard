"use client";

import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { SystemData } from "@/lib/useSystemData";
import { useChartTheme } from "@/components/ThemeProvider";

export default function LoadAverageChart({ data }: { data: SystemData | null }) {
  if (!data) {
    return (
      <div className="glass rounded-xl p-5 lg:col-span-2 animate-pulse">
        <div className="h-4 w-32 bg-surface rounded mb-4" />
        <div className="h-[220px] bg-surface-dim rounded" />
      </div>
    );
  }

  const chartData = [
    { period: "1 min", load: parseFloat(data.cpu.loadAvg["1m"]) },
    { period: "5 min", load: parseFloat(data.cpu.loadAvg["5m"]) },
    { period: "15 min", load: parseFloat(data.cpu.loadAvg["15m"]) },
  ];

  const chart = useChartTheme();
  const maxLoad = Math.max(...chartData.map((d) => d.load), data.cpu.cores);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="glass rounded-xl p-5 lg:col-span-2"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-heading font-semibold">System Load Average</h3>
          <p className="text-xs text-muted">
            {data.cpu.cores} cores — load above {data.cpu.cores} means overloaded
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
          <XAxis
            dataKey="period"
            tick={{ fill: chart.tick, fontSize: 12 }}
            axisLine={{ stroke: chart.axis }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: chart.tick, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            domain={[0, Math.ceil(maxLoad * 1.2)]}
          />
          <Tooltip
            contentStyle={chart.tooltip}
          />
          <Bar
            dataKey="load"
            radius={[6, 6, 0, 0]}
            fill="#00F0FF"
          />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
