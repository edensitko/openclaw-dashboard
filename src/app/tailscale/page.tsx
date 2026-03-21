"use client";

import TailscalePanel from "@/components/dashboard/TailscalePanel";
import { useSystemData } from "@/lib/useSystemData";
import { motion } from "framer-motion";
import { Network, Wifi, WifiOff, Shield } from "lucide-react";

export default function TailscalePage() {
  const { tailscale } = useSystemData(5000);

  const online = tailscale?.peers.filter((p) => p.online).length ?? 0;
  const total = tailscale?.peers.length ?? 0;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-heading">Tailscale</h2>
        <p className="text-sm text-muted">VPN mesh network status and peers</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Status",
            value: tailscale?.running ? "Connected" : tailscale?.installed ? "Disconnected" : "Not Installed",
            icon: Network,
            color: tailscale?.running ? "#00FF88" : "#FF6B6B",
          },
          { label: "Online Peers", value: online.toString(), icon: Wifi, color: "#00F0FF" },
          { label: "Total Peers", value: total.toString(), icon: WifiOff, color: "#6C63FF" },
          {
            label: "This Device",
            value: tailscale?.self?.name ?? "—",
            icon: Shield,
            color: "#FFD93D",
          },
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
                  <p className="text-lg font-bold text-heading truncate">{item.value}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Self node detail */}
      {tailscale?.self && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass p-5">
          <h3 className="text-heading font-semibold mb-3">This Device</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-inset p-3">
              <p className="text-[10px] text-muted mb-1">Hostname</p>
              <p className="text-sm font-mono text-heading">{tailscale.self.name}</p>
            </div>
            <div className="glass-inset p-3">
              <p className="text-[10px] text-muted mb-1">Tailscale IP</p>
              <p className="text-sm font-mono text-[#00F0FF]">{tailscale.self.ip}</p>
            </div>
            <div className="glass-inset p-3">
              <p className="text-[10px] text-muted mb-1">OS</p>
              <p className="text-sm font-mono text-heading">{tailscale.self.os}</p>
            </div>
          </div>
          {tailscale.magicDNSSuffix && (
            <p className="text-xs text-muted mt-3">
              Magic DNS: <span className="text-heading font-mono">{tailscale.magicDNSSuffix}</span>
            </p>
          )}
        </motion.div>
      )}

      <TailscalePanel data={tailscale} />
    </div>
  );
}
