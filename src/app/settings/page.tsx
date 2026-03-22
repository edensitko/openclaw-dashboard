"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Globe, Shield, Bell, Palette, Database, Code, Bot, Server, Network, Key } from "lucide-react";

const settingSections = [
  {
    icon: Bot,
    title: "clawbot Agent",
    description: "Agent model, fallback settings, version, and runtime config",
    color: "#00F0FF",
    href: "/clawbot",
  },
  {
    icon: Globe,
    title: "General",
    description: "Organization name, timezone, and language preferences",
    color: "#6C63FF",
  },
  {
    icon: Shield,
    title: "Security",
    description: "Two-factor authentication, IP allowlists, and session management",
    color: "#FF6B6B",
  },
  {
    icon: Key,
    title: "API Keys & Integrations",
    description: "Discord, Anthropic, OpenAI tokens and webhook endpoints",
    color: "#FFD93D",
    href: "/clawbot",
  },
  {
    icon: Bell,
    title: "Notifications",
    description: "Alert thresholds, email preferences, and webhook endpoints",
    color: "#00FF88",
  },
  {
    icon: Palette,
    title: "Appearance",
    description: "Theme mode, dashboard layout, and display preferences",
    color: "#9E9EBE",
  },
  {
    icon: Server,
    title: "Infrastructure",
    description: "EC2 instance config, autoscaling, and deployment settings",
    color: "#00F0FF",
    href: "/servers",
  },
  {
    icon: Network,
    title: "Tailscale VPN",
    description: "VPN mesh config, peer management, and ACL rules",
    color: "#6C63FF",
    href: "/tailscale",
  },
  {
    icon: Database,
    title: "Data & Privacy",
    description: "Log retention, data export, and GDPR compliance settings",
    color: "#FF6B6B",
  },
  {
    icon: Code,
    title: "API & Routing",
    description: "Rate limits, model routing rules, and fallback behavior",
    color: "#00F0FF",
    href: "/clawbot",
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-heading">Settings</h2>
        <p className="text-sm text-muted">Configure your clawbot instance and infrastructure</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {settingSections.map((section, i) => {
          const Icon = section.icon;
          const content = (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="glass p-5 cursor-pointer hover:bg-surface transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl" style={{ backgroundColor: `${section.color}15` }}>
                  <Icon className="w-6 h-6" style={{ color: section.color }} />
                </div>
                <div>
                  <h3 className="text-heading font-semibold group-hover:text-[#00F0FF] transition-colors">
                    {section.title}
                  </h3>
                  <p className="text-sm text-muted mt-1">{section.description}</p>
                  {section.href && (
                    <span className="text-[10px] text-[#00F0FF] mt-2 inline-block">View details →</span>
                  )}
                </div>
              </div>
            </motion.div>
          );
          return section.href ? (
            <Link key={section.title} href={section.href}>
              {content}
            </Link>
          ) : (
            <div key={section.title}>{content}</div>
          );
        })}
      </div>
    </div>
  );
}
