"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Send,
  Cpu,
  HardDrive,
  Server,
  Network,
  Globe,
  Shield,
  Activity,
  Container,
  Zap,
  Loader2,
  Terminal,
  MemoryStick,
  Wifi,
  X,
  ChevronRight,
  Sparkles,
  RefreshCw,
} from "lucide-react";

/* ── Types ─────────────────────────────────────────── */

interface Skill {
  id: string;
  name: string;
  description: string;
  icon: typeof Bot;
  color: string;
  endpoint: string;
  formatter: (data: Record<string, unknown>) => MessageBlock[];
}

interface MessageBlock {
  type: "text" | "kv" | "table" | "status" | "list";
  title?: string;
  content?: string;
  items?: { label: string; value: string; color?: string }[];
  rows?: Record<string, string>[];
  columns?: string[];
  status?: "ok" | "warn" | "error";
}

interface Message {
  id: string;
  role: "user" | "agent";
  text?: string;
  blocks?: MessageBlock[];
  skill?: string;
  loading?: boolean;
  timestamp: string;
}

/* ── Skills ────────────────────────────────────────── */

const SKILLS: Skill[] = [
  {
    id: "system",
    name: "System Status",
    description: "CPU, memory, disk, uptime, and load average",
    icon: Cpu,
    color: "#00F0FF",
    endpoint: "/api/system",
    formatter: (d: Record<string, unknown>) => {
      const cpu = d.cpu as Record<string, unknown>;
      const mem = d.memory as Record<string, unknown>;
      const disk = d.disk as Record<string, unknown>;
      const loadAvg = cpu?.loadAvg as Record<string, string> | undefined;
      return [
        {
          type: "status",
          title: "System Health",
          status: Number(cpu?.usage) > 90 ? "error" : Number(cpu?.usage) > 70 ? "warn" : "ok",
          content: Number(cpu?.usage) > 90 ? "High CPU usage detected!" : Number(cpu?.usage) > 70 ? "CPU usage is elevated" : "All systems nominal",
        },
        {
          type: "kv",
          title: "System Overview",
          items: [
            { label: "Hostname", value: String(d.hostname || "—") },
            { label: "Platform", value: `${d.platform} ${d.arch}` },
            { label: "Uptime", value: String(d.uptime || "—") },
            { label: "CPU", value: `${cpu?.model} (${cpu?.cores} cores)` },
            { label: "CPU Usage", value: `${cpu?.usage}%`, color: Number(cpu?.usage) > 80 ? "#FF6B6B" : "#00FF88" },
            { label: "CPU Speed", value: `${cpu?.speed}` },
            { label: "Load Avg", value: loadAvg ? `${loadAvg["1m"]} / ${loadAvg["5m"]} / ${loadAvg["15m"]}` : "—" },
          ],
        },
        {
          type: "kv",
          title: "Memory",
          items: [
            { label: "Used", value: String(mem?.used || "—") },
            { label: "Total", value: String(mem?.total || "—") },
            { label: "Free", value: String(mem?.free || "—") },
            { label: "Usage", value: `${mem?.percent}%`, color: Number(mem?.percent) > 80 ? "#FF6B6B" : "#00FF88" },
          ],
        },
        {
          type: "kv",
          title: "Disk",
          items: [
            { label: "Used", value: String(disk?.used || "—") },
            { label: "Total", value: String(disk?.total || "—") },
            { label: "Free", value: String(disk?.free || "—") },
            { label: "Usage", value: `${disk?.percent}%`, color: Number(disk?.percent) > 85 ? "#FF6B6B" : "#00FF88" },
          ],
        },
      ];
    },
  },
  {
    id: "clawbot",
    name: "clawbot Agent",
    description: "Bot status, model, integrations, and processes",
    icon: Bot,
    color: "#6C63FF",
    endpoint: "/api/clawsbot",
    formatter: (d: Record<string, unknown>) => {
      const agent = d.agent as Record<string, unknown>;
      const server = d.server as Record<string, unknown>;
      const mem = d.memory as Record<string, unknown>;
      const integrations = d.integrations as Record<string, boolean>;
      const envKeys = d.envKeys as string[];
      const blocks: MessageBlock[] = [
        {
          type: "status",
          title: "clawbot Status",
          status: "ok",
          content: `${agent?.name} v${agent?.version} running on ${agent?.runtime} ${agent?.nodeVersion}`,
        },
        {
          type: "kv",
          title: "Agent Configuration",
          items: [
            { label: "Model", value: String(agent?.model || "—"), color: "#6C63FF" },
            { label: "Fallback", value: String(agent?.fallbackModel || "—") },
            { label: "Mode", value: String(agent?.mode || "—"), color: agent?.mode === "production" ? "#00FF88" : "#FFD93D" },
            { label: "Version", value: String(agent?.version || "—") },
            { label: "Node.js", value: String(agent?.nodeVersion || "—") },
          ],
        },
        {
          type: "kv",
          title: "Server",
          items: [
            { label: "Hostname", value: String(server?.hostname || "—") },
            { label: "Platform", value: String(server?.platform || "—") },
            { label: "PID", value: String(server?.pid || "—") },
            { label: "Process Uptime", value: `${Math.round(Number(server?.processUptime || 0))}s` },
          ],
        },
        {
          type: "kv",
          title: "Process Memory",
          items: [
            { label: "RSS", value: String(mem?.rss || "—") },
            { label: "Heap Used", value: String(mem?.heapUsed || "—") },
            { label: "Heap Total", value: String(mem?.heapTotal || "—") },
            { label: "External", value: String(mem?.external || "—") },
          ],
        },
        {
          type: "kv",
          title: "Integrations",
          items: [
            { label: "Discord", value: integrations?.discord ? "Connected" : "Not configured", color: integrations?.discord ? "#00FF88" : "#FF6B6B" },
            { label: "Anthropic", value: integrations?.anthropic ? "Connected" : "Not configured", color: integrations?.anthropic ? "#00FF88" : "#FF6B6B" },
            { label: "OpenAI", value: integrations?.openai ? "Connected" : "Not configured", color: integrations?.openai ? "#00FF88" : "#FF6B6B" },
          ],
        },
      ];
      if (envKeys && envKeys.length > 0) {
        blocks.push({
          type: "list",
          title: "Environment Keys",
          items: envKeys.map((k) => ({ label: k, value: "set" })),
        });
      }
      return blocks;
    },
  },
  {
    id: "network",
    name: "Network",
    description: "Interfaces, connections, DNS, and traffic stats",
    icon: Globe,
    color: "#00FF88",
    endpoint: "/api/network",
    formatter: (d: Record<string, unknown>) => {
      const ifaces = d.interfaces as Record<string, unknown>[] | undefined;
      const blocks: MessageBlock[] = [
        {
          type: "kv",
          title: "Network Overview",
          items: [
            { label: "Active Connections", value: String(d.activeConnections || "—"), color: "#00F0FF" },
            { label: "Total RX", value: String(d.totalRx || "—") },
            { label: "Total TX", value: String(d.totalTx || "—") },
          ],
        },
      ];
      if (d.dns) {
        blocks.push({
          type: "list",
          title: "DNS Servers",
          items: (d.dns as string[]).map((s) => ({ label: s, value: "active" })),
        });
      }
      if (ifaces && ifaces.length > 0) {
        blocks.push({
          type: "table",
          title: "Network Interfaces",
          columns: ["Interface", "RX", "TX"],
          rows: ifaces.slice(0, 8).map((i: Record<string, unknown>) => ({
            Interface: String(i.name || "—"),
            RX: String(i.rxBytes || "0"),
            TX: String(i.txBytes || "0"),
          })),
        });
      }
      return blocks;
    },
  },
  {
    id: "services",
    name: "Services",
    description: "Running services, Docker containers, listening ports",
    icon: Container,
    color: "#FFD93D",
    endpoint: "/api/services",
    formatter: (d: Record<string, unknown>) => {
      const services = d.services as Record<string, unknown>[] | undefined;
      const docker = d.docker as Record<string, unknown>[] | undefined;
      const ports = d.ports as Record<string, unknown>[] | undefined;
      const blocks: MessageBlock[] = [];
      if (services && services.length > 0) {
        blocks.push({
          type: "table",
          title: `Services (${services.length})`,
          columns: ["Name", "Status", "PID"],
          rows: services.slice(0, 10).map((s) => ({
            Name: String(s.name || "—"),
            Status: String(s.status || "—"),
            PID: String(s.pid || "—"),
          })),
        });
      }
      if (docker && docker.length > 0) {
        blocks.push({
          type: "table",
          title: `Docker Containers (${docker.length})`,
          columns: ["Name", "Image", "Status"],
          rows: docker.slice(0, 10).map((c) => ({
            Name: String(c.name || "—"),
            Image: String(c.image || "—"),
            Status: String(c.status || "—"),
          })),
        });
      }
      if (ports && ports.length > 0) {
        blocks.push({
          type: "table",
          title: `Listening Ports (${ports.length})`,
          columns: ["Port", "Process", "PID"],
          rows: ports.slice(0, 10).map((p) => ({
            Port: String(p.port || "—"),
            Process: String(p.process || "—"),
            PID: String(p.pid || "—"),
          })),
        });
      }
      if (blocks.length === 0) {
        blocks.push({ type: "text", content: "No active services, containers, or ports detected." });
      }
      return blocks;
    },
  },
  {
    id: "tailscale",
    name: "Tailscale VPN",
    description: "VPN mesh status, peers, and connectivity",
    icon: Shield,
    color: "#9E9EBE",
    endpoint: "/api/tailscale",
    formatter: (d: Record<string, unknown>) => {
      const self = d.self as Record<string, unknown> | undefined;
      const peers = d.peers as Record<string, unknown>[] | undefined;
      const blocks: MessageBlock[] = [
        {
          type: "status",
          title: "Tailscale",
          status: d.running ? "ok" : "error",
          content: d.running
            ? `Connected${d.magicDnsSuffix ? ` · ${d.magicDnsSuffix}` : ""}`
            : d.installed ? "Installed but not running" : "Not installed",
        },
      ];
      if (self) {
        blocks.push({
          type: "kv",
          title: "This Node",
          items: [
            { label: "Name", value: String(self.name || "—") },
            { label: "IP", value: String(self.ip || "—") },
            { label: "Tailscale IP", value: String(self.tailscaleIp || "—"), color: "#00F0FF" },
            { label: "OS", value: String(self.os || "—") },
          ],
        });
      }
      if (peers && peers.length > 0) {
        blocks.push({
          type: "table",
          title: `Peers (${peers.length})`,
          columns: ["Name", "IP", "OS", "Status"],
          rows: peers.map((p) => ({
            Name: String(p.name || "—"),
            IP: String(p.ip || "—"),
            OS: String(p.os || "—"),
            Status: p.online ? "Online" : "Offline",
          })),
        });
      }
      return blocks;
    },
  },
  {
    id: "ec2",
    name: "EC2 Instance",
    description: "AWS instance metadata, type, region, and IPs",
    icon: Server,
    color: "#FF6B6B",
    endpoint: "/api/ec2",
    formatter: (d: Record<string, unknown>) => {
      if (!d.isEc2) {
        return [{ type: "status", title: "EC2", status: "warn", content: "Not running on an EC2 instance" }];
      }
      return [
        {
          type: "status",
          title: "EC2 Instance",
          status: "ok",
          content: `Running on ${d.instanceType} in ${d.region}`,
        },
        {
          type: "kv",
          title: "Instance Details",
          items: [
            { label: "Instance ID", value: String(d.instanceId || "—"), color: "#00F0FF" },
            { label: "Type", value: String(d.instanceType || "—") },
            { label: "Region", value: String(d.region || "—") },
            { label: "AZ", value: String(d.availabilityZone || "—") },
            { label: "Public IP", value: String(d.publicIp || "—") },
            { label: "Private IP", value: String(d.privateIp || "—") },
            { label: "AMI", value: String(d.amiId || "—") },
            { label: "Architecture", value: String(d.architecture || "—") },
            { label: "Account", value: String(d.accountId || "—") },
          ],
        },
      ];
    },
  },
  {
    id: "history",
    name: "Metrics History",
    description: "CPU & memory trend data (last 60 samples)",
    icon: Activity,
    color: "#FF9FF3",
    endpoint: "/api/system/history",
    formatter: (d: Record<string, unknown>) => {
      const history = d.history as { timestamp: string; cpu: number; memory: number }[] | undefined;
      if (!history || history.length === 0) {
        return [{ type: "text", content: "No history data available yet. Metrics are collected every 3 seconds." }];
      }
      const cpuValues = history.map((h) => h.cpu);
      const memValues = history.map((h) => h.memory);
      const avgCpu = (cpuValues.reduce((a, b) => a + b, 0) / cpuValues.length).toFixed(1);
      const maxCpu = Math.max(...cpuValues).toFixed(1);
      const avgMem = (memValues.reduce((a, b) => a + b, 0) / memValues.length).toFixed(1);
      const maxMem = Math.max(...memValues).toFixed(1);
      const latest = history[history.length - 1];
      return [
        {
          type: "kv",
          title: `Metrics History (${history.length} samples)`,
          items: [
            { label: "Current CPU", value: `${latest.cpu}%`, color: latest.cpu > 80 ? "#FF6B6B" : "#00FF88" },
            { label: "Avg CPU", value: `${avgCpu}%` },
            { label: "Peak CPU", value: `${maxCpu}%`, color: Number(maxCpu) > 90 ? "#FF6B6B" : "#FFD93D" },
            { label: "Current Memory", value: `${latest.memory}%`, color: latest.memory > 80 ? "#FF6B6B" : "#00FF88" },
            { label: "Avg Memory", value: `${avgMem}%` },
            { label: "Peak Memory", value: `${maxMem}%`, color: Number(maxMem) > 90 ? "#FF6B6B" : "#FFD93D" },
          ],
        },
      ];
    },
  },
];

