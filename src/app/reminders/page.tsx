"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Bell,
  BellRing,
  Clock,
  Trash2,
  Check,
  X,
  CalendarDays,
  Repeat,
  AlertCircle,
  CheckCircle2,
  Circle,
  ChevronDown,
  Search,
  Filter,
  SortAsc,
  Flag,
} from "lucide-react";

/* ── Types ─────────────────────────────────────────── */

type Priority = "low" | "medium" | "high" | "urgent";
type RecurType = "none" | "daily" | "weekly" | "monthly";
type ReminderStatus = "pending" | "done" | "overdue" | "snoozed";

interface Reminder {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  dueDate: string;
  dueTime: string;
  recur: RecurType;
  status: ReminderStatus;
  createdAt: string;
  snoozedUntil?: string;
  tags: string[];
}

/* ── Constants ─────────────────────────────────────── */

const PRIORITY_CFG: Record<Priority, { color: string; label: string }> = {
  low: { color: "#00FF88", label: "Low" },
  medium: { color: "#FFD93D", label: "Medium" },
  high: { color: "#FF6B6B", label: "High" },
  urgent: { color: "#FF3B30", label: "Urgent" },
};

const RECUR_CFG: Record<RecurType, string> = {
  none: "No repeat",
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
};

const TAGS = ["deploy", "meeting", "review", "bot", "infra", "personal", "standup", "oncall"];

const uid = () => Math.random().toString(36).slice(2, 10);

function useLocalState<T>(key: string, fallback: T): [T, (v: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(fallback);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setState(JSON.parse(raw));
    } catch {}
  }, [key]);
  const set = useCallback(
    (v: T | ((prev: T) => T)) => {
      setState((prev) => {
        const next = typeof v === "function" ? (v as (p: T) => T)(prev) : v;
        localStorage.setItem(key, JSON.stringify(next));
        return next;
      });
    },
    [key],
  );
  return [state, set];
}

/* ── Demo Data ─────────────────────────────────────── */

const today = new Date();
const fmt = (d: Date) => d.toISOString().split("T")[0];
const tomorrow = new Date(today.getTime() + 86400000);
const nextWeek = new Date(today.getTime() + 7 * 86400000);
const yesterday = new Date(today.getTime() - 86400000);

const DEMO_REMINDERS: Reminder[] = [
  {
    id: "r1", title: "Deploy clawbot v3.2.1 to production", description: "Run migration, push Docker image, verify health checks",
    priority: "urgent", dueDate: fmt(today), dueTime: "14:00", recur: "none", status: "pending",
    createdAt: today.toISOString(), tags: ["deploy", "bot"],
  },
  {
    id: "r2", title: "Daily standup", description: "Team sync — share blockers and progress",
    priority: "medium", dueDate: fmt(tomorrow), dueTime: "09:30", recur: "daily", status: "pending",
    createdAt: today.toISOString(), tags: ["standup", "meeting"],
  },
  {
    id: "r3", title: "Review Tailscale ACL changes", description: "Check PR #47 for VPN mesh policy updates",
    priority: "high", dueDate: fmt(tomorrow), dueTime: "11:00", recur: "none", status: "pending",
    createdAt: today.toISOString(), tags: ["review", "infra"],
  },
  {
    id: "r4", title: "Rotate API keys", description: "Rotate Discord, OpenAI, and Anthropic keys per security policy",
    priority: "high", dueDate: fmt(nextWeek), dueTime: "10:00", recur: "monthly", status: "pending",
    createdAt: today.toISOString(), tags: ["infra"],
  },
  {
    id: "r5", title: "Update EC2 instance AMI", description: "Scheduled maintenance window — base image update",
    priority: "medium", dueDate: fmt(yesterday), dueTime: "16:00", recur: "none", status: "overdue",
    createdAt: yesterday.toISOString(), tags: ["deploy", "infra"],
  },
  {
    id: "r6", title: "Check log parser memory usage", description: "Verify the fix for the memory leak in production",
    priority: "low", dueDate: fmt(yesterday), dueTime: "12:00", recur: "none", status: "done",
    createdAt: yesterday.toISOString(), tags: ["bot"],
  },
];

