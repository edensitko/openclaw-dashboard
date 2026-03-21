import { NextResponse } from "next/server";
import { execSync } from "child_process";

interface TailscalePeer {
  name: string;
  ip: string;
  os: string;
  online: boolean;
  relay: string;
  rxBytes: number;
  txBytes: number;
  lastSeen: string;
  exitNode: boolean;
}

interface TailscaleStatus {
  installed: boolean;
  running: boolean;
  self: {
    name: string;
    ip: string;
    os: string;
    tailscaleIp: string;
  } | null;
  peers: TailscalePeer[];
  magicDNSSuffix: string | null;
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

export async function GET() {
  const result: TailscaleStatus = {
    installed: false,
    running: false,
    self: null,
    peers: [],
    magicDNSSuffix: null,
  };

  try {
    // Check if tailscale is installed
    execSync("which tailscale", { encoding: "utf-8" });
    result.installed = true;
  } catch {
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  }

  try {
    // Get tailscale status as JSON
    const statusJson = execSync("tailscale status --json 2>/dev/null", {
      encoding: "utf-8",
      timeout: 5000,
    });

    const status = JSON.parse(statusJson);
    result.running = true;

    // Self info
    if (status.Self) {
      const self = status.Self;
      result.self = {
        name: self.HostName || self.DNSName || "unknown",
        ip: self.TailscaleIPs?.[0] || "",
        os: self.OS || "unknown",
        tailscaleIp: self.TailscaleIPs?.[0] || "",
      };
    }

    // Magic DNS suffix
    result.magicDNSSuffix = status.MagicDNSSuffix || null;

    // Peers
    if (status.Peer) {
      for (const [, peer] of Object.entries(status.Peer) as [string, any][]) {
        result.peers.push({
          name: peer.HostName || peer.DNSName?.split(".")[0] || "unknown",
          ip: peer.TailscaleIPs?.[0] || "",
          os: peer.OS || "unknown",
          online: peer.Online || false,
          relay: peer.Relay || "direct",
          rxBytes: peer.RxBytes || 0,
          txBytes: peer.TxBytes || 0,
          lastSeen: peer.LastSeen || "",
          exitNode: peer.ExitNode || false,
        });
      }
    }
  } catch {
    // Tailscale installed but not running or no permission
    result.running = false;
  }

  return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
}
