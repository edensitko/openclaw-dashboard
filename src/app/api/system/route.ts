import { NextResponse } from "next/server";
import os from "os";
import { execSync } from "child_process";

function getCpuUsage(): number {
  const cpus = os.cpus();
  let totalIdle = 0;
  let totalTick = 0;
  for (const cpu of cpus) {
    for (const type in cpu.times) {
      totalTick += cpu.times[type as keyof typeof cpu.times];
    }
    totalIdle += cpu.times.idle;
  }
  return Math.round(((totalTick - totalIdle) / totalTick) * 100);
}

function getDiskUsage(): { total: number; used: number; free: number; percent: number } {
  try {
    const output = execSync("df -k / | tail -1", { encoding: "utf-8" });
    const parts = output.trim().split(/\s+/);
    const total = parseInt(parts[1]) * 1024;
    const used = parseInt(parts[2]) * 1024;
    const free = parseInt(parts[3]) * 1024;
    const percent = Math.round((used / total) * 100);
    return { total, used, free, percent };
  } catch {
    return { total: 0, used: 0, free: 0, percent: 0 };
  }
}

function getNetworkInfo() {
  const interfaces = os.networkInterfaces();
  const result: { name: string; address: string; family: string; mac: string }[] = [];
  for (const [name, addrs] of Object.entries(interfaces)) {
    if (!addrs) continue;
    for (const addr of addrs) {
      if (!addr.internal) {
        result.push({
          name,
          address: addr.address,
          family: addr.family,
          mac: addr.mac,
        });
      }
    }
  }
  return result;
}

function getTopProcesses(): { pid: string; name: string; cpu: string; mem: string }[] {
  try {
    const output = execSync("ps -eo pid,comm,%cpu,%mem --sort=-%cpu 2>/dev/null | head -11 || ps -eo pid,comm,%cpu,%mem | head -11", {
      encoding: "utf-8",
    });
    const lines = output.trim().split("\n").slice(1);
    return lines.map((line) => {
      const parts = line.trim().split(/\s+/);
      return {
        pid: parts[0],
        name: parts[1]?.replace(/.*\//, "") || "unknown",
        cpu: parts[2] || "0",
        mem: parts[3] || "0",
      };
    });
  } catch {
    try {
      const output = execSync("ps aux | sort -nrk 3,3 | head -10", { encoding: "utf-8" });
      const lines = output.trim().split("\n");
      return lines.map((line) => {
        const parts = line.trim().split(/\s+/);
        return {
          pid: parts[1],
          name: parts[10]?.replace(/.*\//, "") || "unknown",
          cpu: parts[2] || "0",
          mem: parts[3] || "0",
        };
      });
    } catch {
      return [];
    }
  }
}

function getLoadAverage() {
  const load = os.loadavg();
  return {
    "1m": load[0].toFixed(2),
    "5m": load[1].toFixed(2),
    "15m": load[2].toFixed(2),
  };
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${days}d ${hours}h ${minutes}m`;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

export async function GET() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const disk = getDiskUsage();

  const data = {
    timestamp: new Date().toISOString(),
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    osRelease: os.release(),
    osType: os.type(),
    uptime: formatUptime(os.uptime()),
    uptimeSeconds: os.uptime(),

    cpu: {
      model: os.cpus()[0]?.model || "Unknown",
      cores: os.cpus().length,
      usage: getCpuUsage(),
      speed: os.cpus()[0]?.speed || 0,
      loadAvg: getLoadAverage(),
    },

    memory: {
      total: formatBytes(totalMem),
      used: formatBytes(usedMem),
      free: formatBytes(freeMem),
      totalBytes: totalMem,
      usedBytes: usedMem,
      freeBytes: freeMem,
      percent: Math.round((usedMem / totalMem) * 100),
    },

    disk: {
      total: formatBytes(disk.total),
      used: formatBytes(disk.used),
      free: formatBytes(disk.free),
      percent: disk.percent,
    },

    network: getNetworkInfo(),
    processes: getTopProcesses(),
    userInfo: {
      username: os.userInfo().username,
      homedir: os.userInfo().homedir,
    },
  };

  return NextResponse.json(data, {
    headers: { "Cache-Control": "no-store" },
  });
}
