"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  GripVertical,
  MoreHorizontal,
  X,
  Check,
  CheckCircle2,
  Circle,
  Trash2,
  Edit3,
  Tag,
  Clock,
  AlertCircle,
  ChevronDown,
  StickyNote,
  KanbanSquare,
  ListTodo,
  Search,
  Filter,
} from "lucide-react";

/* ── Types ─────────────────────────────────────────── */

type Priority = "low" | "medium" | "high" | "urgent";
type Label = "feature" | "bug" | "infra" | "design" | "docs" | "bot";

interface Step {
  id: string;
  text: string;
  done: boolean;
}

interface Card {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  labels: Label[];
  steps: Step[];
  createdAt: string;
  dueDate?: string;
}

interface Column {
  id: string;
  title: string;
  color: string;
  cards: Card[];
}

interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

/* ── Constants ─────────────────────────────────────── */

const PRIORITY_CONFIG: Record<Priority, { color: string; label: string }> = {
  low: { color: "#00FF88", label: "Low" },
  medium: { color: "#FFD93D", label: "Medium" },
  high: { color: "#FF6B6B", label: "High" },
  urgent: { color: "#FF3B30", label: "Urgent" },
};

const LABEL_CONFIG: Record<Label, { color: string; label: string }> = {
  feature: { color: "#6C63FF", label: "Feature" },
  bug: { color: "#FF6B6B", label: "Bug" },
  infra: { color: "#00F0FF", label: "Infra" },
  design: { color: "#FF9FF3", label: "Design" },
  docs: { color: "#FFD93D", label: "Docs" },
  bot: { color: "#00FF88", label: "Bot" },
};

const NOTE_COLORS = [
  "rgba(108,99,255,0.15)",
  "rgba(0,240,255,0.15)",
  "rgba(0,255,136,0.15)",
  "rgba(255,215,61,0.15)",
  "rgba(255,107,107,0.15)",
  "rgba(255,159,243,0.15)",
];

const DEFAULT_COLUMNS: Column[] = [
  { id: "backlog", title: "Backlog", color: "#9E9EBE", cards: [] },
  { id: "todo", title: "To Do", color: "#6C63FF", cards: [] },
  { id: "in-progress", title: "In Progress", color: "#00F0FF", cards: [] },
  { id: "review", title: "Review", color: "#FFD93D", cards: [] },
  { id: "done", title: "Done", color: "#00FF88", cards: [] },
];

