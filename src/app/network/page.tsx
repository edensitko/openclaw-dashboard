"use client";

import NetworkPanel from "@/components/dashboard/NetworkPanel";
import { useSystemData } from "@/lib/useSystemData";
import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, Radio, Globe } from "lucide-react";

export default function NetworkPage() {
  const { data, network } = useSystemData(3000);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-heading">Network</h2>
        <p className="text-sm text-muted">
          Network interfaces, traffic, and connections
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total RX", value: network?.totalRx ?? "—", icon: ArrowDown, color: "#00FF88" },
          { label: "Total TX", value: network?.totalTx ?? "—", icon: ArrowUp, color: "#00F0FF" },
          { label: "Connections", value: network?.activeConnections.toString() ?? "—", icon: Radio, color: "#6C63FF" },
          { label: "Interfaces", value: network?.interfaces.length.toString() ?? "—", icon: Globe, color: "#FFD93D" },
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
        <NetworkPanel data={network} />

        {/* Network interfaces from OS */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass p-5">
          <h3 className="text-heading font-semibold mb-1">OS Network Interfaces</h3>
          <p className="text-xs text-muted mb-4">IP addresses from system</p>
          {data ? (
            <div className="space-y-2">
              {data.network.map((iface, i) => (
                <div key={i} className="glass-inset p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-mono text-heading">{iface.name}</span>
                    <span className="pill bg-[#00FF88]/15 text-[#00FF88]">{iface.family}</span>
                  </div>
                  <p className="text-xs font-mono text-muted break-all">{iface.address}</p>
                  {iface.mac && iface.mac !== "00:00:00:00:00:00" && (
                    <p className="text-[10px] font-mono text-muted mt-0.5">MAC: {iface.mac}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2 animate-pulse">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-14 bg-surface-dim rounded-2xl" />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
