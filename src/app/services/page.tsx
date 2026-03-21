"use client";

import ServicesPanel from "@/components/dashboard/ServicesPanel";
import ProcessTable from "@/components/dashboard/UsageTable";
import { useSystemData } from "@/lib/useSystemData";
import { motion } from "framer-motion";
import { Container, Play, Square, AlertTriangle } from "lucide-react";

export default function ServicesPage() {
  const { data, services } = useSystemData(3000);

  const running = services?.services.filter((s) => s.status === "running").length ?? 0;
  const stopped = services?.services.filter((s) => s.status === "stopped").length ?? 0;
  const dockerRunning = services?.docker.filter((d) => d.state === "running").length ?? 0;
  const ports = services?.listeningPorts.length ?? 0;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-heading">Services</h2>
        <p className="text-sm text-muted">All running services, Docker containers, and listening ports</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Running", value: running.toString(), icon: Play, color: "#00FF88" },
          { label: "Stopped", value: stopped.toString(), icon: Square, color: "#7A7A9E" },
          { label: "Docker", value: dockerRunning.toString(), icon: Container, color: "#00F0FF" },
          { label: "Ports", value: ports.toString(), icon: AlertTriangle, color: "#FFD93D" },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div key={item.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="glass p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl" style={{ backgroundColor: `${item.color}15` }}>
                  <Icon className="w-5 h-5" style={{ color: item.color }} />
                </div>
                <div>
                  <p className="text-xs text-muted">{item.label}</p>
                  <p className="text-xl font-bold text-heading">{item.value}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ServicesPanel data={services} />
        <ProcessTable data={data} />
      </div>
    </div>
  );
}
