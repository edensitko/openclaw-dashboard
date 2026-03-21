"use client";

import { useEffect, useState } from "react";

export default function AnalyticsPage() {
  const [usage, setUsage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/usage")
      .then(r => r.json())
      .then(setUsage)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: "#fff", padding: "40px" }}>Loading...</div>;
  if (!usage) return <div style={{ color: "#fff", padding: "40px" }}>No data</div>;

  const anthropic = usage.anthropic?.total || {};
  const openai = usage.openai?.total || {};
  const today_anthro = usage.anthropic?.daily?.["2026-03-21"] || {};
  const today_openai = usage.openai?.daily?.["2026-03-21"] || {};

  return (
    <div style={{ padding: "40px", backgroundColor: "#0a0e27", color: "#fff", minHeight: "100vh", fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: "28px", marginBottom: "10px" }}>📊 API Usage & Costs</h1>
      <p style={{ color: "#666", marginBottom: "40px" }}>Real-time tracking of Anthropic + OpenAI APIs</p>

      {/* Today's Usage */}
      <div style={{ marginBottom: "40px" }}>
        <h2 style={{ fontSize: "18px", color: "#00f0ff", marginBottom: "20px" }}>📅 Today (2026-03-21)</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
          {/* Anthropic Today */}
          <div style={{ backgroundColor: "#1a1f3a", border: "1px solid #2d3148", padding: "20px", borderRadius: "12px" }}>
            <div style={{ fontSize: "12px", color: "#00f0ff", marginBottom: "10px", textTransform: "uppercase" }}>Anthropic (Today)</div>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#00f0ff", marginBottom: "5px" }}>
              {today_anthro.tokens_in || 0} in
            </div>
            <div style={{ fontSize: "14px", color: "#666", marginBottom: "10px" }}>
              {today_anthro.tokens_out || 0} out
            </div>
            <div style={{ fontSize: "16px", fontWeight: "bold", color: "#00ff88" }}>
              ${(today_anthro.cost || 0).toFixed(4)}
            </div>
          </div>

          {/* OpenAI Today */}
          <div style={{ backgroundColor: "#1a1f3a", border: "1px solid #2d3148", padding: "20px", borderRadius: "12px" }}>
            <div style={{ fontSize: "12px", color: "#6c63ff", marginBottom: "10px", textTransform: "uppercase" }}>OpenAI (Today)</div>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#6c63ff", marginBottom: "5px" }}>
              {today_openai.tokens_in || 0} in
            </div>
            <div style={{ fontSize: "14px", color: "#666", marginBottom: "10px" }}>
              {today_openai.tokens_out || 0} out
            </div>
            <div style={{ fontSize: "16px", fontWeight: "bold", color: "#00ff88" }}>
              ${(today_openai.cost || 0).toFixed(4)}
            </div>
          </div>
        </div>
      </div>

      {/* Total Usage */}
      <div style={{ marginBottom: "40px" }}>
        <h2 style={{ fontSize: "18px", color: "#00f0ff", marginBottom: "20px" }}>💰 Total (All Time)</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
          {/* Anthropic Total */}
          <div style={{ backgroundColor: "#1a1f3a", border: "1px solid #2d3148", padding: "20px", borderRadius: "12px" }}>
            <div style={{ fontSize: "12px", color: "#00f0ff", marginBottom: "10px", textTransform: "uppercase" }}>Anthropic Total</div>
            <div style={{ fontSize: "28px", fontWeight: "bold", color: "#00f0ff", marginBottom: "5px" }}>
              {anthropic.tokens_in || 0}
            </div>
            <div style={{ fontSize: "12px", color: "#666", marginBottom: "10px" }}>
              Input Tokens
            </div>
            <div style={{ fontSize: "20px", fontWeight: "bold", color: "#00ff88" }}>
              ${(anthropic.cost || 0).toFixed(4)}
            </div>
          </div>

          {/* OpenAI Total */}
          <div style={{ backgroundColor: "#1a1f3a", border: "1px solid #2d3148", padding: "20px", borderRadius: "12px" }}>
            <div style={{ fontSize: "12px", color: "#6c63ff", marginBottom: "10px", textTransform: "uppercase" }}>OpenAI Total</div>
            <div style={{ fontSize: "28px", fontWeight: "bold", color: "#6c63ff", marginBottom: "5px" }}>
              {openai.tokens_in || 0}
            </div>
            <div style={{ fontSize: "12px", color: "#666", marginBottom: "10px" }}>
              Input Tokens
            </div>
            <div style={{ fontSize: "20px", fontWeight: "bold", color: "#00ff88" }}>
              ${(openai.cost || 0).toFixed(4)}
            </div>
          </div>

          {/* Combined Total Cost */}
          <div style={{ backgroundColor: "#1a1f3a", border: "1px solid #2d3148", padding: "20px", borderRadius: "12px" }}>
            <div style={{ fontSize: "12px", color: "#ffd93d", marginBottom: "10px", textTransform: "uppercase" }}>Total Cost</div>
            <div style={{ fontSize: "48px", fontWeight: "bold", color: "#ffd93d", marginBottom: "5px" }}>
              ${((anthropic.cost || 0) + (openai.cost || 0)).toFixed(4)}
            </div>
            <div style={{ fontSize: "12px", color: "#666" }}>
              Anthropic + OpenAI
            </div>
          </div>
        </div>
      </div>

      {/* Raw JSON */}
      <div style={{ marginTop: "40px", backgroundColor: "#1a1f3a", border: "1px solid #2d3148", padding: "20px", borderRadius: "12px" }}>
        <h3 style={{ margin: "0 0 15px 0", fontSize: "14px", color: "#00f0ff" }}>Raw Data</h3>
        <pre style={{ fontSize: "12px", color: "#666", overflow: "auto", maxHeight: "300px" }}>
          {JSON.stringify(usage, null, 2)}
        </pre>
      </div>
    </div>
  );
}
