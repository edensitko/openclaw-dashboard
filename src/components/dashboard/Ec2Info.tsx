"use client";

import { motion } from "framer-motion";
import { Cloud, MapPin, Shield, Server, Hash, Key } from "lucide-react";
import type { Ec2Data } from "@/lib/useSystemData";

export default function Ec2Info({ data }: { data: Ec2Data | null }) {
  if (!data) {
    return (
      <div className="glass p-5 animate-pulse">
        <div className="h-4 w-32 bg-surface rounded-xl mb-4" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-5 bg-surface-dim rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const rows = [
    { icon: Hash, label: "Instance ID", value: data.instanceId, color: "#00F0FF" },
    { icon: Server, label: "Instance Type", value: data.instanceType, color: "#6C63FF" },
    { icon: MapPin, label: "Region / AZ", value: `${data.region} (${data.availabilityZone})`, color: "#00FF88" },
    { icon: Cloud, label: "Public IP", value: data.publicIp, color: "#FFD93D" },
    { icon: Cloud, label: "Private IP", value: data.privateIp, color: "#00F0FF" },
    { icon: Key, label: "AMI ID", value: data.amiId, color: "#6C63FF" },
    { icon: Shield, label: "IAM Role", value: data.iamRole, color: "#FF6B6B" },
    { icon: Hash, label: "Account ID", value: data.accountId, color: "#9E9EBE" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-heading font-semibold">EC2 Instance</h3>
          <p className="text-xs text-muted">{data.hostname}</p>
        </div>
        <div className={`pill ${data.isEc2 ? "bg-[#00FF88]/15 text-[#00FF88]" : "bg-[#FFD93D]/15 text-[#FFD93D]"}`}>
          {data.isEc2 ? "EC2" : "Local"}
        </div>
      </div>

      <div className="space-y-2.5">
        {rows.map((row) => {
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

      {data.securityGroups.length > 0 && (
        <div className="mt-4 pt-3 border-t border-divider">
          <p className="text-xs text-muted mb-2">Security Groups</p>
          <div className="flex flex-wrap gap-1.5">
            {data.securityGroups.map((sg) => (
              <span key={sg} className="pill bg-[#6C63FF]/10 text-[#6C63FF]">
                {sg}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
