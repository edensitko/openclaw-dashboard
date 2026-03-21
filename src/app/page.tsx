"use client";

import KPICard from "@/components/dashboard/KPICard";
import CpuMemoryChart from "@/components/dashboard/RequestsChart";
import DiskUsageChart from "@/components/dashboard/ModelUsageChart";
import ProcessTable from "@/components/dashboard/UsageTable";
import ServerStatus from "@/components/dashboard/ServerStatus";
import Ec2Info from "@/components/dashboard/Ec2Info";
import TailscalePanel from "@/components/dashboard/TailscalePanel";
import NetworkPanel from "@/components/dashboard/NetworkPanel";
import ServicesPanel from "@/components/dashboard/ServicesPanel";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import { useSystemData } from "@/lib/useSystemData";
import {
  Cpu,
  MemoryStick,
  HardDrive,
  Clock,
  Activity,
  Wifi,
} from "lucide-react";

export default function Home() {
  const { data, history, ec2, tailscale, services, network } = useSystemData(3000);

  const cpuHistory = history.map((h) => h.cpu);
  const memHistory = history.map((h) => h.memory);

  return (
    <div className="space-y-5">
      {/* Hero bar — ClawsBot status */}
      <div className="glass-heavy p-6 sm:p-7 rounded-[28px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-[#00F0FF] to-[#6C63FF] flex items-center justify-center shadow-lg shadow-[#00F0FF]/20">
            <span className="text-2xl">🤖</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-heading">
              ClawsBot <span className="text-[#00F0FF]">Dashboard</span>
            </h2>
            <p className="text-xs text-muted">
              {data ? `${data.hostname} · ${data.platform} ${data.arch}` : "Connecting..."}
              {ec2?.isEc2 && ` · ${ec2.instanceType} · ${ec2.region}`}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="pill bg-[#00FF88]/15 text-[#00FF88] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FF88] pulse-dot" />
            Bot Online
          </span>
          {tailscale?.running && (
            <span className="pill bg-[#6C63FF]/15 text-[#6C63FF]">Tailscale Connected</span>
          )}
          {ec2?.isEc2 && (
            <span className="pill bg-[#00F0FF]/15 text-[#00F0FF]">EC2</span>
          )}
          {network && (
            <span className="pill bg-surface text-subtle">
              {network.activeConnections} connections
            </span>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPICard
          label="CPU Usage"
          value={data ? `${data.cpu.usage}%` : "—"}
          subtitle={data ? `${data.cpu.cores} cores` : ""}
          icon={Cpu}
          color="#00F0FF"
          sparkline={cpuHistory}
          index={0}
        />
        <KPICard
          label="Memory"
          value={data ? `${data.memory.percent}%` : "—"}
          subtitle={data ? `${data.memory.used} / ${data.memory.total}` : ""}
          icon={MemoryStick}
          color="#6C63FF"
          sparkline={memHistory}
          index={1}
        />
        <KPICard
          label="Disk"
          value={data ? `${data.disk.percent}%` : "—"}
          subtitle={data ? `${data.disk.used} / ${data.disk.total}` : ""}
          icon={HardDrive}
          color="#00FF88"
          index={2}
        />
        <KPICard
          label="Uptime"
          value={data ? data.uptime : "—"}
          icon={Clock}
          color="#FFD93D"
          index={3}
        />
        <KPICard
          label="Load (1m)"
          value={data ? data.cpu.loadAvg["1m"] : "—"}
          subtitle={data ? `5m: ${data.cpu.loadAvg["5m"]}` : ""}
          icon={Activity}
          color="#FF6B6B"
          index={4}
        />
        <KPICard
          label="Connections"
          value={network ? network.activeConnections.toString() : "—"}
          subtitle={network ? `↓${network.totalRx} ↑${network.totalTx}` : ""}
          icon={Wifi}
          color="#9E9EBE"
          index={5}
        />
      </div>

      {/* CPU/Memory chart + Disk usage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <CpuMemoryChart history={history} />
        <DiskUsageChart data={data} />
      </div>

      {/* EC2 + Server Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Ec2Info data={ec2} />
        <ServerStatus data={data} />
      </div>

      {/* Tailscale + Network I/O */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TailscalePanel data={tailscale} />
        <NetworkPanel data={network} />
      </div>

      {/* Services + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ServicesPanel data={services} />
        <ActivityFeed />
      </div>

      {/* Process Table */}
      <ProcessTable data={data} />
    </div>
  );
}
