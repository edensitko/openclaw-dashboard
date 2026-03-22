import { NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import path from "path";

export async function GET() {
  // Try reading from the live scraped data first (written by scrape-claude-usage.sh)
  const workspaceDataPath = path.join(process.cwd(), "data", "claude-usage.json");

  // Also check common workspace locations
  const possiblePaths = [
    workspaceDataPath,
    path.join(process.env.OPENCLAW_WORKSPACE || "", "data", "claude-usage.json"),
    "/home/ubuntu/.openclaw/workspace/data/claude-usage.json",
  ].filter(Boolean);

  for (const filePath of possiblePaths) {
    try {
      if (existsSync(filePath)) {
        const raw = readFileSync(filePath, "utf-8");
        const data = JSON.parse(raw);
        return NextResponse.json(
          { ...data, source: "live", path: filePath },
          { headers: { "Cache-Control": "no-store" } }
        );
      }
    } catch {
      continue;
    }
  }

  // Fallback: read from public static file
  try {
    const staticPath = path.join(process.cwd(), "public", "claude-usage.json");
    if (existsSync(staticPath)) {
      const raw = readFileSync(staticPath, "utf-8");
      const data = JSON.parse(raw);
      return NextResponse.json(
        { ...data, source: "static" },
        { headers: { "Cache-Control": "no-store" } }
      );
    }
  } catch {
    // fall through
  }

  return NextResponse.json(
    {
      scraped_at: null,
      session: null,
      weekly_all: null,
      weekly_sonnet: null,
      extra_usage: null,
      source: "none",
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
