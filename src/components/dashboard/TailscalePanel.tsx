"use client";

import { motion } from "framer-motion";
import { Network, Wifi, WifiOff, ArrowDown, ArrowUp } from "lucide-react";
import type { TailscaleData } from "@/lib/useSystemData";

function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

export default function TailscalePanel({ data }: { data: TailscaleData | null }) {
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

  const onlineCount = data.peers.filter((p) => p.online).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-heading font-semibold">Tailscale Network</h3>
          <p className="text-xs text-muted">
            {data.magicDNSSuffix || "VPN mesh"}
          </p>
        </div>
        <div className={`pill ${
          !data.installed ? "bg-[#7A7A9E]/15 text-muted" :
          data.running ? "bg-[#00FF88]/15 text-[#00FF88]" :
          "bg-[#FF6B6B]/15 text-[#FF6B6B]"
        }`}>
          {!data.installed ? "Not Installed" : data.running ? "Connected" : "Disconnected"}
        </div>
      </div>

      {/* Self node */}
      {data.self && (
        <div className="glass-inset p-3 mb-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Network className="w-3.5 h-3.5 text-[#00F0FF]" />
              <span className="text-sm font-medium text-heading">{data.self.name}</span>
            </div>
            <span className="pill bg-[#00F0FF]/15 text-[#00F0FF]">This device</span>
          </div>
          <div className="flex gap-4 text-[10px] text-muted mt-1">
            <span>IP: {data.self.ip}</span>
            <span>OS: {data.self.os}</span>
          </div>
        </div>
      )}

      {/* Peers */}
      {data.peers.length > 0 && (
        <>
          <p className="text-xs text-muted mb-2">
            Peers ({onlineCount}/{data.peers.length} online)
          </p>
          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
            {data.peers.map((peer, i) => (
              <motion.div
                key={peer.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass-inset p-3"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {peer.online ? (
                      <Wifi className="w-3.5 h-3.5 text-[#00FF88]" />
                    ) : (
                      <WifiOff className="w-3.5 h-3.5 text-muted" />
                    )}
                    <span className={`text-sm font-medium ${peer.online ? "text-heading" : "text-muted"}`}>
                      {peer.name}
                    </span>
                  </div>
                  <span className={`pill ${peer.online ? "bg-[#00FF88]/15 text-[#00FF88]" : "bg-surface text-muted"}`}>
                    {peer.online ? "online" : "offline"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[10px] text-muted mt-1">
                  <span>{peer.ip}</span>
                  <span>{peer.os}</span>
                  <span>{peer.relay}</span>
                </div>
                {(peer.rxBytes > 0 || peer.txBytes > 0) && (
                  <div className="flex gap-3 mt-1.5 text-[10px]">
                    <span className="flex items-center gap-1 text-[#00FF88]">
                      <ArrowDown className="w-2.5 h-2.5" /> {formatBytes(peer.rxBytes)}
                    </span>
                    <span className="flex items-center gap-1 text-[#00F0FF]">
                      <ArrowUp className="w-2.5 h-2.5" /> {formatBytes(peer.txBytes)}
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </>
      )}

      {!data.installed && (
        <p className="text-sm text-muted text-center py-6">
          Tailscale is not installed on this machine
        </p>
      )}

      {data.installed && !data.running && (
        <p className="text-sm text-muted text-center py-6">
          Tailscale is installed but not connected
        </p>
      )}

      {data.running && data.peers.length === 0 && (
        <p className="text-sm text-muted text-center py-6">
          No peers found
        </p>
      )}
    </motion.div>
  );
}
