import { execSync } from "child_process";

export async function GET() {
  try {
    // Get real Tailscale status
    const statusJson = execSync("tailscale status --json 2>/dev/null || echo '{\"Peer\":{}, \"Self\":null}'", {
      encoding: "utf-8",
    });

    const status = JSON.parse(statusJson);

    // Parse peers
    const peers = status.Peer
      ? Object.entries(status.Peer).map(([key, value]: [string, any]) => ({
          name: value.HostName || "Unknown",
          ip: key || "N/A",
          os: value.OS || "Unknown",
          online: value.Online !== false,
          relay: value.Relay || "direct",
          rxBytes: value.RxBytes || 0,
          txBytes: value.TxBytes || 0,
          lastSeen: value.LastSeen || new Date().toISOString(),
          exitNode: value.ExitNode || false,
        }))
      : [];

    // Self info
    const selfInfo = status.Self
      ? {
          name: status.Self.HostName || "This Device",
          ip: status.Self.TailscaleIPs?.[0] || "N/A",
          os: status.Self.OS || "Unknown",
          tailscaleIp: status.Self.TailscaleIPs?.[0] || "N/A",
        }
      : null;

    return Response.json({
      installed: true,
      running: true,
      self: selfInfo,
      peers: peers,
      magicDNSSuffix: status.MagicDNSSuffix || null,
    });
  } catch (error) {
    // Fallback if tailscale not installed or error
    return Response.json({
      installed: false,
      running: false,
      self: null,
      peers: [],
      magicDNSSuffix: null,
    });
  }
}