/* ── Quick Commands ────────────────────────────────── */

const QUICK_COMMANDS = [
  { label: "Full report", prompt: "Run all skills and give me a full system report" },
  { label: "Health check", prompt: "Check system health — CPU, memory, disk" },
  { label: "Bot status", prompt: "What's the clawbot agent status?" },
  { label: "Network scan", prompt: "Show me network connections and traffic" },
  { label: "Service audit", prompt: "List all running services and ports" },
];

/* ── Helpers ───────────────────────────────────────── */

const uid = () => Math.random().toString(36).slice(2, 10);

function matchSkills(input: string): Skill[] {
  const lower = input.toLowerCase();
  const keywords: Record<string, string[]> = {
    system: ["system", "cpu", "memory", "disk", "uptime", "load", "health", "ram", "usage"],
    clawbot: ["bot", "claw", "agent", "model", "discord", "integration", "claude", "gpt"],
    network: ["network", "connection", "dns", "traffic", "interface", "rx", "tx", "bandwidth"],
    services: ["service", "docker", "container", "port", "process", "listen", "running"],
    tailscale: ["tailscale", "vpn", "mesh", "peer", "tunnel"],
    ec2: ["ec2", "aws", "instance", "cloud", "region", "ami"],
    history: ["history", "trend", "chart", "metric", "average", "peak", "graph"],
  };

  // "full report" or "all" → return all skills
  if (lower.includes("full report") || lower.includes("all skills") || (lower.includes("run") && lower.includes("all"))) {
    return SKILLS;
  }

  const matched = SKILLS.filter((s) => {
    const kws = keywords[s.id] || [];
    return kws.some((kw) => lower.includes(kw)) || lower.includes(s.id) || lower.includes(s.name.toLowerCase());
  });

  // Default to system if nothing matched
  return matched.length > 0 ? matched : [SKILLS[0]];
}

