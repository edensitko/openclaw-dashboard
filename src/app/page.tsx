"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    const fetch_metrics = () => {
      fetch("/api/proxy")
        .then(r => r.json())
        .then(setMetrics)
        .catch(console.error);
    };

    fetch_metrics();
    const interval = setInterval(fetch_metrics, 1000); // Update every 1 second
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      padding: "40px",
      backgroundColor: "#0a0e27",
      color: "#fff",
      minHeight: "100vh",
      fontFamily: "system-ui"
    }}>
      <div style={{ marginBottom: "40px" }}>
        <h1 style={{ margin: "0 0 10px 0", fontSize: "32px" }}>📊 OpenClaw Live Dashboard</h1>
        <p style={{ margin: "0", color: "#666" }}>Real-time machine metrics + OpenClaw usage</p>
      </div>

      {/* Machine Metrics */}
      {metrics && (
        <>
          <div style={{ marginBottom: "40px" }}>
            <h2 style={{ fontSize: "18px", color: "#00f0ff", marginBottom: "20px" }}>🖥️ Machine Metrics</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "20px" }}>
              {/* CPU */}
              <div style={{
                backgroundColor: "#00f0ff15",
                border: "1px solid #00f0ff30",
                padding: "25px",
                borderRadius: "12px",
                textAlign: "center"
              }}>
                <div style={{ fontSize: "12px", color: "#00f0ff", marginBottom: "10px", textTransform: "uppercase" }}>CPU</div>
                <div style={{ fontSize: "56px", fontWeight: "bold", color: "#00f0ff" }}>{metrics.cpu}</div>
                <div style={{ fontSize: "12px", color: "#666", marginTop: "10px" }}>%</div>
              </div>

              {/* Memory */}
              <div style={{
                backgroundColor: "#6c63ff15",
                border: "1px solid #6c63ff30",
                padding: "25px",
                borderRadius: "12px",
                textAlign: "center"
              }}>
                <div style={{ fontSize: "12px", color: "#6c63ff", marginBottom: "10px", textTransform: "uppercase" }}>Memory</div>
                <div style={{ fontSize: "56px", fontWeight: "bold", color: "#6c63ff" }}>{metrics.memory}</div>
                <div style={{ fontSize: "12px", color: "#666", marginTop: "10px" }}>%</div>
              </div>

              {/* Disk */}
              <div style={{
                backgroundColor: "#00ff8815",
                border: "1px solid #00ff8830",
                padding: "25px",
                borderRadius: "12px",
                textAlign: "center"
              }}>
                <div style={{ fontSize: "12px", color: "#00ff88", marginBottom: "10px", textTransform: "uppercase" }}>Disk</div>
                <div style={{ fontSize: "56px", fontWeight: "bold", color: "#00ff88" }}>{metrics.disk}</div>
                <div style={{ fontSize: "12px", color: "#666", marginTop: "10px" }}>%</div>
              </div>

              {/* Uptime */}
              <div style={{
                backgroundColor: "#ffd93d15",
                border: "1px solid #ffd93d30",
                padding: "25px",
                borderRadius: "12px",
                textAlign: "center"
              }}>
                <div style={{ fontSize: "12px", color: "#ffd93d", marginBottom: "10px", textTransform: "uppercase" }}>Uptime</div>
                <div style={{ fontSize: "56px", fontWeight: "bold", color: "#ffd93d" }}>{metrics.uptime}</div>
                <div style={{ fontSize: "12px", color: "#666", marginTop: "10px" }}>hours</div>
              </div>
            </div>
          </div>

          {/* System Info */}
          <div style={{
            backgroundColor: "#1a1f3a",
            border: "1px solid #2d3148",
            padding: "20px",
            borderRadius: "12px",
            marginBottom: "40px"
          }}>
            <h3 style={{ margin: "0 0 15px 0", fontSize: "14px", color: "#00f0ff" }}>System Information</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", fontSize: "13px" }}>
              <div>
                <span style={{ color: "#666" }}>Hostname:</span> <span style={{ color: "#fff", marginLeft: "8px" }}>{metrics.hostname}</span>
              </div>
              <div>
                <span style={{ color: "#666" }}>Platform:</span> <span style={{ color: "#fff", marginLeft: "8px" }}>{metrics.platform}</span>
              </div>
              <div>
                <span style={{ color: "#666" }}>Memory Used:</span> <span style={{ color: "#fff", marginLeft: "8px" }}>{metrics.memoryGB} GB / {metrics.memoryTotalGB} GB</span>
              </div>
              <div>
                <span style={{ color: "#666" }}>Last Update:</span> <span style={{ color: "#fff", marginLeft: "8px" }}>{new Date(metrics.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* OpenClaw Status */}
      <div style={{ marginBottom: "40px" }}>
        <h2 style={{ fontSize: "18px", color: "#00f0ff", marginBottom: "20px" }}>⚙️ OpenClaw Status</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "20px" }}>
          {/* Bots */}
          <div style={{
            backgroundColor: "#1a1f3a",
            border: "1px solid #2d3148",
            padding: "20px",
            borderRadius: "12px"
          }}>
            <div style={{ fontSize: "12px", color: "#666", marginBottom: "10px" }}>ACTIVE BOTS</div>
            <div style={{ fontSize: "32px", fontWeight: "bold", color: "#00ff88" }}>4</div>
            <div style={{ fontSize: "11px", color: "#666", marginTop: "10px" }}>
              Monitor • PM • Promter • Backend
            </div>
          </div>

          {/* Docker Containers */}
          <div style={{
            backgroundColor: "#1a1f3a",
            border: "1px solid #2d3148",
            padding: "20px",
            borderRadius: "12px"
          }}>
            <div style={{ fontSize: "12px", color: "#666", marginBottom: "10px" }}>DOCKER</div>
            <div style={{ fontSize: "32px", fontWeight: "bold", color: "#00f0ff" }}>3</div>
            <div style={{ fontSize: "11px", color: "#666", marginTop: "10px" }}>
              Drone • Dashboard • API
            </div>
          </div>

          {/* API Usage */}
          <div style={{
            backgroundColor: "#1a1f3a",
            border: "1px solid #2d3148",
            padding: "20px",
            borderRadius: "12px"
          }}>
            <div style={{ fontSize: "12px", color: "#666", marginBottom: "10px" }}>API REQUESTS</div>
            <div style={{ fontSize: "32px", fontWeight: "bold", color: "#6c63ff" }}>Real-time</div>
            <div style={{ fontSize: "11px", color: "#666", marginTop: "10px" }}>
              From /api/usage.json
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        fontSize: "12px",
        color: "#666",
        borderTop: "1px solid #2d3148",
        paddingTop: "20px"
      }}>
        <p>🚀 Live metrics update every 1 second | API Server: http://100.126.86.46:3001</p>
        <p>📊 Dashboard: http://100.126.86.46:3000 | 🐳 Drone CI: http://100.126.86.46:8080</p>
      </div>
    </div>
  );
}
