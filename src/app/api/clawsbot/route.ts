import { NextResponse } from "next/server";
import { execSync } from "child_process";
import os from "os";

function safe(cmd: string): string {
  try {
    return execSync(cmd, { timeout: 5000 }).toString().trim();
  } catch {
    return "";
  }
}

export async function GET() {
  // Detect Node.js / bot process info
  const nodeVersion = process.version;
  const platform = os.platform();
  const hostname = os.hostname();

  // Check if clawbot or a bot process is running
  let botProcess: { user: string; pid: string; cpu: string; mem: string; command: string }[] = [];
  try {
    const psOutput = platform === "darwin"
      ? safe("ps aux | grep -i 'claws\\|bot\\|node' | grep -v grep | head -5")
      : safe("ps aux | grep -i 'claws\\|bot\\|node' | grep -v grep | head -5");
    const lines = psOutput.split("\n").filter(Boolean);
    botProcess = lines.map((line) => {
      const parts = line.trim().split(/\s+/);
      return {
        user: parts[0],
        pid: parts[1],
        cpu: parts[2],
        mem: parts[3],
        command: parts.slice(10).join(" "),
      };
    });
  } catch {
    // keep empty
  }

  // Check for Discord bot token env (presence only, not value)
  const hasDiscordToken = !!(process.env.DISCORD_TOKEN || process.env.DISCORD_BOT_TOKEN);
  const hasOpenAIKey = !!(process.env.OPENAI_API_KEY);
  const hasAnthropicKey = !!(process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY);

  // Environment variables summary (safe — no secrets)
  const envKeys = Object.keys(process.env).filter(
    (k) => k.startsWith("CLAWS") || k.startsWith("BOT_") || k.startsWith("DISCORD") || k.startsWith("NODE_")
  );

  // Uptime
  const uptimeSec = process.uptime();
  const serverUptime = os.uptime();

  // Memory
  const memUsage = process.memoryUsage();

  // Docker containers related to clawbot
  let dockerContainers: { name: string; image: string; status: string; ports: string }[] = [];
  try {
    const dockerOut = safe('docker ps -a --format "{{.Names}}|{{.Image}}|{{.Status}}|{{.Ports}}" 2>/dev/null');
    if (dockerOut) {
      dockerContainers = dockerOut.split("\n").filter(Boolean).map((line) => {
        const [name, image, status, ports] = line.split("|");
        return { name, image, status, ports: ports || "" };
      });
    }
  } catch {}

  // PM2 processes (if pm2 is used)
  let pm2Processes: { name: string; status: string; cpu: string; memory: string; uptime: string }[] = [];
  try {
    const pm2Out = safe("pm2 jlist 2>/dev/null");
    if (pm2Out) {
      const pm2Data = JSON.parse(pm2Out);
      pm2Processes = pm2Data.map((p: Record<string, unknown>) => ({
        name: p.name as string,
        status: (p.pm2_env as Record<string, unknown>)?.status as string || "unknown",
        cpu: `${(p.monit as Record<string, unknown>)?.cpu || 0}%`,
        memory: `${Math.round(((p.monit as Record<string, unknown>)?.memory as number || 0) / 1024 / 1024)}MB`,
        uptime: `${Math.round(((p.pm2_env as Record<string, unknown>)?.pm_uptime as number || 0) / 1000 / 60)}m`,
      }));
    }
  } catch {}

  // SystemD service check (Linux only)
  let systemdStatus = "";
  if (platform === "linux") {
    systemdStatus = safe("systemctl is-active clawbot 2>/dev/null") || "not found";
  }

  return NextResponse.json({
    agent: {
      name: "clawbot",
      version: process.env.clawbot_VERSION || "3.2.0",
      nodeVersion,
      runtime: "Node.js",
      model: process.env.clawbot_MODEL || "claude-3.5-sonnet",
      fallbackModel: process.env.clawbot_FALLBACK_MODEL || "gpt-4o-mini",
      mode: process.env.clawbot_MODE || "production",
    },
    server: {
      hostname,
      platform,
      serverUptime,
      processUptime: uptimeSec,
      pid: process.pid,
    },
    memory: {
      rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
      external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
    },
    integrations: {
      discord: hasDiscordToken,
      openai: hasOpenAIKey,
      anthropic: hasAnthropicKey,
    },
    envKeys,
    botProcesses: botProcess,
    dockerContainers,
    pm2Processes,
    systemdStatus,
  });
}
