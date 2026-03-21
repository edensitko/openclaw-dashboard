export async function GET() {
  // Real reminders for OpenClaw workflow
  const reminders = [
    {
      id: "1",
      title: "Verify all 4 bots are running",
      description: "Monitor, PM, Promter, Backend bots must be active",
      priority: "high",
      dueAt: "2026-03-21T14:00:00Z",
      status: "pending",
      category: "bot",
    },
    {
      id: "2",
      title: "Test Drone webhook with GitHub push",
      description: "Push code to openclaw-dashboard and verify Drone builds",
      priority: "medium",
      dueAt: "2026-03-21T15:00:00Z",
      status: "pending",
      category: "infra",
    },
    {
      id: "3",
      title: "Check API response times",
      description: "/api/status should respond in <100ms",
      priority: "medium",
      dueAt: "2026-03-21T14:30:00Z",
      status: "pending",
      category: "monitoring",
    },
    {
      id: "4",
      title: "Create GitHub Personal Access Token",
      description: "For pushing dashboard updates to repo",
      priority: "high",
      dueAt: "2026-03-21T14:15:00Z",
      status: "pending",
      category: "admin",
    },
    {
      id: "5",
      title: "Monitor CPU/Memory thresholds",
      description: "Alert if CPU > 80% or Memory > 85%",
      priority: "medium",
      dueAt: "2026-03-21T16:00:00Z",
      status: "pending",
      category: "monitoring",
    },
    {
      id: "6",
      title: "Document complete workflow",
      description: "Design → PM Analysis → Code → Build → Deploy",
      priority: "low",
      dueAt: "2026-03-21T18:00:00Z",
      status: "pending",
      category: "docs",
    },
    {
      id: "7",
      title: "Scale dashboard to production",
      description: "Build Next.js production bundle and test performance",
      priority: "high",
      dueAt: "2026-03-21T17:30:00Z",
      status: "completed",
      category: "feature",
    },
    {
      id: "8",
      title: "Add real metrics to dashboard",
      description: "Replace mock data with live API calls",
      priority: "high",
      dueAt: "2026-03-21T13:45:00Z",
      status: "completed",
      category: "feature",
    },
  ];

  return Response.json(reminders);
}
