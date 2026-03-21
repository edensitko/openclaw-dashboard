"use client";

import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, Globe, Radio, Wifi } from "lucide-react";
import type { NetworkData } from "@/lib/useSystemData";

export default function NetworkPanel({ data }: { data: NetworkData | null }) {
  if (!data) {
    return (
      <div className="glass p-5 animate-pulse">
        <div className="h-4 w-32 bg-surface rounded-xl mb-4" />
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-14 bg-surface-dim rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-heading font-semibold">Network I/O</h3>
          <p className="text-xs text-muted">{data.activeConnections} active connections</p>
        </div>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="glass-inset p-3 text-center">
          <ArrowDown className="w-4 h-4 text-[#00FF88] mx-auto mb-1" />
          <p className="text-lg font-bold text-heading">{data.totalRx}</p>
          <p className="text-[10px] text-muted">Total Received</p>
        </div>
        <div className="glass-inset p-3 text-center">
          <ArrowUp className="w-4 h-4 text-[#00F0FF] mx-auto mb-1" />
          <p className="text-lg font-bold text-heading">{data.totalTx}</p>
          <p className="text-[10px] text-muted">Total Sent</p>
        </div>
      </div>

      {/* Per-interface */}
      <p className="text-xs text-muted mb-2">Interfaces</p>
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {data.interfaces.map((iface, i) => (
          <motion.div
            key={iface.interface}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="glass-inset p-3"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <Wifi className="w-3 h-3 text-[#00F0FF]" />
                <span className="text-sm font-mono text-heading">{iface.interface}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="flex items-center gap-1.5">
                <ArrowDown className="w-2.5 h-2.5 text-[#00FF88]" />
                <span className="text-subtle">RX: {iface.rxBytesFormatted}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ArrowUp className="w-2.5 h-2.5 text-[#00F0FF]" />
                <span className="text-subtle">TX: {iface.txBytesFormatted}</span>
              </div>
              <span className="text-muted">{iface.rxPackets.toLocaleString()} pkts</span>
              <span className="text-muted">{iface.txPackets.toLocaleString()} pkts</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* DNS */}
      {data.dnsServers.length > 0 && (
        <div className="mt-4 pt-3 border-t border-divider">
          <p className="text-xs text-muted mb-2">DNS Servers</p>
          <div className="flex flex-wrap gap-1.5">
            {data.dnsServers.map((dns) => (
              <span key={dns} className="pill bg-[#6C63FF]/10 text-[#6C63FF] font-mono">
                {dns}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
