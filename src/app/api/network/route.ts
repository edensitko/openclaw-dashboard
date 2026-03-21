import { NextResponse } from "next/server";
import { execSync } from "child_process";
import os from "os";

function getNetworkStats() {
  const platform = os.platform();
  try {
    if (platform === "darwin") {
      const output = execSync("netstat -ib 2>/dev/null | head -15", {
        encoding: "utf-8",
        timeout: 5000,
      });
      const lines = output.trim().split("\n").slice(1);
      return lines
        .filter((l) => !l.includes("lo0") && l.trim())
        .map((line) => {
          const parts = line.trim().split(/\s+/);
          return {
            interface: parts[0] || "",
            mtu: parts[1] || "",
            rxPackets: parseInt(parts[4]) || 0,
            rxBytes: parseInt(parts[6]) || 0,
            txPackets: parseInt(parts[7]) || 0,
            txBytes: parseInt(parts[9]) || 0,
          };
        })
        .filter((s) => s.rxBytes > 0 || s.txBytes > 0);
    } else {
      // Linux — /proc/net/dev
      const output = execSync("cat /proc/net/dev 2>/dev/null", {
        encoding: "utf-8",
        timeout: 5000,
      });
      const lines = output.trim().split("\n").slice(2);
      return lines
        .filter((l) => !l.includes("lo:") && l.trim())
        .map((line) => {
          const [name, rest] = line.trim().split(":");
          const parts = rest?.trim().split(/\s+/) || [];
          return {
            interface: name?.trim() || "",
            mtu: "",
            rxBytes: parseInt(parts[0]) || 0,
            rxPackets: parseInt(parts[1]) || 0,
            txBytes: parseInt(parts[8]) || 0,
            txPackets: parseInt(parts[9]) || 0,
          };
        })
        .filter((s) => s.rxBytes > 0 || s.txBytes > 0);
    }
  } catch {
    return [];
  }
}

function getActiveConnections(): number {
  try {
    const platform = os.platform();
    if (platform === "darwin") {
      const output = execSync("netstat -an 2>/dev/null | grep ESTABLISHED | wc -l", {
        encoding: "utf-8",
        timeout: 5000,
      });
      return parseInt(output.trim()) || 0;
    } else {
      const output = execSync("ss -s 2>/dev/null", {
        encoding: "utf-8",
        timeout: 5000,
      });
      const match = output.match(/estab\s+(\d+)/);
      return match ? parseInt(match[1]) : 0;
    }
  } catch {
    return 0;
  }
}

function getDNSServers(): string[] {
  try {
    const output = execSync("cat /etc/resolv.conf 2>/dev/null", {
      encoding: "utf-8",
      timeout: 3000,
    });
    return output
      .split("\n")
      .filter((l) => l.startsWith("nameserver"))
      .map((l) => l.split(/\s+/)[1] || "")
      .filter(Boolean);
  } catch {
    return [];
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

export async function GET() {
  const stats = getNetworkStats();
  const totalRx = stats.reduce((sum, s) => sum + s.rxBytes, 0);
  const totalTx = stats.reduce((sum, s) => sum + s.txBytes, 0);

  const data = {
    interfaces: stats.map((s) => ({
      ...s,
      rxBytesFormatted: formatBytes(s.rxBytes),
      txBytesFormatted: formatBytes(s.txBytes),
    })),
    totalRx: formatBytes(totalRx),
    totalTx: formatBytes(totalTx),
    totalRxBytes: totalRx,
    totalTxBytes: totalTx,
    activeConnections: getActiveConnections(),
    dnsServers: getDNSServers(),
  };

  return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
}
