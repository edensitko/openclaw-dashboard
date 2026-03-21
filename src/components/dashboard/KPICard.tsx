"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export interface KPICardProps {
  label: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  color?: string;
  sparkline?: number[];
  index?: number;
}

function MiniSparkline({ data, color = "#00F0FF" }: { data: number[]; color?: string }) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const h = 32;
  const w = 80;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={w} height={h} className="opacity-60">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function KPICard({
  label,
  value,
  subtitle,
  icon: Icon,
  color = "#00F0FF",
  sparkline,
  index = 0,
}: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="glass rounded-xl p-4 sm:p-5 hover:bg-surface transition-all duration-300 cursor-default"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}18` }}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color }} />
        </div>
        {sparkline && (
          <div className="hidden sm:block">
            <MiniSparkline data={sparkline} color={color} />
          </div>
        )}
      </div>

      <p className="text-xs sm:text-sm text-muted mb-1">{label}</p>
      <p className="text-xl sm:text-2xl font-bold text-heading mb-1">{value}</p>
      {subtitle && <p className="text-[10px] sm:text-xs text-muted truncate">{subtitle}</p>}
    </motion.div>
  );
}
