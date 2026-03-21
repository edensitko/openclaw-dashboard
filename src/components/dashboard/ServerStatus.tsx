"use client";

import { motion } from "framer-motion";
import { Monitor, Cpu, HardDrive, Clock, Globe, User } from "lucide-react";
import type { SystemData } from "@/lib/useSystemData";

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="w-full h-1.5 rounded-full bg-surface overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${value}%`, backgroundColor: color }}
      />
    </div>
  );
}

function getColor(pct: number) {
  if (pct > 85) return "#FF6B6B";
  if (pct > 65) return "#FFD93D";
  return "#00FF88";
}

export default function ServerStatus({ data }: { data: SystemData | null }) {
  if (!data) {
    return (
      <div className="glass rounded-xl p-5 animate-pulse">
        <div className="h-4 w-32 bg-surface rounded mb-4" />
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-surface-dim rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="glass rounded-xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-heading font-semibold">Server Info</h3>
          <p className="text-xs text-muted">{data.hostname}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse" />
          <span className="text-xs text-[#00FF88]">Online</span>
        </div>
      </div>

      <div className="space-y-3">
        {/* System info */}
        <div className="p-3 rounded-lg bg-surface-dim border border-divider-dim">
          <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
            <div className="flex items-center gap-2">
              <Monitor className="w-3.5 h-3.5 text-[#00F0FF]" />
              <span className="text-muted">OS</span>
            </div>
            <span className="text-heading text-right font-mono">{data.osType} {data.arch}</span>

            <div className="flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-[#6C63FF]" />
              <span className="text-muted">CPU</span>
            </div>
            <span className="text-heading text-right font-mono text-[10px] truncate">{data.cpu.model.split("@")[0].trim()}</span>

            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-[#00FF88]" />
              <span className="text-muted">Platform</span>
            </div>
            <span className="text-heading text-right font-mono">{data.platform}</span>

            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#FFD93D]" />
              <span className="text-muted">Uptime</span>
            </div>
            <span className="text-heading text-right font-mono">{data.uptime}</span>

            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-subtle" />
              <span className="text-muted">User</span>
            </div>
            <span className="text-heading text-right font-mono">{data.userInfo.username}</span>
          </div>
        </div>

        {/* CPU */}
        <div className="p-3 rounded-lg bg-surface-dim border border-divider-dim">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-muted">CPU Usage ({data.cpu.cores} cores)</span>
            <span className="font-mono" style={{ color: getColor(data.cpu.usage) }}>
              {data.cpu.usage}%
            </span>
          </div>
          <ProgressBar value={data.cpu.usage} color={getColor(data.cpu.usage)} />
          <div className="flex gap-4 mt-2 text-[10px] text-muted">
            <span>Load: {data.cpu.loadAvg["1m"]} / {data.cpu.loadAvg["5m"]} / {data.cpu.loadAvg["15m"]}</span>
          </div>
        </div>

        {/* Memory */}
        <div className="p-3 rounded-lg bg-surface-dim border border-divider-dim">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-muted">Memory ({data.memory.used} / {data.memory.total})</span>
            <span className="font-mono" style={{ color: getColor(data.memory.percent) }}>
              {data.memory.percent}%
            </span>
          </div>
          <ProgressBar value={data.memory.percent} color={getColor(data.memory.percent)} />
        </div>

        {/* Disk */}
        <div className="p-3 rounded-lg bg-surface-dim border border-divider-dim">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-muted">Disk ({data.disk.used} / {data.disk.total})</span>
            <span className="font-mono" style={{ color: getColor(data.disk.percent) }}>
              {data.disk.percent}%
            </span>
          </div>
          <ProgressBar value={data.disk.percent} color={getColor(data.disk.percent)} />
        </div>

        {/* Network */}
        {data.network.length > 0 && (
          <div className="p-3 rounded-lg bg-surface-dim border border-divider-dim">
            <p className="text-xs text-muted mb-2">Network Interfaces</p>
            <div className="space-y-1">
              {data.network.slice(0, 4).map((iface, i) => (
                <div key={i} className="flex justify-between text-[10px]">
                  <span className="text-subtle">{iface.name} ({iface.family})</span>
                  <span className="text-heading font-mono">{iface.address}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
