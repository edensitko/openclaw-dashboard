export interface ActivityEvent {
  id: string;
  type: "request" | "error" | "deploy" | "alert" | "user";
  message: string;
  timestamp: string;
  user?: string;
}

export const activityFeed: ActivityEvent[] = [
  { id: "1", type: "request", message: "clawbot agent processed 1,200 commands in the last hour", timestamp: "2 min ago" },
  { id: "2", type: "deploy", message: "Deployed clawbot v3.2.0 to EC2 production", timestamp: "15 min ago", user: "eden" },
  { id: "3", type: "alert", message: "EC2 memory usage exceeded 90% — autoscaling triggered", timestamp: "28 min ago" },
  { id: "4", type: "error", message: "Tailscale peer eden-macbook disconnected briefly", timestamp: "45 min ago" },
  { id: "5", type: "user", message: "New Discord guild connected: Acme Corp Server", timestamp: "1h ago", user: "system" },
  { id: "6", type: "request", message: "Bot agent switched to claude-3.5-sonnet (lower latency)", timestamp: "1h ago" },
  { id: "7", type: "deploy", message: "Scaled EC2 instance from t3.medium to t3.large", timestamp: "2h ago", user: "eden" },
  { id: "8", type: "error", message: "Upstream LLM timeout — 3 retries before success", timestamp: "3h ago" },
  { id: "9", type: "alert", message: "SSL certificate renewal in 14 days", timestamp: "5h ago" },
  { id: "10", type: "user", message: "Tailscale ACL updated: added new peer claws-staging", timestamp: "6h ago", user: "eden" },
];
