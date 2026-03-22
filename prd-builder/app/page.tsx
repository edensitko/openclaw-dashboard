"use client";

import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";

let _idCounter = 0;
const generateId = (): string => {
  return "id-" + (++_idCounter) + "-" + Date.now().toString(36).slice(-6);
};
import {
  Plus,
  Share2,
  Clock,
  Users,
  Search,
  Trash2,
  Star,
  Palette,
  Settings,
  Calendar,
  GripVertical,
  Upload,
  Zap,
  Target,
  BarChart3,
  Globe,
  Layout,
  Type,
  ShoppingCart,
  Mail,
  Phone,
  RotateCw,
  Image,
  Monitor,
  Smartphone,
  Lock,
  TrendingUp,
  MessageSquare,
  Megaphone,
  Briefcase,
  Eye,
  Code,
  Database,
  DollarSign,
  BookOpen,
  Flag,
  Check,
  FileDown,
  FileJson,
  Printer,
  ChevronDown,
  Sun,
  Moon,
  Shield,
  Repeat,
  Pencil,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Types ─── */
interface SitePage {
  id: string;
  name: string;
  description: string;
  isMainNav: boolean;
  subPages: string[];
}

interface Feature {
  id: string;
  name: string;
  description: string;
  category: string;
  estimatedCost: number;
}

interface Competitor {
  id: string;
  url: string;
  likes: string;
  dislikes: string;
}

interface Phase {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  deliverables: string;
  featureNames: string[];
}

/* ─── Constants ─── */
const TABS = [
  { id: "overview", label: "סקירה כללית", icon: Globe },
  { id: "audience", label: "קהל יעד", icon: Users },
  { id: "design", label: "עיצוב ותוכן", icon: Palette },
  { id: "structure", label: "מבנה ודפים", icon: Layout },
  { id: "functionality", label: "פונקציונליות", icon: Zap },
  { id: "technical", label: "טכני ו-SEO", icon: Settings },
  { id: "timeline", label: "לוח זמנים", icon: Calendar },
  { id: "summary", label: "סיכום והערכה", icon: DollarSign },
];

const SITE_TYPES = [
  "אתר תדמית", "חנות אונליין", "בלוג / מגזין", "אתר שירותים",
  "לנדינג פייג׳", "פלטפורמה / SaaS", "אתר קהילה / פורום",
  "פורטפוליו", "אתר מוסדי", "אפליקציית ווב", "אחר",
];

const STYLE_OPTIONS = [
  "מודרני ומינימליסטי", "תאגידי ומקצועי", "צעיר ודינמי",
  "יוקרתי ופרימיום", "חם ומזמין", "טכנולוגי וחדשני",
  "קלאסי ואלגנטי", "שובב וצבעוני",
];

const FUNC_CATEGORIES = [
  { name: "טפסים", icon: Mail, items: ["טופס יצירת קשר", "טופס הרשמה", "טופס הצעת מחיר", "טופס משוב", "טופס הזמנת פגישה", "טופס ניוזלטר"] },
  { name: "מסחר", icon: ShoppingCart, items: ["עגלת קניות", "תשלום אונליין", "ניהול מלאי", "קופונים והנחות", "מעקב הזמנות", "סליקת אשראי"] },
  { name: "תוכן", icon: BookOpen, items: ["בלוג / חדשות", "גלריית תמונות", "גלריית וידאו", "עמוד שאלות נפוצות", "המלצות לקוחות", "פודקאסט"] },
  { name: "אינטראקציה", icon: MessageSquare, items: ["צ׳אט חי", "צ׳אטבוט AI", "תגובות", "דירוגים וביקורות", "שיתוף חברתי", "מערכת הודעות"] },
  { name: "משתמשים", icon: Users, items: ["הרשמה והתחברות", "פרופיל משתמש", "אזור אישי", "היסטוריית הזמנות", "רשימת מועדפים", "התחברות עם Google/Facebook"] },
  { name: "מתקדם", icon: Code, items: ["חיפוש באתר", "מפת אתר", "רב-שפתיות", "נגישות (AA/AAA)", "אנימציות", "מפה אינטראקטיבית"] },
];

/* Default cost estimates per feature (in ₪) */
const FEATURE_COSTS: Record<string, number> = {
  "טופס יצירת קשר": 0, "טופס הרשמה": 0, "טופס הצעת מחיר": 0, "טופס משוב": 0, "טופס הזמנת פגישה": 0, "טופס ניוזלטר": 0,
  "עגלת קניות": 0, "תשלום אונליין": 0, "ניהול מלאי": 300, "קופונים והנחות": 200, "מעקב הזמנות": 200, "סליקת אשראי": 300,
  "בלוג / חדשות": 0, "גלריית תמונות": 0, "גלריית וידאו": 0, "עמוד שאלות נפוצות": 0, "המלצות לקוחות": 0, "פודקאסט": 200,
  "צ׳אט חי": 200, "צ׳אטבוט AI": 500, "תגובות": 0, "דירוגים וביקורות": 150, "שיתוף חברתי": 0, "מערכת הודעות": 300,
  "הרשמה והתחברות": 0, "פרופיל משתמש": 200, "אזור אישי": 300, "היסטוריית הזמנות": 0, "רשימת מועדפים": 100, "התחברות עם Google/Facebook": 150,
  "חיפוש באתר": 0, "מפת אתר": 0, "רב-שפתיות": 500, "נגישות (AA/AAA)": 400, "אנימציות": 200, "מפה אינטראקטיבית": 200,
};

const BASE_COSTS: Record<string, number> = {
  "אתר תדמית": 1500, "חנות אונליין": 3000, "בלוג / מגזין": 1000, "אתר שירותים": 2000,
  "לנדינג פייג׳": 800, "פלטפורמה / SaaS": 15000, "אתר קהילה / פורום": 4000,
  "פורטפוליו": 1500, "אתר מוסדי": 3500, "אפליקציית ווב": 12000, "אחר": 1500,
};

const BUDGET_RANGES = [
  "עד ₪5,000", "₪5,000 - ₪15,000", "₪15,000 - ₪30,000",
  "₪30,000 - ₪60,000", "₪60,000 - ₪100,000", "מעל ₪100,000", "לא הוגדר",
];

/* ─── Animation helpers ─── */
const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};

const stagger = (i: number) => ({
  initial: { opacity: 0, y: 12 } as const,
  animate: { opacity: 1, y: 0 } as const,
  transition: { delay: i * 0.04, duration: 0.3 },
});

