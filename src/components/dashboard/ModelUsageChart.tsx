"use client";

import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import type { SystemData } from "@/lib/useSystemData";
import { useChartTheme } from "@/components/ThemeProvider";

export default function DiskUsageChart({ data }: { data: SystemData | null }) {
  if (!data) {
    return (
      <div className="glass rounded-xl p-5 animate-pulse">
        <div className="h-4 w-24 bg-surface rounded mb-4" />
        <div className="h-[200px] bg-surface-dim rounded" />
      </div>
    );
  }

  const chart = useChartTheme();
  const used = data.disk.percent;
  const free = 100 - used;

  const pieData = [
    { name: "Used", value: used, color: used > 85 ? "#FF6B6B" : used > 65 ? "#FFD93D" : "#00F0FF" },
    { name: "Free", value: free, color: chart.pieFree },
  ];

  const memUsed = data.memory.percent;
  const memFree = 100 - memUsed;
  const memData = [
    { name: "Used", value: memUsed, color: memUsed > 85 ? "#FF6B6B" : memUsed > 65 ? "#FFD93D" : "#6C63FF" },
    { name: "Free", value: memFree, color: chart.pieFree },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="glass rounded-xl p-5"
    >
      <h3 className="text-heading font-semibold mb-1">Resource Usage</h3>
      <p className="text-xs text-muted mb-4">Disk & Memory</p>

      <div className="grid grid-cols-2 gap-2">
        {/* Disk */}
        <div>
          <ResponsiveContainer width="100%" height={120}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={50}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="text-center -mt-2">
            <p className="text-lg font-bold text-heading">{used}%</p>
            <p className="text-[10px] text-muted">Disk</p>
          </div>
        </div>

        {/* Memory */}
        <div>
          <ResponsiveContainer width="100%" height={120}>
            <PieChart>
              <Pie
                data={memData}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={50}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
                stroke="none"
              >
                {memData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="text-center -mt-2">
            <p className="text-lg font-bold text-heading">{memUsed}%</p>
            <p className="text-[10px] text-muted">Memory</p>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 mt-4 pt-3 border-t border-divider">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted">Disk Total</span>
          <span className="text-heading font-mono">{data.disk.total}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted">Disk Free</span>
          <span className="text-heading font-mono">{data.disk.free}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted">RAM Total</span>
          <span className="text-heading font-mono">{data.memory.total}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted">RAM Free</span>
          <span className="text-heading font-mono">{data.memory.free}</span>
        </div>
      </div>
    </motion.div>
  );
}