/* ── Helpers ───────────────────────────────────────── */

function getStatus(r: Reminder): ReminderStatus {
  if (r.status === "done") return "done";
  if (r.snoozedUntil && new Date(r.snoozedUntil) > new Date()) return "snoozed";
  const due = new Date(`${r.dueDate}T${r.dueTime || "23:59"}`);
  if (due < new Date()) return "overdue";
  return "pending";
}

function timeUntil(date: string, time: string): string {
  const due = new Date(`${date}T${time || "23:59"}`);
  const diff = due.getTime() - Date.now();
  if (diff < 0) {
    const ago = Math.abs(diff);
    if (ago < 3600000) return `${Math.round(ago / 60000)}m overdue`;
    if (ago < 86400000) return `${Math.round(ago / 3600000)}h overdue`;
    return `${Math.round(ago / 86400000)}d overdue`;
  }
  if (diff < 3600000) return `in ${Math.round(diff / 60000)}m`;
  if (diff < 86400000) return `in ${Math.round(diff / 3600000)}h`;
  return `in ${Math.round(diff / 86400000)}d`;
}

const STATUS_ICON: Record<ReminderStatus, { icon: typeof Bell; color: string }> = {
  pending: { icon: Bell, color: "#00F0FF" },
  done: { icon: CheckCircle2, color: "#00FF88" },
  overdue: { icon: AlertCircle, color: "#FF6B6B" },
  snoozed: { icon: Clock, color: "#FFD93D" },
};

/* ── Main Component ────────────────────────────────── */

