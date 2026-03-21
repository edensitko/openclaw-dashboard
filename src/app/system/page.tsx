"use client";

import { useEffect, useState } from "react";

export default function SystemPage() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        // Try direct fetch from OpenClaw Control UI
        const response = await fetch("http://127.0.0.1:18789/api/status", {
          method: "GET",
          headers: { "Accept": "application/json" },
        }).catch(() => 
          // Fallback to proxy
          fetch("/api/system-status")
        );
        const data = await response.json();
        setStatus(data);
      } catch (error) {
        console.error("Failed to fetch status:", error);
        setStatus(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    // Refresh every 5 seconds for live data
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div style={{ color: "#fff", padding: "40px" }}>Loading live data from OpenClaw...</div>;
  if (!status) return <div style={{ color: "#fff", padding: "40px" }}>Unable to fetch status. Make sure OpenClaw Control UI is running on localhost:18789</div>;

  const sessions = status.sessions?.recent || [];
  const totalSessions = status.sessions?.count || 0;
  const totalInputTokens = sessions.reduce((sum: number, s: any) => sum + (s.inputTokens || 0), 0);
  const totalOutputTokens = sessions.reduce((sum: number, s: any) => sum + (s.outputTokens || 0), 0);
  const totalCacheRead = sessions.reduce((sum: number, s: any) => sum + (s.cacheRead || 0), 0);

  return (
    <div style={{ padding: "40px", backgroundColor: "#0a0e27", color: "#fff", minHeight: "100vh", fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: "28px", marginBottom: "10px" }}>🖥️ OpenClaw System Status</h1>
      <p style={{ color: "#666", marginBottom: "40px" }}>Real-time session & token usage tracking</p>

      {/* Summary */}
      <div style={{ marginBottom: "40px" }}>
        <h2 style={{ fontSize: "18px", color: "#00f0ff", marginBottom: "20px" }}>📊 Session Summary</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "20px" }}>
          <div style={{ backgroundColor: "#1a1f3a", border: "1px solid #2d3148", padding: "20px", borderRadius: "12px" }}>
            <div style={{ fontSize: "12px", color: "#00f0ff", marginBottom: "10px", textTransform: "uppercase" }}>Total Sessions</div>
            <div style={{ fontSize: "48px", fontWeight: "bold", color: "#00f0ff" }}>{totalSessions}</div>
          </div>

          <div style={{ backgroundColor: "#1a1f3a", border: "1px solid #2d3148", padding: "20px", borderRadius: "12px" }}>
            <div style={{ fontSize: "12px", color: "#6c63ff", marginBottom: "10px", textTransform: "uppercase" }}>Input Tokens</div>
            <div style={{ fontSize: "48px", fontWeight: "bold", color: "#6c63ff" }}>{totalInputTokens.toLocaleString()}</div>
          </div>

          <div style={{ backgroundColor: "#1a1f3a", border: "1px solid #2d3148", padding: "20px", borderRadius: "12px" }}>
            <div style={{ fontSize: "12px", color: "#00ff88", marginBottom: "10px", textTransform: "uppercase" }}>Output Tokens</div>
            <div style={{ fontSize: "48px", fontWeight: "bold", color: "#00ff88" }}>{totalOutputTokens.toLocaleString()}</div>
          </div>

          <div style={{ backgroundColor: "#1a1f3a", border: "1px solid #2d3148", padding: "20px", borderRadius: "12px" }}>
            <div style={{ fontSize: "12px", color: "#ffd93d", marginBottom: "10px", textTransform: "uppercase" }}>Cache Read</div>
            <div style={{ fontSize: "48px", fontWeight: "bold", color: "#ffd93d" }}>{totalCacheRead.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      <div style={{ marginBottom: "40px" }}>
        <h2 style={{ fontSize: "18px", color: "#00f0ff", marginBottom: "20px" }}>📱 Recent Sessions</h2>
        <div style={{ backgroundColor: "#1a1f3a", border: "1px solid #2d3148", borderRadius: "12px", overflow: "hidden" }}>
          <div style={{ padding: "20px" }}>
            {sessions.map((session: any, i: number) => (
              <div key={i} style={{ 
                padding: "15px 0", 
                borderBottom: i < sessions.length - 1 ? "1px solid #2d3148" : "none",
                marginBottom: "15px"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                  <div style={{ fontSize: "14px", fontWeight: "bold", color: "#00f0ff" }}>{session.sessionId}</div>
                  <div style={{ fontSize: "12px", color: "#666" }}>Age: {session.age}ms</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "10px", fontSize: "12px" }}>
                  <div>
                    <span style={{ color: "#666" }}>Input:</span> <span style={{ color: "#6c63ff" }}>{session.inputTokens || 0}</span>
                  </div>
                  <div>
                    <span style={{ color: "#666" }}>Output:</span> <span style={{ color: "#00ff88" }}>{session.outputTokens || 0}</span>
                  </div>
                  <div>
                    <span style={{ color: "#666" }}>Cache Read:</span> <span style={{ color: "#ffd93d" }}>{session.cacheRead || 0}</span>
                  </div>
                  <div>
                    <span style={{ color: "#666" }}>Total:</span> <span style={{ color: "#fff" }}>{(session.totalTokens || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Info */}
      <div style={{
        backgroundColor: "#1a1f3a",
        border: "1px solid #2d3148",
        padding: "20px",
        borderRadius: "12px",
        fontSize: "13px"
      }}>
        <h3 style={{ margin: "0 0 15px 0", color: "#00f0ff" }}>System Configuration</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "15px" }}>
          <div>
            <span style={{ color: "#666" }}>Runtime:</span> {status.runtimeVersion}
          </div>
          <div>
            <span style={{ color: "#666" }}>Default Model:</span> {status.sessions?.defaults?.model}
          </div>
          <div>
            <span style={{ color: "#666" }}>Context Tokens:</span> {status.sessions?.defaults?.contextTokens?.toLocaleString()}
          </div>
          <div>
            <span style={{ color: "#666" }}>Heartbeat Agent:</span> {status.heartbeat?.defaultAgentId}
          </div>
        </div>
      </div>
    </div>
  );
}