const DEMO_COLUMNS: Column[] = [
  {
    id: "backlog",
    title: "Backlog",
    color: "#9E9EBE",
    cards: [
      {
        id: "c1",
        title: "Add webhook retry logic",
        description: "Implement exponential backoff for failed webhook deliveries",
        priority: "medium",
        labels: ["feature", "infra"],
        steps: [
          { id: "s1", text: "Design retry strategy", done: true },
          { id: "s2", text: "Implement backoff algorithm", done: false },
          { id: "s3", text: "Add dead letter queue", done: false },
        ],
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: "todo",
    title: "To Do",
    color: "#6C63FF",
    cards: [
      {
        id: "c2",
        title: "Discord slash commands v2",
        description: "Upgrade ClawsBot Discord commands to use new interaction API",
        priority: "high",
        labels: ["bot", "feature"],
        steps: [
          { id: "s4", text: "Audit current commands", done: true },
          { id: "s5", text: "Migrate to slash commands", done: false },
          { id: "s6", text: "Add autocomplete", done: false },
          { id: "s7", text: "Test in staging guild", done: false },
        ],
        createdAt: new Date().toISOString(),
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      },
      {
        id: "c3",
        title: "Fix memory leak in log parser",
        description: "Log streaming accumulates buffers when connection drops",
        priority: "urgent",
        labels: ["bug"],
        steps: [],
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: "in-progress",
    title: "In Progress",
    color: "#00F0FF",
    cards: [
      {
        id: "c4",
        title: "Dashboard light/dark theme",
        description: "CSS variable-based theme system with glassmorphism",
        priority: "high",
        labels: ["design", "feature"],
        steps: [
          { id: "s8", text: "Define CSS variables", done: true },
          { id: "s9", text: "Create ThemeProvider", done: true },
          { id: "s10", text: "Update all components", done: true },
          { id: "s11", text: "Fix chart colors", done: true },
          { id: "s12", text: "Test on mobile", done: false },
        ],
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: "review",
    title: "Review",
    color: "#FFD93D",
    cards: [
      {
        id: "c5",
        title: "Tailscale ACL documentation",
        description: "Document VPN mesh peer management and ACL rules",
        priority: "low",
        labels: ["docs", "infra"],
        steps: [
          { id: "s13", text: "Write ACL overview", done: true },
          { id: "s14", text: "Add peer diagrams", done: true },
          { id: "s15", text: "Review with team", done: false },
        ],
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: "done",
    title: "Done",
    color: "#00FF88",
    cards: [
      {
        id: "c6",
        title: "EC2 auto-scaling setup",
        description: "Configure target tracking scaling policy for API instances",
        priority: "high",
        labels: ["infra"],
        steps: [
          { id: "s16", text: "Create launch template", done: true },
          { id: "s17", text: "Configure ASG", done: true },
          { id: "s18", text: "Set scaling policies", done: true },
          { id: "s19", text: "Load test", done: true },
        ],
        createdAt: new Date().toISOString(),
      },
    ],
  },
];

const DEMO_NOTES: Note[] = [
  {
    id: "n1",
    title: "Sprint Goals",
    content: "1. Ship Discord v2 commands\n2. Fix log parser memory leak\n3. Complete theme system\n4. Start webhook retry implementation",
    color: NOTE_COLORS[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "n2",
    title: "Architecture Notes",
    content: "ClawsBot uses Claude 3.5 Sonnet as primary model with GPT-4o-mini fallback.\n\nAll API routes go through the Next.js API layer.\n\nTailscale mesh connects all nodes.",
    color: NOTE_COLORS[1],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "n3",
    title: "Deploy Checklist",
    content: "- Run tests\n- Check env vars\n- Build & push image\n- Update ECS service\n- Verify health checks\n- Monitor Grafana for 15min",
    color: NOTE_COLORS[2],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/* ── Helpers ───────────────────────────────────────── */

const uid = () => Math.random().toString(36).slice(2, 10);

function useLocalState<T>(key: string, fallback: T): [T, (v: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(fallback);
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setState(JSON.parse(raw));
    } catch { /* ignore */ }
    loaded.current = true;
  }, [key]);

  const set = useCallback(
    (v: T | ((prev: T) => T)) => {
      setState((prev) => {
        const next = typeof v === "function" ? (v as (p: T) => T)(prev) : v;
        localStorage.setItem(key, JSON.stringify(next));
        return next;
      });
    },
    [key]
  );

  return [state, set];
}

/* ── Main Component ────────────────────────────────── */

export default function ProjectsPage() {
  const [columns, setColumns] = useLocalState<Column[]>("pm-columns", DEMO_COLUMNS);
  const [notes, setNotes] = useLocalState<Note[]>("pm-notes", DEMO_NOTES);
  const [view, setView] = useState<"kanban" | "notes">("kanban");
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [editingCardCol, setEditingCardCol] = useState<string>("");
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [addingToCol, setAddingToCol] = useState<string | null>(null);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState<Priority | "all">("all");
  const [showFilters, setShowFilters] = useState(false);

  // Drag state
  const [dragCard, setDragCard] = useState<{ cardId: string; fromCol: string } | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  /* ── Kanban Actions ──────────────────────────────── */

  const addCard = (colId: string) => {
    if (!newCardTitle.trim()) return;
    const card: Card = {
      id: uid(),
      title: newCardTitle.trim(),
      description: "",
      priority: "medium",
      labels: [],
      steps: [],
      createdAt: new Date().toISOString(),
    };
    setColumns((prev) =>
      prev.map((c) => (c.id === colId ? { ...c, cards: [...c.cards, card] } : c))
    );
    setNewCardTitle("");
    setAddingToCol(null);
  };

  const updateCard = (colId: string, card: Card) => {
    setColumns((prev) =>
      prev.map((c) =>
        c.id === colId
          ? { ...c, cards: c.cards.map((k) => (k.id === card.id ? card : k)) }
          : c
      )
    );
  };

  const deleteCard = (colId: string, cardId: string) => {
    setColumns((prev) =>
      prev.map((c) =>
        c.id === colId ? { ...c, cards: c.cards.filter((k) => k.id !== cardId) } : c
      )
    );
    setEditingCard(null);
  };

  const moveCard = (cardId: string, fromCol: string, toCol: string) => {
    if (fromCol === toCol) return;
    setColumns((prev) => {
      const card = prev.find((c) => c.id === fromCol)?.cards.find((k) => k.id === cardId);
      if (!card) return prev;
      return prev.map((c) => {
        if (c.id === fromCol) return { ...c, cards: c.cards.filter((k) => k.id !== cardId) };
        if (c.id === toCol) return { ...c, cards: [...c.cards, card] };
        return c;
      });
    });
  };

  /* ── Drag & Drop ─────────────────────────────────── */

  const handleDragStart = (cardId: string, fromCol: string) => {
    setDragCard({ cardId, fromCol });
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    setDragOverCol(colId);
  };

  const handleDrop = (colId: string) => {
    if (dragCard) {
      moveCard(dragCard.cardId, dragCard.fromCol, colId);
    }
    setDragCard(null);
    setDragOverCol(null);
  };

  const handleDragEnd = () => {
    setDragCard(null);
    setDragOverCol(null);
  };

  /* ── Notes Actions ───────────────────────────────── */

  const addNote = () => {
    const note: Note = {
      id: uid(),
      title: "New Note",
      content: "",
      color: NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes((prev) => [note, ...prev]);
    setEditingNote(note);
  };

  const updateNote = (note: Note) => {
    setNotes((prev) => prev.map((n) => (n.id === note.id ? { ...note, updatedAt: new Date().toISOString() } : n)));
  };

  const deleteNote = (noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    setEditingNote(null);
  };

  /* ── Filter cards ────────────────────────────────── */

  const filterCards = (cards: Card[]) => {
    return cards.filter((card) => {
      const matchesSearch =
        !searchQuery ||
        card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = filterPriority === "all" || card.priority === filterPriority;
      return matchesSearch && matchesPriority;
    });
  };

  /* ── Stats ───────────────────────────────────────── */

  const totalCards = columns.reduce((s, c) => s + c.cards.length, 0);
  const doneCards = columns.find((c) => c.id === "done")?.cards.length ?? 0;
  const totalSteps = columns.flatMap((c) => c.cards).flatMap((k) => k.steps).length;
  const doneSteps = columns.flatMap((c) => c.cards).flatMap((k) => k.steps).filter((s) => s.done).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-heading">Projects</h2>
          <p className="text-sm text-muted">Kanban board & notes for ClawsBot development</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex glass-inset rounded-2xl p-1">
            <button
              onClick={() => setView("kanban")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                view === "kanban" ? "bg-[#00F0FF]/15 text-[#00F0FF]" : "text-muted hover:text-heading"
              }`}
            >
              <KanbanSquare className="w-3.5 h-3.5" /> Kanban
            </button>
            <button
              onClick={() => setView("notes")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                view === "notes" ? "bg-[#00F0FF]/15 text-[#00F0FF]" : "text-muted hover:text-heading"
              }`}
            >
              <StickyNote className="w-3.5 h-3.5" /> Notes
            </button>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-4 flex flex-wrap gap-6"
      >
        <div className="flex items-center gap-2">
          <ListTodo className="w-4 h-4 text-[#6C63FF]" />
          <span className="text-xs text-muted">Tasks</span>
          <span className="text-sm font-semibold text-heading">{totalCards}</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#00FF88]" />
          <span className="text-xs text-muted">Done</span>
          <span className="text-sm font-semibold text-heading">{doneCards}</span>
        </div>
        <div className="flex items-center gap-2">
          <Circle className="w-4 h-4 text-[#FFD93D]" />
          <span className="text-xs text-muted">Steps</span>
          <span className="text-sm font-semibold text-heading">
            {doneSteps}/{totalSteps}
          </span>
        </div>
        {totalCards > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <div className="w-24 h-1.5 rounded-full bg-surface overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#6C63FF] to-[#00F0FF] transition-all"
                style={{ width: `${totalCards ? (doneCards / totalCards) * 100 : 0}%` }}
              />
            </div>
            <span className="text-xs text-muted">
              {totalCards ? Math.round((doneCards / totalCards) * 100) : 0}%
            </span>
          </div>
        )}
      </motion.div>

      {/* Kanban View */}
      {view === "kanban" && (
        <>
          {/* Search + Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="w-full pl-9 pr-3 py-2 rounded-2xl glass-inset text-sm text-heading placeholder-muted outline-none focus:ring-1 focus:ring-[#00F0FF]/30"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-medium transition-all glass-inset ${
                filterPriority !== "all" ? "text-[#00F0FF]" : "text-muted hover:text-heading"
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              Filter
              <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>
            {showFilters && (
              <div className="flex gap-1.5">
                <button
                  onClick={() => setFilterPriority("all")}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all ${
                    filterPriority === "all" ? "bg-surface text-heading" : "text-muted hover:text-heading"
                  }`}
                >
                  All
                </button>
                {(Object.keys(PRIORITY_CONFIG) as Priority[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setFilterPriority(p)}
                    className="px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all"
                    style={{
                      color: filterPriority === p ? PRIORITY_CONFIG[p].color : undefined,
                      backgroundColor:
                        filterPriority === p ? `${PRIORITY_CONFIG[p].color}15` : undefined,
                    }}
                  >
                    {PRIORITY_CONFIG[p].label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Board */}
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2">
            {columns.map((col, colIdx) => {
              const filtered = filterCards(col.cards);
              return (
                <motion.div
                  key={col.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: colIdx * 0.06 }}
                  className={`flex-shrink-0 w-[300px] flex flex-col rounded-[22px] transition-all ${
                    dragOverCol === col.id
                      ? "ring-2 ring-[#00F0FF]/40 bg-[#00F0FF]/5"
                      : ""
                  }`}
                  style={{ background: "var(--glass-bg)", border: "0.5px solid var(--glass-border)" }}
                  onDragOver={(e) => handleDragOver(e, col.id)}
                  onDragLeave={() => setDragOverCol(null)}
                  onDrop={() => handleDrop(col.id)}
                >
                  {/* Column header */}
                  <div className="flex items-center justify-between px-4 pt-4 pb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: col.color }}
                      />
                      <h3 className="text-sm font-semibold text-heading">{col.title}</h3>
                      <span className="text-[11px] text-muted px-1.5 py-0.5 rounded-lg bg-surface">
                        {filtered.length}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setAddingToCol(col.id);
                        setNewCardTitle("");
                      }}
                      className="p-1 rounded-lg hover:bg-surface text-muted hover:text-heading transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Cards */}
                  <div className="flex-1 px-3 pb-3 space-y-2 min-h-[60px] overflow-y-auto max-h-[calc(100vh-360px)]">
                    {/* Add card form */}
                    <AnimatePresence>
                      {addingToCol === col.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="glass-inset p-3 space-y-2">
                            <input
                              autoFocus
                              value={newCardTitle}
                              onChange={(e) => setNewCardTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") addCard(col.id);
                                if (e.key === "Escape") setAddingToCol(null);
                              }}
                              placeholder="Task title..."
                              className="w-full bg-transparent text-sm text-heading placeholder-muted outline-none"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => addCard(col.id)}
                                className="px-3 py-1 rounded-xl bg-[#00F0FF]/15 text-[#00F0FF] text-xs font-medium hover:bg-[#00F0FF]/25 transition-colors"
                              >
                                Add
                              </button>
                              <button
                                onClick={() => setAddingToCol(null)}
                                className="px-3 py-1 rounded-xl text-xs text-muted hover:text-heading transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Card list */}
                    {filtered.map((card) => (
                      <KanbanCard
                        key={card.id}
                        card={card}
                        colId={col.id}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onOpen={() => {
                          setEditingCard(card);
                          setEditingCardCol(col.id);
                        }}
                        onToggleStep={(stepId) => {
                          const updated = {
                            ...card,
                            steps: card.steps.map((s) =>
                              s.id === stepId ? { ...s, done: !s.done } : s
                            ),
                          };
                          updateCard(col.id, updated);
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      )}

      {/* Notes View */}
      {view === "notes" && (
        <>
          <div className="flex justify-end">
            <button
              onClick={addNote}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#00F0FF]/15 text-[#00F0FF] text-xs font-medium hover:bg-[#00F0FF]/25 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> New Note
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note, i) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass p-5 cursor-pointer group hover:scale-[1.01] transition-transform"
                style={{ borderLeft: `3px solid ${note.color.replace("0.15", "0.6")}` }}
                onClick={() => setEditingNote(note)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-semibold text-heading">{note.title}</h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNote(note.id);
                    }}
                    className="p-1 rounded-lg text-muted hover:text-[#FF6B6B] opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-body whitespace-pre-wrap line-clamp-6">
                  {note.content || "Empty note..."}
                </p>
                <p className="text-[10px] text-muted mt-3">
                  {new Date(note.updatedAt).toLocaleDateString()}
                </p>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* Card Detail Modal */}
      <AnimatePresence>
        {editingCard && (
          <CardModal
            card={editingCard}
            colId={editingCardCol}
            columns={columns}
            onUpdate={(card) => {
              updateCard(editingCardCol, card);
              setEditingCard(card);
            }}
            onMove={(toCol) => {
              moveCard(editingCard.id, editingCardCol, toCol);
              setEditingCardCol(toCol);
            }}
            onDelete={() => deleteCard(editingCardCol, editingCard.id)}
            onClose={() => setEditingCard(null)}
          />
        )}
      </AnimatePresence>

      {/* Note Edit Modal */}
      <AnimatePresence>
        {editingNote && (
          <NoteModal
            note={editingNote}
            onUpdate={(note) => {
              updateNote(note);
              setEditingNote(note);
            }}
            onDelete={() => deleteNote(editingNote.id)}
            onClose={() => setEditingNote(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Kanban Card ───────────────────────────────────── */

function KanbanCard({
  card,
  colId,
  onDragStart,
  onDragEnd,
  onOpen,
  onToggleStep,
}: {
  card: Card;
  colId: string;
  onDragStart: (cardId: string, fromCol: string) => void;
  onDragEnd: () => void;
  onOpen: () => void;
  onToggleStep: (stepId: string) => void;
}) {
  const doneSteps = card.steps.filter((s) => s.done).length;
  const totalSteps = card.steps.length;

  return (
    <div
      draggable
      onDragStart={() => onDragStart(card.id, colId)}
      onDragEnd={onDragEnd}
      onClick={onOpen}
      className="glass-inset p-3 cursor-grab active:cursor-grabbing hover:bg-surface transition-all group"
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <GripVertical className="w-3.5 h-3.5 text-muted opacity-0 group-hover:opacity-100 shrink-0 mt-0.5 transition-opacity" />
        <p className="text-[13px] font-medium text-heading flex-1 leading-snug">{card.title}</p>
      </div>

      {/* Labels */}
      {card.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2 ml-5">
          {card.labels.map((l) => (
            <span
              key={l}
              className="text-[10px] font-medium px-1.5 py-0.5 rounded-md"
              style={{
                color: LABEL_CONFIG[l].color,
                backgroundColor: `${LABEL_CONFIG[l].color}15`,
              }}
            >
              {LABEL_CONFIG[l].label}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between ml-5">
        <div className="flex items-center gap-2">
          {/* Priority */}
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: PRIORITY_CONFIG[card.priority].color }}
          />

          {/* Steps progress */}
          {totalSteps > 0 && (
            <span className="text-[10px] text-muted flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              {doneSteps}/{totalSteps}
            </span>
          )}

          {/* Due date */}
          {card.dueDate && (
            <span className="text-[10px] text-muted flex items-center gap-0.5">
              <Clock className="w-3 h-3" />
              {card.dueDate}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Card Detail Modal ─────────────────────────────── */

function CardModal({
  card,
  colId,
  columns,
  onUpdate,
  onMove,
  onDelete,
  onClose,
}: {
  card: Card;
  colId: string;
  columns: Column[];
  onUpdate: (card: Card) => void;
  onMove: (toCol: string) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const [editTitle, setEditTitle] = useState(false);
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description);
  const [newStep, setNewStep] = useState("");
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  useEffect(() => {
    setTitle(card.title);
    setDescription(card.description);
  }, [card]);

  const saveTitle = () => {
    if (title.trim()) onUpdate({ ...card, title: title.trim() });
    setEditTitle(false);
  };

  const saveDescription = () => {
    onUpdate({ ...card, description });
  };

  const addStep = () => {
    if (!newStep.trim()) return;
    onUpdate({
      ...card,
      steps: [...card.steps, { id: uid(), text: newStep.trim(), done: false }],
    });
    setNewStep("");
  };

  const toggleStep = (stepId: string) => {
    onUpdate({
      ...card,
      steps: card.steps.map((s) => (s.id === stepId ? { ...s, done: !s.done } : s)),
    });
  };

  const removeStep = (stepId: string) => {
    onUpdate({ ...card, steps: card.steps.filter((s) => s.id !== stepId) });
  };

  const toggleLabel = (label: Label) => {
    const has = card.labels.includes(label);
    onUpdate({
      ...card,
      labels: has ? card.labels.filter((l) => l !== label) : [...card.labels, label],
    });
  };

  const doneSteps = card.steps.filter((s) => s.done).length;

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
        className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto glass-heavy p-6 space-y-5"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-surface text-muted hover:text-heading transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        {editTitle ? (
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={(e) => e.key === "Enter" && saveTitle()}
            className="text-lg font-bold text-heading bg-transparent outline-none border-b border-divider pb-1 w-full"
          />
        ) : (
          <h2
            onClick={() => setEditTitle(true)}
            className="text-lg font-bold text-heading cursor-pointer hover:text-[#00F0FF] transition-colors pr-8"
          >
            {card.title}
            <Edit3 className="w-3.5 h-3.5 inline ml-2 opacity-40" />
          </h2>
        )}

        {/* Column + Priority */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Move to column */}
          <div className="relative">
            <button
              onClick={() => setShowMoveMenu(!showMoveMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-inset text-xs font-medium text-muted hover:text-heading transition-colors"
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: columns.find((c) => c.id === colId)?.color,
                }}
              />
              {columns.find((c) => c.id === colId)?.title}
              <ChevronDown className="w-3 h-3" />
            </button>
            {showMoveMenu && (
              <div className="absolute top-full left-0 mt-1 z-10 glass-heavy p-1.5 min-w-[140px] space-y-0.5">
                {columns.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onMove(c.id);
                      setShowMoveMenu(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs transition-colors ${
                      c.id === colId ? "text-[#00F0FF] bg-[#00F0FF]/10" : "text-muted hover:text-heading hover:bg-surface"
                    }`}
                  >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                    {c.title}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Priority */}
          {(Object.keys(PRIORITY_CONFIG) as Priority[]).map((p) => (
            <button
              key={p}
              onClick={() => onUpdate({ ...card, priority: p })}
              className="px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all"
              style={{
                color: card.priority === p ? PRIORITY_CONFIG[p].color : undefined,
                backgroundColor: card.priority === p ? `${PRIORITY_CONFIG[p].color}15` : undefined,
                opacity: card.priority === p ? 1 : 0.5,
              }}
            >
              {PRIORITY_CONFIG[p].label}
            </button>
          ))}
        </div>

        {/* Due date */}
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted" />
          <input
            type="date"
            value={card.dueDate || ""}
            onChange={(e) => onUpdate({ ...card, dueDate: e.target.value || undefined })}
            className="bg-transparent text-sm text-heading outline-none"
          />
          {card.dueDate && (
            <button
              onClick={() => onUpdate({ ...card, dueDate: undefined })}
              className="text-[10px] text-muted hover:text-[#FF6B6B] transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Labels */}
        <div>
          <p className="text-xs text-muted mb-2 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" /> Labels
          </p>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(LABEL_CONFIG) as Label[]).map((l) => {
              const active = card.labels.includes(l);
              return (
                <button
                  key={l}
                  onClick={() => toggleLabel(l)}
                  className="px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all"
                  style={{
                    color: active ? LABEL_CONFIG[l].color : undefined,
                    backgroundColor: active ? `${LABEL_CONFIG[l].color}15` : undefined,
                    opacity: active ? 1 : 0.4,
                    border: active ? `1px solid ${LABEL_CONFIG[l].color}30` : "1px solid transparent",
                  }}
                >
                  {LABEL_CONFIG[l].label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Description */}
        <div>
          <p className="text-xs text-muted mb-2">Description</p>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={saveDescription}
            rows={3}
            placeholder="Add a description..."
            className="w-full glass-inset p-3 rounded-2xl text-sm text-body placeholder-muted outline-none resize-none focus:ring-1 focus:ring-[#00F0FF]/30"
          />
        </div>

        {/* Steps / Checklist */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Steps
              {card.steps.length > 0 && (
                <span className="text-[10px]">
                  ({doneSteps}/{card.steps.length})
                </span>
              )}
            </p>
            {card.steps.length > 0 && (
              <div className="w-16 h-1 rounded-full bg-surface overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#00FF88] transition-all"
                  style={{
                    width: `${card.steps.length ? (doneSteps / card.steps.length) * 100 : 0}%`,
                  }}
                />
              </div>
            )}
          </div>

          <div className="space-y-1.5 mb-2">
            {card.steps.map((step) => (
              <div
                key={step.id}
                className="flex items-center gap-2 group px-1 py-0.5 rounded-lg hover:bg-surface-dim transition-colors"
              >
                <button onClick={() => toggleStep(step.id)} className="shrink-0">
                  {step.done ? (
                    <CheckCircle2 className="w-4 h-4 text-[#00FF88]" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted" />
                  )}
                </button>
                <span
                  className={`text-sm flex-1 ${
                    step.done ? "line-through text-muted" : "text-body"
                  }`}
                >
                  {step.text}
                </span>
                <button
                  onClick={() => removeStep(step.id)}
                  className="p-0.5 rounded text-muted hover:text-[#FF6B6B] opacity-0 group-hover:opacity-100 transition-all"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              value={newStep}
              onChange={(e) => setNewStep(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addStep()}
              placeholder="Add a step..."
              className="flex-1 glass-inset px-3 py-1.5 rounded-xl text-sm text-heading placeholder-muted outline-none focus:ring-1 focus:ring-[#00F0FF]/30"
            />
            <button
              onClick={addStep}
              className="px-3 py-1.5 rounded-xl bg-[#00F0FF]/15 text-[#00F0FF] text-xs font-medium hover:bg-[#00F0FF]/25 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Delete */}
        <div className="flex justify-end pt-2 border-t border-divider">
          <button
            onClick={onDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-[#FF6B6B] hover:bg-[#FF6B6B]/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete Task
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Note Edit Modal ───────────────────────────────── */

function NoteModal({
  note,
  onUpdate,
  onDelete,
  onClose,
}: {
  note: Note;
  onUpdate: (note: Note) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
  }, [note]);

  const save = () => {
    onUpdate({ ...note, title: title.trim() || "Untitled", content });
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
        className="relative w-full max-w-md glass-heavy p-6 space-y-4"
        style={{ borderLeft: `3px solid ${note.color.replace("0.15", "0.6")}` }}
      >
        <button
          onClick={() => {
            save();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-surface text-muted hover:text-heading transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={save}
          className="text-lg font-bold text-heading bg-transparent outline-none w-full pr-8"
          placeholder="Note title..."
        />

        {/* Color picker */}
        <div className="flex gap-2">
          {NOTE_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => onUpdate({ ...note, color: c })}
              className="w-5 h-5 rounded-full transition-transform hover:scale-110"
              style={{
                backgroundColor: c.replace("0.15", "0.5"),
                border: note.color === c ? "2px solid var(--t-heading)" : "2px solid transparent",
              }}
            />
          ))}
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={save}
          rows={10}
          placeholder="Write your note..."
          className="w-full glass-inset p-4 rounded-2xl text-sm text-body placeholder-muted outline-none resize-none focus:ring-1 focus:ring-[#00F0FF]/30 leading-relaxed"
        />

        <div className="flex items-center justify-between pt-2 border-t border-divider">
          <span className="text-[10px] text-muted">
            Updated {new Date(note.updatedAt).toLocaleString()}
          </span>
          <button
            onClick={onDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-[#FF6B6B] hover:bg-[#FF6B6B]/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
