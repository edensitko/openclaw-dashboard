import { NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";

const PRICING_PATH = join(process.cwd(), "data", "pricing.json");

interface PricingData {
  featureCosts: Record<string, number>;
  baseCosts: Record<string, number>;
  extrasCosts: Record<string, number>;
  monthlyCosts: Record<string, number>;
  yearlyCosts: Record<string, number>;
  updatedAt: string;
}

async function readPricing(): Promise<PricingData> {
  const raw = await readFile(PRICING_PATH, "utf-8");
  return JSON.parse(raw);
}

export async function GET() {
  try {
    const data = await readPricing();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to read pricing data" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const current = await readPricing();

    const updated: PricingData = {
      featureCosts: body.featureCosts ?? current.featureCosts,
      baseCosts: body.baseCosts ?? current.baseCosts,
      extrasCosts: body.extrasCosts ?? current.extrasCosts,
      monthlyCosts: body.monthlyCosts ?? current.monthlyCosts,
      yearlyCosts: body.yearlyCosts ?? current.yearlyCosts,
      updatedAt: new Date().toISOString(),
    };

    await writeFile(PRICING_PATH, JSON.stringify(updated, null, 2), "utf-8");
    return NextResponse.json({ success: true, data: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update pricing data" }, { status: 500 });
  }
}
