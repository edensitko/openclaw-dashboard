export async function GET() {
  // Real projects from OpenClaw ecosystem
  const projects = [
    {
      id: "1",
      title: "Telegram Bot Ecosystem",
      description: "4-bot system for product development workflow",
      priority: "high",
      labels: ["bot", "infra"],
      steps: [
        { id: "1", text: "Monitor Bot - Real-time metrics", done: true },
        { id: "2", text: "PM Bot - Design analysis", done: true },
        { id: "3", text: "Promter Bot - Website generation", done: true },
        { id: "4", text: "Backend Bot - API monitoring", done: true },
      ],
      createdAt: "2026-03-21T10:06:00Z",
      dueDate: "2026-03-21T14:00:00Z",
      status: "in-progress",
    },
    {
      id: "2",
      title: "Dashboard - Live Metrics",
      description: "Real-time server monitoring with glassmorphism UI",
      priority: "high",
      labels: ["feature", "design"],
      steps: [
        { id: "1", text: "API Server on port 3001", done: true },
        { id: "2", text: "Next.js dashboard on port 3000", done: true },
        { id: "3", text: "Live data refresh (1 sec)", done: true },
        { id: "4", text: "OpenClaw status display", done: true },
      ],
      createdAt: "2026-03-21T10:30:00Z",
      dueDate: "2026-03-21T13:40:00Z",
      status: "completed",
    },
    {
      id: "3",
      title: "Drone CI/CD Setup",
      description: "GitHub webhook + Docker-based builds",
      priority: "medium",
      labels: ["infra", "feature"],
      steps: [
        { id: "1", text: "Docker installation", done: true },
        { id: "2", text: "Drone Server (port 8080)", done: true },
        { id: "3", text: "GitHub OAuth integration", done: true },
        { id: "4", text: "Test webhook builds", done: false },
      ],
      createdAt: "2026-03-21T11:00:00Z",
      dueDate: "2026-03-21T17:00:00Z",
      status: "in-progress",
    },
    {
      id: "4",
      title: "Infrastructure Hardening",
      description: "AWS EC2 + Tailscale + UFW security",
      priority: "urgent",
      labels: ["infra"],
      steps: [
        { id: "1", text: "AWS setup (t3.medium)", done: true },
        { id: "2", text: "Tailscale VPN", done: true },
        { id: "3", text: "UFW firewall rules", done: true },
        { id: "4", text: "SSH hardening", done: true },
      ],
      createdAt: "2026-03-21T08:00:00Z",
      dueDate: "2026-03-21T12:00:00Z",
      status: "completed",
    },
  ];

  return Response.json(projects);
}
