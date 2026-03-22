import { NextResponse } from "next/server";
import { execSync } from "child_process";
import os from "os";

/* ─── Well-known port descriptions ─── */
const WELL_KNOWN: Record<string, { name: string; category: string; icon: string }> = {
  "22":    { name: "SSH", category: "system", icon: "terminal" },
  "53":    { name: "DNS", category: "system", icon: "globe" },
  "80":    { name: "HTTP", category: "web", icon: "globe" },
  "443":   { name: "HTTPS", category: "web", icon: "globe" },
  "3000":  { name: "Dev Server", category: "web", icon: "code" },
  "3001":  { name: "API Server", category: "api", icon: "zap" },
  "3306":  { name: "MySQL", category: "database", icon: "database" },
  "4000":  { name: "Dev Server", category: "web", icon: "code" },
  "5000":  { name: "Flask / API", category: "api", icon: "zap" },
  "5173":  { name: "Vite Dev", category: "web", icon: "code" },
  "5432":  { name: "PostgreSQL", category: "database", icon: "database" },
  "5900":  { name: "VNC", category: "system", icon: "monitor" },
  "6379":  { name: "Redis", category: "database", icon: "database" },
  "8000":  { name: "Web Server", category: "web", icon: "globe" },
  "8080":  { name: "HTTP Proxy / CI", category: "web", icon: "globe" },
  "8443":  { name: "HTTPS Alt", category: "web", icon: "globe" },
  "8888":  { name: "Jupyter", category: "dev", icon: "code" },
  "9000":  { name: "PHP-FPM / Portainer", category: "web", icon: "globe" },
  "9090":  { name: "Prometheus", category: "monitoring", icon: "activity" },
  "9100":  { name: "Node Exporter", category: "monitoring", icon: "activity" },
  "18789": { name: "OpenClaw Control UI", category: "api", icon: "bot" },
  "27017": { name: "MongoDB", category: "database", icon: "database" },
};

const CATEGORIES: Record<string, string> = {
  web: "#00F0FF",
  api: "#6C63FF",
  database: "#FFD93D",
  system: "#00FF88",
  monitoring: "#FF6B6B",
  dev: "#D4A373",
  docker: "#00F0FF",
  unknown: "#7A7A9E",
};

interface PortEntry {
  port: string;
  pid: string;
  process: string;
  protocol: string;
}

interface DockerContainer {
  name: string;
  image: string;
  status: string;
  state: string;
  ports: string;
  created: string;
}

interface AppInfo {
  id: string;
  name: string;
  process: string;
  pid: string;
  ports: string[];
  protocol: string;
  category: string;
  categoryColor: string;
  icon: string;
  description: string;
  source: "system" | "docker";
  status: "running" | "stopped" | "unknown";
  dockerImage?: string;
  dockerStatus?: string;
  dockerPorts?: string;
}

function getListeningPorts(): PortEntry[] {
  try {
    const platform = os.platform();
    if (platform === "darwin") {
      const output = execSync(
        "lsof -iTCP -sTCP:LISTEN -P -n 2>/dev/null | tail -50",
        { encoding: "utf-8", timeout: 5000 }
      );
      return output
        .trim()
        .split("\n")
        .filter(Boolean)
        .map((line) => {
          const parts = line.trim().split(/\s+/);
          const process = parts[0] || "unknown";
          const pid = parts[1] || "";
          const addr = parts[8] || "";
          const port = addr.split(":").pop() || "";
          return { port, pid, process, protocol: "TCP" };
        })
        .filter((p) => /^\d+$/.test(p.port));
    } else {
      const output = execSync("ss -tlnp 2>/dev/null | tail -50", {
        encoding: "utf-8",
        timeout: 5000,
      });
      return output
        .trim()
        .split("\n")
        .slice(1)
        .filter(Boolean)
        .map((line) => {
          const parts = line.trim().split(/\s+/);
          const local = parts[3] || "";
          const port = local.split(":").pop() || "";
          const processInfo = parts[5] || "";
          const pidMatch = processInfo.match(/pid=(\d+)/);
          const nameMatch = processInfo.match(/users:\(\("([^"]+)"/);
          return {
            port,
            pid: pidMatch?.[1] || "",
            process: nameMatch?.[1] || "unknown",
            protocol: "TCP",
          };
        })
        .filter((p) => /^\d+$/.test(p.port));
    }
  } catch {
    return [];
  }
}

function getDockerContainers(): DockerContainer[] {
  try {
    const output = execSync(
      'docker ps -a --format "{{.Names}}\\t{{.Image}}\\t{{.Status}}\\t{{.State}}\\t{{.Ports}}\\t{{.CreatedAt}}" 2>/dev/null',
      { encoding: "utf-8", timeout: 5000 }
    );
    return output
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const [name, image, status, state, ports, created] = line.split("\t");
        return {
          name: name || "unknown",
          image: image || "unknown",
          status: status || "unknown",
          state: state || "unknown",
          ports: ports || "",
          created: created || "",
        };
      });
  } catch {
    return [];
  }
}

