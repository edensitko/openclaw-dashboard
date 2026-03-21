import { NextResponse } from "next/server";

async function fetchMeta(path: string, timeout = 2000): Promise<string | null> {
  try {
    // First get IMDSv2 token
    const tokenRes = await fetch("http://169.254.169.254/latest/api/token", {
      method: "PUT",
      headers: { "X-aws-ec2-metadata-token-ttl-seconds": "60" },
      signal: AbortSignal.timeout(timeout),
    });

    const token = tokenRes.ok ? await tokenRes.text() : "";

    const headers: Record<string, string> = {};
    if (token) headers["X-aws-ec2-metadata-token"] = token;

    const res = await fetch(`http://169.254.169.254/latest/meta-data/${path}`, {
      headers,
      signal: AbortSignal.timeout(timeout),
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

async function fetchIdentityDoc(timeout = 2000) {
  try {
    const tokenRes = await fetch("http://169.254.169.254/latest/api/token", {
      method: "PUT",
      headers: { "X-aws-ec2-metadata-token-ttl-seconds": "60" },
      signal: AbortSignal.timeout(timeout),
    });
    const token = tokenRes.ok ? await tokenRes.text() : "";
    const headers: Record<string, string> = {};
    if (token) headers["X-aws-ec2-metadata-token"] = token;

    const res = await fetch(
      "http://169.254.169.254/latest/dynamic/instance-identity/document",
      { headers, signal: AbortSignal.timeout(timeout) }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function GET() {
  const [
    instanceId,
    instanceType,
    availabilityZone,
    publicIp,
    privateIp,
    amiId,
    hostname,
    securityGroups,
    iamRole,
    identityDoc,
  ] = await Promise.all([
    fetchMeta("instance-id"),
    fetchMeta("instance-type"),
    fetchMeta("placement/availability-zone"),
    fetchMeta("public-ipv4"),
    fetchMeta("local-ipv4"),
    fetchMeta("ami-id"),
    fetchMeta("hostname"),
    fetchMeta("security-groups"),
    fetchMeta("iam/security-credentials/"),
    fetchIdentityDoc(),
  ]);

  const isEc2 = !!instanceId;

  const data = {
    isEc2,
    instanceId: instanceId || "N/A",
    instanceType: instanceType || "N/A",
    availabilityZone: availabilityZone || "N/A",
    region: identityDoc?.region || (availabilityZone ? availabilityZone.slice(0, -1) : "N/A"),
    publicIp: publicIp || "N/A",
    privateIp: privateIp || "N/A",
    amiId: amiId || "N/A",
    hostname: hostname || "N/A",
    securityGroups: securityGroups?.split("\n").filter(Boolean) || [],
    iamRole: iamRole?.split("\n")[0] || "N/A",
    accountId: identityDoc?.accountId || "N/A",
    architecture: identityDoc?.architecture || "N/A",
    kernelId: identityDoc?.kernelId || null,
    imageId: identityDoc?.imageId || null,
  };

  return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
}
