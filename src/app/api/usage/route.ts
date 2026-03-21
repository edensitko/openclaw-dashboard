import * as fs from "fs";
import * as path from "path";

export async function GET() {
  try {
    // Read the actual api_usage.json from workspace
    const usageFile = "/home/ubuntu/.openclaw/workspace/api_usage.json";
    
    if (!fs.existsSync(usageFile)) {
      return Response.json({ error: "Usage file not found" }, { status: 404 });
    }

    const content = fs.readFileSync(usageFile, "utf-8");
    const data = JSON.parse(content);

    // Return the real usage data
    return Response.json({
      timestamp: new Date().toISOString(),
      anthropic: data.anthropic,
      openai: data.openai,
    });
  } catch (error) {
    return Response.json(
      { error: `Failed to read usage: ${error}` },
      { status: 500 }
    );
  }
}
