"use client";

import ServerStatus from "@/components/dashboard/ServerStatus";
import Ec2Info from "@/components/dashboard/Ec2Info";
import ProcessTable from "@/components/dashboard/UsageTable";
import { useSystemData } from "@/lib/useSystemData";
import { motion } from "framer-motion";
import { Server, Cpu, HardDrive, Clock } from "lucide-react";

export default function ServersPage() {
  const { data, ec2 } = useSystemData(3000);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-heading">Server</h2>
        <p className="text-sm text-muted">
          {data?.hostname || "loading..."} · Infrastructure monitoring
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "CPU Cores", value: data?.cpu.cores.toString() ?? "—", sub: data?.cpu.model.split("@")[0].trim(), icon: Cpu, color: "#00F0FF" },
          { label: "Memory", value: data?.memory.total ?? "—", sub: `${data?.memory.percent ?? 0}% used`, icon: Server, color: "#6C63FF" },
          { label: "Disk", value: data?.disk.total ?? "—", sub: `${data?.disk.percent ?? 0}% used`, icon: HardDrive, color: "#00FF88" },
          { label: "Uptime", value: data?.uptime ?? "—", sub: `${data?.platform ?? ""} ${data?.arch ?? ""}`, icon: Clock, color: "#FFD93D" },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div key={item.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="glass p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl" style={{ backgroundColor: `${item.color}15` }}>
                  <Icon className="w-5 h-5" style={{ color: item.color }} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted">{item.label}</p>
                  <p className="text-xl font-bold text-heading">{item.value}</p>
                  {item.sub && <p className="text-[10px] text-muted truncate">{item.sub}</p>}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Ec2Info data={ec2} />
        <ServerStatus data={data} />
      </div>

      {/* Load averages */}
      {data && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-5">
          <h3 className="text-heading font-semibold mb-4">Load Average</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "1 minute", value: data.cpu.loadAvg["1m"] },
              { label: "5 minutes", value: data.cpu.loadAvg["5m"] },
              { label: "15 minutes", value: data.cpu.loadAvg["15m"] },
            ].map((load) => {
              const pct = Math.min((parseFloat(load.value) / data.cpu.cores) * 100, 100);
              const color = pct > 85 ? "#FF6B6B" : pct > 65 ? "#FFD93D" : "#00FF88";
              return (
                <div key={load.label} className="glass-inset p-4">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-muted">{load.label}</span>
                    <span className="font-mono text-heading">{load.value} / {data.cpu.cores}</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-surface overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      <ProcessTable data={data} />
    </div>
  );
}