function getProcessInfo(pid: string): { cpu: string; mem: string; command: string } | null {
  if (!pid) return null;
  try {
    const output = execSync(`ps -p ${pid} -o %cpu,%mem,command= 2>/dev/null`, {
      encoding: "utf-8",
      timeout: 3000,
    });
    const line = output.trim().split("\n").pop();
    if (!line) return null;
    const parts = line.trim().split(/\s+/);
    return {
      cpu: parts[0] || "0.0",
      mem: parts[1] || "0.0",
      command: parts.slice(2).join(" ").slice(0, 120),
    };
  } catch {
    return null;
  }
}

export async function GET() {
  const ports = getListeningPorts();
  const docker = getDockerContainers();

  // Group ports by process+pid
  const grouped = new Map<string, PortEntry[]>();
  for (const p of ports) {
    const key = `${p.process}:${p.pid}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(p);
  }

  const apps: AppInfo[] = [];
  const seenPorts = new Set<string>();

  // System processes
  for (const [key, entries] of grouped) {
    const portNums = [...new Set(entries.map((e) => e.port))];
    const firstEntry = entries[0];
    const bestPort = portNums.find((p) => WELL_KNOWN[p]) || portNums[0];
    const known = WELL_KNOWN[bestPort];
    const category = known?.category || "unknown";

    apps.push({
      id: `sys-${key}`,
      name: known?.name || firstEntry.process,
      process: firstEntry.process,
      pid: firstEntry.pid,
      ports: portNums,
      protocol: firstEntry.protocol,
      category,
      categoryColor: CATEGORIES[category] || CATEGORIES.unknown,
      icon: known?.icon || "server",
      description: portNums.map((p) => WELL_KNOWN[p]?.name || `Port ${p}`).join(", "),
      source: "system",
      status: "running",
    });

    portNums.forEach((p) => seenPorts.add(p));
  }

  // Docker containers
  for (const c of docker) {
    const containerPorts: string[] = [];
    if (c.ports) {
      const matches = c.ports.match(/\d+(?=->)/g) || [];
      const bindMatches = c.ports.match(/->(\d+)/g) || [];
      containerPorts.push(
        ...matches,
        ...bindMatches.map((m) => m.replace("->", ""))
      );
    }
    const uniquePorts = [...new Set(containerPorts)];
    const bestPort = uniquePorts.find((p) => WELL_KNOWN[p]) || uniquePorts[0];
    const known = bestPort ? WELL_KNOWN[bestPort] : null;
    const category = known?.category || "docker";

    apps.push({
      id: `docker-${c.name}`,
      name: c.name,
      process: "docker",
      pid: "",
      ports: uniquePorts,
      protocol: "TCP",
      category,
      categoryColor: CATEGORIES[category] || CATEGORIES.docker,
      icon: known?.icon || "container",
      description: c.image,
      source: "docker",
      status: c.state === "running" ? "running" : "stopped",
      dockerImage: c.image,
      dockerStatus: c.status,
      dockerPorts: c.ports,
    });
  }

  // Enrich with process CPU/mem for top entries
  const enriched = apps.map((app) => {
    if (app.source === "system" && app.pid) {
      const info = getProcessInfo(app.pid);
      if (info) {
        return { ...app, cpu: info.cpu, mem: info.mem, command: info.command };
      }
    }
    return app;
  });

  const summary = {
    totalApps: enriched.length,
    totalPorts: [...new Set(enriched.flatMap((a) => a.ports))].length,
    running: enriched.filter((a) => a.status === "running").length,
    stopped: enriched.filter((a) => a.status === "stopped").length,
    byCategory: Object.fromEntries(
      Object.keys(CATEGORIES).map((cat) => [
        cat,
        enriched.filter((a) => a.category === cat).length,
      ])
    ),
    dockerContainers: docker.length,
    systemProcesses: enriched.filter((a) => a.source === "system").length,
  };

  return NextResponse.json(
    { apps: enriched, summary, categories: CATEGORIES, timestamp: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store" } }
  );
}
