import { NextResponse } from "next/server";
import { execSync } from "child_process";
import os from "os";

interface ServiceInfo {
  name: string;
  status: "running" | "stopped" | "failed" | "unknown";
  pid?: string;
  description?: string;
}

function getLinuxServices(): ServiceInfo[] {
  try {
    const output = execSync(
      "systemctl list-units --type=service --all --no-legend --no-pager 2>/dev/null | head -50",
      { encoding: "utf-8", timeout: 5000 }
    );
    return output
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const parts = line.trim().split(/\s+/);
        const name = parts[0]?.replace(".service", "") || "unknown";
        const active = parts[2] || "unknown";
        const sub = parts[3] || "";
        const desc = parts.slice(4).join(" ");
        let status: ServiceInfo["status"] = "unknown";
        if (active === "active") status = "running";
        else if (active === "inactive") status = "stopped";
        else if (active === "failed") status = "failed";
        return { name, status, description: desc };
      });
  } catch {
    return [];
  }
}

function getMacServices(): ServiceInfo[] {
  try {
    const output = execSync("launchctl list 2>/dev/null | head -50", {
      encoding: "utf-8",
      timeout: 5000,
    });
    return output
      .trim()
      .split("\n")
      .slice(1) // skip header
      .filter(Boolean)
      .map((line) => {
        const parts = line.trim().split(/\t+/);
        const pid = parts[0] || "-";
        const exitStatus = parts[1] || "0";
        const name = parts[2] || "unknown";
        const isRunning = pid !== "-" && pid !== "0";
        return {
          name: name.replace(/^com\.(apple|google|microsoft)\./, ""),
          status: isRunning ? ("running" as const) : ("stopped" as const),
          pid: isRunning ? pid : undefined,
        };
      })
      .filter((s) => !s.name.startsWith("["));
  } catch {
    return [];
  }
}

function getDockerContainers(): {
  name: string;
  image: string;
  status: string;
  state: string;
  ports: string;
  created: string;
}[] {
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

function getListeningPorts(): { port: string; pid: string; process: string; protocol: string }[] {
  try {
    const platform = os.platform();
    let output: string;
    if (platform === "darwin") {
      output = execSync(
        "lsof -iTCP -sTCP:LISTEN -P -n 2>/dev/null | tail -30",
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
        });
    } else {
      output = execSync(
        "ss -tlnp 2>/dev/null | tail -30",
        { encoding: "utf-8", timeout: 5000 }
      );
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
        });
    }
  } catch {
    return [];
  }
}

export async function GET() {
  const platform = os.platform();

  const data = {
    platform,
    services: platform === "darwin" ? getMacServices() : getLinuxServices(),
    docker: getDockerContainers(),
    listeningPorts: getListeningPorts(),
  };

  return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
}
