import { NextResponse } from "next/server";
import os from "os";

// In-memory history buffer — stores last 30 data points (polled every 2s from the client = ~1 min of data)
const history: { timestamp: string; cpu: number; memory: number }[] = [];
const MAX_HISTORY = 60;

function getCpuUsage(): number {
  const cpus = os.cpus();
  let totalIdle = 0;
  let totalTick = 0;
  for (const cpu of cpus) {
    for (const type in cpu.times) {
      totalTick += cpu.times[type as keyof typeof cpu.times];
    }
    totalIdle += cpu.times.idle;
  }
  return Math.round(((totalTick - totalIdle) / totalTick) * 100);
}

export async function GET() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memPercent = Math.round((usedMem / totalMem) * 100);
  const cpuPercent = getCpuUsage();

  const point = {
    timestamp: new Date().toISOString(),
    cpu: cpuPercent,
    memory: memPercent,
  };

  history.push(point);
  if (history.length > MAX_HISTORY) {
    history.shift();
  }

  return NextResponse.json(history, {
    headers: { "Cache-Control": "no-store" },
  });
}