export default function RemindersPage() {
  const [reminders, setReminders] = useLocalState<Reminder[]>("reminders-data", DEMO_REMINDERS);
  const [editing, setEditing] = useState<Reminder | null>(null);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<ReminderStatus | "all">("all");
  const [filterPriority, setFilterPriority] = useState<Priority | "all">("all");
  const [sortBy, setSortBy] = useState<"date" | "priority">("date");
  const [showFilters, setShowFilters] = useState(false);

  // Re-check statuses every minute
  const [, setTick] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(iv);
  }, []);

  // Update statuses on render
  const withStatus = reminders.map((r) => ({ ...r, status: getStatus(r) }));

  // Filter & sort
  const filtered = withStatus
    .filter((r) => {
      if (filterStatus !== "all" && r.status !== filterStatus) return false;
      if (filterPriority !== "all" && r.priority !== filterPriority) return false;
      if (search && !r.title.toLowerCase().includes(search.toLowerCase()) && !r.tags.some((t) => t.includes(search.toLowerCase()))) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "priority") {
        const order: Record<Priority, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
        return order[a.priority] - order[b.priority];
      }
      return new Date(`${a.dueDate}T${a.dueTime}`).getTime() - new Date(`${b.dueDate}T${b.dueTime}`).getTime();
    });

  // Stats
  const stats = {
    total: withStatus.length,
    pending: withStatus.filter((r) => r.status === "pending").length,
    overdue: withStatus.filter((r) => r.status === "overdue").length,
    done: withStatus.filter((r) => r.status === "done").length,
    snoozed: withStatus.filter((r) => r.status === "snoozed").length,
  };

  // Actions
  const toggle = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => r.id === id ? { ...r, status: r.status === "done" ? "pending" : "done" } : r),
    );
  };

  const snooze = (id: string, minutes: number) => {
    setReminders((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: "snoozed", snoozedUntil: new Date(Date.now() + minutes * 60000).toISOString() }
          : r,
      ),
    );
  };

  const remove = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
    setEditing(null);
  };

  const save = (reminder: Reminder) => {
    setReminders((prev) => {
      const exists = prev.find((r) => r.id === reminder.id);
      if (exists) return prev.map((r) => (r.id === reminder.id ? reminder : r));
      return [reminder, ...prev];
    });
    setEditing(null);
    setCreating(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-heading">Reminders</h2>
          <p className="text-sm text-muted">Stay on top of deployments, reviews, and tasks</p>
        </div>
        <button
          onClick={() => {
            setCreating(true);
            setEditing({
              id: uid(),
              title: "",
              description: "",
              priority: "medium",
              dueDate: fmt(new Date()),
              dueTime: "12:00",
              recur: "none",
              status: "pending",
              createdAt: new Date().toISOString(),
              tags: [],
            });
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#00F0FF]/15 text-[#00F0FF] text-xs font-medium hover:bg-[#00F0FF]/25 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> New Reminder
        </button>
      </div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass p-4 flex flex-wrap gap-5">
        {([
          { label: "Pending", count: stats.pending, color: "#00F0FF", icon: Bell },
          { label: "Overdue", count: stats.overdue, color: "#FF6B6B", icon: AlertCircle },
          { label: "Snoozed", count: stats.snoozed, color: "#FFD93D", icon: Clock },
          { label: "Done", count: stats.done, color: "#00FF88", icon: CheckCircle2 },
        ] as const).map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="flex items-center gap-2">
              <Icon className="w-4 h-4" style={{ color: s.color }} />
              <span className="text-xs text-muted">{s.label}</span>
              <span className="text-sm font-semibold text-heading">{s.count}</span>
            </div>
          );
        })}
        {stats.total > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <div className="w-24 h-1.5 rounded-full bg-surface overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#00FF88] to-[#00F0FF] transition-all"
                style={{ width: `${(stats.done / stats.total) * 100}%` }}
              />
            </div>
            <span className="text-xs text-muted">{Math.round((stats.done / stats.total) * 100)}%</span>
          </div>
        )}
      </motion.div>

      {/* Search + Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reminders..."
            className="w-full pl-9 pr-3 py-2 rounded-2xl glass-inset text-sm text-heading placeholder-muted outline-none focus:ring-1 focus:ring-[#00F0FF]/30"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-medium transition-all glass-inset ${
            filterStatus !== "all" || filterPriority !== "all" ? "text-[#00F0FF]" : "text-muted hover:text-heading"
          }`}
        >
          <Filter className="w-3.5 h-3.5" /> Filter
          <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? "rotate-180" : ""}`} />
        </button>
        <button
          onClick={() => setSortBy(sortBy === "date" ? "priority" : "date")}
          className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-medium glass-inset text-muted hover:text-heading transition-all"
        >
          <SortAsc className="w-3.5 h-3.5" />
          {sortBy === "date" ? "By Date" : "By Priority"}
        </button>
      </div>

      {showFilters && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex flex-wrap gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted uppercase tracking-wider">Status</span>
            {(["all", "pending", "overdue", "snoozed", "done"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all ${
                  filterStatus === s ? "bg-surface text-heading" : "text-muted hover:text-heading"
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted uppercase tracking-wider">Priority</span>
            <button
              onClick={() => setFilterPriority("all")}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all ${
                filterPriority === "all" ? "bg-surface text-heading" : "text-muted"
              }`}
            >
              All
            </button>
            {(Object.keys(PRIORITY_CFG) as Priority[]).map((p) => (
              <button
                key={p}
                onClick={() => setFilterPriority(p)}
                className="px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all"
                style={{
                  color: filterPriority === p ? PRIORITY_CFG[p].color : undefined,
                  backgroundColor: filterPriority === p ? `${PRIORITY_CFG[p].color}15` : undefined,
                }}
              >
                {PRIORITY_CFG[p].label}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Reminders List */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {filtered.map((r, i) => {
            const st = STATUS_ICON[r.status];
            const StIcon = st.icon;
            return (
              <motion.div
                key={r.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ delay: i * 0.03 }}
                className={`glass p-4 flex items-start gap-3 group cursor-pointer hover:bg-surface transition-all ${
                  r.status === "done" ? "opacity-60" : ""
                }`}
                onClick={() => setEditing(r)}
              >
                {/* Toggle */}
                <button
                  onClick={(e) => { e.stopPropagation(); toggle(r.id); }}
                  className="shrink-0 mt-0.5"
                >
                  {r.status === "done" ? (
                    <CheckCircle2 className="w-5 h-5 text-[#00FF88]" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted hover:text-[#00F0FF] transition-colors" />
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className={`text-sm font-medium truncate ${r.status === "done" ? "line-through text-muted" : "text-heading"}`}>
                      {r.title}
                    </h3>
                  </div>
                  {r.description && (
                    <p className="text-xs text-muted truncate mb-1.5">{r.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Priority */}
                    <span
                      className="text-[10px] font-medium px-1.5 py-0.5 rounded-md flex items-center gap-1"
                      style={{ color: PRIORITY_CFG[r.priority].color, backgroundColor: `${PRIORITY_CFG[r.priority].color}15` }}
                    >
                      <Flag className="w-2.5 h-2.5" />
                      {PRIORITY_CFG[r.priority].label}
                    </span>
                    {/* Due */}
                    <span className={`text-[10px] flex items-center gap-1 ${r.status === "overdue" ? "text-[#FF6B6B]" : "text-muted"}`}>
                      <Clock className="w-3 h-3" />
                      {r.dueDate} {r.dueTime} · {timeUntil(r.dueDate, r.dueTime)}
                    </span>
                    {/* Recur */}
                    {r.recur !== "none" && (
                      <span className="text-[10px] text-[#6C63FF] flex items-center gap-1">
                        <Repeat className="w-3 h-3" />
                        {RECUR_CFG[r.recur]}
                      </span>
                    )}
                    {/* Tags */}
                    {r.tags.map((t) => (
                      <span key={t} className="text-[10px] text-subtle px-1.5 py-0.5 rounded-md bg-surface">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Status + Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <StIcon className="w-4 h-4" style={{ color: st.color }} />
                  {r.status !== "done" && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); snooze(r.id, 30); }}
                        title="Snooze 30m"
                        className="p-1 rounded-lg hover:bg-surface text-muted hover:text-[#FFD93D] transition-colors"
                      >
                        <Clock className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); snooze(r.id, 60); }}
                        title="Snooze 1h"
                        className="p-1 rounded-lg hover:bg-surface text-muted hover:text-[#FFD93D] transition-colors"
                      >
                        <BellRing className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); remove(r.id); }}
                    className="p-1 rounded-lg hover:bg-surface text-muted hover:text-[#FF6B6B] opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="glass p-10 text-center">
            <Bell className="w-8 h-8 text-muted mx-auto mb-3" />
            <p className="text-sm text-muted">No reminders found</p>
          </div>
        )}
      </div>

      {/* Edit/Create Modal */}
      <AnimatePresence>
        {editing && (
          <ReminderModal
            reminder={editing}
            isNew={creating}
            onSave={save}
            onDelete={() => remove(editing.id)}
            onClose={() => { setEditing(null); setCreating(false); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Reminder Modal ────────────────────────────────── */

function ReminderModal({
  reminder,
  isNew,
  onSave,
  onDelete,
  onClose,
}: {
  reminder: Reminder;
  isNew: boolean;
  onSave: (r: Reminder) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const [r, setR] = useState<Reminder>(reminder);

  const toggleTag = (tag: string) => {
    setR((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md max-h-[85vh] overflow-y-auto glass-heavy p-6 space-y-5"
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-surface text-muted hover:text-heading transition-colors">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-bold text-heading">{isNew ? "New Reminder" : "Edit Reminder"}</h2>

        {/* Title */}
        <div>
          <label className="text-xs text-muted mb-1 block">Title</label>
          <input
            autoFocus
            value={r.title}
            onChange={(e) => setR({ ...r, title: e.target.value })}
            placeholder="What do you need to remember?"
            className="w-full glass-inset px-3 py-2 rounded-2xl text-sm text-heading placeholder-muted outline-none focus:ring-1 focus:ring-[#00F0FF]/30"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-xs text-muted mb-1 block">Description</label>
          <textarea
            value={r.description}
            onChange={(e) => setR({ ...r, description: e.target.value })}
            rows={2}
            placeholder="Optional details..."
            className="w-full glass-inset px-3 py-2 rounded-2xl text-sm text-body placeholder-muted outline-none resize-none focus:ring-1 focus:ring-[#00F0FF]/30"
          />
        </div>

        {/* Date + Time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted mb-1 flex items-center gap-1"><CalendarDays className="w-3 h-3" /> Date</label>
            <input
              type="date"
              value={r.dueDate}
              onChange={(e) => setR({ ...r, dueDate: e.target.value })}
              className="w-full glass-inset px-3 py-2 rounded-2xl text-sm text-heading outline-none focus:ring-1 focus:ring-[#00F0FF]/30"
            />
          </div>
          <div>
            <label className="text-xs text-muted mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Time</label>
            <input
              type="time"
              value={r.dueTime}
              onChange={(e) => setR({ ...r, dueTime: e.target.value })}
              className="w-full glass-inset px-3 py-2 rounded-2xl text-sm text-heading outline-none focus:ring-1 focus:ring-[#00F0FF]/30"
            />
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className="text-xs text-muted mb-2 block">Priority</label>
          <div className="flex gap-2">
            {(Object.keys(PRIORITY_CFG) as Priority[]).map((p) => (
              <button
                key={p}
                onClick={() => setR({ ...r, priority: p })}
                className="flex-1 py-2 rounded-2xl text-xs font-medium transition-all text-center"
                style={{
                  color: r.priority === p ? PRIORITY_CFG[p].color : undefined,
                  backgroundColor: r.priority === p ? `${PRIORITY_CFG[p].color}15` : undefined,
                  border: r.priority === p ? `1px solid ${PRIORITY_CFG[p].color}30` : "1px solid transparent",
                  opacity: r.priority === p ? 1 : 0.5,
                }}
              >
                {PRIORITY_CFG[p].label}
              </button>
            ))}
          </div>
        </div>

        {/* Recurrence */}
        <div>
          <label className="text-xs text-muted mb-2 flex items-center gap-1"><Repeat className="w-3 h-3" /> Repeat</label>
          <div className="flex gap-2">
            {(Object.keys(RECUR_CFG) as RecurType[]).map((rc) => (
              <button
                key={rc}
                onClick={() => setR({ ...r, recur: rc })}
                className={`flex-1 py-2 rounded-2xl text-xs font-medium transition-all text-center ${
                  r.recur === rc
                    ? "bg-[#6C63FF]/15 text-[#6C63FF] border border-[#6C63FF]/30"
                    : "text-muted opacity-50 border border-transparent"
                }`}
              >
                {RECUR_CFG[rc]}
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="text-xs text-muted mb-2 block">Tags</label>
          <div className="flex flex-wrap gap-1.5">
            {TAGS.map((t) => {
              const active = r.tags.includes(t);
              return (
                <button
                  key={t}
                  onClick={() => toggleTag(t)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all ${
                    active
                      ? "bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30"
                      : "text-muted opacity-50 border border-transparent hover:opacity-80"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-divider">
          {!isNew && (
            <button
              onClick={onDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-[#FF6B6B] hover:bg-[#FF6B6B]/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          )}
          <div className="flex gap-2 ml-auto">
            <button onClick={onClose} className="px-4 py-2 rounded-2xl text-xs text-muted hover:text-heading transition-colors">
              Cancel
            </button>
            <button
              onClick={() => { if (r.title.trim()) onSave(r); }}
              className="px-4 py-2 rounded-2xl bg-[#00F0FF]/15 text-[#00F0FF] text-xs font-medium hover:bg-[#00F0FF]/25 transition-colors"
            >
              {isNew ? "Create" : "Save"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