/* ── Main Component ────────────────────────────────── */

export default function AgentPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "agent",
      text: "Hey! I'm the OpenClaw Agent. I can fetch live data from your infrastructure using skills. Try asking me about system status, clawbot, network, services, or type **\"full report\"** for everything.",
      blocks: [],
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [running, setRunning] = useState(false);
  const [showSkills, setShowSkills] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const runSkill = useCallback(async (skill: Skill): Promise<MessageBlock[]> => {
    try {
      const res = await fetch(skill.endpoint);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return skill.formatter(data);
    } catch (err) {
      return [{ type: "status", title: skill.name, status: "error", content: `Failed to fetch: ${(err as Error).message}` }];
    }
  }, []);

  const handleSend = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || running) return;
    setInput("");

    // Add user message
    const userMsg: Message = { id: uid(), role: "user", text: msg, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);

    // Detect skills
    const skills = matchSkills(msg);
    setRunning(true);

    // Add loading message
    const loadingId = uid();
    setMessages((prev) => [
      ...prev,
      {
        id: loadingId,
        role: "agent",
        text: `Running ${skills.length} skill${skills.length > 1 ? "s" : ""}: ${skills.map((s) => s.name).join(", ")}...`,
        loading: true,
        timestamp: new Date().toISOString(),
      },
    ]);

    // Execute all matched skills in parallel
    const results = await Promise.all(skills.map((s) => runSkill(s)));
    const allBlocks = results.flat();

    // Summary text
    const statuses = allBlocks.filter((b) => b.type === "status");
    const errors = statuses.filter((b) => b.status === "error");
    const warns = statuses.filter((b) => b.status === "warn");
    let summary = "";
    if (skills.length > 1) {
      summary = `Fetched data from ${skills.length} skills. `;
    }
    if (errors.length > 0) {
      summary += `${errors.length} issue${errors.length > 1 ? "s" : ""} found. `;
    } else if (warns.length > 0) {
      summary += `${warns.length} warning${warns.length > 1 ? "s" : ""}. `;
    } else {
      summary += "Everything looks good.";
    }

    // Replace loading with result
    setMessages((prev) =>
      prev.map((m) =>
        m.id === loadingId
          ? {
              ...m,
              text: summary,
              blocks: allBlocks,
              skill: skills.map((s) => s.name).join(", "),
              loading: false,
            }
          : m,
      ),
    );

    setRunning(false);
  };

  const runSingleSkill = async (skill: Skill) => {
    setShowSkills(false);
    await handleSend(`Show me ${skill.name.toLowerCase()} details`);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-bold text-heading">Agent</h2>
          <p className="text-sm text-muted">
            AI-powered assistant with {SKILLS.length} skills to fetch live OpenClaw data
          </p>
        </div>
        <button
          onClick={() => setShowSkills(!showSkills)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl glass-inset text-xs font-medium text-muted hover:text-heading transition-all"
        >
          <Zap className="w-3.5 h-3.5 text-[#FFD93D]" />
          {SKILLS.length} Skills
          <ChevronRight className={`w-3 h-3 transition-transform ${showSkills ? "rotate-90" : ""}`} />
        </button>
      </div>

      {/* Skills panel */}
      <AnimatePresence>
        {showSkills && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {SKILLS.map((skill) => {
                const Icon = skill.icon;
                return (
                  <button
                    key={skill.id}
                    onClick={() => runSingleSkill(skill)}
                    disabled={running}
                    className="glass-inset p-3 text-left hover:bg-surface transition-all group disabled:opacity-50"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-4 h-4" style={{ color: skill.color }} />
                      <span className="text-xs font-semibold text-heading group-hover:text-[#00F0FF] transition-colors">
                        {skill.name}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted leading-snug">{skill.description}</p>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-4 pr-1 -mr-1">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[75%] ${
                msg.role === "user"
                  ? "glass-inset p-3 ml-8"
                  : "glass p-4"
              }`}
            >
              {/* Agent header */}
              {msg.role === "agent" && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#00F0FF] to-[#6C63FF] flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-[11px] font-semibold text-heading">OpenClaw Agent</span>
                  {msg.skill && (
                    <span className="text-[10px] text-[#00F0FF] bg-[#00F0FF]/10 px-1.5 py-0.5 rounded-md">
                      {msg.skill}
                    </span>
                  )}
                  {msg.loading && <Loader2 className="w-3.5 h-3.5 text-[#00F0FF] animate-spin" />}
                </div>
              )}

              {/* Text */}
              {msg.text && (
                <p className={`text-sm leading-relaxed ${msg.role === "user" ? "text-heading" : "text-body"}`}>
                  {msg.text.split("**").map((part, i) =>
                    i % 2 === 1 ? (
                      <strong key={i} className="text-heading font-semibold">{part}</strong>
                    ) : (
                      <span key={i}>{part}</span>
                    ),
                  )}
                </p>
              )}

              {/* Blocks */}
              {msg.blocks && msg.blocks.length > 0 && (
                <div className="mt-3 space-y-3">
                  {msg.blocks.map((block, i) => (
                    <BlockRenderer key={i} block={block} />
                  ))}
                </div>
              )}

              {/* Timestamp */}
              <p className="text-[10px] text-muted mt-2">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </motion.div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Quick commands */}
      <div className="flex gap-1.5 overflow-x-auto py-2 -mx-1 px-1">
        {QUICK_COMMANDS.map((cmd) => (
          <button
            key={cmd.label}
            onClick={() => handleSend(cmd.prompt)}
            disabled={running}
            className="shrink-0 px-3 py-1.5 rounded-2xl glass-inset text-[11px] font-medium text-muted hover:text-[#00F0FF] hover:bg-[#00F0FF]/5 transition-all disabled:opacity-50"
          >
            {cmd.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 pt-2">
        <div className="flex-1 relative">
          <Terminal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about system, bot, network, services... or type 'full report'"
            disabled={running}
            className="w-full pl-9 pr-4 py-3 rounded-2xl glass text-sm text-heading placeholder-muted outline-none focus:ring-1 focus:ring-[#00F0FF]/30 disabled:opacity-50"
          />
        </div>
        <button
          onClick={() => handleSend()}
          disabled={running || !input.trim()}
          className="p-3 rounded-2xl bg-gradient-to-br from-[#00F0FF] to-[#6C63FF] text-white hover:opacity-90 transition-opacity disabled:opacity-40 shrink-0"
        >
          {running ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}

/* ── Block Renderer ────────────────────────────────── */

function BlockRenderer({ block }: { block: MessageBlock }) {
  switch (block.type) {
    case "status": {
      const colors = { ok: "#00FF88", warn: "#FFD93D", error: "#FF6B6B" };
      const color = colors[block.status || "ok"];
      return (
        <div className="glass-inset p-3 flex items-start gap-2" style={{ borderLeft: `3px solid ${color}` }}>
          <div className="w-2 h-2 rounded-full mt-1 shrink-0 pulse-dot" style={{ backgroundColor: color }} />
          <div>
            {block.title && <p className="text-xs font-semibold text-heading">{block.title}</p>}
            {block.content && <p className="text-xs text-body mt-0.5">{block.content}</p>}
          </div>
        </div>
      );
    }

    case "kv":
      return (
        <div className="glass-inset p-3">
          {block.title && <p className="text-[10px] text-muted uppercase tracking-wider mb-2">{block.title}</p>}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {block.items?.map((item, i) => (
              <div key={i} className="flex justify-between">
                <span className="text-[11px] text-muted">{item.label}</span>
                <span className="text-[11px] font-medium" style={{ color: item.color || undefined }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      );

    case "table":
      return (
        <div className="glass-inset p-3 overflow-x-auto">
          {block.title && <p className="text-[10px] text-muted uppercase tracking-wider mb-2">{block.title}</p>}
          <table className="w-full text-[11px]">
            <thead>
              <tr>
                {block.columns?.map((col) => (
                  <th key={col} className="text-left text-muted font-medium pb-1.5 pr-3">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows?.map((row, i) => (
                <tr key={i} className="border-t border-divider-dim">
                  {block.columns?.map((col) => (
                    <td key={col} className="py-1.5 pr-3 text-body font-mono">
                      {row[col] || "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "list":
      return (
        <div className="glass-inset p-3">
          {block.title && <p className="text-[10px] text-muted uppercase tracking-wider mb-2">{block.title}</p>}
          <div className="flex flex-wrap gap-1.5">
            {block.items?.map((item, i) => (
              <span key={i} className="text-[10px] font-mono text-body bg-surface px-2 py-0.5 rounded-md">
                {item.label}
              </span>
            ))}
          </div>
        </div>
      );

    case "text":
      return (
        <p className="text-xs text-body">{block.content}</p>
      );

    default:
      return null;
  }
}
