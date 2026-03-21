"use client";

import { useEffect, useState } from "react";

export default function AnalyticsPage() {
  const [usage, setUsage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load from static JSON file in public folder
    fetch("/api-usage.json")
      .then(r => r.json())
      .then(setUsage)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: "#fff", padding: "40px" }}>⏳ Loading...</div>;
  if (!usage) return <div style={{ color: "#fff", padding: "40px" }}>❌ No data</div>;

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
            <div style={{ fontSize: "12px", color: "#00f0ff", marginBottom: "10px", textTransform: "uppercase", fontWeight: "bold" }}>Anthropic (Today)</div>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#00f0ff", marginBottom: "5px" }}>
              {(today_anthro.tokens_in || 0).toLocaleString()} in
            </div>
            <div style={{ fontSize: "14px", color: "#666", marginBottom: "10px" }}>
              {(today_anthro.tokens_out || 0).toLocaleString()} out
            </div>
            <div style={{ fontSize: "18px", fontWeight: "bold", color: "#00ff88" }}>
              ${(today_anthro.cost || 0).toFixed(4)}
            </div>
          </div>

          {/* OpenAI Today */}
          <div style={{ backgroundColor: "#1a1f3a", border: "1px solid #2d3148", padding: "20px", borderRadius: "12px" }}>
            <div style={{ fontSize: "12px", color: "#6c63ff", marginBottom: "10px", textTransform: "uppercase", fontWeight: "bold" }}>OpenAI (Today)</div>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#6c63ff", marginBottom: "5px" }}>
              {(today_openai.tokens_in || 0).toLocaleString()} in
            </div>
            <div style={{ fontSize: "14px", color: "#666", marginBottom: "10px" }}>
              {(today_openai.tokens_out || 0).toLocaleString()} out
            </div>
            <div style={{ fontSize: "18px", fontWeight: "bold", color: "#00ff88" }}>
              ${(today_openai.cost || 0).toFixed(4)}
            </div>
          </div>

          {/* Today Total */}
          <div style={{ backgroundColor: "#1a1f3a", border: "1px solid #2d3148", padding: "20px", borderRadius: "12px" }}>
            <div style={{ fontSize: "12px", color: "#ffd93d", marginBottom: "10px", textTransform: "uppercase", fontWeight: "bold" }}>Today Total</div>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#ffd93d", marginBottom: "15px" }}>
              ${((today_anthro.cost || 0) + (today_openai.cost || 0)).toFixed(4)}
            </div>
            <div style={{ fontSize: "12px", color: "#666" }}>
              ${(today_anthro.cost || 0).toFixed(4)} + ${(today_openai.cost || 0).toFixed(4)}
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
            <div style={{ fontSize: "12px", color: "#00f0ff", marginBottom: "10px", textTransform: "uppercase", fontWeight: "bold" }}>Anthropic Total</div>
            <div style={{ fontSize: "32px", fontWeight: "bold", color: "#00f0ff", marginBottom: "5px" }}>
              {(anthropic.tokens_in || 0).toLocaleString()}
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
            <div style={{ fontSize: "12px", color: "#6c63ff", marginBottom: "10px", textTransform: "uppercase", fontWeight: "bold" }}>OpenAI Total</div>
            <div style={{ fontSize: "32px", fontWeight: "bold", color: "#6c63ff", marginBottom: "5px" }}>
              {(openai.tokens_in || 0).toLocaleString()}
            </div>
            <div style={{ fontSize: "12px", color: "#666", marginBottom: "10px" }}>
              Input Tokens
            </div>
            <div style={{ fontSize: "20px", fontWeight: "bold", color: "#00ff88" }}>
              ${(openai.cost || 0).toFixed(4)}
            </div>
          </div>

          {/* Combined Total Cost */}
          <div style={{ backgroundColor: "#2d1a3a", border: "2px solid #ffd93d", padding: "20px", borderRadius: "12px" }}>
            <div style={{ fontSize: "12px", color: "#ffd93d", marginBottom: "10px", textTransform: "uppercase", fontWeight: "bold" }}>🎯 Total Cost</div>
            <div style={{ fontSize: "48px", fontWeight: "bold", color: "#ffd93d", marginBottom: "5px" }}>
              ${((anthropic.cost || 0) + (openai.cost || 0)).toFixed(4)}
            </div>
            <div style={{ fontSize: "12px", color: "#666" }}>
              Anthropic + OpenAI
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div style={{ marginBottom: "40px" }}>
        <h2 style={{ fontSize: "18px", color: "#00f0ff", marginBottom: "20px" }}>📈 Monthly (Mar 2026)</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
          {/* Anthropic Monthly */}
          <div style={{ backgroundColor: "#1a1f3a", border: "1px solid #2d3148", padding: "20px", borderRadius: "12px" }}>
            <div style={{ fontSize: "12px", color: "#00f0ff", marginBottom: "10px", textTransform: "uppercase", fontWeight: "bold" }}>Anthropic</div>
            <div style={{ fontSize: "20px", fontWeight: "bold", color: "#00ff88" }}>
              ${(usage.anthropic?.monthly?.["2026-03"]?.cost || 0).toFixed(4)}
            </div>
            <div style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
              {(usage.anthropic?.monthly?.["2026-03"]?.tokens_in || 0).toLocaleString()} tokens
            </div>
          </div>

          {/* OpenAI Monthly */}
          <div style={{ backgroundColor: "#1a1f3a", border: "1px solid #2d3148", padding: "20px", borderRadius: "12px" }}>
            <div style={{ fontSize: "12px", color: "#6c63ff", marginBottom: "10px", textTransform: "uppercase", fontWeight: "bold" }}>OpenAI</div>
            <div style={{ fontSize: "20px", fontWeight: "bold", color: "#00ff88" }}>
              ${(usage.openai?.monthly?.["2026-03"]?.cost || 0).toFixed(4)}
            </div>
            <div style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
              {(usage.openai?.monthly?.["2026-03"]?.tokens_in || 0).toLocaleString()} tokens
            </div>
          </div>
        </div>
      </div>

      {/* Models Breakdown */}
      <div style={{ marginBottom: "40px" }}>
        <h2 style={{ fontSize: "18px", color: "#00f0ff", marginBottom: "20px" }}>🤖 Models Used</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
          {Object.entries(usage.anthropic?.models || {}).map(([model, data]: [string, any]) => (
            <div key={model} style={{ backgroundColor: "#1a1f3a", border: "1px solid #2d3148", padding: "20px", borderRadius: "12px" }}>
              <div style={{ fontSize: "12px", color: "#00f0ff", marginBottom: "10px", fontWeight: "bold" }}>{model}</div>
              <div style={{ fontSize: "16px", fontWeight: "bold", color: "#fff", marginBottom: "5px" }}>
                ${(data.cost || 0).toFixed(4)}
              </div>
              <div style={{ fontSize: "12px", color: "#666" }}>
                {(data.tokens_in || 0).toLocaleString()} in / {(data.tokens_out || 0).toLocaleString()} out
              </div>
            </div>
          ))}
          {Object.entries(usage.openai?.models || {}).map(([model, data]: [string, any]) => (
            <div key={model} style={{ backgroundColor: "#1a1f3a", border: "1px solid #2d3148", padding: "20px", borderRadius: "12px" }}>
              <div style={{ fontSize: "12px", color: "#6c63ff", marginBottom: "10px", fontWeight: "bold" }}>{model}</div>
              <div style={{ fontSize: "16px", fontWeight: "bold", color: "#fff", marginBottom: "5px" }}>
                ${(data.cost || 0).toFixed(4)}
              </div>
              <div style={{ fontSize: "12px", color: "#666" }}>
                {(data.tokens_in || 0).toLocaleString()} in / {(data.tokens_out || 0).toLocaleString()} out
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        fontSize: "12px",
        color: "#666",
        borderTop: "1px solid #2d3148",
        paddingTop: "20px"
      }}>
        <p>✅ Real-time API cost tracking | Last updated: {new Date().toLocaleString()}</p>
        <p>📊 Data source: /api-usage.json (Anthropic + OpenAI)</p>
      </div>
    </div>
  );
}
