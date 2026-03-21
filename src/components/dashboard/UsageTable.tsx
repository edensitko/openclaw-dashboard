"use client";

import { motion } from "framer-motion";
import type { SystemData } from "@/lib/useSystemData";

export default function ProcessTable({ data }: { data: SystemData | null }) {
  const processes = data?.processes ?? [];

  if (!data) {
    return (
      <div className="glass rounded-xl overflow-hidden animate-pulse">
        <div className="p-5 border-b border-divider">
          <div className="h-4 w-40 bg-surface rounded" />
        </div>
        <div className="p-5 space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-6 bg-surface-dim rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      className="glass rounded-xl overflow-hidden"
    >
      <div className="flex items-center justify-between p-5 border-b border-divider">
        <div>
          <h3 className="text-heading font-semibold">Top Processes</h3>
          <p className="text-xs text-muted">Sorted by CPU usage — live from {data.hostname}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse" />
          <span className="text-xs text-muted">Live</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-divider">
              {["PID", "Process", "CPU %", "Memory %"].map((header) => (
                <th
                  key={header}
                  className="text-left text-xs font-medium text-muted uppercase tracking-wider px-5 py-3"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {processes.map((proc, i) => {
              const cpuVal = parseFloat(proc.cpu);
              const memVal = parseFloat(proc.mem);
              return (
                <tr
                  key={`${proc.pid}-${i}`}
                  className="border-b border-divider-dim hover:bg-surface-dim transition-colors"
                >
                  <td className="px-5 py-2.5 text-sm font-mono text-muted">{proc.pid}</td>
                  <td className="px-5 py-2.5 text-sm font-mono text-heading">{proc.name}</td>
                  <td className="px-5 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-surface overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(cpuVal, 100)}%`,
                            backgroundColor: cpuVal > 50 ? "#FF6B6B" : cpuVal > 20 ? "#FFD93D" : "#00FF88",
                          }}
                        />
                      </div>
                      <span className="text-xs font-mono text-subtle">{proc.cpu}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-surface overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(memVal, 100)}%`,
                            backgroundColor: memVal > 50 ? "#FF6B6B" : memVal > 20 ? "#FFD93D" : "#6C63FF",
                          }}
                        />
                      </div>
                      <span className="text-xs font-mono text-subtle">{proc.mem}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
