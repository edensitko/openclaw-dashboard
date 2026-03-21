"use client";

import { motion } from "framer-motion";
import { Container, Play, Square, AlertTriangle, Globe } from "lucide-react";
import type { ServicesData } from "@/lib/useSystemData";

export default function ServicesPanel({ data }: { data: ServicesData | null }) {
  if (!data) {
    return (
      <div className="glass p-5 animate-pulse">
        <div className="h-4 w-32 bg-surface rounded-xl mb-4" />
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-8 bg-surface-dim rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const running = data.services.filter((s) => s.status === "running");
  const stopped = data.services.filter((s) => s.status === "stopped");
  const failed = data.services.filter((s) => s.status === "failed");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-heading font-semibold">System Services</h3>
          <p className="text-xs text-muted">
            {running.length} running · {stopped.length} stopped
            {failed.length > 0 && ` · ${failed.length} failed`}
          </p>
        </div>
      </div>

      {/* Docker containers */}
      {data.docker.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-muted mb-2 flex items-center gap-1.5">
            <Container className="w-3 h-3" /> Docker Containers
          </p>
          <div className="space-y-2">
            {data.docker.map((c, i) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="glass-inset p-3"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-mono text-heading">{c.name}</span>
                  <span className={`pill ${
                    c.state === "running" ? "bg-[#00FF88]/15 text-[#00FF88]" :
                    c.state === "exited" ? "bg-[#FF6B6B]/15 text-[#FF6B6B]" :
                    "bg-surface text-muted"
                  }`}>
                    {c.state}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-3 text-[10px] text-muted mt-1">
                  <span>{c.image}</span>
                  {c.ports && <span>{c.ports}</span>}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Listening ports */}
      {data.listeningPorts.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-muted mb-2 flex items-center gap-1.5">
            <Globe className="w-3 h-3" /> Listening Ports
          </p>
          <div className="space-y-1 max-h-[250px] overflow-y-auto pr-1">
            {data.listeningPorts.slice(0, 20).map((p, i) => (
              <div key={`${p.port}-${i}`} className="flex items-center justify-between py-1.5 px-2 ios-row rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[#00F0FF] w-12">:{p.port}</span>
                  <span className="text-xs text-subtle truncate max-w-[120px]">{p.process}</span>
                </div>
                <span className="text-[10px] font-mono text-muted">PID {p.pid}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Services list */}
      <p className="text-xs text-muted mb-2">Services</p>
      <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1">
        {running.slice(0, 25).map((svc, i) => (
          <div key={svc.name} className="flex items-center justify-between py-1.5 px-2 ios-row rounded-xl">
            <div className="flex items-center gap-2">
              <Play className="w-2.5 h-2.5 text-[#00FF88]" />
              <span className="text-xs text-heading truncate max-w-[200px]">{svc.name}</span>
            </div>
            {svc.pid && <span className="text-[10px] font-mono text-muted">PID {svc.pid}</span>}
          </div>
        ))}
        {failed.map((svc) => (
          <div key={svc.name} className="flex items-center justify-between py-1.5 px-2 ios-row rounded-xl">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-2.5 h-2.5 text-[#FF6B6B]" />
              <span className="text-xs text-[#FF6B6B] truncate max-w-[200px]">{svc.name}</span>
            </div>
            <span className="pill bg-[#FF6B6B]/15 text-[#FF6B6B]">failed</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
