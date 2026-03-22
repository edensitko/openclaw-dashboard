"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Bot,
  Cpu,
  Zap,
  Globe,
  Shield,
  Bell,
  Palette,
  Database,
  Code,
  Server,
  Activity,
  Cloud,
  Terminal,
  MemoryStick,
  Settings,
  Layers,
  MessageSquare,
  Key,
  CheckCircle,
  XCircle,
  Container,
} from "lucide-react";

interface clawbotData {
  agent: {
    name: string;
    version: string;
    nodeVersion: string;
    runtime: string;
    model: string;
    fallbackModel: string;
    mode: string;
  };
  server: {
    hostname: string;
    platform: string;
    serverUptime: number;
    processUptime: number;
    pid: number;
  };
  memory: {
    rss: string;
    heapUsed: string;
    heapTotal: string;
    external: string;
  };
  integrations: {
    discord: boolean;
    openai: boolean;
    anthropic: boolean;
  };
  envKeys: string[];
  botProcesses: { user: string; pid: string; cpu: string; mem: string; command: string }[];
  dockerContainers: { name: string; image: string; status: string; ports: string }[];
  pm2Processes: { name: string; status: string; cpu: string; memory: string; uptime: string }[];
  systemdStatus: string;
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

const settingSections = [
  {
    icon: Globe,
    title: "General",
    description: "Bot name, timezone, default language, and response behavior",
    color: "#00F0FF",
    items: ["Bot Display Name", "Default Language", "Timezone", "Response Format", "Max Tokens"],
  },
  {
    icon: Shield,
    title: "Security",
    description: "API key rotation, rate limits, IP allowlists, and auth settings",
    color: "#6C63FF",
    items: ["API Key Rotation", "Rate Limit (rpm)", "IP Allowlist", "2FA Required", "Session Timeout"],
  },
  {
    icon: Bell,
    title: "Notifications",
    description: "Alert thresholds, Discord webhook, email preferences",
    color: "#FFD93D",
    items: ["Error Alert Threshold", "CPU Alert %", "Memory Alert %", "Discord Webhook", "Email Alerts"],
  },
  {
    icon: Palette,
    title: "Appearance",
    description: "Dashboard theme, chart colors, and display preferences",
    color: "#00FF88",
    items: ["Theme Mode", "Accent Color", "Chart Style", "Compact Mode", "Animation"],
  },
  {
    icon: Database,
    title: "Data & Privacy",
    description: "Log retention, data export, GDPR compliance, and caching",
    color: "#FF6B6B",
    items: ["Log Retention (days)", "Cache TTL", "Data Export", "GDPR Mode", "Anonymize Logs"],
  },
  {
    icon: Code,
    title: "API & Routing",
    description: "Model routing, fallback behavior, and endpoint configuration",
    color: "#00F0FF",
    items: ["Primary Model", "Fallback Model", "Retry Count", "Timeout (ms)", "Streaming"],
  },
];

export default function clawbotPage() {
  const [data, setData] = useState<clawbotData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/clawsbot", { cache: "no-store" });
        if (res.ok) setData(await res.json());
      } catch {}
    };
    fetchData();
    const id = setInterval(fetchData, 10000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-heading">clawbot</h2>
        <p className="text-sm text-muted">Agent configuration, integrations, and settings</p>
      </div>

      {/* Agent Status Hero */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-heavy p-6 rounded-[28px]"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-[#00F0FF] to-[#6C63FF] flex items-center justify-center shadow-lg shadow-[#00F0FF]/20">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-heading">
                {data?.agent.name || "clawbot"}{" "}
                <span className="text-sm font-normal text-muted">v{data?.agent.version || "..."}</span>
              </h3>
              <p className="text-xs text-muted">
                {data ? `${data.agent.runtime} ${data.agent.nodeVersion} · PID ${data.server.pid}` : "Loading..."}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="pill bg-[#00FF88]/15 text-[#00FF88] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FF88] pulse-dot" />
              {data?.agent.mode || "Online"}
            </span>
            <span className="pill bg-[#6C63FF]/15 text-[#6C63FF]">
              {data?.agent.model || "..."}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Agent Info Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Model",
            value: data?.agent.model ?? "—",
            icon: Zap,
            color: "#00F0FF",
          },
          {
            label: "Fallback",
            value: data?.agent.fallbackModel ?? "—",
            icon: Layers,
            color: "#6C63FF",
          },
          {
            label: "Process Uptime",
            value: data ? formatUptime(data.server.processUptime) : "—",
            icon: Activity,
            color: "#00FF88",
          },
          {
            label: "Memory (RSS)",
            value: data?.memory.rss ?? "—",
            icon: MemoryStick,
            color: "#FFD93D",
          },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="glass p-4"
            >
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

      {/* Agent Details + Integrations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Agent Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Terminal className="w-4 h-4 text-[#00F0FF]" />
            <h3 className="text-heading font-semibold">Agent Details</h3>
          </div>
          <div className="space-y-2.5">
            {[
              { label: "Runtime", value: data ? `${data.agent.runtime} ${data.agent.nodeVersion}` : "—", icon: Server, color: "#00F0FF" },
              { label: "Primary Model", value: data?.agent.model ?? "—", icon: Zap, color: "#6C63FF" },
              { label: "Fallback Model", value: data?.agent.fallbackModel ?? "—", icon: Layers, color: "#FFD93D" },
              { label: "Mode", value: data?.agent.mode ?? "—", icon: Settings, color: "#00FF88" },
              { label: "Hostname", value: data?.server.hostname ?? "—", icon: Globe, color: "#00F0FF" },
              { label: "Platform", value: data?.server.platform ?? "—", icon: Cpu, color: "#9E9EBE" },
              { label: "PID", value: data?.server.pid.toString() ?? "—", icon: Activity, color: "#FF6B6B" },
            ].map((row) => {
              const Icon = row.icon;
              return (
                <div key={row.label} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-3.5 h-3.5" style={{ color: row.color }} />
                    <span className="text-xs text-muted">{row.label}</span>
                  </div>
                  <span className="text-xs font-mono text-heading truncate max-w-[180px] text-right">
                    {row.value}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Memory usage */}
          {data && (
            <div className="mt-4 pt-3 border-t border-divider">
              <p className="text-xs text-muted mb-2">Process Memory</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "RSS", value: data.memory.rss },
                  { label: "Heap Used", value: data.memory.heapUsed },
                  { label: "Heap Total", value: data.memory.heapTotal },
                  { label: "External", value: data.memory.external },
                ].map((m) => (
                  <div key={m.label} className="glass-inset p-2 text-center">
                    <p className="text-[10px] text-muted">{m.label}</p>
                    <p className="text-sm font-mono text-heading">{m.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Integrations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Key className="w-4 h-4 text-[#6C63FF]" />
            <h3 className="text-heading font-semibold">Integrations & Keys</h3>
          </div>

          <div className="space-y-3">
            {[
              { name: "Discord Bot", connected: data?.integrations.discord ?? false, icon: MessageSquare, color: "#5865F2" },
              { name: "Anthropic (Claude)", connected: data?.integrations.anthropic ?? false, icon: Cloud, color: "#D4A373" },
              { name: "OpenAI", connected: data?.integrations.openai ?? false, icon: Zap, color: "#10A37F" },
            ].map((integration) => {
              const Icon = integration.icon;
              return (
                <div key={integration.name} className="glass-inset p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" style={{ color: integration.color }} />
                    <span className="text-sm text-heading">{integration.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {integration.connected ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-[#00FF88]" />
                        <span className="pill bg-[#00FF88]/15 text-[#00FF88]">Connected</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-muted" />
                        <span className="pill bg-surface text-muted">Not configured</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Environment Keys */}
          {data && data.envKeys.length > 0 && (
            <div className="mt-4 pt-3 border-t border-divider">
              <p className="text-xs text-muted mb-2">Environment Variables</p>
              <div className="flex flex-wrap gap-1.5">
                {data.envKeys.map((key) => (
                  <span key={key} className="pill bg-[#6C63FF]/10 text-[#6C63FF] font-mono">
                    {key}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Docker containers */}
          {data && data.dockerContainers.length > 0 && (
            <div className="mt-4 pt-3 border-t border-divider">
              <p className="text-xs text-muted mb-2 flex items-center gap-1.5">
                <Container className="w-3 h-3" /> Docker Containers
              </p>
              <div className="space-y-2">
                {data.dockerContainers.map((c) => (
                  <div key={c.name} className="glass-inset p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-mono text-heading">{c.name}</span>
                      <span className={`pill ${
                        c.status.toLowerCase().includes("up") ? "bg-[#00FF88]/15 text-[#00FF88]" : "bg-[#FF6B6B]/15 text-[#FF6B6B]"
                      }`}>
                        {c.status.split(" ")[0]}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted">{c.image}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PM2 processes */}
          {data && data.pm2Processes.length > 0 && (
            <div className="mt-4 pt-3 border-t border-divider">
              <p className="text-xs text-muted mb-2">PM2 Processes</p>
              <div className="space-y-2">
                {data.pm2Processes.map((p) => (
                  <div key={p.name} className="glass-inset p-3 flex items-center justify-between">
                    <span className="text-sm font-mono text-heading">{p.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted">{p.cpu} · {p.memory}</span>
                      <span className={`pill ${
                        p.status === "online" ? "bg-[#00FF88]/15 text-[#00FF88]" : "bg-[#FF6B6B]/15 text-[#FF6B6B]"
                      }`}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Bot Processes */}
      {data && data.botProcesses.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-xl overflow-hidden"
        >
          <div className="p-5 border-b border-divider">
            <h3 className="text-heading font-semibold">Bot Processes</h3>
            <p className="text-xs text-muted">Active Node.js and bot-related processes</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-divider">
                  {["PID", "User", "CPU", "MEM", "Command"].map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-muted uppercase tracking-wider px-5 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.botProcesses.map((proc, i) => (
                  <tr key={i} className="border-b border-divider-dim hover:bg-surface-dim transition-colors">
                    <td className="px-5 py-2.5 text-sm font-mono text-muted">{proc.pid}</td>
                    <td className="px-5 py-2.5 text-sm text-heading">{proc.user}</td>
                    <td className="px-5 py-2.5 text-sm font-mono text-[#00F0FF]">{proc.cpu}%</td>
                    <td className="px-5 py-2.5 text-sm font-mono text-[#6C63FF]">{proc.mem}%</td>
                    <td className="px-5 py-2.5 text-xs font-mono text-muted truncate max-w-[300px]">{proc.command}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Settings Grid */}
      <div>
        <h3 className="text-lg font-semibold text-heading mb-3">Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {settingSections.map((section, i) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="glass p-5 cursor-pointer hover:bg-surface transition-all group"
              >
                <div className="flex items-start gap-4 mb-3">
                  <div className="p-3 rounded-2xl" style={{ backgroundColor: `${section.color}15` }}>
                    <Icon className="w-6 h-6" style={{ color: section.color }} />
                  </div>
                  <div>
                    <h3 className="text-heading font-semibold group-hover:text-[#00F0FF] transition-colors">
                      {section.title}
                    </h3>
                    <p className="text-sm text-muted mt-1">{section.description}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 pl-[60px]">
                  {section.items.map((item) => (
                    <span key={item} className="pill bg-surface text-muted text-[10px]">
                      {item}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
