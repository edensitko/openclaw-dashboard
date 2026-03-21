"use client";

import { motion } from "framer-motion";
import ActivityFeed from "@/components/dashboard/ActivityFeed";

const logs = [
  { time: "2026-03-21 14:23:01", level: "INFO", service: "clawsbot", msg: "Bot agent started — processing incoming webhook" },
  { time: "2026-03-21 14:22:58", level: "WARN", service: "rate-limiter", msg: "Rate limit approaching for Discord guild 9832 (850/1000 rpm)" },
  { time: "2026-03-21 14:22:55", level: "INFO", service: "agent", msg: "Routed request to claude-3.5-sonnet (region: eu-west)" },
  { time: "2026-03-21 14:22:50", level: "ERROR", service: "upstream", msg: "Timeout waiting for upstream LLM response (30s)" },
  { time: "2026-03-21 14:22:45", level: "INFO", service: "auth", msg: "Tailscale peer authenticated: eden-macbook" },
  { time: "2026-03-21 14:22:40", level: "INFO", service: "clawsbot", msg: "Command processed: /ask 'what is the weather' (145ms)" },
  { time: "2026-03-21 14:22:35", level: "WARN", service: "health", msg: "EC2 memory usage elevated (92% used)" },
  { time: "2026-03-21 14:22:30", level: "INFO", service: "billing", msg: "Usage record: 15,230 tokens for guild acme-server" },
  { time: "2026-03-21 14:22:25", level: "ERROR", service: "agent", msg: "Fallback triggered — primary model unavailable" },
  { time: "2026-03-21 14:22:20", level: "INFO", service: "clawsbot", msg: "Scheduled task ran: daily-stats-report" },
];

const levelColors: Record<string, string> = {
  INFO: "text-[#00F0FF]",
  WARN: "text-[#FFD93D]",
  ERROR: "text-[#FF6B6B]",
};

const levelBg: Record<string, string> = {
  INFO: "bg-[#00F0FF]/10",
  WARN: "bg-[#FFD93D]/10",
  ERROR: "bg-[#FF6B6B]/10",
};

export default function LogsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-heading">Logs</h2>
        <p className="text-sm text-muted">ClawsBot system and agent logs</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass overflow-hidden">
          <div className="p-4 border-b border-divider flex items-center justify-between">
            <span className="text-sm text-heading font-medium">System Logs</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00FF88] pulse-dot" />
              <span className="text-xs text-muted">Streaming</span>
            </div>
          </div>
          <div className="p-3 font-mono text-xs space-y-1 max-h-[600px] overflow-y-auto glass-inset m-3" style={{ borderRadius: "14px" }}>
            {logs.map((log, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex gap-3 py-1.5 px-2 rounded-xl ios-row"
              >
                <span className="text-muted shrink-0 hidden md:inline">{log.time}</span>
                <span className={`shrink-0 px-1.5 py-0.5 rounded-lg text-[10px] font-bold ${levelColors[log.level]} ${levelBg[log.level]}`}>
                  {log.level}
                </span>
                <span className="text-[#6C63FF] shrink-0 hidden sm:inline">[{log.service}]</span>
                <span className="text-body break-all sm:break-normal">{log.msg}</span>
              </motion.div>
            ))}
          </div>
        </div>
        <ActivityFeed />
      </div>
    </div>
  );
}