/* ─── Reusable form components ─── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--prd-muted)" }}>
      {children}
    </label>
  );
}

function SubHeading({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: "0.5px solid var(--prd-border)" }}>
      <Icon size={16} style={{ color: "#00F0FF" }} />
      <h3 className="text-sm font-bold" style={{ color: "var(--prd-heading)" }}>{children}</h3>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
export default function WebsiteCharacterization() {
  /* ─── Dynamic pricing from API ─── */
  const [dynamicFeatureCosts, setDynamicFeatureCosts] = useState<Record<string, number>>(FEATURE_COSTS);
  const [dynamicBaseCosts, setDynamicBaseCosts] = useState<Record<string, number>>(BASE_COSTS);
  const [dynamicExtrasCosts, setDynamicExtrasCosts] = useState<Record<string, number>>({
    "עיצוב לוגו": 300, "קופירייטינג מלא": 800, "קופירייטינג חלקי": 400, "SEO בסיסי": 500, "שפה נוספת (לשפה)": 150,
  });
  const [dynamicMonthlyCosts, setDynamicMonthlyCosts] = useState<Record<string, number>>({});
  const [dynamicYearlyCosts, setDynamicYearlyCosts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch("/api/pricing")
      .then((res) => res.ok ? res.json() : null)
      .then((pricing) => {
        if (pricing) {
          if (pricing.featureCosts) setDynamicFeatureCosts(pricing.featureCosts);
          if (pricing.baseCosts) setDynamicBaseCosts(pricing.baseCosts);
          if (pricing.extrasCosts) setDynamicExtrasCosts(pricing.extrasCosts);
          if (pricing.monthlyCosts) setDynamicMonthlyCosts(pricing.monthlyCosts);
          if (pricing.yearlyCosts) setDynamicYearlyCosts(pricing.yearlyCosts);
        }
      })
      .catch(() => {});
  }, []);

  /* ─── State ─── */
  const [data, setData] = useState({
    // Overview
    projectName: "",
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    businessType: "",
    siteType: "",
    existingSiteUrl: "",
    projectGoals: "",
    uniqueValue: "",
    competitors: [] as Competitor[],

    // Audience
    audienceAge: "",
    audienceGender: "" as "" | "גברים" | "נשים" | "שני המינים",
    audienceLocation: "",
    audienceInterests: "",
    audiencePainPoints: "",
    audienceDevices: [] as string[],

    // Structure
    pages: [] as SitePage[],

    // Design + Content
    stylePreference: "",
    primaryColor: "#00F0FF",
    secondaryColor: "#6C63FF",
    accentColor: "#00FF88",
    hasLogo: "" as "" | "כן" | "לא" | "צריך עיצוב",
    referenceSites: "",
    moodKeywords: "",
    contentDescription: "",
    contentLanguages: ["עברית"] as string[],
    needsCopywriting: "" as "" | "כן" | "לא" | "חלקית",
    needsPhotography: "" as "" | "כן" | "לא",

    // Functionality
    selectedFeatures: [] as Feature[],

    // Technical + SEO
    domainStatus: "" as "" | "יש דומיין" | "צריך לרכוש" | "לא בטוח",
    domainName: "",
    cmsPreference: "" as "" | "WordPress" | "Webflow" | "Next.js" | "Wix" | "Shopify" | "Custom" | "לא משנה",
    sslNeeded: true,
    responsiveDesign: true,
    integrationsNeeded: "",
    targetKeywords: "",
    googleAnalytics: true,
    socialMedia: {} as Record<string, string>,
    emailMarketing: "" as "" | "כן" | "לא" | "אולי בעתיד",

    // Timeline
    phases: [] as Phase[],
    deadline: "",
    budgetRange: "",
    launchDate: "",
    maintenanceNeeded: "" as "" | "כן" | "לא" | "אולי",

    // Monthly/Yearly services
    selectedMonthly: [] as string[],
    selectedYearly: [] as string[],

    // General notes
    generalNotes: "",

    // Final price overrides (null = use calculated)
    finalPriceOverride: null as number | null,
    finalMonthlyOverride: null as number | null,
    finalYearlyOverride: null as number | null,
  });

  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");

  /* ─── Theme ─── */
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const saved = localStorage.getItem("prd-theme") as "dark" | "light" | null;
    const initial = saved || (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("prd-theme", next);
  };

  /* ─── Auto-save to localStorage ─── */
  const isInitialLoad = useRef(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("prd-draft");
      if (saved) {
        const parsed = JSON.parse(saved);
        setData((prev) => ({ ...prev, ...parsed }));
      }
    } catch {}
    // Mark initial load done after a tick so the first data change doesn't re-save the defaults
    setTimeout(() => { isInitialLoad.current = false; }, 500);
  }, []);

  useEffect(() => {
    if (isInitialLoad.current) return;
    try {
      localStorage.setItem("prd-draft", JSON.stringify(data));
    } catch {}
  }, [data]);

  /* ─── Update helper ─── */
  const update = useCallback(
    (fields: Partial<typeof data>) => setData((prev) => ({ ...prev, ...fields })),
    []
  );

  /* ─── CRUD: Pages ─── */
  const addPage = () => {
    update({
      pages: [...data.pages, { id: generateId(), name: "עמוד חדש", description: "", isMainNav: true, subPages: [] }],
    });
  };
  const updatePage = (id: string, updates: Partial<SitePage>) => {
    update({ pages: data.pages.map((p) => (p.id === id ? { ...p, ...updates } : p)) });
  };
  const deletePage = (id: string) => {
    update({ pages: data.pages.filter((p) => p.id !== id) });
  };

  /* ─── CRUD: Features ─── */
  const addFeatureFromTemplate = (name: string, category: string) => {
    if (data.selectedFeatures.some((f) => f.name === name)) return;
    update({
      selectedFeatures: [
        ...data.selectedFeatures,
        { id: generateId(), name, description: "", category, estimatedCost: dynamicFeatureCosts[name] || 1000 },
      ],
    });
  };
  const updateFeature = (id: string, updates: Partial<Feature>) => {
    update({ selectedFeatures: data.selectedFeatures.map((f) => (f.id === id ? { ...f, ...updates } : f)) });
  };
  const deleteFeature = (id: string) => {
    update({ selectedFeatures: data.selectedFeatures.filter((f) => f.id !== id) });
  };

  /* ─── CRUD: Phases ─── */
  const addPhase = () => {
    update({
      phases: [...data.phases, { id: generateId(), name: "שלב חדש", startDate: "", endDate: "", deliverables: "", featureNames: [] }],
    });
  };
  const updatePhase = (id: string, updates: Partial<Phase>) => {
    update({ phases: data.phases.map((p) => (p.id === id ? { ...p, ...updates } : p)) });
  };
  const deletePhase = (id: string) => {
    update({ phases: data.phases.filter((p) => p.id !== id) });
  };

  /* ─── CRUD: Competitors ─── */
  const addCompetitor = () => {
    update({
      competitors: [...data.competitors, { id: generateId(), url: "", likes: "", dislikes: "" }],
    });
  };
  const updateCompetitor = (id: string, updates: Partial<Competitor>) => {
    update({ competitors: data.competitors.map((c) => (c.id === id ? { ...c, ...updates } : c)) });
  };
  const deleteCompetitor = (id: string) => {
    update({ competitors: data.competitors.filter((c) => c.id !== id) });
  };

  /* ─── Completion calc ─── */
  const completionItems = useMemo(() => [
    { label: "שם הפרויקט", done: data.projectName.length > 0 },
    { label: "פרטי לקוח", done: data.clientName.length > 0 && data.clientEmail.length > 0 },
    { label: "סוג האתר", done: data.siteType.length > 0 },
    { label: "מטרות הפרויקט", done: data.projectGoals.length > 0 },
    { label: "קהל יעד", done: data.audienceAge.length > 0 || data.audienceLocation.length > 0 },
    { label: "מבנה ודפים", done: data.pages.length > 0 },
    { label: "עיצוב ותוכן", done: data.stylePreference.length > 0 },
    { label: "פונקציונליות", done: data.selectedFeatures.length > 0 },
    { label: "טכני ו-SEO", done: data.cmsPreference.length > 0 || data.targetKeywords.length > 0 },
    { label: "לוח זמנים", done: data.deadline.length > 0 || data.phases.length > 0 || data.selectedMonthly.length > 0 || data.selectedYearly.length > 0 },
    { label: "תקציב", done: data.budgetRange.length > 0 },
  ], [data]);

  const completionPct = Math.round((completionItems.filter((i) => i.done).length / completionItems.length) * 100);

  const [showExportMenu, setShowExportMenu] = useState(false);
  const [recurringView, setRecurringView] = useState<"monthly" | "yearly">("monthly");

  /* ─── Export: JSON ─── */
  const exportJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.projectName || "אפיון-אתר"}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  }, [data]);

  /* ─── Import: JSON ─── */
  const importJSONRef = useRef<HTMLInputElement>(null);
  const importJSON = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        setData((prev) => ({ ...prev, ...parsed }));
        setActiveTab("overview");
      } catch {
        alert("קובץ JSON לא תקין");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
    setShowExportMenu(false);
  }, []);

  /* ─── Reset form ─── */
  const resetForm = useCallback(() => {
    if (!window.confirm("האם אתה בטוח? כל הנתונים יימחקו.")) return;
    localStorage.removeItem("prd-draft");
    window.location.reload();
  }, []);

  /* ─── Export: HTML (printable / saveable as PDF) ─── */
  const exportHTML = useCallback(() => {
    const section = (title: string, content: string) =>
      content ? `<div class="section"><h2>${title}</h2>${content}</div>` : "";

    const field = (label: string, value: string) =>
      value ? `<p><strong>${label}:</strong> ${value}</p>` : "";

    const list = (items: string[]) =>
      items.length > 0 ? `<ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul>` : "";

    const pagesHtml = data.pages.map((p, i) =>
      `<div class="card"><strong>${i + 1}. ${p.name}</strong> ${p.isMainNav ? '<span class="badge">תפריט ראשי</span>' : '<span class="badge secondary">עמוד פנימי</span>'}<p>${p.description || "ללא תיאור"}</p></div>`
    ).join("");

    const featuresHtml = data.selectedFeatures.map((f) =>
      `<div class="card"><strong>${f.name}</strong> <span class="badge secondary">${f.category}</span>${f.description ? `<p>${f.description}</p>` : ""}</div>`
    ).join("");

    const phasesHtml = data.phases.map((p, i) =>
      `<div class="card"><strong>${i + 1}. ${p.name}</strong>${p.startDate || p.endDate ? ` <span class="badge secondary">${p.startDate} → ${p.endDate}</span>` : ""}${p.deliverables ? `<p>${p.deliverables}</p>` : ""}</div>`
    ).join("");

    const competitorsHtml = data.competitors.map((c, i) =>
      `<div class="card"><strong>${i + 1}. ${c.url || "ללא כתובת"}</strong><p style="color:#22c55e">👍 ${c.likes || "—"}</p><p style="color:#ef4444">👎 ${c.dislikes || "—"}</p></div>`
    ).join("");

    const html = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>אפיון אתר — ${data.projectName || "ללא שם"}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;700;900&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Heebo', sans-serif; background: #f8f9fa; color: #1a1a2e; line-height: 1.7; padding: 40px; }
  .container { max-width: 900px; margin: 0 auto; }
  .header { text-align: center; margin-bottom: 48px; padding-bottom: 32px; border-bottom: 3px solid #6C63FF; }
  .header h1 { font-size: 32px; font-weight: 900; color: #1a1a2e; margin-bottom: 4px; }
  .header .subtitle { font-size: 16px; color: #666; }
  .header .meta { margin-top: 16px; display: flex; justify-content: center; gap: 24px; flex-wrap: wrap; }
  .header .meta span { font-size: 13px; color: #888; }
  .header .meta strong { color: #1a1a2e; }
  .section { margin-bottom: 36px; page-break-inside: avoid; }
  .section h2 { font-size: 20px; font-weight: 700; color: #6C63FF; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1.5px solid #e0e0e0; }
  .section p { margin-bottom: 8px; }
  .section strong { color: #1a1a2e; }
  .card { background: white; border: 1px solid #e8e8e8; border-radius: 12px; padding: 16px; margin-bottom: 12px; }
  .card strong { color: #1a1a2e; }
  .card p { margin-top: 6px; color: #555; font-size: 14px; }
  .badge { display: inline-block; padding: 2px 10px; border-radius: 100px; font-size: 11px; font-weight: 600; background: #6C63FF; color: white; margin-inline-start: 8px; }
  .badge.secondary { background: #e8e8e8; color: #555; }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  ul { padding-inline-start: 20px; margin-bottom: 8px; }
  li { margin-bottom: 4px; }
  .footer { margin-top: 48px; text-align: center; padding-top: 24px; border-top: 1px solid #e0e0e0; color: #aaa; font-size: 12px; }
  @media print { body { padding: 20px; } .section { page-break-inside: avoid; } }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>📋 אפיון אתר — ${data.projectName || "ללא שם"}</h1>
    <p class="subtitle">מסמך אפיון מקצועי לבניית אתר</p>
    <div class="meta">
      ${data.clientName ? `<span>לקוח: <strong>${data.clientName}</strong></span>` : ""}
      ${data.siteType ? `<span>סוג: <strong>${data.siteType}</strong></span>` : ""}
      ${data.budgetRange ? `<span>תקציב: <strong>${data.budgetRange}</strong></span>` : ""}
      ${data.deadline ? `<span>דדליין: <strong>${data.deadline}</strong></span>` : ""}
      <span>תאריך: <strong>${new Date().toLocaleDateString("he-IL")}</strong></span>
    </div>
  </div>

  ${section("סקירה כללית", [
    field("סוג עסק", data.businessType),
    field("סוג אתר", data.siteType),
    field("אתר קיים", data.existingSiteUrl),
    field("מטרות", data.projectGoals),
    field("ערך ייחודי", data.uniqueValue),
  ].join(""))}

  ${section("פרטי לקוח", [
    field("שם", data.clientName),
    field("טלפון", data.clientPhone),
    field("אימייל", data.clientEmail),
  ].join(""))}

  ${section("קהל יעד", [
    field("טווח גילאים", data.audienceAge),
    field("מגדר", data.audienceGender),
    field("מיקום", data.audienceLocation),
    field("תחומי עניין", data.audienceInterests),
    field("כאבים ובעיות", data.audiencePainPoints),
    data.audienceDevices.length > 0 ? field("מכשירים", data.audienceDevices.join(", ")) : "",
  ].join(""))}

  ${section("מבנה ודפים", pagesHtml || "<p>לא הוגדרו עמודים</p>")}

  ${section("עיצוב ותוכן", [
    field("סגנון", data.stylePreference),
    field("צבעים", `ראשי: ${data.primaryColor}, משני: ${data.secondaryColor}, הדגשה: ${data.accentColor}`),
    field("לוגו", data.hasLogo),
    field("אווירה", data.moodKeywords),
    field("אתרי השראה", data.referenceSites),
    field("תוכן האתר", data.contentDescription),
    field("שפות", data.contentLanguages.join(", ")),
    field("קופירייטינג", data.needsCopywriting),
    field("צילום", data.needsPhotography),
  ].join(""))}

  ${section("פונקציונליות", featuresHtml || "<p>לא נבחרו פיצ׳רים</p>")}

  ${section("טכני ו-SEO", [
    field("CMS", data.cmsPreference),
    field("דומיין", data.domainStatus + (data.domainName ? ` (${data.domainName})` : "")),
    field("SSL", data.sslNeeded ? "כן" : "לא"),
    field("רספונסיבי", data.responsiveDesign ? "כן" : "לא"),
    field("אינטגרציות", data.integrationsNeeded),
    field("מילות מפתח", data.targetKeywords),
    field("Google Analytics", data.googleAnalytics ? "כן" : "לא"),
    Object.keys(data.socialMedia).length > 0 ? field("רשתות חברתיות", Object.entries(data.socialMedia).map(([k, v]) => v ? `${k}: ${v}` : k).join(", ")) : "",
    field("שיווק במייל", data.emailMarketing),
  ].join(""))}

  ${section("לוח זמנים ותקציב", [
    field("תאריך עלייה", data.launchDate),
    field("דדליין", data.deadline),
    field("תקציב", data.budgetRange),
    field("תחזוקה", data.maintenanceNeeded),
    phasesHtml ? "<h3 style='margin:16px 0 8px;font-size:15px;'>שלבי פרויקט</h3>" + phasesHtml : "",
  ].join(""))}

  ${competitorsHtml ? section("מתחרים", competitorsHtml) : ""}

  ${data.generalNotes ? section("הערות כלליות", `<p>${data.generalNotes}</p>`) : ""}

  <div class="footer">
    נוצר ע״י מערכת אפיון אתרים | ${new Date().toLocaleDateString("he-IL")} | השלמה: ${completionPct}%
  </div>
</div>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.projectName || "אפיון-אתר"}.html`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  }, [data, completionPct]);

  /* ─── Export: Print / PDF ─── */
  const exportPrint = useCallback(() => {
    // Build a temporary printable page and trigger print dialog (Save as PDF)
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    // Reuse the same HTML generation
    const field = (label: string, value: string) =>
      value ? `<p><strong>${label}:</strong> ${value}</p>` : "";

    const pagesText = data.pages.map((p, i) => `${i + 1}. ${p.name}${p.description ? ` — ${p.description}` : ""}`).join("\n");
    const featuresText = data.selectedFeatures.map((f) => `• ${f.name} (${f.category})`).join("\n");

    printWindow.document.write(`<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
<meta charset="UTF-8">
<title>אפיון אתר — ${data.projectName || "ללא שם"}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;700;900&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Heebo', sans-serif; padding: 40px; color: #1a1a2e; line-height: 1.8; font-size: 14px; }
  h1 { font-size: 28px; text-align: center; margin-bottom: 4px; }
  .sub { text-align: center; color: #888; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 2px solid #6C63FF; }
  h2 { color: #6C63FF; font-size: 18px; margin: 24px 0 12px; border-bottom: 1px solid #ddd; padding-bottom: 6px; }
  p { margin-bottom: 6px; }
  strong { color: #1a1a2e; }
  pre { white-space: pre-wrap; background: #f5f5f5; padding: 12px; border-radius: 8px; font-family: 'Heebo', sans-serif; font-size: 13px; margin-bottom: 12px; }
  .footer { margin-top: 40px; text-align: center; color: #aaa; font-size: 11px; border-top: 1px solid #eee; padding-top: 16px; }
</style>
</head>
<body>
  <h1>📋 אפיון אתר — ${data.projectName || "ללא שם"}</h1>
  <p class="sub">${data.clientName ? `לקוח: ${data.clientName} | ` : ""}${data.siteType ? `סוג: ${data.siteType} | ` : ""}תאריך: ${new Date().toLocaleDateString("he-IL")}</p>

  <h2>סקירה כללית</h2>
  ${field("סוג עסק", data.businessType)}
  ${field("סוג אתר", data.siteType)}
  ${field("אתר קיים", data.existingSiteUrl)}
  ${field("מטרות", data.projectGoals)}
  ${field("ערך ייחודי", data.uniqueValue)}

  <h2>פרטי לקוח</h2>
  ${field("שם", data.clientName)}
  ${field("טלפון", data.clientPhone)}
  ${field("אימייל", data.clientEmail)}

  <h2>קהל יעד</h2>
  ${field("גילאים", data.audienceAge)}
  ${field("מגדר", data.audienceGender)}
  ${field("מיקום", data.audienceLocation)}
  ${field("תחומי עניין", data.audienceInterests)}
  ${field("כאבים ובעיות", data.audiencePainPoints)}
  ${field("מכשירים", data.audienceDevices.join(", "))}

  <h2>מבנה ודפים</h2>
  ${pagesText ? `<pre>${pagesText}</pre>` : "<p>לא הוגדרו</p>"}

  <h2>עיצוב ותוכן</h2>
  ${field("סגנון", data.stylePreference)}
  ${field("צבעים", `ראשי: ${data.primaryColor}, משני: ${data.secondaryColor}, הדגשה: ${data.accentColor}`)}
  ${field("לוגו", data.hasLogo)}
  ${field("אווירה", data.moodKeywords)}
  ${field("אתרי השראה", data.referenceSites)}
  ${field("שפות", data.contentLanguages.join(", "))}
  ${field("קופירייטינג", data.needsCopywriting)}
  ${field("צילום", data.needsPhotography)}

  <h2>פונקציונליות</h2>
  ${featuresText ? `<pre>${featuresText}</pre>` : "<p>לא נבחרו פיצ׳רים</p>"}

  <h2>טכני ו-SEO</h2>
  ${field("CMS", data.cmsPreference)}
  ${field("דומיין", data.domainStatus + (data.domainName ? ` (${data.domainName})` : ""))}
  ${field("SSL", data.sslNeeded ? "כן" : "לא")}
  ${field("רספונסיבי", data.responsiveDesign ? "כן" : "לא")}
  ${field("אינטגרציות", data.integrationsNeeded)}
  ${field("מילות מפתח", data.targetKeywords)}
  ${field("רשתות חברתיות", Object.entries(data.socialMedia).map(([k, v]) => v ? `${k}: ${v}` : k).join(", "))}
  ${field("שיווק במייל", data.emailMarketing)}

  <h2>לוח זמנים ותקציב</h2>
  ${field("עלייה לאוויר", data.launchDate)}
  ${field("דדליין", data.deadline)}
  ${field("תקציב", data.budgetRange)}
  ${field("תחזוקה", data.maintenanceNeeded)}

  ${data.competitors.length > 0 ? `<h2>מתחרים</h2>${data.competitors.map((c, i) => `<p><strong>${i + 1}. ${c.url || "—"}</strong><br/>👍 ${c.likes || "—"} | 👎 ${c.dislikes || "—"}</p>`).join("")}` : ""}

  ${data.generalNotes ? `<h2>הערות כלליות</h2><p style="white-space:pre-wrap">${data.generalNotes}</p>` : ""}

  <div class="footer">נוצר ע״י מערכת אפיון אתרים | השלמה: ${completionPct}%</div>
</body>
</html>`);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
    setShowExportMenu(false);
  }, [data, completionPct]);

  /* ─── Radio/Pill helper ─── */
  const PillSelect = ({ options, value, onChange, color = "#00F0FF" }: { options: string[]; value: string; onChange: (v: string) => void; color?: string }) => (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            onClick={() => onChange(active ? "" : opt)}
            className="pill flex items-center gap-1 transition-all text-xs"
            style={{
              backgroundColor: active ? `${color}18` : "transparent",
              color: active ? color : "var(--prd-muted)",
              border: `1px solid ${active ? color + "40" : "var(--prd-border)"}`,
            }}
          >
            {active && <Check size={10} />} {opt}
          </button>
        );
      })}
    </div>
  );

  /* ─── Toggle helper for multi-select ─── */
  const toggleArrayItem = (arr: string[], item: string) =>
    arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];

  const formatCurrency = (n: number) => "₪" + n.toLocaleString("he-IL");

  /* ─── Tab content renderer ─── */
  const renderContent = () => {
    switch (activeTab) {
      /* ═══ OVERVIEW ═══ */
      case "overview":
        return (
          <motion.div {...fadeIn} className="space-y-6">
            <SubHeading icon={Briefcase}>פרטי הפרויקט</SubHeading>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <SectionLabel>שם הפרויקט / האתר *</SectionLabel>
                <input type="text" value={data.projectName} onChange={(e) => update({ projectName: e.target.value })} placeholder="לדוגמה: חנות האופנה של מיכל" className="prd-input" />
              </div>
              <div>
                <SectionLabel>סוג העסק *</SectionLabel>
                <input type="text" value={data.businessType} onChange={(e) => update({ businessType: e.target.value })} placeholder="לדוגמה: מסעדה, עורך דין, חנות בגדים" className="prd-input" />
              </div>
            </div>

            <div>
              <SectionLabel>סוג האתר *</SectionLabel>
              <PillSelect options={SITE_TYPES} value={data.siteType} onChange={(v) => update({ siteType: v })} />
            </div>

            <div>
              <SectionLabel>כתובת אתר קיים (אם יש)</SectionLabel>
              <input type="url" value={data.existingSiteUrl} onChange={(e) => update({ existingSiteUrl: e.target.value })} placeholder="https://www.example.co.il" className="prd-input" dir="ltr" />
            </div>

            <div>
              <SectionLabel>מטרות הפרויקט *</SectionLabel>
              <textarea value={data.projectGoals} onChange={(e) => update({ projectGoals: e.target.value })} placeholder="מה המטרות העיקריות של האתר? מה אתם רוצים להשיג?" rows={3} className="prd-textarea" />
            </div>

            <div>
              <SectionLabel>ערך ייחודי / USP</SectionLabel>
              <textarea value={data.uniqueValue} onChange={(e) => update({ uniqueValue: e.target.value })} placeholder="מה מייחד אתכם מהמתחרים? למה לקוח יבחר בכם?" rows={2} className="prd-textarea" />
            </div>

            <SubHeading icon={Phone}>פרטי הלקוח</SubHeading>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <SectionLabel>שם מלא *</SectionLabel>
                <input type="text" value={data.clientName} onChange={(e) => update({ clientName: e.target.value })} placeholder="שם איש הקשר" className="prd-input" />
              </div>
              <div>
                <SectionLabel>טלפון</SectionLabel>
                <input type="tel" value={data.clientPhone} onChange={(e) => update({ clientPhone: e.target.value })} placeholder="050-0000000" className="prd-input" dir="ltr" />
              </div>
              <div>
                <SectionLabel>אימייל *</SectionLabel>
                <input type="email" value={data.clientEmail} onChange={(e) => update({ clientEmail: e.target.value })} placeholder="email@example.com" className="prd-input" dir="ltr" />
              </div>
            </div>

            {/* ─── Social Media ─── */}
            <SubHeading icon={Share2}>רשתות חברתיות</SubHeading>
            <div className="space-y-2">
              {["Facebook", "Instagram", "LinkedIn", "Twitter / X", "TikTok", "YouTube", "WhatsApp"].map((sn) => {
                const active = sn in data.socialMedia;
                return (
                  <div key={sn}>
                    <button
                      onClick={() => {
                        const next = { ...data.socialMedia };
                        if (active) { delete next[sn]; } else { next[sn] = ""; }
                        update({ socialMedia: next });
                      }}
                      className="pill flex items-center gap-1.5 transition-all text-xs mb-1"
                      style={{
                        backgroundColor: active ? "rgba(108,99,255,0.12)" : "transparent",
                        color: active ? "#6C63FF" : "var(--prd-muted)",
                        border: `1px solid ${active ? "rgba(108,99,255,0.3)" : "var(--prd-border)"}`,
                      }}
                    >
                      {active && <Check size={10} />} {sn}
                    </button>
                    {active && (
                      <input
                        type="url"
                        value={data.socialMedia[sn]}
                        onChange={(e) => update({ socialMedia: { ...data.socialMedia, [sn]: e.target.value } })}
                        placeholder={`קישור ל-${sn}`}
                        className="prd-input text-xs mr-6"
                        dir="ltr"
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* ─── Competitors ─── */}
            <SubHeading icon={Target}>מתחרים</SubHeading>
            <button onClick={addCompetitor} className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-white transition-all" style={{ background: "linear-gradient(135deg, #6C63FF, #00F0FF)" }}>
              <Plus size={14} /> הוסף מתחרה
            </button>
            <AnimatePresence mode="popLayout">
              {data.competitors.map((comp, i) => (
                <motion.div key={comp.id} {...stagger(i)} exit={{ opacity: 0, height: 0 }} layout className="glass rounded-xl p-4 group">
                  <div className="flex items-center justify-between mb-2">
                    <input type="url" value={comp.url} onChange={(e) => updateCompetitor(comp.id, { url: e.target.value })} placeholder="https://www.competitor.co.il" className="prd-input text-sm flex-1" dir="ltr" />
                    <button onClick={() => deleteCompetitor(comp.id)} className="p-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all mr-2" style={{ color: "#FF6B6B" }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <textarea value={comp.likes} onChange={(e) => updateCompetitor(comp.id, { likes: e.target.value })} placeholder="מה אהבתם?" rows={1} className="prd-textarea text-xs" />
                    <textarea value={comp.dislikes} onChange={(e) => updateCompetitor(comp.id, { dislikes: e.target.value })} placeholder="מה לא אהבתם?" rows={1} className="prd-textarea text-xs" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        );

      /* ═══ AUDIENCE ═══ */
      case "audience":
        return (
          <motion.div {...fadeIn} className="space-y-6">
            <SubHeading icon={Users}>הגדרת קהל היעד</SubHeading>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <SectionLabel>טווח גילאים</SectionLabel>
                <input type="text" value={data.audienceAge} onChange={(e) => update({ audienceAge: e.target.value })} placeholder="לדוגמה: 25-45" className="prd-input" />
              </div>
              <div>
                <SectionLabel>מגדר</SectionLabel>
                <PillSelect options={["גברים", "נשים", "שני המינים"]} value={data.audienceGender} onChange={(v) => update({ audienceGender: v as typeof data.audienceGender })} />
              </div>
              <div>
                <SectionLabel>מיקום גיאוגרפי</SectionLabel>
                <input type="text" value={data.audienceLocation} onChange={(e) => update({ audienceLocation: e.target.value })} placeholder="ישראל, בינלאומי..." className="prd-input" />
              </div>
            </div>

            <div>
              <SectionLabel>תחומי עניין וכאבים</SectionLabel>
              <textarea value={data.audienceInterests} onChange={(e) => update({ audienceInterests: e.target.value })} placeholder="מה מעניין את קהל היעד? אילו בעיות האתר פותר עבורם?" rows={3} className="prd-textarea" />
            </div>

            <div>
              <SectionLabel>נקודות כאב</SectionLabel>
              <textarea value={data.audiencePainPoints} onChange={(e) => update({ audiencePainPoints: e.target.value })} placeholder="מה מתסכל את הלקוחות הפוטנציאליים? מה חסר בפתרונות הקיימים?" rows={2} className="prd-textarea" />
            </div>

            <div>
              <SectionLabel>מכשירים עיקריים</SectionLabel>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: "סמארטפון", icon: Smartphone },
                  { name: "מחשב", icon: Monitor },
                  { name: "טאבלט", icon: Layout },
                ].map(({ name, icon: Icon }) => {
                  const active = data.audienceDevices.includes(name);
                  return (
                    <button
                      key={name}
                      onClick={() => update({ audienceDevices: toggleArrayItem(data.audienceDevices, name) })}
                      className="pill flex items-center gap-1.5 px-3 py-1.5 transition-all"
                      style={{
                        backgroundColor: active ? "rgba(0,240,255,0.12)" : "transparent",
                        color: active ? "#00F0FF" : "var(--prd-muted)",
                        border: `1px solid ${active ? "rgba(0,240,255,0.3)" : "var(--prd-border)"}`,
                      }}
                    >
                      <Icon size={13} /> {name}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        );

      /* ═══ STRUCTURE ═══ */
      case "structure":
        return (
          <motion.div {...fadeIn} className="space-y-4">
            <SubHeading icon={Layout}>מבנה האתר ודפים</SubHeading>

            <button onClick={addPage} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all" style={{ background: "linear-gradient(135deg, #6C63FF, #00F0FF)" }}>
              <Plus size={16} /> הוסף עמוד
            </button>

            {data.pages.length > 0 && (
              <div className="glass-inset rounded-xl p-3 text-xs" style={{ color: "var(--prd-muted)" }}>
                סה״כ {data.pages.length} עמודים | {data.pages.filter((p) => p.isMainNav).length} בתפריט ראשי
              </div>
            )}

            <AnimatePresence mode="popLayout">
              {data.pages.map((page, i) => (
                <motion.div key={page.id} {...stagger(i)} exit={{ opacity: 0, height: 0 }} layout className="glass rounded-xl p-5 group">
                  <div className="flex items-start gap-3">
                    <div className="pt-1 opacity-30 group-hover:opacity-60 transition-opacity cursor-grab">
                      <GripVertical size={16} />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: "rgba(0,240,255,0.12)", color: "#00F0FF" }}>
                          {i + 1}
                        </div>
                        <input
                          type="text"
                          value={page.name}
                          onChange={(e) => updatePage(page.id, { name: e.target.value })}
                          className="text-base font-semibold bg-transparent border-none outline-none flex-1"
                          style={{ color: "var(--prd-heading)" }}
                        />
                        <button
                          onClick={() => updatePage(page.id, { isMainNav: !page.isMainNav })}
                          className="pill text-[10px] transition-all"
                          style={{
                            backgroundColor: page.isMainNav ? "rgba(0,240,255,0.12)" : "transparent",
                            color: page.isMainNav ? "#00F0FF" : "var(--prd-muted)",
                            border: `1px solid ${page.isMainNav ? "rgba(0,240,255,0.3)" : "var(--prd-border)"}`,
                          }}
                        >
                          {page.isMainNav ? "תפריט ראשי" : "עמוד פנימי"}
                        </button>
                      </div>
                      <textarea
                        value={page.description}
                        onChange={(e) => updatePage(page.id, { description: e.target.value })}
                        placeholder="תיאור העמוד: מה יופיע בו? מה המטרה שלו?"
                        rows={2}
                        className="prd-textarea text-sm"
                      />
                    </div>
                    <button onClick={() => deletePage(page.id)} className="p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all" style={{ color: "#FF6B6B" }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {data.pages.length === 0 && (
              <div className="glass-inset rounded-xl p-10 text-center">
                <Layout size={32} className="mx-auto mb-3 opacity-30" style={{ color: "var(--prd-muted)" }} />
                <p className="text-sm" style={{ color: "var(--prd-muted)" }}>
                  טרם הוגדרו עמודים. הוסיפו את העמודים הרצויים באתר.
                </p>
                <p className="text-xs mt-2" style={{ color: "var(--prd-muted)", opacity: 0.6 }}>
                  לדוגמה: עמוד ראשי, אודות, שירותים, פרויקטים, בלוג, צור קשר
                </p>
              </div>
            )}
          </motion.div>
        );

      /* ═══ DESIGN ═══ */
      case "design":
        return (
          <motion.div {...fadeIn} className="space-y-6">
            <SubHeading icon={Palette}>עיצוב ומיתוג</SubHeading>

            <div>
              <SectionLabel>סגנון עיצוב מועדף</SectionLabel>
              <PillSelect options={STYLE_OPTIONS} value={data.stylePreference} onChange={(v) => update({ stylePreference: v })} color="#6C63FF" />
            </div>

            <div>
              <SectionLabel>צבעים מועדפים</SectionLabel>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "ראשי", key: "primaryColor" as const },
                  { label: "משני", key: "secondaryColor" as const },
                  { label: "הדגשה", key: "accentColor" as const },
                ].map((c) => (
                  <div key={c.key} className="glass-inset rounded-xl p-2.5 text-center">
                    <p className="text-[10px] uppercase tracking-wider mb-1.5" style={{ color: "var(--prd-muted)" }}>{c.label}</p>
                    <div className="flex items-center justify-center gap-2">
                      <input type="color" value={data[c.key]} onChange={(e) => update({ [c.key]: e.target.value })} className="w-7 h-7 rounded-lg cursor-pointer border-none" style={{ background: "transparent" }} />
                      <span className="text-[10px] font-mono" style={{ color: "var(--prd-heading)" }} dir="ltr">{data[c.key]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <SectionLabel>לוגו</SectionLabel>
                <PillSelect options={["כן", "לא", "צריך עיצוב"]} value={data.hasLogo} onChange={(v) => update({ hasLogo: v as typeof data.hasLogo })} color="#FFD93D" />
              </div>
              <div>
                <SectionLabel>מילות מפתח לאווירה</SectionLabel>
                <input type="text" value={data.moodKeywords} onChange={(e) => update({ moodKeywords: e.target.value })} placeholder="נקי, אמין, חדשני, מקצועי..." className="prd-input" />
              </div>
            </div>

            <div>
              <SectionLabel>אתרי השראה</SectionLabel>
              <textarea value={data.referenceSites} onChange={(e) => update({ referenceSites: e.target.value })} placeholder="קישורים לאתרים שאתם אוהבים + מה אהבתם" rows={2} className="prd-textarea" dir="ltr" />
            </div>

            {/* ─── Content section (merged) ─── */}
            <SubHeading icon={Type}>תוכן</SubHeading>

            <div>
              <SectionLabel>על מה האתר? (בקצרה)</SectionLabel>
              <textarea value={data.contentDescription} onChange={(e) => update({ contentDescription: e.target.value })} placeholder="ספרו בקצרה על התוכן המרכזי של האתר — מה הגולש ימצא בו, אילו שירותים/מוצרים מוצגים, מה המסר העיקרי" rows={3} className="prd-textarea" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <SectionLabel>שפות האתר</SectionLabel>
                <div className="flex flex-wrap gap-2">
                  {["עברית", "אנגלית", "ערבית", "רוסית"].map((lang) => {
                    const active = data.contentLanguages.includes(lang);
                    return (
                      <button
                        key={lang}
                        onClick={() => update({ contentLanguages: toggleArrayItem(data.contentLanguages, lang) })}
                        className="pill flex items-center gap-1 transition-all text-xs"
                        style={{
                          backgroundColor: active ? "rgba(108,99,255,0.12)" : "transparent",
                          color: active ? "#6C63FF" : "var(--prd-muted)",
                          border: `1px solid ${active ? "rgba(108,99,255,0.3)" : "var(--prd-border)"}`,
                        }}
                      >
                        {active && <Check size={10} />} {lang}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <SectionLabel>קופירייטינג</SectionLabel>
                <PillSelect options={["כן", "לא", "חלקית"]} value={data.needsCopywriting} onChange={(v) => update({ needsCopywriting: v as typeof data.needsCopywriting })} color="#00FF88" />
              </div>
            </div>

            <div>
              <SectionLabel>צריך צילום מקצועי?</SectionLabel>
              <PillSelect options={["כן", "לא"]} value={data.needsPhotography} onChange={(v) => update({ needsPhotography: v as typeof data.needsPhotography })} color="#FFD93D" />
            </div>
          </motion.div>
        );

      /* ═══ FUNCTIONALITY ═══ */
      case "functionality":
        return (
          <motion.div {...fadeIn} className="space-y-6">
            <SubHeading icon={Zap}>פונקציונליות ופיצ׳רים</SubHeading>

            <p className="text-xs" style={{ color: "var(--prd-muted)" }}>
              לחצו על פיצ׳רים רלוונטיים להוסיף אותם לרשימה.
            </p>

            {FUNC_CATEGORIES.map((cat) => {
              const CatIcon = cat.icon;
              return (
                <div key={cat.name} className="glass-inset rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CatIcon size={14} style={{ color: "#00F0FF" }} />
                    <span className="text-xs font-bold" style={{ color: "var(--prd-heading)" }}>{cat.name}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {cat.items.map((item) => {
                      const selected = data.selectedFeatures.some((f) => f.name === item);
                      const cost = dynamicFeatureCosts[item] || 0;
                      return (
                        <button
                          key={item}
                          onClick={() => selected ? deleteFeature(data.selectedFeatures.find((f) => f.name === item)!.id) : addFeatureFromTemplate(item, cat.name)}
                          className="pill flex items-center gap-1 transition-all text-xs"
                          style={{
                            backgroundColor: selected ? "rgba(0,255,136,0.12)" : "transparent",
                            color: selected ? "#00FF88" : "var(--prd-muted)",
                            border: `1px solid ${selected ? "rgba(0,255,136,0.3)" : "var(--prd-border)"}`,
                          }}
                        >
                          {selected ? <Check size={10} /> : <Plus size={10} />} {item}
                          {cost > 0 && <span className="font-mono text-[10px] opacity-60" dir="ltr">₪{cost.toLocaleString("he-IL")}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {data.selectedFeatures.length > 0 && (
              <>
                <div className="flex items-center gap-2 mt-6 mb-2">
                  <Star size={16} style={{ color: "#FFD93D" }} />
                  <h3 className="text-sm font-bold" style={{ color: "var(--prd-heading)" }}>פיצ׳רים שנבחרו ({data.selectedFeatures.length})</h3>
                </div>
                <AnimatePresence mode="popLayout">
                  {data.selectedFeatures.map((feature, i) => {
                    return (
                      <motion.div key={feature.id} {...stagger(i)} exit={{ opacity: 0, height: 0 }} layout className="glass rounded-xl p-4 group">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold flex-1" style={{ color: "var(--prd-heading)" }}>{feature.name}</span>
                          <span className="text-[10px] pill" style={{ backgroundColor: "rgba(108,99,255,0.12)", color: "#6C63FF", border: "1px solid rgba(108,99,255,0.2)" }}>
                            {feature.category}
                          </span>
                          <button onClick={() => deleteFeature(feature.id)} className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all" style={{ color: "#FF6B6B" }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="mt-2">
                          <textarea
                            value={feature.description}
                            onChange={(e) => updateFeature(feature.id, { description: e.target.value })}
                            placeholder="הערות נוספות לפיצ׳ר זה..."
                            rows={1}
                            className="prd-textarea text-xs w-full"
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </>
            )}
          </motion.div>
        );

      /* ═══ TECHNICAL ═══ */
      case "technical":
        return (
          <motion.div {...fadeIn} className="space-y-6">
            <SubHeading icon={Settings}>דרישות טכניות</SubHeading>

            <div>
              <SectionLabel>מערכת ניהול תוכן (CMS)</SectionLabel>
              <PillSelect options={["WordPress", "Webflow", "Next.js", "Wix", "Shopify", "Custom", "לא משנה"]} value={data.cmsPreference} onChange={(v) => update({ cmsPreference: v as typeof data.cmsPreference })} color="#6C63FF" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <SectionLabel>מצב דומיין</SectionLabel>
                <PillSelect options={["יש דומיין", "צריך לרכוש", "לא בטוח"]} value={data.domainStatus} onChange={(v) => update({ domainStatus: v as typeof data.domainStatus })} color="#00FF88" />
              </div>
              <div>
                <SectionLabel>שם דומיין</SectionLabel>
                <input type="text" value={data.domainName} onChange={(e) => update({ domainName: e.target.value })} placeholder="example.co.il" className="prd-input" dir="ltr" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="glass-inset rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock size={14} style={{ color: "#00FF88" }} />
                    <span className="text-xs" style={{ color: "var(--prd-heading)" }}>SSL</span>
                  </div>
                  <button onClick={() => update({ sslNeeded: !data.sslNeeded })} className="w-10 h-5 rounded-full transition-all relative" style={{ backgroundColor: data.sslNeeded ? "rgba(0,255,136,0.3)" : "var(--prd-surface)" }}>
                    <div className="w-4 h-4 rounded-full absolute top-0.5 transition-all" style={{ backgroundColor: data.sslNeeded ? "#00FF88" : "var(--prd-muted)", right: data.sslNeeded ? "1px" : "auto", left: data.sslNeeded ? "auto" : "1px" }} />
                  </button>
                </div>
              </div>
              <div className="glass-inset rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone size={14} style={{ color: "#00F0FF" }} />
                    <span className="text-xs" style={{ color: "var(--prd-heading)" }}>רספונסיבי</span>
                  </div>
                  <button onClick={() => update({ responsiveDesign: !data.responsiveDesign })} className="w-10 h-5 rounded-full transition-all relative" style={{ backgroundColor: data.responsiveDesign ? "rgba(0,240,255,0.3)" : "var(--prd-surface)" }}>
                    <div className="w-4 h-4 rounded-full absolute top-0.5 transition-all" style={{ backgroundColor: data.responsiveDesign ? "#00F0FF" : "var(--prd-muted)", right: data.responsiveDesign ? "1px" : "auto", left: data.responsiveDesign ? "auto" : "1px" }} />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <SectionLabel>אינטגרציות נדרשות</SectionLabel>
              <textarea value={data.integrationsNeeded} onChange={(e) => update({ integrationsNeeded: e.target.value })} placeholder="Google Maps, PayPal, סליקה, Mailchimp, CRM..." rows={2} className="prd-textarea" />
            </div>

            {/* ─── SEO (merged) ─── */}
            <SubHeading icon={TrendingUp}>SEO ושיווק</SubHeading>

            <div>
              <SectionLabel>מילות מפתח מטרה</SectionLabel>
              <textarea value={data.targetKeywords} onChange={(e) => update({ targetKeywords: e.target.value })} placeholder="מילות מפתח לדירוג בגוגל, לדוגמה: עורך דין תל אביב" rows={2} className="prd-textarea" />
            </div>

            <div className="glass-inset rounded-xl p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 size={14} style={{ color: "#FFD93D" }} />
                  <span className="text-xs" style={{ color: "var(--prd-heading)" }}>Google Analytics</span>
                </div>
                <button onClick={() => update({ googleAnalytics: !data.googleAnalytics })} className="w-10 h-5 rounded-full transition-all relative" style={{ backgroundColor: data.googleAnalytics ? "rgba(255,217,61,0.3)" : "var(--prd-surface)" }}>
                  <div className="w-4 h-4 rounded-full absolute top-0.5 transition-all" style={{ backgroundColor: data.googleAnalytics ? "#FFD93D" : "var(--prd-muted)", right: data.googleAnalytics ? "1px" : "auto", left: data.googleAnalytics ? "auto" : "1px" }} />
                </button>
              </div>
            </div>

            <div>
              <SectionLabel>שיווק במייל</SectionLabel>
              <PillSelect options={["כן", "לא", "אולי בעתיד"]} value={data.emailMarketing} onChange={(v) => update({ emailMarketing: v as typeof data.emailMarketing })} color="#00FF88" />
            </div>

            {/* ─── Monthly services selection ─── */}
            {Object.keys(dynamicMonthlyCosts).length > 0 && (() => {
              const monthlyGroups: { label: string; icon: React.ElementType; keys: string[] }[] = [
                { label: "אחסון", icon: Database, keys: [] },
                { label: "תחזוקה", icon: Settings, keys: [] },
                { label: "אבטחה ותשתית", icon: Lock, keys: [] },
                { label: "שיווק ותוכן", icon: Megaphone, keys: [] },
              ];
              const monthlyGroupMap: Record<string, number> = {
                "אחסון בסיסי": 0, "אחסון מתקדם": 0, "אחסון פרימיום": 0,
                "תחזוקה שוטפת": 1, "תחזוקה + עדכוני תוכן": 1, "תחזוקה פרימיום (24/7)": 1,
                "גיבויים יומיים": 2, "SSL / אבטחה": 2, "ניטור ביצועים": 2, "תמיכה טכנית": 2, "עדכוני אבטחה": 2, "CDN / CloudFlare": 2,
                "SEO שוטף": 3, "ניהול רשתות חברתיות": 3, "קמפיין Google Ads": 3, "ניוזלטר חודשי": 3, "כתיבת תוכן (4 פוסטים)": 3, "דוחות אנליטיקס": 3, "צ׳אטבוט AI (תפעול)": 3,
              };
              Object.keys(dynamicMonthlyCosts).forEach((k) => {
                const gi = monthlyGroupMap[k] ?? 3;
                monthlyGroups[gi].keys.push(k);
              });
              const monthlyTotal = data.selectedMonthly.reduce((s, n) => s + (dynamicMonthlyCosts[n] || 0), 0);

              return (
                <div>
                  <SubHeading icon={Repeat}>שירותים חודשיים</SubHeading>
                  <p className="text-xs mb-4" style={{ color: "var(--prd-muted)" }}>בחרו שירותים חוזרים חודשיים שתרצו לכלול בפרויקט</p>
                  <div className="space-y-4">
                    {monthlyGroups.filter((g) => g.keys.length > 0).map((group) => {
                      const GIcon = group.icon;
                      return (
                        <div key={group.label} className="glass rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <GIcon size={14} style={{ color: "#00F0FF" }} />
                            <span className="text-xs font-bold" style={{ color: "var(--prd-heading)" }}>{group.label}</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {group.keys.map((name) => {
                              const cost = dynamicMonthlyCosts[name] || 0;
                              const selected = data.selectedMonthly.includes(name);
                              return (
                                <div
                                  key={name}
                                  onClick={() => update({ selectedMonthly: selected ? data.selectedMonthly.filter((n) => n !== name) : [...data.selectedMonthly, name] })}
                                  className="flex items-center justify-between py-2.5 px-3 rounded-xl cursor-pointer transition-all"
                                  style={{ backgroundColor: selected ? "rgba(0,240,255,0.08)" : "var(--prd-surface)", border: `0.5px solid ${selected ? "rgba(0,240,255,0.2)" : "var(--prd-border)"}` }}
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: selected ? "rgba(0,240,255,0.2)" : "transparent", border: `1.5px solid ${selected ? "#00F0FF" : "var(--prd-border)"}` }}>
                                      {selected && <Check size={10} style={{ color: "#00F0FF" }} />}
                                    </div>
                                    <span className="text-xs" style={{ color: selected ? "var(--prd-heading)" : "var(--prd-text)" }}>{name}</span>
                                  </div>
                                  <span className="text-xs font-mono font-bold" style={{ color: selected ? "#00F0FF" : "var(--prd-muted)" }} dir="ltr">{formatCurrency(cost)}<span className="text-[10px] font-normal">/חודש</span></span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {data.selectedMonthly.length > 0 && (
                    <div className="glass-inset rounded-xl p-4 mt-4 flex items-center justify-between">
                      <span className="text-xs font-bold" style={{ color: "var(--prd-heading)" }}>סה״כ חודשי ({data.selectedMonthly.length} שירותים)</span>
                      <span className="text-sm font-mono font-bold" style={{ color: "#00F0FF" }} dir="ltr">{formatCurrency(monthlyTotal)}<span className="text-xs font-normal">/חודש</span></span>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ─── Yearly services selection ─── */}
            {Object.keys(dynamicYearlyCosts).length > 0 && (() => {
              const yearlyGroups: { label: string; icon: React.ElementType; keys: string[] }[] = [
                { label: "דומיינים", icon: Globe, keys: [] },
                { label: "רישיונות", icon: Shield, keys: [] },
                { label: "ביקורות שנתיות", icon: Eye, keys: [] },
              ];
              const yearlyGroupMap: Record<string, number> = {
                "דומיין .co.il": 0, "דומיין .com": 0, "דומיין .io": 0,
                "רישיון תבנית / נושא": 1, "רישיון פלאגינים פרימיום": 1, "SSL Certificate (שנתי)": 1,
                "Google Workspace": 1, "שרת ייעודי": 1, "רישיון Shopify": 1, "רישיון Wix Premium": 1, "רישיון Webflow": 1,
                "ביקורת אבטחה שנתית": 2, "ביקורת נגישות שנתית": 2, "ביקורת SEO שנתית": 2,
              };
              Object.keys(dynamicYearlyCosts).forEach((k) => {
                const gi = yearlyGroupMap[k] ?? 1;
                yearlyGroups[gi].keys.push(k);
              });
              const yearlyTotal = data.selectedYearly.reduce((s, n) => s + (dynamicYearlyCosts[n] || 0), 0);

              return (
                <div>
                  <SubHeading icon={Calendar}>שירותים שנתיים</SubHeading>
                  <p className="text-xs mb-4" style={{ color: "var(--prd-muted)" }}>בחרו שירותים שנתיים שתרצו לכלול בפרויקט</p>
                  <div className="space-y-4">
                    {yearlyGroups.filter((g) => g.keys.length > 0).map((group) => {
                      const GIcon = group.icon;
                      return (
                        <div key={group.label} className="glass rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <GIcon size={14} style={{ color: "#FF6B6B" }} />
                            <span className="text-xs font-bold" style={{ color: "var(--prd-heading)" }}>{group.label}</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {group.keys.map((name) => {
                              const cost = dynamicYearlyCosts[name] || 0;
                              const monthly = Math.round(cost / 12);
                              const selected = data.selectedYearly.includes(name);
                              return (
                                <div
                                  key={name}
                                  onClick={() => update({ selectedYearly: selected ? data.selectedYearly.filter((n) => n !== name) : [...data.selectedYearly, name] })}
                                  className="flex items-center justify-between py-2.5 px-3 rounded-xl cursor-pointer transition-all"
                                  style={{ backgroundColor: selected ? "rgba(255,107,107,0.08)" : "var(--prd-surface)", border: `0.5px solid ${selected ? "rgba(255,107,107,0.2)" : "var(--prd-border)"}` }}
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: selected ? "rgba(255,107,107,0.2)" : "transparent", border: `1.5px solid ${selected ? "#FF6B6B" : "var(--prd-border)"}` }}>
                                      {selected && <Check size={10} style={{ color: "#FF6B6B" }} />}
                                    </div>
                                    <span className="text-xs" style={{ color: selected ? "var(--prd-heading)" : "var(--prd-text)" }}>{name}</span>
                                  </div>
                                  <div className="flex flex-col items-end">
                                    <span className="text-xs font-mono font-bold" style={{ color: selected ? "#FF6B6B" : "var(--prd-muted)" }} dir="ltr">{formatCurrency(cost)}<span className="text-[10px] font-normal">/שנה</span></span>
                                    <span className="text-[10px] font-mono" style={{ color: "var(--prd-muted)" }} dir="ltr">≈ {formatCurrency(monthly)}/חודש</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {data.selectedYearly.length > 0 && (
                    <div className="glass-inset rounded-xl p-4 mt-4 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold block" style={{ color: "var(--prd-heading)" }}>סה״כ שנתי ({data.selectedYearly.length} שירותים)</span>
                        <span className="text-[10px]" style={{ color: "var(--prd-muted)" }}>≈ {formatCurrency(Math.round(yearlyTotal / 12))}/חודש</span>
                      </div>
                      <span className="text-sm font-mono font-bold" style={{ color: "#FF6B6B" }} dir="ltr">{formatCurrency(yearlyTotal)}<span className="text-xs font-normal">/שנה</span></span>
                    </div>
                  )}
                </div>
              );
            })()}
          </motion.div>
        );

      /* ═══ TIMELINE ═══ */
      case "timeline":
        return (
          <motion.div {...fadeIn} className="space-y-6">
            <SubHeading icon={Calendar}>לוח זמנים ותקציב</SubHeading>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <SectionLabel>תאריך עלייה לאוויר רצוי</SectionLabel>
                <input type="date" value={data.launchDate} onChange={(e) => update({ launchDate: e.target.value })} className="prd-input" />
              </div>
              <div>
                <SectionLabel>דדליין</SectionLabel>
                <input type="date" value={data.deadline} onChange={(e) => update({ deadline: e.target.value })} className="prd-input" />
              </div>
            </div>

            <div>
              <SectionLabel>טווח תקציב</SectionLabel>
              <PillSelect options={BUDGET_RANGES} value={data.budgetRange} onChange={(v) => update({ budgetRange: v })} color="#00FF88" />
            </div>

            <div>
              <SectionLabel>צריך תחזוקה שוטפת?</SectionLabel>
              <PillSelect options={["כן", "לא", "אולי"]} value={data.maintenanceNeeded} onChange={(v) => update({ maintenanceNeeded: v as typeof data.maintenanceNeeded })} color="#FFD93D" />
            </div>

            <div className="flex items-center justify-between mt-4">
              <SubHeading icon={Flag}>שלבי פרויקט</SubHeading>
            </div>

            <button onClick={addPhase} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white transition-all" style={{ background: "linear-gradient(135deg, #6C63FF, #00F0FF)" }}>
              <Plus size={16} /> הוסף שלב
            </button>

            <AnimatePresence mode="popLayout">
              {data.phases.map((phase, i) => (
                <motion.div key={phase.id} {...stagger(i)} exit={{ opacity: 0, height: 0 }} layout className="glass rounded-xl p-4 sm:p-5 group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: "rgba(0,240,255,0.12)", color: "#00F0FF" }}>
                        {i + 1}
                      </div>
                      <input
                        type="text"
                        value={phase.name}
                        onChange={(e) => updatePhase(phase.id, { name: e.target.value })}
                        className="text-sm sm:text-base font-semibold bg-transparent border-none outline-none min-w-0 w-full"
                        style={{ color: "var(--prd-heading)" }}
                      />
                    </div>
                    <button onClick={() => deletePhase(phase.id)} className="p-2 rounded-xl opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all shrink-0" style={{ color: "#FF6B6B" }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider mb-1" style={{ color: "var(--prd-muted)" }}>התחלה</label>
                      <input type="date" value={phase.startDate} onChange={(e) => updatePhase(phase.id, { startDate: e.target.value })} className="prd-input text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider mb-1" style={{ color: "var(--prd-muted)" }}>סיום</label>
                      <input type="date" value={phase.endDate} onChange={(e) => updatePhase(phase.id, { endDate: e.target.value })} className="prd-input text-sm" />
                    </div>
                  </div>
                  <textarea value={phase.deliverables} onChange={(e) => updatePhase(phase.id, { deliverables: e.target.value })} placeholder="תוצרים ויעדים של השלב..." rows={2} className="prd-textarea text-sm" />
                  {/* Feature assignment */}
                  {data.selectedFeatures.length > 0 && (
                    <div className="mt-3 pt-3" style={{ borderTop: "0.5px solid var(--prd-border)" }}>
                      <p className="text-[10px] uppercase tracking-wider font-semibold mb-2" style={{ color: "var(--prd-muted)" }}>פיצ׳רים בשלב זה</p>
                      <div className="flex flex-wrap gap-1.5">
                        {data.selectedFeatures.map((f) => {
                          const assigned = (phase.featureNames || []).includes(f.name);
                          return (
                            <button
                              key={f.id}
                              onClick={() => {
                                const current = phase.featureNames || [];
                                const next = assigned ? current.filter((n) => n !== f.name) : [...current, f.name];
                                updatePhase(phase.id, { featureNames: next });
                              }}
                              className="pill flex items-center gap-1 transition-all text-[10px]"
                              style={{
                                backgroundColor: assigned ? "rgba(108,99,255,0.12)" : "transparent",
                                color: assigned ? "#6C63FF" : "var(--prd-muted)",
                                border: `1px solid ${assigned ? "rgba(108,99,255,0.3)" : "var(--prd-border)"}`,
                              }}
                            >
                              {assigned ? <Check size={8} /> : <Plus size={8} />} {f.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {data.phases.length === 0 && (
              <div className="glass-inset rounded-xl p-5 sm:p-8 text-center">
                <Calendar size={28} className="mx-auto mb-2 opacity-30" style={{ color: "var(--prd-muted)" }} />
                <p className="text-sm" style={{ color: "var(--prd-muted)" }}>טרם הוגדרו שלבי פרויקט</p>
                <p className="text-xs mt-1" style={{ color: "var(--prd-muted)", opacity: 0.6 }}>
                  לדוגמה: אפיון, עיצוב, פיתוח, תוכן, בדיקות, השקה
                </p>
              </div>
            )}

            {/* ─── Gantt Chart ─── */}
            {(() => {
              const phasesWithDates = data.phases.filter((p) => p.startDate && p.endDate);
              if (phasesWithDates.length === 0) return null;

              const allStarts = phasesWithDates.map((p) => new Date(p.startDate).getTime());
              const allEnds = phasesWithDates.map((p) => new Date(p.endDate).getTime());
              const ganttStart = Math.min(...allStarts);
              const ganttEnd = Math.max(...allEnds);
              const totalSpan = ganttEnd - ganttStart;

              if (totalSpan <= 0) return null;

              // Generate month markers
              const monthMarkers: { label: string; pos: number }[] = [];
              const startDate = new Date(ganttStart);
              const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
              while (cursor.getTime() <= ganttEnd) {
                const pos = ((cursor.getTime() - ganttStart) / totalSpan) * 100;
                if (pos >= 0 && pos <= 100) {
                  monthMarkers.push({
                    label: cursor.toLocaleDateString("he-IL", { month: "short", year: "2-digit" }),
                    pos,
                  });
                }
                cursor.setMonth(cursor.getMonth() + 1);
              }

              // Today marker
              const today = Date.now();
              const todayPos = today >= ganttStart && today <= ganttEnd ? ((today - ganttStart) / totalSpan) * 100 : null;

              const barColors = ["#00F0FF", "#6C63FF", "#00FF88", "#FFD93D", "#FF6B6B", "#FF85C0", "#FFA64D", "#85E0FF"];

              return (
                <div>
                  <SubHeading icon={BarChart3}>תצוגת גאנט</SubHeading>
                  <div className="glass rounded-2xl p-3 sm:p-5 overflow-x-auto">
                    <div className="min-w-[400px]">
                    {/* Month header */}
                    <div className="relative h-6 mb-2" style={{ marginRight: 80 }}>
                      {monthMarkers.map((m, i) => (
                        <span
                          key={i}
                          className="absolute text-[10px] font-semibold whitespace-nowrap"
                          style={{ right: `${m.pos}%`, transform: "translateX(50%)", color: "var(--prd-muted)" }}
                        >
                          {m.label}
                        </span>
                      ))}
                    </div>

                    {/* Rows */}
                    <div className="space-y-2">
                      {phasesWithDates.map((phase, i) => {
                        const pStart = new Date(phase.startDate).getTime();
                        const pEnd = new Date(phase.endDate).getTime();
                        const leftPct = ((pStart - ganttStart) / totalSpan) * 100;
                        const widthPct = Math.max(((pEnd - pStart) / totalSpan) * 100, 1);
                        const color = barColors[i % barColors.length];
                        const durationDays = Math.ceil((pEnd - pStart) / (1000 * 60 * 60 * 24));

                        return (
                          <div key={phase.id} className="flex items-center gap-2 sm:gap-3">
                            {/* Label */}
                            <div className="w-[80px] shrink-0 text-left">
                              <p className="text-xs font-semibold truncate" style={{ color: "var(--prd-heading)" }}>{phase.name || `שלב ${i + 1}`}</p>
                              <p className="text-[10px]" style={{ color: "var(--prd-muted)" }}>{durationDays} ימים</p>
                            </div>
                            {/* Bar track */}
                            <div className="flex-1 relative h-8 rounded-lg" style={{ backgroundColor: "var(--prd-surface)" }}>
                              {/* Grid lines */}
                              {monthMarkers.map((m, mi) => (
                                <div
                                  key={mi}
                                  className="absolute top-0 bottom-0 w-px"
                                  style={{ right: `${m.pos}%`, backgroundColor: "var(--prd-border)", opacity: 0.5 }}
                                />
                              ))}
                              {/* Bar */}
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${widthPct}%` }}
                                transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
                                className="absolute top-1 bottom-1 rounded-md flex items-center justify-center"
                                style={{
                                  right: `${leftPct}%`,
                                  background: `linear-gradient(135deg, ${color}, ${color}88)`,
                                  boxShadow: `0 2px 8px ${color}30`,
                                }}
                              >
                                {widthPct > 12 && (
                                  <span className="text-[10px] font-bold text-white whitespace-nowrap px-2 drop-shadow-sm">
                                    {phase.name || `שלב ${i + 1}`}
                                  </span>
                                )}
                              </motion.div>
                              {/* Today line */}
                              {todayPos !== null && (
                                <div
                                  className="absolute top-0 bottom-0 w-0.5 z-10"
                                  style={{ right: `${todayPos}%`, backgroundColor: "#FF6B6B" }}
                                >
                                  {i === 0 && (
                                    <span className="absolute -top-5 text-[9px] font-bold whitespace-nowrap" style={{ color: "#FF6B6B", transform: "translateX(50%)" }}>
                                      היום
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    </div>{/* end min-w wrapper */}
                    {/* Legend */}
                    <div className="flex items-center gap-3 sm:gap-4 mt-4 pt-3 flex-wrap" style={{ borderTop: "0.5px solid var(--prd-border)" }}>
                      <div className="flex items-center gap-4 flex-wrap">
                        {phasesWithDates.map((phase, i) => (
                          <div key={phase.id} className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: barColors[i % barColors.length] }} />
                            <span className="text-[10px]" style={{ color: "var(--prd-muted)" }}>{phase.name || `שלב ${i + 1}`}</span>
                          </div>
                        ))}
                      </div>
                      {todayPos !== null && (
                        <div className="flex items-center gap-1.5 mr-auto">
                          <div className="w-3 h-0.5 rounded" style={{ backgroundColor: "#FF6B6B" }} />
                          <span className="text-[10px]" style={{ color: "#FF6B6B" }}>היום</span>
                        </div>
                      )}
                    </div>

                    {/* Summary bar */}
                    <div className="glass-inset rounded-xl p-3 mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                      <div className="flex items-center gap-2">
                        <Clock size={12} style={{ color: "var(--prd-muted)" }} />
                        <span className="text-[10px] font-semibold" style={{ color: "var(--prd-muted)" }}>
                          משך כולל: {Math.ceil(totalSpan / (1000 * 60 * 60 * 24))} ימים
                        </span>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="text-[10px]" style={{ color: "var(--prd-muted)" }}>
                          {new Date(ganttStart).toLocaleDateString("he-IL")}
                        </span>
                        <span className="text-[10px]" style={{ color: "var(--prd-muted)" }}>→</span>
                        <span className="text-[10px]" style={{ color: "var(--prd-muted)" }}>
                          {new Date(ganttEnd).toLocaleDateString("he-IL")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ─── General Notes ─── */}
            <SubHeading icon={BookOpen}>הערות כלליות</SubHeading>
            <textarea
              value={data.generalNotes}
              onChange={(e) => update({ generalNotes: e.target.value })}
              placeholder="כל דבר נוסף שחשוב לציין — העדפות, מגבלות, דגשים מיוחדים, מידע שלא נכלל בשדות האחרים..."
              rows={4}
              className="prd-textarea"
            />
          </motion.div>
        );

      /* ═══ SUMMARY ═══ */
      case "summary": {
        const baseCost = data.siteType ? (dynamicBaseCosts[data.siteType] || 2000) : 0;
        const featuresTotalCost = data.selectedFeatures.reduce((sum, f) => sum + (f.estimatedCost || 0), 0);
        const designExtra = data.hasLogo === "צריך עיצוב" ? (dynamicExtrasCosts["עיצוב לוגו"] || 2500) : 0;
        const copyExtra = data.needsCopywriting === "כן" ? (dynamicExtrasCosts["קופירייטינג מלא"] || 3000) : data.needsCopywriting === "חלקית" ? (dynamicExtrasCosts["קופירייטינג חלקי"] || 1500) : 0;
        const seoExtra = data.targetKeywords.length > 0 ? (dynamicExtrasCosts["SEO בסיסי"] || 2000) : 0;
        const multiLangExtra = data.contentLanguages.length > 1 ? (data.contentLanguages.length - 1) * (dynamicExtrasCosts["שפה נוספת (לשפה)"] || 2500) : 0;
        const calcMonthlyServices = data.selectedMonthly.reduce((s, name) => s + (dynamicMonthlyCosts[name] || 0), 0);
        const calcYearlyServices = data.selectedYearly.reduce((s, name) => s + (dynamicYearlyCosts[name] || 0), 0);
        const extrasTotal = featuresTotalCost + designExtra + copyExtra + seoExtra + multiLangExtra;

        const calcMonthly = calcMonthlyServices + Math.round(extrasTotal / 12);
        const calcYearly = calcYearlyServices + calcMonthlyServices * 12 + extrasTotal;

        const displayOneTime = data.finalPriceOverride ?? baseCost;
        const displayMonthly = data.finalMonthlyOverride ?? calcMonthly;
        const displayYearly = data.finalYearlyOverride ?? calcYearly;

        const firstYearTotal = displayOneTime + displayYearly;

        return (
          <motion.div {...fadeIn} className="space-y-6">
            {/* ─── Pricing hero ─── */}
            <div className="glass-heavy rounded-2xl overflow-hidden">
              {/* Side-by-side: project cost (right) | recurring total (left) */}
              <div className="grid grid-cols-1 sm:grid-cols-2" style={{ minHeight: 120 }}>
                {/* Right — project cost */}
                <div className="p-4 sm:p-5 text-center relative group/main flex flex-col justify-center" style={{ background: "linear-gradient(180deg, rgba(0,255,136,0.06) 0%, transparent 100%)", borderLeft: "0.5px solid var(--prd-border)", borderBottom: "0.5px solid var(--prd-border)" }}>
                  <p className="text-[10px] uppercase tracking-widest mb-2 font-semibold" style={{ color: "var(--prd-muted)" }}>עלות הקמת הפרויקט</p>
                  <div className="flex items-center justify-center gap-1.5">
                    {data.finalPriceOverride !== null ? (
                      <input
                        type="number"
                        value={data.finalPriceOverride}
                        onChange={(e) => update({ finalPriceOverride: e.target.value === "" ? null : Number(e.target.value) })}
                        className="text-2xl sm:text-3xl font-black font-mono leading-none text-center bg-transparent border-none outline-none w-full"
                        style={{ color: "#00FF88" }}
                        dir="ltr"
                      />
                    ) : (
                      <p className="text-2xl sm:text-3xl font-black font-mono leading-none" style={{ color: "#00FF88" }} dir="ltr">{formatCurrency(baseCost)}</p>
                    )}
                    <button
                      onClick={() => update({ finalPriceOverride: data.finalPriceOverride !== null ? null : baseCost })}
                      className="p-1 rounded-lg transition-all opacity-0 group-hover/main:opacity-100 shrink-0"
                      style={{ backgroundColor: "rgba(0,255,136,0.1)", color: "#00FF88" }}
                      title={data.finalPriceOverride !== null ? "חזור לחישוב אוטומטי" : "ערוך מחיר סופי"}
                    >
                      {data.finalPriceOverride !== null ? <RotateCcw size={12} /> : <Pencil size={12} />}
                    </button>
                  </div>
                  {data.finalPriceOverride !== null && (
                    <p className="text-[10px] mt-1" style={{ color: "#00FF88", opacity: 0.7 }}>מקור: {formatCurrency(baseCost)}</p>
                  )}
                  <p className="text-[10px] mt-1.5" style={{ color: "var(--prd-muted)" }}>
                    {data.siteType ? `${data.siteType} — חד-פעמי` : "בחרו סוג אתר"}
                  </p>
                </div>

                {/* Left — recurring total with toggle */}
                <div className="p-4 sm:p-5 text-center flex flex-col justify-center">
                  {/* Toggle */}
                  <div className="flex items-center justify-center gap-1.5 mb-3 rounded-xl p-1" style={{ backgroundColor: "var(--prd-surface)" }}>
                    <button
                      onClick={() => setRecurringView("monthly")}
                      className="flex-1 py-2 rounded-lg text-xs font-bold transition-all"
                      style={{
                        backgroundColor: recurringView === "monthly" ? "rgba(0,240,255,0.15)" : "transparent",
                        color: recurringView === "monthly" ? "#00F0FF" : "var(--prd-muted)",
                        border: recurringView === "monthly" ? "0.5px solid rgba(0,240,255,0.25)" : "0.5px solid transparent",
                        boxShadow: recurringView === "monthly" ? "0 2px 8px rgba(0,240,255,0.1)" : "none",
                      }}
                    >
                      חודשי
                    </button>
                    <button
                      onClick={() => setRecurringView("yearly")}
                      className="flex-1 py-2 rounded-lg text-xs font-bold transition-all"
                      style={{
                        backgroundColor: recurringView === "yearly" ? "rgba(255,107,107,0.15)" : "transparent",
                        color: recurringView === "yearly" ? "#FF6B6B" : "var(--prd-muted)",
                        border: recurringView === "yearly" ? "0.5px solid rgba(255,107,107,0.25)" : "0.5px solid transparent",
                        boxShadow: recurringView === "yearly" ? "0 2px 8px rgba(255,107,107,0.1)" : "none",
                      }}
                    >
                      שנתי
                    </button>
                  </div>

                  {recurringView === "monthly" ? (
                    <div className="relative group/mo">
                      <div className="flex items-center justify-center gap-1.5">
                        {data.finalMonthlyOverride !== null ? (
                          <input
                            type="number"
                            value={data.finalMonthlyOverride}
                            onChange={(e) => update({ finalMonthlyOverride: e.target.value === "" ? null : Number(e.target.value) })}
                            className="text-2xl sm:text-3xl font-black font-mono text-center bg-transparent border-none outline-none w-full"
                            style={{ color: "#00F0FF" }}
                            dir="ltr"
                          />
                        ) : (
                          <p className="text-2xl sm:text-3xl font-black font-mono leading-none" style={{ color: calcMonthly > 0 ? "#00F0FF" : "var(--prd-muted)" }} dir="ltr">
                            {formatCurrency(calcMonthly)}
                          </p>
                        )}
                        <button
                          onClick={() => update({ finalMonthlyOverride: data.finalMonthlyOverride !== null ? null : calcMonthly })}
                          className="p-1 rounded-lg transition-all opacity-0 group-hover/mo:opacity-100 shrink-0"
                          style={{ backgroundColor: "rgba(0,240,255,0.1)", color: "#00F0FF" }}
                        >
                          {data.finalMonthlyOverride !== null ? <RotateCcw size={12} /> : <Pencil size={12} />}
                        </button>
                      </div>
                      {data.finalMonthlyOverride !== null && (
                        <p className="text-[10px] mt-1" style={{ color: "#00F0FF", opacity: 0.6 }}>מקור: {formatCurrency(calcMonthly)}</p>
                      )}
                      <p className="text-[10px] mt-1.5" style={{ color: "var(--prd-muted)" }}>
                        {extrasTotal > 0 ? `כולל פיצ׳רים + שירותים` : data.selectedMonthly.length > 0 ? `${data.selectedMonthly.length} שירותים / חודש` : "סה״כ חודשי"}
                      </p>
                    </div>
                  ) : (
                    <div className="relative group/yr">
                      <div className="flex items-center justify-center gap-1.5">
                        {data.finalYearlyOverride !== null ? (
                          <input
                            type="number"
                            value={data.finalYearlyOverride}
                            onChange={(e) => update({ finalYearlyOverride: e.target.value === "" ? null : Number(e.target.value) })}
                            className="text-2xl sm:text-3xl font-black font-mono text-center bg-transparent border-none outline-none w-full"
                            style={{ color: "#FF6B6B" }}
                            dir="ltr"
                          />
                        ) : (
                          <p className="text-2xl sm:text-3xl font-black font-mono leading-none" style={{ color: calcYearly > 0 ? "#FF6B6B" : "var(--prd-muted)" }} dir="ltr">
                            {formatCurrency(calcYearly)}
                          </p>
                        )}
                        <button
                          onClick={() => update({ finalYearlyOverride: data.finalYearlyOverride !== null ? null : calcYearly })}
                          className="p-1 rounded-lg transition-all opacity-0 group-hover/yr:opacity-100 shrink-0"
                          style={{ backgroundColor: "rgba(255,107,107,0.1)", color: "#FF6B6B" }}
                        >
                          {data.finalYearlyOverride !== null ? <RotateCcw size={12} /> : <Pencil size={12} />}
                        </button>
                      </div>
                      {data.finalYearlyOverride !== null && (
                        <p className="text-[10px] mt-1" style={{ color: "#FF6B6B", opacity: 0.6 }}>מקור: {formatCurrency(calcYearly)}</p>
                      )}
                      <p className="text-[10px] mt-1.5" style={{ color: "var(--prd-muted)" }}>
                        {extrasTotal > 0 ? `כולל פיצ׳רים + שירותים` : (data.selectedYearly.length + data.selectedMonthly.length) > 0 ? `${data.selectedYearly.length + data.selectedMonthly.length} שירותים / שנה` : "סה״כ שנתי (כולל חודשי)"}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* First year total */}
              <div className="px-4 sm:px-5 py-3 flex items-center justify-between" style={{ background: "linear-gradient(90deg, rgba(108,99,255,0.08), rgba(0,240,255,0.08))", borderTop: "0.5px solid var(--prd-border)" }}>
                <span className="text-xs font-bold" style={{ color: "var(--prd-heading)" }}>עלות שנה ראשונה כוללת</span>
                <span className="text-sm sm:text-base font-black font-mono" style={{ color: "#6C63FF" }} dir="ltr">
                  {formatCurrency(firstYearTotal)}
                </span>
              </div>
            </div>

            <p className="text-[10px] text-center -mt-3" style={{ color: "var(--prd-muted)" }}>
              * לחצו על העיפרון כדי לערוך את המחיר הסופי — {data.finalPriceOverride !== null || data.finalMonthlyOverride !== null || data.finalYearlyOverride !== null ? "מחירים ידניים פעילים" : "כרגע מוצג חישוב אוטומטי"}
            </p>

            {/* ─── What's included in monthly/yearly ─── */}
            {(extrasTotal > 0 || calcMonthlyServices > 0 || calcYearlyServices > 0) && (
              <div className="glass rounded-xl p-3 sm:p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs sm:text-sm font-bold" style={{ color: "var(--prd-heading)" }}>פירוט המחיר החודשי/שנתי</h4>
                </div>
                <div className="space-y-0.5">
                  {/* Features included in price */}
                  {data.selectedFeatures.length > 0 && (
                    <>
                      <div className="flex items-center gap-2 py-1.5 px-3">
                        <Zap size={12} style={{ color: "#6C63FF" }} />
                        <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "var(--prd-muted)" }}>פיצ׳רים ({data.selectedFeatures.length})</span>
                        <span className="text-[10px] font-mono mr-auto" style={{ color: "#6C63FF" }} dir="ltr">{formatCurrency(featuresTotalCost)}</span>
                      </div>
                      {data.selectedFeatures.map((f) => (
                          <div key={f.id} className="flex items-center justify-between py-1.5 px-3 mr-4 rounded-lg">
                            <span className="text-xs truncate" style={{ color: "var(--prd-text)" }}>{f.name}</span>
                            <span className="text-[10px] font-mono shrink-0 mr-2" style={{ color: "var(--prd-muted)" }} dir="ltr">{formatCurrency(f.estimatedCost)}</span>
                          </div>
                      ))}
                    </>
                  )}
                  {/* Non-feature extras */}
                  {[
                    { label: "עיצוב לוגו", amount: designExtra, icon: Palette },
                    { label: "קופירייטינג", amount: copyExtra, icon: Type },
                    { label: "SEO בסיסי", amount: seoExtra, icon: TrendingUp },
                    { label: `רב-שפתיות (${data.contentLanguages.length} שפות)`, amount: multiLangExtra, icon: Globe },
                  ].filter(r => r.amount > 0).map((row) => {
                    const Icon = row.icon;
                    return (
                      <div key={row.label} className="flex items-center justify-between py-1.5 px-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Icon size={12} style={{ color: "#6C63FF" }} />
                          <span className="text-xs" style={{ color: "var(--prd-text)" }}>{row.label}</span>
                        </div>
                        <span className="text-[10px] font-mono mr-2" style={{ color: "var(--prd-muted)" }} dir="ltr">{formatCurrency(row.amount)}</span>
                      </div>
                    );
                  })}
                  {/* Monthly services */}
                  {data.selectedMonthly.length > 0 && (
                    <>
                      <div className="flex items-center gap-2 py-1.5 px-3 mt-2" style={{ borderTop: "0.5px solid var(--prd-border)" }}>
                        <Repeat size={12} style={{ color: "#00F0FF" }} />
                        <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "var(--prd-muted)" }}>שירותים חודשיים ({data.selectedMonthly.length})</span>
                        <span className="text-[10px] font-mono mr-auto" style={{ color: "#00F0FF" }} dir="ltr">{formatCurrency(calcMonthlyServices)}/חודש</span>
                      </div>
                      {data.selectedMonthly.map((name) => (
                        <div key={name} className="flex items-center justify-between py-1.5 px-3 mr-4 rounded-lg">
                          <span className="text-xs" style={{ color: "var(--prd-text)" }}>{name}</span>
                          <span className="text-[10px] font-mono" style={{ color: "var(--prd-muted)" }} dir="ltr">{formatCurrency(dynamicMonthlyCosts[name] || 0)}/חודש</span>
                        </div>
                      ))}
                    </>
                  )}
                  {/* Yearly services */}
                  {data.selectedYearly.length > 0 && (
                    <>
                      <div className="flex items-center gap-2 py-1.5 px-3 mt-2" style={{ borderTop: "0.5px solid var(--prd-border)" }}>
                        <Calendar size={12} style={{ color: "#FF6B6B" }} />
                        <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "var(--prd-muted)" }}>שירותים שנתיים ({data.selectedYearly.length})</span>
                        <span className="text-[10px] font-mono mr-auto" style={{ color: "#FF6B6B" }} dir="ltr">{formatCurrency(calcYearlyServices)}/שנה</span>
                      </div>
                      {data.selectedYearly.map((name) => (
                        <div key={name} className="flex items-center justify-between py-1.5 px-3 mr-4 rounded-lg">
                          <span className="text-xs" style={{ color: "var(--prd-text)" }}>{name}</span>
                          <span className="text-[10px] font-mono" style={{ color: "var(--prd-muted)" }} dir="ltr">{formatCurrency(dynamicYearlyCosts[name] || 0)}/שנה</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* ─── Sections status ─── */}
            <div className="glass rounded-xl p-3 sm:p-5">
              <h4 className="text-sm font-bold mb-4" style={{ color: "var(--prd-heading)" }}>סטטוס סעיפים</h4>
              <div className="grid grid-cols-2 gap-x-3 sm:gap-x-4 gap-y-2">
                {[
                  { label: "עמודים", value: data.pages.length, icon: Layout, color: "#00F0FF" },
                  { label: "פיצ׳רים", value: data.selectedFeatures.length, icon: Zap, color: "#6C63FF" },
                  { label: "שפות", value: data.contentLanguages.length, icon: Type, color: "#00FF88" },
                  { label: "שלבים", value: data.phases.length, icon: Calendar, color: "#FFD93D" },
                  { label: "מתחרים", value: data.competitors.length, icon: Target, color: "#FF6B6B" },
                  { label: "רשתות", value: Object.keys(data.socialMedia).length, icon: Megaphone, color: "#6C63FF" },
                ].map((s) => {
                  const Icon = s.icon;
                  return (
                    <div key={s.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon size={13} style={{ color: s.color }} />
                        <span className="text-xs" style={{ color: "var(--prd-muted)" }}>{s.label}</span>
                      </div>
                      <span className="text-sm font-mono font-bold" style={{ color: s.value > 0 ? s.color : "var(--prd-muted)" }}>{s.value}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ─── Key decisions summary ─── */}
            <div className="glass rounded-xl p-3 sm:p-5">
              <h4 className="text-sm font-bold mb-4" style={{ color: "var(--prd-heading)" }}>החלטות עיקריות</h4>
              <div className="space-y-2">
                {[
                  { q: "סגנון עיצוב", a: data.stylePreference, icon: Palette },
                  { q: "לוגו", a: data.hasLogo, icon: Image },
                  { q: "רספונסיבי", a: data.responsiveDesign ? "כן" : "לא", icon: Smartphone },
                  { q: "SSL", a: data.sslNeeded ? "כן" : "לא", icon: Lock },
                  { q: "קופירייטינג", a: data.needsCopywriting, icon: Type },
                  { q: "צילום", a: data.needsPhotography, icon: Image },
                  { q: "Google Analytics", a: data.googleAnalytics ? "כן" : "לא", icon: BarChart3 },
                  { q: "שיווק במייל", a: data.emailMarketing, icon: Mail },
                  { q: "תחזוקה שוטפת", a: data.maintenanceNeeded, icon: Settings },
                ].filter((item) => item.a).map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.q} className="flex items-center justify-between py-1.5">
                      <div className="flex items-center gap-2">
                        <Icon size={12} style={{ color: "var(--prd-muted)" }} />
                        <span className="text-xs" style={{ color: "var(--prd-muted)" }}>{item.q}</span>
                      </div>
                      <span className="text-xs font-semibold" style={{ color: "var(--prd-heading)" }}>{item.a}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ─── A4 Preview ─── */}
            <div className="glass rounded-xl p-3 sm:p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-4">
                <h4 className="text-sm font-bold" style={{ color: "var(--prd-heading)" }}>תצוגה מקדימה — מסמך אפיון</h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const el = document.getElementById("a4-preview");
                      if (!el) return;
                      const printWin = window.open("", "_blank");
                      if (!printWin) return;
                      printWin.document.write(`<!DOCTYPE html><html lang="he" dir="rtl"><head><meta charset="UTF-8"><title>${data.projectName || "מסמך אפיון"}</title><style>@page{size:A4;margin:12mm}*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a2e;font-size:11px;line-height:1.6;direction:rtl}h1{font-size:20px;font-weight:800;margin-bottom:4px}h2{font-size:13px;font-weight:700;color:#6C63FF;margin:16px 0 8px;padding-bottom:4px;border-bottom:1.5px solid #eee}h3{font-size:11px;font-weight:600;margin:8px 0 4px}.header{text-align:center;padding:16px 0;border-bottom:2px solid #6C63FF;margin-bottom:16px}.meta{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:12px}.meta-item{background:#f8f9fa;border-radius:6px;padding:6px 10px}.meta-item .label{font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#888}.meta-item .value{font-size:11px;font-weight:600;color:#1a1a2e}.tag{display:inline-block;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:500;margin:2px}.tag-must{background:#fde8e8;color:#e53e3e}.tag-nice{background:#fef6e0;color:#d69e2e}.tag-future{background:#e6ffed;color:#38a169}.cost-row{display:flex;justify-content:space-between;padding:4px 0;border-bottom:0.5px solid #f0f0f0}.cost-row:last-child{border:none}.total-row{font-weight:700;border-top:2px solid #1a1a2e;margin-top:4px;padding-top:6px}.price-hero{text-align:center;background:linear-gradient(135deg,#f0f0ff,#e8faf0);border-radius:10px;padding:16px;margin:12px 0}.price-hero .amount{font-size:28px;font-weight:900;font-family:monospace;color:#1a1a2e}.price-hero .sub{font-size:10px;color:#666;margin-top:4px}.recurring{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:8px 0}.recurring-box{text-align:center;background:#f8f9fa;border-radius:8px;padding:10px}.recurring-box .amount{font-size:16px;font-weight:800;font-family:monospace}.page-list{columns:2;column-gap:12px}.page-item{break-inside:avoid;background:#f8f9fa;border-radius:6px;padding:6px 8px;margin-bottom:4px}.feature-grid{display:grid;grid-template-columns:1fr 1fr;gap:4px}.feature-item{background:#f8f9fa;border-radius:6px;padding:5px 8px;display:flex;justify-content:space-between;align-items:center}.service-item{display:flex;justify-content:space-between;padding:3px 0;font-size:10px}.footer{margin-top:20px;padding-top:10px;border-top:1px solid #eee;text-align:center;color:#888;font-size:9px}</style></head><body>${el.innerHTML}<div class="footer">מסמך זה נוצר אוטומטית מתוך מערכת אפיון אתרים | ${new Date().toLocaleDateString("he-IL")}</div></body></html>`);
                      printWin.document.close();
                      setTimeout(() => { printWin.print(); }, 300);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
                    style={{ backgroundColor: "rgba(255,107,107,0.1)", color: "#FF6B6B", border: "0.5px solid rgba(255,107,107,0.2)" }}
                  >
                    <Printer size={12} /> PDF / הדפסה
                  </button>
                  <button
                    onClick={() => {
                      const el = document.getElementById("a4-preview");
                      if (!el) return;
                      const html = `<!DOCTYPE html><html lang="he" dir="rtl"><head><meta charset="UTF-8"><title>${data.projectName || "מסמך אפיון"}</title><style>@page{size:A4;margin:12mm}*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a2e;font-size:11px;line-height:1.6;direction:rtl;max-width:210mm;margin:0 auto;padding:20px}h1{font-size:20px;font-weight:800;margin-bottom:4px}h2{font-size:13px;font-weight:700;color:#6C63FF;margin:16px 0 8px;padding-bottom:4px;border-bottom:1.5px solid #eee}h3{font-size:11px;font-weight:600;margin:8px 0 4px}.header{text-align:center;padding:16px 0;border-bottom:2px solid #6C63FF;margin-bottom:16px}.meta{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:12px}.meta-item{background:#f8f9fa;border-radius:6px;padding:6px 10px}.meta-item .label{font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#888}.meta-item .value{font-size:11px;font-weight:600}.tag{display:inline-block;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:500;margin:2px}.tag-must{background:#fde8e8;color:#e53e3e}.tag-nice{background:#fef6e0;color:#d69e2e}.tag-future{background:#e6ffed;color:#38a169}.cost-row{display:flex;justify-content:space-between;padding:4px 0;border-bottom:0.5px solid #f0f0f0}.total-row{font-weight:700;border-top:2px solid #1a1a2e;margin-top:4px;padding-top:6px}.price-hero{text-align:center;background:linear-gradient(135deg,#f0f0ff,#e8faf0);border-radius:10px;padding:16px;margin:12px 0}.price-hero .amount{font-size:28px;font-weight:900;font-family:monospace}.recurring{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:8px 0}.recurring-box{text-align:center;background:#f8f9fa;border-radius:8px;padding:10px}.recurring-box .amount{font-size:16px;font-weight:800;font-family:monospace}.page-list{columns:2;column-gap:12px}.page-item{break-inside:avoid;background:#f8f9fa;border-radius:6px;padding:6px 8px;margin-bottom:4px}.feature-grid{display:grid;grid-template-columns:1fr 1fr;gap:4px}.feature-item{background:#f8f9fa;border-radius:6px;padding:5px 8px;display:flex;justify-content:space-between}.service-item{display:flex;justify-content:space-between;padding:3px 0;font-size:10px}.footer{margin-top:20px;padding-top:10px;border-top:1px solid #eee;text-align:center;color:#888;font-size:9px}</style></head><body>${el.innerHTML}<div class="footer">מסמך זה נוצר אוטומטית מתוך מערכת אפיון אתרים | ${new Date().toLocaleDateString("he-IL")}</div></body></html>`;
                      const blob = new Blob([html], { type: "text/html" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `${data.projectName || "אפיון-אתר"}.html`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
                    style={{ backgroundColor: "rgba(0,240,255,0.1)", color: "#00F0FF", border: "0.5px solid rgba(0,240,255,0.2)" }}
                  >
                    <Globe size={12} /> HTML
                  </button>
                </div>
              </div>

              {/* A4 white page preview */}
              <div className="overflow-auto rounded-lg" style={{ maxHeight: 600, border: "1px solid #ddd" }}>
                <div
                  id="a4-preview"
                  className="w-full sm:w-auto"
                  style={{
                    maxWidth: "210mm",
                    minHeight: "auto",
                    background: "#fff",
                    color: "#1a1a2e",
                    padding: "6mm 4mm",
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                    fontSize: 11,
                    lineHeight: 1.6,
                    direction: "rtl",
                  }}
                >
                  {/* Header */}
                  <div style={{ textAlign: "center", paddingBottom: 16, borderBottom: "2px solid #6C63FF", marginBottom: 16 }}>
                    <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4, color: "#1a1a2e" }}>
                      {data.projectName || "מסמך אפיון אתר"}
                    </h1>
                    <p style={{ fontSize: 11, color: "#666" }}>
                      {data.clientName && `${data.clientName} | `}{data.siteType || "אתר"} | {new Date().toLocaleDateString("he-IL")}
                    </p>
                  </div>

                  {/* Project meta */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 12 }}>
                    {[
                      { label: "שם הפרויקט", value: data.projectName },
                      { label: "לקוח", value: data.clientName },
                      { label: "סוג אתר", value: data.siteType },
                      { label: "סוג עסק", value: data.businessType },
                      { label: "CMS", value: data.cmsPreference },
                      { label: "דומיין", value: data.domainName || data.domainStatus },
                      { label: "שפות", value: data.contentLanguages.join(", ") },
                      { label: "דדליין", value: data.deadline },
                    ].filter(i => i.value).map((item) => (
                      <div key={item.label} style={{ background: "#f8f9fa", borderRadius: 6, padding: "6px 10px" }}>
                        <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1, color: "#888" }}>{item.label}</div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#1a1a2e" }}>{item.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Content description */}
                  {data.contentDescription && (
                    <>
                      <h2 style={{ fontSize: 13, fontWeight: 700, color: "#6C63FF", margin: "16px 0 8px", paddingBottom: 4, borderBottom: "1.5px solid #eee" }}>תיאור האתר</h2>
                      <p style={{ fontSize: 11, color: "#333", whiteSpace: "pre-wrap" }}>{data.contentDescription}</p>
                    </>
                  )}

                  {/* Target audience */}
                  {(data.audienceAge || data.audienceLocation || data.audienceGender || data.audienceInterests) && (
                    <>
                      <h2 style={{ fontSize: 13, fontWeight: 700, color: "#6C63FF", margin: "16px 0 8px", paddingBottom: 4, borderBottom: "1.5px solid #eee" }}>קהל יעד</h2>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                        {data.audienceGender && (
                          <div style={{ background: "#f8f9fa", borderRadius: 6, padding: "6px 10px" }}>
                            <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1, color: "#888" }}>מגדר</div>
                            <div style={{ fontSize: 11, fontWeight: 600 }}>{data.audienceGender}</div>
                          </div>
                        )}
                        {data.audienceAge && (
                          <div style={{ background: "#f8f9fa", borderRadius: 6, padding: "6px 10px" }}>
                            <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1, color: "#888" }}>טווח גילאים</div>
                            <div style={{ fontSize: 11, fontWeight: 600 }}>{data.audienceAge}</div>
                          </div>
                        )}
                        {data.audienceLocation && (
                          <div style={{ background: "#f8f9fa", borderRadius: 6, padding: "6px 10px" }}>
                            <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1, color: "#888" }}>מיקום</div>
                            <div style={{ fontSize: 11, fontWeight: 600 }}>{data.audienceLocation}</div>
                          </div>
                        )}
                        {data.audienceInterests && (
                          <div style={{ background: "#f8f9fa", borderRadius: 6, padding: "6px 10px" }}>
                            <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1, color: "#888" }}>תחומי עניין</div>
                            <div style={{ fontSize: 11, fontWeight: 600 }}>{data.audienceInterests}</div>
                          </div>
                        )}
                        {data.audiencePainPoints && (
                          <div style={{ background: "#f8f9fa", borderRadius: 6, padding: "6px 10px" }}>
                            <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1, color: "#888" }}>נקודות כאב</div>
                            <div style={{ fontSize: 11, fontWeight: 600 }}>{data.audiencePainPoints}</div>
                          </div>
                        )}
                        {data.audienceDevices.length > 0 && (
                          <div style={{ background: "#f8f9fa", borderRadius: 6, padding: "6px 10px" }}>
                            <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1, color: "#888" }}>מכשירים</div>
                            <div style={{ fontSize: 11, fontWeight: 600 }}>{data.audienceDevices.join(", ")}</div>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* Design */}
                  {(data.stylePreference || data.primaryColor || data.secondaryColor || data.moodKeywords.length > 0) && (
                    <>
                      <h2 style={{ fontSize: 13, fontWeight: 700, color: "#6C63FF", margin: "16px 0 8px", paddingBottom: 4, borderBottom: "1.5px solid #eee" }}>עיצוב ותוכן</h2>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                        {data.stylePreference && (
                          <div style={{ background: "#f8f9fa", borderRadius: 6, padding: "6px 10px" }}>
                            <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1, color: "#888" }}>סגנון</div>
                            <div style={{ fontSize: 11, fontWeight: 600 }}>{data.stylePreference}</div>
                          </div>
                        )}
                        {data.hasLogo && (
                          <div style={{ background: "#f8f9fa", borderRadius: 6, padding: "6px 10px" }}>
                            <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1, color: "#888" }}>לוגו</div>
                            <div style={{ fontSize: 11, fontWeight: 600 }}>{data.hasLogo}</div>
                          </div>
                        )}
                        {data.primaryColor && (
                          <div style={{ background: "#f8f9fa", borderRadius: 6, padding: "6px 10px" }}>
                            <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1, color: "#888" }}>צבע ראשי</div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <div style={{ width: 14, height: 14, borderRadius: 3, background: data.primaryColor, border: "1px solid #ddd" }} />
                              <span style={{ fontSize: 11, fontWeight: 600 }}>{data.primaryColor}</span>
                            </div>
                          </div>
                        )}
                        {data.secondaryColor && (
                          <div style={{ background: "#f8f9fa", borderRadius: 6, padding: "6px 10px" }}>
                            <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1, color: "#888" }}>צבע משני</div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <div style={{ width: 14, height: 14, borderRadius: 3, background: data.secondaryColor, border: "1px solid #ddd" }} />
                              <span style={{ fontSize: 11, fontWeight: 600 }}>{data.secondaryColor}</span>
                            </div>
                          </div>
                        )}
                        {data.needsCopywriting && (
                          <div style={{ background: "#f8f9fa", borderRadius: 6, padding: "6px 10px" }}>
                            <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1, color: "#888" }}>קופירייטינג</div>
                            <div style={{ fontSize: 11, fontWeight: 600 }}>{data.needsCopywriting}</div>
                          </div>
                        )}
                        {data.needsPhotography && (
                          <div style={{ background: "#f8f9fa", borderRadius: 6, padding: "6px 10px" }}>
                            <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1, color: "#888" }}>צילום</div>
                            <div style={{ fontSize: 11, fontWeight: 600 }}>{data.needsPhotography}</div>
                          </div>
                        )}
                      </div>
                      {data.moodKeywords.length > 0 && (
                        <div style={{ marginTop: 6 }}>
                          <span style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1, color: "#888" }}>מילות אווירה: </span>
                          {data.moodKeywords.split(/[,،、\s]+/).filter(Boolean).map((k: string) => (
                            <span key={k} style={{ display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 500, margin: 2, background: "#f0f0ff", color: "#6C63FF" }}>{k}</span>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {/* Pages */}
                  {data.pages.length > 0 && (
                    <>
                      <h2 style={{ fontSize: 13, fontWeight: 700, color: "#6C63FF", margin: "16px 0 8px", paddingBottom: 4, borderBottom: "1.5px solid #eee" }}>מבנה ודפים ({data.pages.length})</h2>
                      <div style={{ columns: 2, columnGap: 12 }}>
                        {data.pages.map((page) => (
                          <div key={page.id} style={{ breakInside: "avoid", background: "#f8f9fa", borderRadius: 6, padding: "6px 8px", marginBottom: 4 }}>
                            <div style={{ fontWeight: 600, fontSize: 11 }}>{page.name}{page.isMainNav && <span style={{ fontSize: 9, color: "#6C63FF", marginRight: 4 }}> (ניווט ראשי)</span>}</div>
                            {page.description && <div style={{ fontSize: 10, color: "#666" }}>{page.description}</div>}
                            {page.subPages.length > 0 && <div style={{ fontSize: 10, color: "#888", marginTop: 2 }}>עמודי משנה: {page.subPages.join(", ")}</div>}
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Features */}
                  {data.selectedFeatures.length > 0 && (
                    <>
                      <h2 style={{ fontSize: 13, fontWeight: 700, color: "#6C63FF", margin: "16px 0 8px", paddingBottom: 4, borderBottom: "1.5px solid #eee" }}>פונקציונליות ({data.selectedFeatures.length})</h2>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                        {data.selectedFeatures.map((f) => (
                          <div key={f.id} style={{ background: "#f8f9fa", borderRadius: 6, padding: "5px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 11 }}>{f.name}</span>
                            <span style={{ fontSize: 10, fontFamily: "monospace", fontWeight: 600, direction: "ltr" }}>{formatCurrency(f.estimatedCost)}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Technical */}
                  <h2 style={{ fontSize: 13, fontWeight: 700, color: "#6C63FF", margin: "16px 0 8px", paddingBottom: 4, borderBottom: "1.5px solid #eee" }}>טכני ו-SEO</h2>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                    {[
                      { label: "CMS", value: data.cmsPreference },
                      { label: "SSL", value: data.sslNeeded ? "כן" : "לא" },
                      { label: "רספונסיבי", value: data.responsiveDesign ? "כן" : "לא" },
                      { label: "Google Analytics", value: data.googleAnalytics ? "כן" : "לא" },
                      { label: "שיווק במייל", value: data.emailMarketing },
                      { label: "דומיין", value: data.domainName || data.domainStatus },
                    ].filter(i => i.value).map((item) => (
                      <div key={item.label} style={{ background: "#f8f9fa", borderRadius: 6, padding: "6px 10px" }}>
                        <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1, color: "#888" }}>{item.label}</div>
                        <div style={{ fontSize: 11, fontWeight: 600 }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                  {data.targetKeywords && (
                    <div style={{ marginTop: 6, background: "#f8f9fa", borderRadius: 6, padding: "6px 10px" }}>
                      <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1, color: "#888" }}>מילות מפתח</div>
                      <div style={{ fontSize: 11 }}>{data.targetKeywords}</div>
                    </div>
                  )}

                  {/* Social media */}
                  {Object.keys(data.socialMedia).length > 0 && (
                    <>
                      <h2 style={{ fontSize: 13, fontWeight: 700, color: "#6C63FF", margin: "16px 0 8px", paddingBottom: 4, borderBottom: "1.5px solid #eee" }}>רשתות חברתיות</h2>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                        {Object.entries(data.socialMedia).map(([name, url]) => (
                          <div key={name} style={{ background: "#f8f9fa", borderRadius: 6, padding: "5px 8px" }}>
                            <span style={{ fontWeight: 600, fontSize: 11 }}>{name}</span>
                            {url && <div style={{ fontSize: 10, color: "#6C63FF", direction: "ltr", textAlign: "left" }}>{url as string}</div>}
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Competitors */}
                  {data.competitors.length > 0 && (
                    <>
                      <h2 style={{ fontSize: 13, fontWeight: 700, color: "#6C63FF", margin: "16px 0 8px", paddingBottom: 4, borderBottom: "1.5px solid #eee" }}>מתחרים</h2>
                      {data.competitors.map((c) => (
                        <div key={c.id} style={{ background: "#f8f9fa", borderRadius: 6, padding: "6px 10px", marginBottom: 4 }}>
                          {c.url && <div style={{ fontWeight: 600, fontSize: 11, direction: "ltr" }}>{c.url}</div>}
                          {c.likes && <div style={{ fontSize: 10, color: "#38a169" }}>מה שאהבתי: {c.likes}</div>}
                          {c.dislikes && <div style={{ fontSize: 10, color: "#e53e3e" }}>מה שלא: {c.dislikes}</div>}
                        </div>
                      ))}
                    </>
                  )}

                  {/* Timeline & phases */}
                  {(data.launchDate || data.deadline || data.phases.length > 0) && (
                    <>
                      <h2 style={{ fontSize: 13, fontWeight: 700, color: "#6C63FF", margin: "16px 0 8px", paddingBottom: 4, borderBottom: "1.5px solid #eee" }}>לוח זמנים</h2>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 8 }}>
                        {data.launchDate && (
                          <div style={{ background: "#f8f9fa", borderRadius: 6, padding: "6px 10px" }}>
                            <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1, color: "#888" }}>תאריך עלייה</div>
                            <div style={{ fontSize: 11, fontWeight: 600 }}>{data.launchDate}</div>
                          </div>
                        )}
                        {data.deadline && (
                          <div style={{ background: "#f8f9fa", borderRadius: 6, padding: "6px 10px" }}>
                            <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1, color: "#888" }}>דדליין</div>
                            <div style={{ fontSize: 11, fontWeight: 600 }}>{data.deadline}</div>
                          </div>
                        )}
                        {data.budgetRange && (
                          <div style={{ background: "#f8f9fa", borderRadius: 6, padding: "6px 10px" }}>
                            <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1, color: "#888" }}>תקציב</div>
                            <div style={{ fontSize: 11, fontWeight: 600 }}>{data.budgetRange}</div>
                          </div>
                        )}
                      </div>
                      {data.phases.length > 0 && (
                        <div>
                          <h3 style={{ fontSize: 11, fontWeight: 600, margin: "8px 0 4px" }}>שלבי פרויקט</h3>
                          {data.phases.map((phase, i) => (
                            <div key={phase.id} style={{ display: "flex", alignItems: "baseline", gap: 8, padding: "3px 0", borderBottom: "0.5px solid #f0f0f0" }}>
                              <span style={{ fontWeight: 700, color: "#6C63FF", fontSize: 11, minWidth: 18 }}>{i + 1}.</span>
                              <div style={{ flex: 1 }}>
                                <span style={{ fontWeight: 600, fontSize: 11 }}>{phase.name}</span>
                                {phase.startDate && phase.endDate && <span style={{ fontSize: 10, color: "#888", marginRight: 6 }}>{phase.startDate} → {phase.endDate}</span>}
                                {phase.deliverables && <div style={{ fontSize: 10, color: "#666" }}>{phase.deliverables}</div>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {/* General notes */}
                  {data.generalNotes && (
                    <>
                      <h2 style={{ fontSize: 13, fontWeight: 700, color: "#6C63FF", margin: "16px 0 8px", paddingBottom: 4, borderBottom: "1.5px solid #eee" }}>הערות כלליות</h2>
                      <p style={{ fontSize: 11, color: "#333", whiteSpace: "pre-wrap" }}>{data.generalNotes}</p>
                    </>
                  )}

                  {/* Services */}
                  {(data.selectedMonthly.length > 0 || data.selectedYearly.length > 0) && (
                    <>
                      <h2 style={{ fontSize: 13, fontWeight: 700, color: "#6C63FF", margin: "16px 0 8px", paddingBottom: 4, borderBottom: "1.5px solid #eee" }}>שירותים שוטפים</h2>
                      {data.selectedMonthly.length > 0 && (
                        <div style={{ marginBottom: 8 }}>
                          <h3 style={{ fontSize: 11, fontWeight: 600, margin: "4px 0" }}>חודשי</h3>
                          {data.selectedMonthly.map((name) => (
                            <div key={name} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", fontSize: 10, borderBottom: "0.5px solid #f5f5f5" }}>
                              <span>{name}</span>
                              <span style={{ fontFamily: "monospace", fontWeight: 600, direction: "ltr" }}>{formatCurrency(dynamicMonthlyCosts[name] || 0)}/חודש</span>
                            </div>
                          ))}
                          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, borderTop: "1.5px solid #ddd", marginTop: 4, paddingTop: 4, fontSize: 11 }}>
                            <span>סה״כ חודשי</span>
                            <span style={{ fontFamily: "monospace", direction: "ltr" }}>{formatCurrency(calcMonthly)}/חודש</span>
                          </div>
                        </div>
                      )}
                      {data.selectedYearly.length > 0 && (
                        <div>
                          <h3 style={{ fontSize: 11, fontWeight: 600, margin: "4px 0" }}>שנתי</h3>
                          {data.selectedYearly.map((name) => (
                            <div key={name} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", fontSize: 10, borderBottom: "0.5px solid #f5f5f5" }}>
                              <span>{name}</span>
                              <span style={{ fontFamily: "monospace", fontWeight: 600, direction: "ltr" }}>{formatCurrency(dynamicYearlyCosts[name] || 0)}/שנה</span>
                            </div>
                          ))}
                          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, borderTop: "1.5px solid #ddd", marginTop: 4, paddingTop: 4, fontSize: 11 }}>
                            <span>סה״כ שנתי</span>
                            <span style={{ fontFamily: "monospace", direction: "ltr" }}>{formatCurrency(calcYearly)}/שנה</span>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Pricing summary */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, margin: "16px 0" }}>
                    <div style={{ textAlign: "center", background: "linear-gradient(135deg, #f0f0ff, #e8faf0)", borderRadius: 10, padding: 16 }}>
                      <div style={{ fontSize: 10, color: "#666", marginBottom: 4 }}>עלות הקמת הפרויקט</div>
                      <div style={{ fontSize: 24, fontWeight: 900, fontFamily: "monospace", color: "#1a1a2e", direction: "ltr" }}>{formatCurrency(displayOneTime)}</div>
                      <div style={{ fontSize: 9, color: "#666", marginTop: 4 }}>{data.siteType || "חד-פעמי"}</div>
                    </div>
                    <div style={{ textAlign: "center", background: "#f8f9fa", borderRadius: 10, padding: 16 }}>
                      <div style={{ fontSize: 10, color: "#666", marginBottom: 4 }}>חודשי</div>
                      <div style={{ fontSize: 24, fontWeight: 900, fontFamily: "monospace", direction: "ltr" }}>{formatCurrency(displayMonthly)}</div>
                      <div style={{ fontSize: 9, color: "#888", marginTop: 4 }}>שנתי: {formatCurrency(displayYearly)}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "center", background: "#f0f0ff", borderRadius: 8, padding: 10, marginTop: 8 }}>
                    <div style={{ fontSize: 10, color: "#888" }}>עלות שנה ראשונה כוללת</div>
                    <div style={{ fontSize: 20, fontWeight: 900, fontFamily: "monospace", color: "#6C63FF", direction: "ltr" }}>{formatCurrency(firstYearTotal)}</div>
                  </div>

                  {/* Extras breakdown */}
                  {extrasTotal > 0 && (
                    <>
                      <h2 style={{ fontSize: 13, fontWeight: 700, color: "#6C63FF", margin: "16px 0 8px", paddingBottom: 4, borderBottom: "1.5px solid #eee" }}>תוספות</h2>
                      {[
                        { label: `פיצ׳רים (${data.selectedFeatures.length})`, amount: featuresTotalCost },
                        { label: "עיצוב לוגו", amount: designExtra },
                        { label: "קופירייטינג", amount: copyExtra },
                        { label: "SEO בסיסי", amount: seoExtra },
                        { label: `רב-שפתיות (${data.contentLanguages.length} שפות)`, amount: multiLangExtra },
                      ].filter(r => r.amount > 0).map((row) => (
                        <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "0.5px solid #f0f0f0" }}>
                          <span>{row.label}</span>
                          <span style={{ fontFamily: "monospace", fontWeight: 600, direction: "ltr" }}>{formatCurrency(row.amount)}</span>
                        </div>
                      ))}
                      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, borderTop: "2px solid #1a1a2e", marginTop: 4, paddingTop: 6 }}>
                        <span>סה״כ תוספות</span>
                        <span style={{ fontFamily: "monospace", direction: "ltr" }}>{formatCurrency(extrasTotal)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* ─── Notes ─── */}
            <div className="glass-inset rounded-xl p-4 text-center">
              <p className="text-xs" style={{ color: "var(--prd-muted)" }}>
                העלויות המוצגות הן הערכה ראשונית בלבד ועשויות להשתנות בהתאם לדרישות מפורטות.
                <br />
                מחירי הפיצ׳רים מנוהלים דרך פאנל האדמין. הטופס נשמר אוטומטית.
              </p>
            </div>
          </motion.div>
        );
      }

      default:
        return null;
    }
  };

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */
  return (
    <div className="min-h-screen">
      {/* ═══════ STICKY HEADER ═══════ */}
      <div className="sticky top-0 z-50" style={{ background: "var(--header-bg)", backdropFilter: "blur(40px) saturate(180%)", borderBottom: "0.5px solid var(--prd-border)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold" style={{ color: "var(--prd-heading)" }}>
                אפיון אתר
              </h1>
              <p className="text-xs" style={{ color: "var(--prd-muted)" }}>מסמך אפיון מקצועי לבניית אתר</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl transition-all"
                style={{ backgroundColor: "var(--prd-surface)", border: "0.5px solid var(--prd-border)", color: "var(--prd-muted)" }}
                title={theme === "dark" ? "מצב בהיר" : "מצב כהה"}
              >
                {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
              </button>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ backgroundColor: "var(--prd-surface)" }}>
                <div className="w-2 h-2 rounded-full pulse-dot" style={{ backgroundColor: completionPct === 100 ? "#00FF88" : "#FFD93D" }} />
                <span className="text-xs font-mono font-bold" style={{ color: completionPct === 100 ? "#00FF88" : "#FFD93D" }}>{completionPct}%</span>
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                  style={{ backgroundColor: "rgba(108,99,255,0.12)", color: "#6C63FF", border: "0.5px solid rgba(108,99,255,0.2)" }}
                >
                  <FileDown size={14} /> ייצוא <ChevronDown size={12} />
                </button>
                <AnimatePresence>
                  {showExportMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 top-full mt-2 z-50 glass-heavy rounded-xl p-2 min-w-[180px] shadow-2xl"
                      style={{ backgroundColor: "var(--prd-bg)", border: "0.5px solid var(--glass-heavy-border)" }}
                    >
                      <button onClick={exportPrint} className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-xs font-medium transition-all hover:bg-white/5" style={{ color: "var(--prd-heading)" }}>
                        <Printer size={14} style={{ color: "#FF6B6B" }} />
                        <div className="text-right">
                          <div>הדפסה / PDF</div>
                          <div className="text-[10px]" style={{ color: "var(--prd-muted)" }}>שמירה כ-PDF דרך הדפסה</div>
                        </div>
                      </button>
                      <button onClick={exportHTML} className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-xs font-medium transition-all hover:bg-white/5" style={{ color: "var(--prd-heading)" }}>
                        <Globe size={14} style={{ color: "#00F0FF" }} />
                        <div className="text-right">
                          <div>קובץ HTML</div>
                          <div className="text-[10px]" style={{ color: "var(--prd-muted)" }}>מסמך מעוצב לשיתוף</div>
                        </div>
                      </button>
                      <button onClick={exportJSON} className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-xs font-medium transition-all hover:bg-white/5" style={{ color: "var(--prd-heading)" }}>
                        <FileJson size={14} style={{ color: "#00FF88" }} />
                        <div className="text-right">
                          <div>קובץ JSON</div>
                          <div className="text-[10px]" style={{ color: "var(--prd-muted)" }}>נתונים גולמיים לגיבוי</div>
                        </div>
                      </button>
                      <div style={{ borderTop: "0.5px solid var(--prd-border)", margin: "4px 0" }} />
                      <button onClick={() => importJSONRef.current?.click()} className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-xs font-medium transition-all hover:bg-white/5" style={{ color: "var(--prd-heading)" }}>
                        <Upload size={14} style={{ color: "#6C63FF" }} />
                        <div className="text-right">
                          <div>ייבוא JSON</div>
                          <div className="text-[10px]" style={{ color: "var(--prd-muted)" }}>טעינת אפיון קודם</div>
                        </div>
                      </button>
                      <input ref={importJSONRef} type="file" accept=".json" onChange={importJSON} className="hidden" />
                      <button onClick={resetForm} className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-xs font-medium transition-all hover:bg-white/5" style={{ color: "#FF6B6B" }}>
                        <RotateCw size={14} />
                        <div className="text-right">
                          <div>התחל מחדש</div>
                          <div className="text-[10px]" style={{ color: "var(--prd-muted)" }}>מחיקת כל הנתונים</div>
                        </div>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1.5 overflow-x-auto overflow-y-hidden whitespace-nowrap pb-2 -mb-2 scrollbar-hide">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all"
                  style={{
                    backgroundColor: active ? "rgba(0,240,255,0.1)" : "transparent",
                    color: active ? "#00F0FF" : "var(--prd-muted)",
                    border: active ? "0.5px solid rgba(0,240,255,0.2)" : "0.5px solid transparent",
                    boxShadow: active ? "0 0 12px rgba(0,240,255,0.08)" : "none",
                  }}
                >
                  <Icon size={13} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══════ CONTENT ═══════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-heavy rounded-[24px] p-6 sm:p-8">
              <AnimatePresence mode="wait">
                <div key={activeTab}>{renderContent()}</div>
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Search */}
            <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="relative">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 z-10" size={15} style={{ color: "var(--prd-muted)" }} />
              <input
                type="text"
                placeholder="חיפוש באפיון..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="prd-input pr-10"
              />
              {searchQuery.trim().length > 1 && (() => {
                const q = searchQuery.trim().toLowerCase();
                const results: { label: string; tab: string; tabLabel: string }[] = [];
                // Overview
                if (data.projectName.toLowerCase().includes(q)) results.push({ label: `שם: ${data.projectName}`, tab: "overview", tabLabel: "סקירה" });
                if (data.businessType.toLowerCase().includes(q)) results.push({ label: `עסק: ${data.businessType}`, tab: "overview", tabLabel: "סקירה" });
                if (data.siteType.toLowerCase().includes(q)) results.push({ label: `אתר: ${data.siteType}`, tab: "overview", tabLabel: "סקירה" });
                // Audience
                if (data.audienceInterests.toLowerCase().includes(q)) results.push({ label: "תחומי עניין", tab: "audience", tabLabel: "קהל יעד" });
                // Design
                if (data.stylePreference.toLowerCase().includes(q)) results.push({ label: `סגנון: ${data.stylePreference}`, tab: "design", tabLabel: "עיצוב" });
                if (data.moodKeywords.toLowerCase().includes(q)) results.push({ label: "מילות אווירה", tab: "design", tabLabel: "עיצוב" });
                // Pages
                data.pages.filter((p) => p.name.toLowerCase().includes(q)).forEach((p) => results.push({ label: `עמוד: ${p.name}`, tab: "structure", tabLabel: "מבנה" }));
                // Features
                data.selectedFeatures.filter((f) => f.name.toLowerCase().includes(q)).forEach((f) => results.push({ label: `פיצ׳ר: ${f.name}`, tab: "functionality", tabLabel: "פונקציונליות" }));
                // Also search unselected features
                FUNC_CATEGORIES.flatMap((c) => c.items).filter((item) => item.toLowerCase().includes(q) && !data.selectedFeatures.some((f) => f.name === item)).forEach((item) => results.push({ label: `פיצ׳ר זמין: ${item}`, tab: "functionality", tabLabel: "פונקציונליות" }));
                // Technical
                if (data.targetKeywords.toLowerCase().includes(q)) results.push({ label: "מילות מפתח", tab: "technical", tabLabel: "טכני" });
                if (data.integrationsNeeded.toLowerCase().includes(q)) results.push({ label: "אינטגרציות", tab: "technical", tabLabel: "טכני" });
                // Monthly/yearly
                data.selectedMonthly.filter((n) => n.toLowerCase().includes(q)).forEach((n) => results.push({ label: `חודשי: ${n}`, tab: "technical", tabLabel: "טכני" }));
                data.selectedYearly.filter((n) => n.toLowerCase().includes(q)).forEach((n) => results.push({ label: `שנתי: ${n}`, tab: "technical", tabLabel: "טכני" }));

                if (results.length === 0) return (
                  <div className="absolute top-full left-0 right-0 mt-1 glass rounded-xl p-3 z-50 text-center">
                    <p className="text-xs" style={{ color: "var(--prd-muted)" }}>לא נמצאו תוצאות</p>
                  </div>
                );
                return (
                  <div className="absolute top-full left-0 right-0 mt-1 glass rounded-xl p-2 z-50 max-h-60 overflow-y-auto space-y-0.5">
                    {results.slice(0, 8).map((r, i) => (
                      <button
                        key={i}
                        onClick={() => { setActiveTab(r.tab); setSearchQuery(""); }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all"
                        style={{ color: "var(--prd-heading)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--prd-surface-hover)")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        <span className="truncate">{r.label}</span>
                        <span className="text-[10px] pill shrink-0 mr-2" style={{ backgroundColor: "rgba(0,240,255,0.1)", color: "#00F0FF", border: "0.5px solid rgba(0,240,255,0.2)" }}>{r.tabLabel}</span>
                      </button>
                    ))}
                  </div>
                );
              })()}
            </motion.div>

            {/* Completion */}
            <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }} className="glass rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold" style={{ color: "var(--prd-heading)" }}>התקדמות מילוי</h3>
                <span className="text-lg font-bold font-mono" style={{ color: completionPct === 100 ? "#00FF88" : "#00F0FF" }}>
                  {completionPct}%
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden mb-4" style={{ background: "var(--prd-surface)" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPct}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full rounded-full"
                  style={{ background: completionPct === 100 ? "#00FF88" : "linear-gradient(90deg, #6C63FF, #00F0FF)" }}
                />
              </div>
              <div className="space-y-1.5">
                {completionItems.map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-xs">
                    <div
                      className="w-3.5 h-3.5 rounded-sm flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: item.done ? "rgba(0,255,136,0.15)" : "var(--prd-surface)",
                        border: `1px solid ${item.done ? "rgba(0,255,136,0.3)" : "var(--prd-border)"}`,
                      }}
                    >
                      {item.done && <Check size={8} style={{ color: "#00FF88" }} />}
                    </div>
                    <span style={{ color: item.done ? "var(--prd-muted)" : "var(--prd-heading)", textDecoration: item.done ? "line-through" : "none" }}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick stats */}
            <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="glass rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 size={16} style={{ color: "#FFD93D" }} />
                <h3 className="text-sm font-semibold" style={{ color: "var(--prd-heading)" }}>סיכום מהיר</h3>
              </div>
              <div className="space-y-2.5">
                {[
                  { label: "עמודים", value: data.pages.length, icon: Layout, color: "#00F0FF" },
                  { label: "פיצ׳רים", value: data.selectedFeatures.length, icon: Zap, color: "#6C63FF" },
                  { label: "שפות", value: data.contentLanguages.length, icon: Type, color: "#00FF88" },
                  { label: "שלבים", value: data.phases.length, icon: Calendar, color: "#FFD93D" },
                  { label: "מתחרים", value: data.competitors.length, icon: Target, color: "#FF6B6B" },
                  { label: "רשתות", value: Object.keys(data.socialMedia).length, icon: Share2, color: "#6C63FF" },
                ].map((s) => {
                  const Icon = s.icon;
                  return (
                    <div key={s.label} className="flex items-center justify-between py-0.5">
                      <div className="flex items-center gap-2">
                        <Icon size={13} style={{ color: s.color }} />
                        <span className="text-xs" style={{ color: "var(--prd-muted)" }}>{s.label}</span>
                      </div>
                      <span className="text-xs font-mono font-bold" style={{ color: "var(--prd-heading)" }}>{s.value}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Project info card */}
            {(data.projectName || data.clientName || data.siteType) && (
              <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="glass rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase size={16} style={{ color: "#6C63FF" }} />
                  <h3 className="text-sm font-semibold" style={{ color: "var(--prd-heading)" }}>כרטיס פרויקט</h3>
                </div>
                <div className="space-y-2">
                  {data.projectName && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--prd-muted)" }}>שם הפרויקט</p>
                      <p className="text-sm font-semibold" style={{ color: "var(--prd-heading)" }}>{data.projectName}</p>
                    </div>
                  )}
                  {data.clientName && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--prd-muted)" }}>לקוח</p>
                      <p className="text-sm" style={{ color: "var(--prd-heading)" }}>{data.clientName}</p>
                    </div>
                  )}
                  {data.siteType && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--prd-muted)" }}>סוג אתר</p>
                      <span className="pill text-[10px]" style={{ backgroundColor: "rgba(0,240,255,0.12)", color: "#00F0FF", border: "1px solid rgba(0,240,255,0.2)" }}>
                        {data.siteType}
                      </span>
                    </div>
                  )}
                  {data.budgetRange && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--prd-muted)" }}>תקציב</p>
                      <span className="pill text-[10px]" style={{ backgroundColor: "rgba(0,255,136,0.12)", color: "#00FF88", border: "1px solid rgba(0,255,136,0.2)" }}>
                        {data.budgetRange}
                      </span>
                    </div>
                  )}
                  {data.deadline && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--prd-muted)" }}>דדליין</p>
                      <p className="text-sm font-mono" style={{ color: "#FFD93D" }}>{data.deadline}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

          </div>
        </div>
      </div>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 py-8 mt-8" style={{ borderTop: "0.5px solid var(--prd-border)" }}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #6C63FF, #00F0FF)" }}>
              <Globe size={14} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold" style={{ color: "var(--prd-heading)" }}>מערכת אפיון אתרים</p>
              <p className="text-[10px]" style={{ color: "var(--prd-muted)" }}>בניית מסמכי אפיון מקצועיים</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a href="/admin" className="flex items-center gap-1.5 text-xs font-medium transition-all hover:opacity-80" style={{ color: "var(--prd-accent-2)" }}>
              <Shield size={13} /> ניהול מחירון
            </a>
            <span style={{ color: "var(--prd-border)" }}>|</span>
            <span className="text-[10px]" style={{ color: "var(--prd-muted)" }}>
              {new Date().getFullYear()} &copy; כל הזכויות שמורות
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
