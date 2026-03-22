import { execSync } from "child_process";

export async function GET() {
  try {
    // Fetch from OpenClaw Control UI if available
    try {
      const controlResponse = await fetch("http://127.0.0.1:18789/api/status", {
        method: "GET",
      });
      if (controlResponse.ok) {
        const data = await controlResponse.json();
        return Response.json(data);
      }
    } catch {
      // Fall through to CLI
    }

    // Fallback to CLI
    const output = execSync("openclaw status --json", {
      encoding: "utf-8",
      timeout: 10000,
    });

    const data = JSON.parse(output);
    return Response.json(data);
  } catch {
    return Response.json(
      { status: "unavailable", message: "OpenClaw CLI not installed or not reachable" },
      { status: 200 }
    );
  }
}
