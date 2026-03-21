"use client";

import { useState, useEffect, useCallback } from "react";

export interface SystemData {
  timestamp: string;
  hostname: string;
  platform: string;
  arch: string;
  osRelease: string;
  osType: string;
  uptime: string;
  uptimeSeconds: number;
  cpu: {
    model: string;
    cores: number;
    usage: number;
    speed: number;
    loadAvg: { "1m": string; "5m": string; "15m": string };
  };
  memory: {
    total: string;
    used: string;
    free: string;
    totalBytes: number;
    usedBytes: number;
    freeBytes: number;
    percent: number;
  };
  disk: {
    total: string;
    used: string;
    free: string;
    percent: number;
  };
  network: { name: string; address: string; family: string; mac: string }[];
  processes: { pid: string; name: string; cpu: string; mem: string }[];
  userInfo: { username: string; homedir: string };
}

export interface HistoryPoint {
  timestamp: string;
  cpu: number;
  memory: number;
}

export interface Ec2Data {
  isEc2: boolean;
  instanceId: string;
  instanceType: string;
  availabilityZone: string;
  region: string;
  publicIp: string;
  privateIp: string;
  amiId: string;
  hostname: string;
  securityGroups: string[];
  iamRole: string;
  accountId: string;
  architecture: string;
}

export interface TailscalePeer {
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

export interface TailscaleData {
  installed: boolean;
  running: boolean;
  self: { name: string; ip: string; os: string; tailscaleIp: string } | null;
  peers: TailscalePeer[];
  magicDNSSuffix: string | null;
}

export interface ServiceInfo {
  name: string;
  status: "running" | "stopped" | "failed" | "unknown";
  pid?: string;
  description?: string;
}

export interface DockerContainer {
  name: string;
  image: string;
  status: string;
  state: string;
  ports: string;
  created: string;
}

export interface ServicesData {
  platform: string;
  services: ServiceInfo[];
  docker: DockerContainer[];
  listeningPorts: { port: string; pid: string; process: string; protocol: string }[];
}

export interface NetworkInterface {
  interface: string;
  rxBytes: number;
  txBytes: number;
  rxPackets: number;
  txPackets: number;
  rxBytesFormatted: string;
  txBytesFormatted: string;
}

export interface NetworkData {
  interfaces: NetworkInterface[];
  totalRx: string;
  totalTx: string;
  totalRxBytes: number;
  totalTxBytes: number;
  activeConnections: number;
  dnsServers: string[];
}

export function useSystemData(intervalMs = 3000) {
  const [data, setData] = useState<SystemData | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [ec2, setEc2] = useState<Ec2Data | null>(null);
  const [tailscale, setTailscale] = useState<TailscaleData | null>(null);
  const [services, setServices] = useState<ServicesData | null>(null);
  const [network, setNetwork] = useState<NetworkData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchCore = useCallback(async () => {
    try {
      const [sysRes, histRes] = await Promise.all([
        fetch("/api/system", { cache: "no-store" }),
        fetch("/api/system/history", { cache: "no-store" }),
      ]);
      if (sysRes.ok) setData(await sysRes.json());
      if (histRes.ok) setHistory(await histRes.json());
      setError(null);
    } catch {
      setError("Failed to fetch system data");
    }
  }, []);

  const fetchExtended = useCallback(async () => {
    try {
      const [ec2Res, tsRes, svcRes, netRes] = await Promise.all([
        fetch("/api/ec2", { cache: "no-store" }),
        fetch("/api/tailscale", { cache: "no-store" }),
        fetch("/api/services", { cache: "no-store" }),
        fetch("/api/network", { cache: "no-store" }),
      ]);
      if (ec2Res.ok) setEc2(await ec2Res.json());
      if (tsRes.ok) setTailscale(await tsRes.json());
      if (svcRes.ok) setServices(await svcRes.json());
      if (netRes.ok) setNetwork(await netRes.json());
    } catch {
      // non-critical
    }
  }, []);

  useEffect(() => {
    fetchCore();
    fetchExtended();
    const coreId = setInterval(fetchCore, intervalMs);
    const extId = setInterval(fetchExtended, intervalMs * 3); // less frequent
    return () => {
      clearInterval(coreId);
      clearInterval(extId);
    };
  }, [fetchCore, fetchExtended, intervalMs]);

  return { data, history, ec2, tailscale, services, network, error, refetch: fetchCore };
}
