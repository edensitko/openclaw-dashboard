"use client";

import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Rocket,
  XCircle,
  UserPlus,
} from "lucide-react";
import { activityFeed } from "@/lib/mock-data";

const typeConfig: Record<string, { icon: React.ElementType; color: string }> = {
  request: { icon: Activity, color: "#00F0FF" },
  error: { icon: XCircle, color: "#FF6B6B" },
  deploy: { icon: Rocket, color: "#6C63FF" },
  alert: { icon: AlertTriangle, color: "#FFD93D" },
  user: { icon: UserPlus, color: "#00FF88" },
};

export default function ActivityFeed() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="glass p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-heading font-semibold">Activity Feed</h3>
          <p className="text-xs text-muted">Recent events</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse" />
          <span className="text-xs text-muted">Live</span>
        </div>
      </div>

      <div className="space-y-1 max-h-[400px] overflow-y-auto pr-1">
        {activityFeed.map((event, i) => {
          const config = typeConfig[event.type];
          const Icon = config.icon;

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-3 p-3 rounded-2xl ios-row"
            >
              <div
                className="mt-0.5 p-1.5 rounded-xl shrink-0"
                style={{ backgroundColor: `${config.color}15` }}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: config.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-body leading-snug">{event.message}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-muted">{event.timestamp}</span>
                  {event.user && (
                    <span className="text-[10px] text-[#6C63FF]">@{event.user}</span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
