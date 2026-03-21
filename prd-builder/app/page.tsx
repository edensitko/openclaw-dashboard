"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  Plus,
  Download,
  Share2,
  Upload,
  Clock,
  Users,
  Search,
  Trash2,
  FileText,
  Star,
  CheckSquare,
  Palette,
  Settings,
  Calendar,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Minus,
  CircleDot,
  Zap,
  Target,
  BarChart3,
  X,
  Globe,
  Layout,
  Type,
  ShoppingCart,
  Mail,
  Phone,
  MapPin,
  Image,
  Monitor,
  Smartphone,
  Layers,
  Lock,
  TrendingUp,
  MessageSquare,
  Megaphone,
  Briefcase,
  Eye,
  Code,
  Database,
  Wifi,
  DollarSign,
  BookOpen,
  Heart,
  Flag,
  AlertTriangle,
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
  priority: "חובה" | "רצוי" | "עתידי";
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
}

interface ContentSection {
  id: string;
  page: string;
  type: string;
  description: string;
  whoProvides: "לקוח" | "מעצב" | "קופירייטר";
}

/* ─── Constants ─── */
const PRIORITY_CONFIG = {
  "חובה": { color: "#FF6B6B", bg: "rgba(255,107,107,0.12)", icon: ArrowUp },
  "רצוי": { color: "#FFD93D", bg: "rgba(255,217,61,0.12)", icon: Minus },
  "עתידי": { color: "#00FF88", bg: "rgba(0,255,136,0.12)", icon: ArrowDown },
};

const TABS = [
  { id: "overview", label: "סקירה כללית", icon: Globe },
  { id: "audience", label: "קהל יעד", icon: Users },
  { id: "structure", label: "מבנה ודפים", icon: Layout },
  { id: "design", label: "עיצוב ומיתוג", icon: Palette },
  { id: "content", label: "תוכן", icon: Type },
  { id: "functionality", label: "פונקציונליות", icon: Zap },
  { id: "technical", label: "טכני", icon: Settings },
  { id: "seo", label: "SEO ושיווק", icon: TrendingUp },
  { id: "timeline", label: "לוח זמנים", icon: Calendar },
  { id: "competitors", label: "מתחרים", icon: Target },
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
  "טופס יצירת קשר": 500, "טופס הרשמה": 600, "טופס הצעת מחיר": 800, "טופס משוב": 500, "טופס הזמנת פגישה": 1000, "טופס ניוזלטר": 400,
  "עגלת קניות": 3000, "תשלום אונליין": 2500, "ניהול מלאי": 2000, "קופונים והנחות": 1500, "מעקב הזמנות": 2000, "סליקת אשראי": 2500,
  "בלוג / חדשות": 1500, "גלריית תמונות": 800, "גלריית וידאו": 1000, "עמוד שאלות נפוצות": 500, "המלצות לקוחות": 600, "פודקאסט": 1200,
  "צ׳אט חי": 1500, "צ׳אטבוט AI": 4000, "תגובות": 800, "דירוגים וביקורות": 1200, "שיתוף חברתי": 400, "מערכת הודעות": 2500,
  "הרשמה והתחברות": 2000, "פרופיל משתמש": 1500, "אזור אישי": 2500, "היסטוריית הזמנות": 1000, "רשימת מועדפים": 800, "התחברות עם Google/Facebook": 1500,
  "חיפוש באתר": 1000, "מפת אתר": 300, "רב-שפתיות": 3000, "נגישות (AA/AAA)": 2500, "אנימציות": 1500, "מפה אינטראקטיבית": 1200,
};

const BASE_COSTS: Record<string, number> = {
  "אתר תדמית": 5000, "חנות אונליין": 12000, "בלוג / מגזין": 4000, "אתר שירותים": 6000,
  "לנדינג פייג׳": 2500, "פלטפורמה / SaaS": 25000, "אתר קהילה / פורום": 10000,
  "פורטפוליו": 3500, "אתר מוסדי": 7000, "אפליקציית ווב": 20000, "אחר": 5000,
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
    "עיצוב לוגו": 2500, "קופירייטינג מלא": 3000, "קופירייטינג חלקי": 1500, "SEO בסיסי": 2000, "שפה נוספת (לשפה)": 2500,
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
    mainMessage: "",

    // Audience
    audienceAge: "",
    audienceGender: "" as "" | "גברים" | "נשים" | "שני המינים",
    audienceLocation: "",
    audienceIncome: "",
    audienceInterests: "",
    audiencePainPoints: "",
    audienceDevices: [] as string[],
    audienceBehavior: "",

    // Structure
    pages: [] as SitePage[],

    // Design
    stylePreference: "",
    primaryColor: "#00F0FF",
    secondaryColor: "#6C63FF",
    accentColor: "#00FF88",
    fontPreference: "",
    designNotes: "",
    hasLogo: "" as "" | "כן" | "לא" | "צריך עיצוב",
    hasBrandGuide: "" as "" | "כן" | "לא",
    referenceSites: "",
    moodKeywords: "",

    // Content
    contentSections: [] as ContentSection[],
    contentLanguages: ["עברית"] as string[],
    needsCopywriting: "" as "" | "כן" | "לא" | "חלקית",
    needsPhotography: "" as "" | "כן" | "לא",
    needsVideoProduction: "" as "" | "כן" | "לא",
    existingContent: "",

    // Functionality
    selectedFeatures: [] as Feature[],
    customFeature: "",

    // Technical
    hostingPreference: "",
    domainStatus: "" as "" | "יש דומיין" | "צריך לרכוש" | "לא בטוח",
    domainName: "",
    cmsPreference: "" as "" | "WordPress" | "Webflow" | "Next.js" | "Wix" | "Shopify" | "Custom" | "לא משנה",
    sslNeeded: true,
    responsiveDesign: true,
    browserSupport: "",
    integrationsNeeded: "",
    apiRequirements: "",
    performanceNotes: "",
    securityRequirements: "",

    // SEO
    targetKeywords: "",
    googleAnalytics: true,
    searchConsole: true,
    socialMedia: [] as string[],
    emailMarketing: "" as "" | "כן" | "לא" | "אולי בעתיד",
    seoNotes: "",
    localSeo: "" as "" | "כן" | "לא",
    googleBusiness: "" as "" | "כן, קיים" | "לא, צריך ליצור" | "לא רלוונטי",

    // Timeline
    phases: [] as Phase[],
    deadline: "",
    budgetRange: "",
    budgetNotes: "",
    launchDate: "",
    maintenanceNeeded: "" as "" | "כן" | "לא" | "אולי",

    // Competitors
    competitors: [] as Competitor[],

    // Monthly/Yearly services
    selectedMonthly: [] as string[],
    selectedYearly: [] as string[],

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

  /* ─── Update helper ─── */
  const update = useCallback(
    (fields: Partial<typeof data>) => setData((prev) => ({ ...prev, ...fields })),
    []
  );

  /* ─── CRUD: Pages ─── */
  const addPage = () => {
    update({
      pages: [...data.pages, { id: Date.now().toString(), name: "עמוד חדש", description: "", isMainNav: true, subPages: [] }],
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
        { id: Date.now().toString(), name, description: "", priority: "רצוי", category, estimatedCost: dynamicFeatureCosts[name] || 1000 },
      ],
    });
  };
  const updateFeature = (id: string, updates: Partial<Feature>) => {
    update({ selectedFeatures: data.selectedFeatures.map((f) => (f.id === id ? { ...f, ...updates } : f)) });
  };
  const deleteFeature = (id: string) => {
    update({ selectedFeatures: data.selectedFeatures.filter((f) => f.id !== id) });
  };

  /* ─── CRUD: Content sections ─── */
  const addContentSection = () => {
    update({
      contentSections: [
        ...data.contentSections,
        { id: Date.now().toString(), page: "", type: "", description: "", whoProvides: "לקוח" },
      ],
    });
  };
  const updateContentSection = (id: string, updates: Partial<ContentSection>) => {
    update({ contentSections: data.contentSections.map((s) => (s.id === id ? { ...s, ...updates } : s)) });
  };
  const deleteContentSection = (id: string) => {
    update({ contentSections: data.contentSections.filter((s) => s.id !== id) });
  };

  /* ─── CRUD: Phases ─── */
  const addPhase = () => {
    update({
      phases: [...data.phases, { id: Date.now().toString(), name: "שלב חדש", startDate: "", endDate: "", deliverables: "" }],
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
      competitors: [...data.competitors, { id: Date.now().toString(), url: "", likes: "", dislikes: "" }],
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
    { label: "סוג העסק", done: data.businessType.length > 0 },
    { label: "סוג האתר", done: data.siteType.length > 0 },
    { label: "מטרות הפרויקט", done: data.projectGoals.length > 0 },
    { label: "קהל יעד", done: data.audienceAge.length > 0 || data.audienceLocation.length > 0 },
    { label: "מבנה ודפים", done: data.pages.length > 0 },
    { label: "סגנון עיצוב", done: data.stylePreference.length > 0 },
    { label: "תוכן", done: data.contentSections.length > 0 || data.existingContent.length > 0 },
    { label: "פונקציונליות", done: data.selectedFeatures.length > 0 },
    { label: "דרישות טכניות", done: data.cmsPreference.length > 0 || data.hostingPreference.length > 0 },
    { label: "SEO ושיווק", done: data.targetKeywords.length > 0 },
    { label: "לוח זמנים", done: data.deadline.length > 0 || data.phases.length > 0 || data.selectedMonthly.length > 0 || data.selectedYearly.length > 0 },
    { label: "תקציב", done: data.budgetRange.length > 0 },
    { label: "מתחרים", done: data.competitors.length > 0 },
  ], [data]);

  const completionPct = Math.round((completionItems.filter((i) => i.done).length / completionItems.length) * 100);

  const [showExportMenu, setShowExportMenu] = useState(false);

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
      `<div class="card"><strong>${f.name}</strong> <span class="badge">${f.priority}</span> <span class="badge secondary">${f.category}</span>${f.description ? `<p>${f.description}</p>` : ""}</div>`
    ).join("");

    const contentHtml = data.contentSections.map((s) =>
      `<div class="card"><strong>${s.page}</strong> — ${s.type} <span class="badge">${s.whoProvides}</span>${s.description ? `<p>${s.description}</p>` : ""}</div>`
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
    field("מסר מרכזי", data.mainMessage),
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
    field("הכנסה", data.audienceIncome),
    field("תחומי עניין", data.audienceInterests),
    field("כאבים ובעיות", data.audiencePainPoints),
    data.audienceDevices.length > 0 ? field("מכשירים", data.audienceDevices.join(", ")) : "",
    field("התנהגות גלישה", data.audienceBehavior),
  ].join(""))}

  ${section("מבנה ודפים", pagesHtml || "<p>לא הוגדרו עמודים</p>")}

  ${section("עיצוב ומיתוג", [
    field("סגנון", data.stylePreference),
    field("צבע ראשי", data.primaryColor),
    field("צבע משני", data.secondaryColor),
    field("צבע הדגשה", data.accentColor),
    field("לוגו", data.hasLogo),
    field("מדריך מותג", data.hasBrandGuide),
    field("פונט", data.fontPreference),
    field("מילות אווירה", data.moodKeywords),
    field("אתרי השראה", data.referenceSites),
    field("הערות עיצוב", data.designNotes),
  ].join(""))}

  ${section("תוכן", [
    field("שפות", data.contentLanguages.join(", ")),
    field("קופירייטינג", data.needsCopywriting),
    field("צילום", data.needsPhotography),
    field("וידאו", data.needsVideoProduction),
    field("תוכן קיים", data.existingContent),
    contentHtml ? "<h3 style='margin:16px 0 8px;font-size:15px;'>מפת תוכן</h3>" + contentHtml : "",
  ].join(""))}

  ${section("פונקציונליות", featuresHtml || "<p>לא נבחרו פיצ׳רים</p>")}

  ${section("דרישות טכניות", [
    field("CMS", data.cmsPreference),
    field("דומיין", data.domainStatus + (data.domainName ? ` (${data.domainName})` : "")),
    field("אחסון", data.hostingPreference),
    field("SSL", data.sslNeeded ? "כן" : "לא"),
    field("רספונסיבי", data.responsiveDesign ? "כן" : "לא"),
    field("אינטגרציות", data.integrationsNeeded),
    field("API", data.apiRequirements),
    field("ביצועים", data.performanceNotes),
    field("אבטחה", data.securityRequirements),
    field("דפדפנים", data.browserSupport),
  ].join(""))}

  ${section("SEO ושיווק", [
    field("מילות מפתח", data.targetKeywords),
    field("Google Analytics", data.googleAnalytics ? "כן" : "לא"),
    field("Search Console", data.searchConsole ? "כן" : "לא"),
    data.socialMedia.length > 0 ? field("רשתות חברתיות", data.socialMedia.join(", ")) : "",
    field("שיווק במייל", data.emailMarketing),
    field("SEO מקומי", data.localSeo),
    field("Google Business", data.googleBusiness),
    field("הערות SEO", data.seoNotes),
  ].join(""))}

  ${section("לוח זמנים ותקציב", [
    field("תאריך עלייה", data.launchDate),
    field("דדליין", data.deadline),
    field("תקציב", data.budgetRange),
    field("הערות תקציב", data.budgetNotes),
    field("תחזוקה", data.maintenanceNeeded),
    phasesHtml ? "<h3 style='margin:16px 0 8px;font-size:15px;'>שלבי פרויקט</h3>" + phasesHtml : "",
  ].join(""))}

  ${section("ניתוח מתחרים", competitorsHtml || "<p>לא הוספו מתחרים</p>")}

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
    const featuresText = data.selectedFeatures.map((f) => `• ${f.name} [${f.priority}] (${f.category})`).join("\n");

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
  ${field("מסר מרכזי", data.mainMessage)}

  <h2>פרטי לקוח</h2>
  ${field("שם", data.clientName)}
  ${field("טלפון", data.clientPhone)}
  ${field("אימייל", data.clientEmail)}

  <h2>קהל יעד</h2>
  ${field("גילאים", data.audienceAge)}
  ${field("מגדר", data.audienceGender)}
  ${field("מיקום", data.audienceLocation)}
  ${field("הכנסה", data.audienceIncome)}
  ${field("תחומי עניין", data.audienceInterests)}
  ${field("כאבים ובעיות", data.audiencePainPoints)}
  ${field("מכשירים", data.audienceDevices.join(", "))}

  <h2>מבנה ודפים</h2>
  ${pagesText ? `<pre>${pagesText}</pre>` : "<p>לא הוגדרו</p>"}

  <h2>עיצוב ומיתוג</h2>
  ${field("סגנון", data.stylePreference)}
  ${field("צבעים", `ראשי: ${data.primaryColor}, משני: ${data.secondaryColor}, הדגשה: ${data.accentColor}`)}
  ${field("לוגו", data.hasLogo)}
  ${field("מדריך מותג", data.hasBrandGuide)}
  ${field("פונט", data.fontPreference)}
  ${field("אווירה", data.moodKeywords)}
  ${field("אתרי השראה", data.referenceSites)}

  <h2>תוכן</h2>
  ${field("שפות", data.contentLanguages.join(", "))}
  ${field("קופירייטינג", data.needsCopywriting)}
  ${field("צילום", data.needsPhotography)}
  ${field("וידאו", data.needsVideoProduction)}
  ${field("תוכן קיים", data.existingContent)}

  <h2>פונקציונליות</h2>
  ${featuresText ? `<pre>${featuresText}</pre>` : "<p>לא נבחרו פיצ׳רים</p>"}

  <h2>דרישות טכניות</h2>
  ${field("CMS", data.cmsPreference)}
  ${field("דומיין", data.domainStatus + (data.domainName ? ` (${data.domainName})` : ""))}
  ${field("אחסון", data.hostingPreference)}
  ${field("SSL", data.sslNeeded ? "כן" : "לא")}
  ${field("רספונסיבי", data.responsiveDesign ? "כן" : "לא")}
  ${field("אינטגרציות", data.integrationsNeeded)}
  ${field("אבטחה", data.securityRequirements)}

  <h2>SEO ושיווק</h2>
  ${field("מילות מפתח", data.targetKeywords)}
  ${field("רשתות חברתיות", data.socialMedia.join(", "))}
  ${field("שיווק במייל", data.emailMarketing)}
  ${field("SEO מקומי", data.localSeo)}
  ${field("Google Business", data.googleBusiness)}

  <h2>לוח זמנים ותקציב</h2>
  ${field("עלייה לאוויר", data.launchDate)}
  ${field("דדליין", data.deadline)}
  ${field("תקציב", data.budgetRange)}
  ${field("הערות", data.budgetNotes)}
  ${field("תחזוקה", data.maintenanceNeeded)}

  <h2>מתחרים</h2>
  ${data.competitors.length > 0 ? data.competitors.map((c, i) => `<p><strong>${i + 1}. ${c.url || "—"}</strong><br/>👍 ${c.likes || "—"} | 👎 ${c.dislikes || "—"}</p>`).join("") : "<p>לא הוספו</p>"}

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
              <textarea value={data.projectGoals} onChange={(e) => update({ projectGoals: e.target.value })} placeholder="מה המטרות העיקריות של האתר? מה אתם רוצים להשיג?&#10;לדוגמה: הגדלת מכירות, יצירת נוכחות דיגיטלית, איסוף לידים..." rows={4} className="prd-textarea" />
            </div>

            <div>
              <SectionLabel>ערך ייחודי / USP</SectionLabel>
              <textarea value={data.uniqueValue} onChange={(e) => update({ uniqueValue: e.target.value })} placeholder="מה מייחד אתכם מהמתחרים? למה לקוח יבחר בכם?" rows={3} className="prd-textarea" />
            </div>

            <div>
              <SectionLabel>מסר מרכזי</SectionLabel>
              <input type="text" value={data.mainMessage} onChange={(e) => update({ mainMessage: e.target.value })} placeholder="המשפט המרכזי שהגולש צריך לזכור מהביקור באתר" className="prd-input" />
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
          </motion.div>
        );

      /* ═══ AUDIENCE ═══ */
      case "audience":
        return (
          <motion.div {...fadeIn} className="space-y-6">
            <SubHeading icon={Users}>הגדרת קהל היעד</SubHeading>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <SectionLabel>טווח גילאים</SectionLabel>
                <input type="text" value={data.audienceAge} onChange={(e) => update({ audienceAge: e.target.value })} placeholder="לדוגמה: 25-45" className="prd-input" />
              </div>
              <div>
                <SectionLabel>מגדר</SectionLabel>
                <PillSelect options={["גברים", "נשים", "שני המינים"]} value={data.audienceGender} onChange={(v) => update({ audienceGender: v as typeof data.audienceGender })} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <SectionLabel>מיקום גיאוגרפי</SectionLabel>
                <input type="text" value={data.audienceLocation} onChange={(e) => update({ audienceLocation: e.target.value })} placeholder="לדוגמה: ישראל, אזור המרכז, בינלאומי" className="prd-input" />
              </div>
              <div>
                <SectionLabel>רמת הכנסה</SectionLabel>
                <PillSelect options={["נמוכה", "בינונית", "גבוהה", "מגוון"]} value={data.audienceIncome} onChange={(v) => update({ audienceIncome: v })} color="#FFD93D" />
              </div>
            </div>

            <div>
              <SectionLabel>תחומי עניין ותחביבים</SectionLabel>
              <textarea value={data.audienceInterests} onChange={(e) => update({ audienceInterests: e.target.value })} placeholder="מה מעניין את קהל היעד שלכם? באילו פלטפורמות הם פעילים?" rows={3} className="prd-textarea" />
            </div>

            <div>
              <SectionLabel>כאבים ובעיות של הקהל</SectionLabel>
              <textarea value={data.audiencePainPoints} onChange={(e) => update({ audiencePainPoints: e.target.value })} placeholder="אילו בעיות האתר שלכם פותר? מה מתסכל את הלקוחות הפוטנציאליים?" rows={3} className="prd-textarea" />
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

            <div>
              <SectionLabel>התנהגות גלישה צפויה</SectionLabel>
              <textarea value={data.audienceBehavior} onChange={(e) => update({ audienceBehavior: e.target.value })} placeholder="איך אתם מדמיינים שהגולש ישתמש באתר? מה המסלול הטיפוסי שלו?" rows={3} className="prd-textarea" />
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
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "צבע ראשי", key: "primaryColor" as const },
                  { label: "צבע משני", key: "secondaryColor" as const },
                  { label: "צבע הדגשה", key: "accentColor" as const },
                ].map((c) => (
                  <div key={c.key} className="glass-inset rounded-xl p-3 text-center">
                    <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: "var(--prd-muted)" }}>{c.label}</p>
                    <div className="flex items-center justify-center gap-2">
                      <input
                        type="color"
                        value={data[c.key]}
                        onChange={(e) => update({ [c.key]: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer border-none"
                        style={{ background: "transparent" }}
                      />
                      <span className="text-xs font-mono" style={{ color: "var(--prd-heading)" }} dir="ltr">{data[c.key]}</span>
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
                <SectionLabel>מדריך מותג (Brand Guide)</SectionLabel>
                <PillSelect options={["כן", "לא"]} value={data.hasBrandGuide} onChange={(v) => update({ hasBrandGuide: v as typeof data.hasBrandGuide })} color="#FFD93D" />
              </div>
            </div>

            <div>
              <SectionLabel>העדפת פונט</SectionLabel>
              <input type="text" value={data.fontPreference} onChange={(e) => update({ fontPreference: e.target.value })} placeholder="לדוגמה: Heebo, Assistant, Rubik, או ׳אין העדפה׳" className="prd-input" />
            </div>

            <div>
              <SectionLabel>מילות מפתח לאווירה (Mood)</SectionLabel>
              <input type="text" value={data.moodKeywords} onChange={(e) => update({ moodKeywords: e.target.value })} placeholder="לדוגמה: נקי, אמין, חדשני, חם, מקצועי, מזמין" className="prd-input" />
            </div>

            <div>
              <SectionLabel>אתרי השראה</SectionLabel>
              <textarea value={data.referenceSites} onChange={(e) => update({ referenceSites: e.target.value })} placeholder="הדביקו קישורים לאתרים שאתם אוהבים את העיצוב שלהם, וציינו מה אהבתם" rows={3} className="prd-textarea" dir="ltr" />
            </div>

            <div>
              <SectionLabel>הערות עיצוב נוספות</SectionLabel>
              <textarea value={data.designNotes} onChange={(e) => update({ designNotes: e.target.value })} placeholder="דרישות עיצוב מיוחדות, דברים שחשוב לכם, דברים שלא אוהבים..." rows={3} className="prd-textarea" />
            </div>

            <div>
              <SectionLabel>העלאת קבצי מיתוג</SectionLabel>
              <div className="glass-inset rounded-xl p-8 text-center cursor-pointer transition-all hover:border-[var(--prd-border-focus)]" style={{ border: "2px dashed var(--prd-border)" }}>
                <Upload size={28} className="mx-auto mb-2" style={{ color: "var(--prd-muted)" }} />
                <p className="text-sm" style={{ color: "var(--prd-muted)" }}>גררו קבצי לוגו, פונטים או מדריך מותג לכאן</p>
                <p className="text-xs mt-1" style={{ color: "var(--prd-muted)", opacity: 0.5 }}>PNG, SVG, PDF, AI</p>
              </div>
            </div>
          </motion.div>
        );

      /* ═══ CONTENT ═══ */
      case "content":
        return (
          <motion.div {...fadeIn} className="space-y-6">
            <SubHeading icon={Type}>תוכן האתר</SubHeading>

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
                <SectionLabel>צריך קופירייטינג?</SectionLabel>
                <PillSelect options={["כן", "לא", "חלקית"]} value={data.needsCopywriting} onChange={(v) => update({ needsCopywriting: v as typeof data.needsCopywriting })} color="#00FF88" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <SectionLabel>צריך צילום מקצועי?</SectionLabel>
                <PillSelect options={["כן", "לא"]} value={data.needsPhotography} onChange={(v) => update({ needsPhotography: v as typeof data.needsPhotography })} color="#FFD93D" />
              </div>
              <div>
                <SectionLabel>צריך הפקת וידאו?</SectionLabel>
                <PillSelect options={["כן", "לא"]} value={data.needsVideoProduction} onChange={(v) => update({ needsVideoProduction: v as typeof data.needsVideoProduction })} color="#FFD93D" />
              </div>
            </div>

            <div>
              <SectionLabel>תוכן קיים</SectionLabel>
              <textarea value={data.existingContent} onChange={(e) => update({ existingContent: e.target.value })} placeholder="האם יש לכם תוכן מוכן? טקסטים, תמונות, סרטונים? פרטו מה זמין ומה צריך ליצור" rows={3} className="prd-textarea" />
            </div>

            <div className="flex items-center justify-between">
              <SubHeading icon={Layers}>מפת תוכן לפי עמודים</SubHeading>
            </div>

            <button onClick={addContentSection} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all" style={{ background: "linear-gradient(135deg, #6C63FF, #00F0FF)" }}>
              <Plus size={16} /> הוסף סעיף תוכן
            </button>

            <AnimatePresence mode="popLayout">
              {data.contentSections.map((section, i) => (
                <motion.div key={section.id} {...stagger(i)} exit={{ opacity: 0, height: 0 }} layout className="glass rounded-xl p-4 group">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] uppercase tracking-wider" style={{ color: "var(--prd-muted)" }}>עמוד</label>
                      <input type="text" value={section.page} onChange={(e) => updateContentSection(section.id, { page: e.target.value })} placeholder="שם העמוד" className="prd-input text-sm mt-1" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-wider" style={{ color: "var(--prd-muted)" }}>סוג תוכן</label>
                      <input type="text" value={section.type} onChange={(e) => updateContentSection(section.id, { type: e.target.value })} placeholder="טקסט / תמונה / וידאו" className="prd-input text-sm mt-1" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-wider" style={{ color: "var(--prd-muted)" }}>מי מספק?</label>
                      <div className="flex gap-1 mt-1">
                        {(["לקוח", "מעצב", "קופירייטר"] as const).map((who) => (
                          <button
                            key={who}
                            onClick={() => updateContentSection(section.id, { whoProvides: who })}
                            className="pill text-[10px] flex-1 text-center transition-all"
                            style={{
                              backgroundColor: section.whoProvides === who ? "rgba(0,240,255,0.12)" : "transparent",
                              color: section.whoProvides === who ? "#00F0FF" : "var(--prd-muted)",
                              border: `1px solid ${section.whoProvides === who ? "rgba(0,240,255,0.3)" : "var(--prd-border)"}`,
                            }}
                          >
                            {who}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <textarea value={section.description} onChange={(e) => updateContentSection(section.id, { description: e.target.value })} placeholder="תיאור מפורט של התוכן הנדרש..." rows={2} className="prd-textarea text-sm flex-1" />
                    <button onClick={() => deleteContentSection(section.id)} className="p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all self-start" style={{ color: "#FF6B6B" }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        );

      /* ═══ FUNCTIONALITY ═══ */
      case "functionality":
        return (
          <motion.div {...fadeIn} className="space-y-6">
            <SubHeading icon={Zap}>פונקציונליות ופיצ׳רים</SubHeading>

            <p className="text-xs" style={{ color: "var(--prd-muted)" }}>
              לחצו על פיצ׳רים רלוונטיים להוסיף אותם לרשימה. לאחר מכן תוכלו להגדיר עדיפות לכל אחד.
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
                    const pri = PRIORITY_CONFIG[feature.priority];
                    const PriIcon = pri.icon;
                    return (
                      <motion.div key={feature.id} {...stagger(i)} exit={{ opacity: 0, height: 0 }} layout className="glass rounded-xl p-4 group">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold flex-1" style={{ color: "var(--prd-heading)" }}>{feature.name}</span>
                          <span className="text-[10px] pill" style={{ backgroundColor: "rgba(108,99,255,0.12)", color: "#6C63FF", border: "1px solid rgba(108,99,255,0.2)" }}>
                            {feature.category}
                          </span>
                          <div className="flex gap-1">
                            {(["חובה", "רצוי", "עתידי"] as const).map((p) => {
                              const cfg = PRIORITY_CONFIG[p];
                              const Icon = cfg.icon;
                              const active = feature.priority === p;
                              return (
                                <button
                                  key={p}
                                  onClick={() => updateFeature(feature.id, { priority: p })}
                                  className="pill flex items-center gap-0.5 text-[10px] transition-all"
                                  style={{
                                    backgroundColor: active ? cfg.bg : "transparent",
                                    color: active ? cfg.color : "var(--prd-muted)",
                                    border: `1px solid ${active ? cfg.color + "40" : "var(--prd-border)"}`,
                                  }}
                                >
                                  <Icon size={9} /> {p}
                                </button>
                              );
                            })}
                          </div>
                          <button onClick={() => deleteFeature(feature.id)} className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all" style={{ color: "#FF6B6B" }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <textarea
                            value={feature.description}
                            onChange={(e) => updateFeature(feature.id, { description: e.target.value })}
                            placeholder="הערות נוספות לפיצ׳ר זה..."
                            rows={1}
                            className="prd-textarea text-xs flex-1"
                          />
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-[10px]" style={{ color: "var(--prd-muted)" }}>₪</span>
                            <input
                              type="number"
                              value={feature.estimatedCost}
                              onChange={(e) => updateFeature(feature.id, { estimatedCost: Number(e.target.value) || 0 })}
                              className="prd-input text-xs font-mono w-20 text-center"
                              dir="ltr"
                            />
                          </div>
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
              <PillSelect
                options={["WordPress", "Webflow", "Next.js", "Wix", "Shopify", "Custom", "לא משנה"]}
                value={data.cmsPreference}
                onChange={(v) => update({ cmsPreference: v as typeof data.cmsPreference })}
                color="#6C63FF"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <SectionLabel>מצב דומיין</SectionLabel>
                <PillSelect options={["יש דומיין", "צריך לרכוש", "לא בטוח"]} value={data.domainStatus} onChange={(v) => update({ domainStatus: v as typeof data.domainStatus })} color="#00FF88" />
              </div>
              <div>
                <SectionLabel>שם דומיין (אם רלוונטי)</SectionLabel>
                <input type="text" value={data.domainName} onChange={(e) => update({ domainName: e.target.value })} placeholder="example.co.il" className="prd-input" dir="ltr" />
              </div>
            </div>

            <div>
              <SectionLabel>אחסון (Hosting)</SectionLabel>
              <input type="text" value={data.hostingPreference} onChange={(e) => update({ hostingPreference: e.target.value })} placeholder="לדוגמה: יש אחסון קיים, צריך המלצה, Vercel, AWS..." className="prd-input" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="glass-inset rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock size={14} style={{ color: "#00FF88" }} />
                    <span className="text-xs" style={{ color: "var(--prd-heading)" }}>תעודת SSL</span>
                  </div>
                  <button
                    onClick={() => update({ sslNeeded: !data.sslNeeded })}
                    className="w-10 h-5 rounded-full transition-all relative"
                    style={{ backgroundColor: data.sslNeeded ? "rgba(0,255,136,0.3)" : "var(--prd-surface)" }}
                  >
                    <div
                      className="w-4 h-4 rounded-full absolute top-0.5 transition-all"
                      style={{
                        backgroundColor: data.sslNeeded ? "#00FF88" : "var(--prd-muted)",
                        right: data.sslNeeded ? "1px" : "auto",
                        left: data.sslNeeded ? "auto" : "1px",
                      }}
                    />
                  </button>
                </div>
              </div>
              <div className="glass-inset rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone size={14} style={{ color: "#00F0FF" }} />
                    <span className="text-xs" style={{ color: "var(--prd-heading)" }}>רספונסיבי (מובייל)</span>
                  </div>
                  <button
                    onClick={() => update({ responsiveDesign: !data.responsiveDesign })}
                    className="w-10 h-5 rounded-full transition-all relative"
                    style={{ backgroundColor: data.responsiveDesign ? "rgba(0,240,255,0.3)" : "var(--prd-surface)" }}
                  >
                    <div
                      className="w-4 h-4 rounded-full absolute top-0.5 transition-all"
                      style={{
                        backgroundColor: data.responsiveDesign ? "#00F0FF" : "var(--prd-muted)",
                        right: data.responsiveDesign ? "1px" : "auto",
                        left: data.responsiveDesign ? "auto" : "1px",
                      }}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <SectionLabel>אינטגרציות נדרשות</SectionLabel>
              <textarea value={data.integrationsNeeded} onChange={(e) => update({ integrationsNeeded: e.target.value })} placeholder="לדוגמה: Google Maps, PayPal, סליקה ישראלית (Tranzila/CardCom), Mailchimp, CRM..." rows={3} className="prd-textarea" />
            </div>

            <div>
              <SectionLabel>דרישות API</SectionLabel>
              <textarea value={data.apiRequirements} onChange={(e) => update({ apiRequirements: e.target.value })} placeholder="האם יש צורך בחיבור ל-API חיצוני? פרטו..." rows={2} className="prd-textarea" />
            </div>

            <div>
              <SectionLabel>דרישות ביצועים</SectionLabel>
              <textarea value={data.performanceNotes} onChange={(e) => update({ performanceNotes: e.target.value })} placeholder="זמן טעינה מקסימלי, עומס צפוי, CDN..." rows={2} className="prd-textarea" />
            </div>

            <div>
              <SectionLabel>דרישות אבטחה</SectionLabel>
              <textarea value={data.securityRequirements} onChange={(e) => update({ securityRequirements: e.target.value })} placeholder="GDPR, תקני אבטחה, גיבויים, 2FA..." rows={2} className="prd-textarea" />
            </div>

            <div>
              <SectionLabel>תמיכת דפדפנים</SectionLabel>
              <input type="text" value={data.browserSupport} onChange={(e) => update({ browserSupport: e.target.value })} placeholder="Chrome, Safari, Firefox, Edge, IE..." className="prd-input" dir="ltr" />
            </div>
          </motion.div>
        );

      /* ═══ SEO ═══ */
      case "seo":
        return (
          <motion.div {...fadeIn} className="space-y-6">
            <SubHeading icon={TrendingUp}>SEO ושיווק דיגיטלי</SubHeading>

            <div>
              <SectionLabel>מילות מפתח מטרה</SectionLabel>
              <textarea value={data.targetKeywords} onChange={(e) => update({ targetKeywords: e.target.value })} placeholder="רשמו מילות מפתח שחשוב לכם לדרג בהן בגוגל&#10;לדוגמה: עורך דין תל אביב, מסעדה איטלקית הרצליה" rows={4} className="prd-textarea" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="glass-inset rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 size={14} style={{ color: "#FFD93D" }} />
                    <span className="text-xs" style={{ color: "var(--prd-heading)" }}>Google Analytics</span>
                  </div>
                  <button
                    onClick={() => update({ googleAnalytics: !data.googleAnalytics })}
                    className="w-10 h-5 rounded-full transition-all relative"
                    style={{ backgroundColor: data.googleAnalytics ? "rgba(255,217,61,0.3)" : "var(--prd-surface)" }}
                  >
                    <div
                      className="w-4 h-4 rounded-full absolute top-0.5 transition-all"
                      style={{
                        backgroundColor: data.googleAnalytics ? "#FFD93D" : "var(--prd-muted)",
                        right: data.googleAnalytics ? "1px" : "auto",
                        left: data.googleAnalytics ? "auto" : "1px",
                      }}
                    />
                  </button>
                </div>
              </div>
              <div className="glass-inset rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Search size={14} style={{ color: "#00F0FF" }} />
                    <span className="text-xs" style={{ color: "var(--prd-heading)" }}>Search Console</span>
                  </div>
                  <button
                    onClick={() => update({ searchConsole: !data.searchConsole })}
                    className="w-10 h-5 rounded-full transition-all relative"
                    style={{ backgroundColor: data.searchConsole ? "rgba(0,240,255,0.3)" : "var(--prd-surface)" }}
                  >
                    <div
                      className="w-4 h-4 rounded-full absolute top-0.5 transition-all"
                      style={{
                        backgroundColor: data.searchConsole ? "#00F0FF" : "var(--prd-muted)",
                        right: data.searchConsole ? "1px" : "auto",
                        left: data.searchConsole ? "auto" : "1px",
                      }}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <SectionLabel>רשתות חברתיות</SectionLabel>
              <div className="flex flex-wrap gap-2">
                {["Facebook", "Instagram", "LinkedIn", "Twitter / X", "TikTok", "YouTube", "Pinterest", "WhatsApp"].map((sn) => {
                  const active = data.socialMedia.includes(sn);
                  return (
                    <button
                      key={sn}
                      onClick={() => update({ socialMedia: toggleArrayItem(data.socialMedia, sn) })}
                      className="pill flex items-center gap-1 transition-all text-xs"
                      style={{
                        backgroundColor: active ? "rgba(108,99,255,0.12)" : "transparent",
                        color: active ? "#6C63FF" : "var(--prd-muted)",
                        border: `1px solid ${active ? "rgba(108,99,255,0.3)" : "var(--prd-border)"}`,
                      }}
                    >
                      {active && <Check size={10} />} {sn}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <SectionLabel>שיווק במייל</SectionLabel>
                <PillSelect options={["כן", "לא", "אולי בעתיד"]} value={data.emailMarketing} onChange={(v) => update({ emailMarketing: v as typeof data.emailMarketing })} color="#00FF88" />
              </div>
              <div>
                <SectionLabel>SEO מקומי</SectionLabel>
                <PillSelect options={["כן", "לא"]} value={data.localSeo} onChange={(v) => update({ localSeo: v as typeof data.localSeo })} color="#FFD93D" />
              </div>
            </div>

            <div>
              <SectionLabel>Google Business Profile</SectionLabel>
              <PillSelect options={["כן, קיים", "לא, צריך ליצור", "לא רלוונטי"]} value={data.googleBusiness} onChange={(v) => update({ googleBusiness: v as typeof data.googleBusiness })} color="#00F0FF" />
            </div>

            <div>
              <SectionLabel>הערות SEO נוספות</SectionLabel>
              <textarea value={data.seoNotes} onChange={(e) => update({ seoNotes: e.target.value })} placeholder="דרישות SEO מיוחדות, קמפיינים מתוכננים, שיווק PPC..." rows={3} className="prd-textarea" />
            </div>
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
              <SectionLabel>הערות תקציב</SectionLabel>
              <textarea value={data.budgetNotes} onChange={(e) => update({ budgetNotes: e.target.value })} placeholder="האם התקציב כולל תוכן? עיצוב לוגו? תחזוקה שנתית?" rows={2} className="prd-textarea" />
            </div>

            <div>
              <SectionLabel>צריך תחזוקה שוטפת?</SectionLabel>
              <PillSelect options={["כן", "לא", "אולי"]} value={data.maintenanceNeeded} onChange={(v) => update({ maintenanceNeeded: v as typeof data.maintenanceNeeded })} color="#FFD93D" />
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

            <div className="flex items-center justify-between mt-4">
              <SubHeading icon={Flag}>שלבי פרויקט</SubHeading>
            </div>

            <button onClick={addPhase} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all" style={{ background: "linear-gradient(135deg, #6C63FF, #00F0FF)" }}>
              <Plus size={16} /> הוסף שלב
            </button>

            <AnimatePresence mode="popLayout">
              {data.phases.map((phase, i) => (
                <motion.div key={phase.id} {...stagger(i)} exit={{ opacity: 0, height: 0 }} layout className="glass rounded-xl p-5 group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold" style={{ backgroundColor: "rgba(0,240,255,0.12)", color: "#00F0FF" }}>
                        {i + 1}
                      </div>
                      <input
                        type="text"
                        value={phase.name}
                        onChange={(e) => updatePhase(phase.id, { name: e.target.value })}
                        className="text-base font-semibold bg-transparent border-none outline-none"
                        style={{ color: "var(--prd-heading)" }}
                      />
                    </div>
                    <button onClick={() => deletePhase(phase.id)} className="p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all" style={{ color: "#FF6B6B" }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
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
                </motion.div>
              ))}
            </AnimatePresence>

            {data.phases.length === 0 && (
              <div className="glass-inset rounded-xl p-8 text-center">
                <Calendar size={28} className="mx-auto mb-2 opacity-30" style={{ color: "var(--prd-muted)" }} />
                <p className="text-sm" style={{ color: "var(--prd-muted)" }}>טרם הוגדרו שלבי פרויקט</p>
                <p className="text-xs mt-1" style={{ color: "var(--prd-muted)", opacity: 0.6 }}>
                  לדוגמה: אפיון, עיצוב, פיתוח, תוכן, בדיקות, השקה
                </p>
              </div>
            )}
          </motion.div>
        );

      /* ═══ COMPETITORS ═══ */
      case "competitors":
        return (
          <motion.div {...fadeIn} className="space-y-4">
            <SubHeading icon={Target}>ניתוח מתחרים</SubHeading>

            <p className="text-xs" style={{ color: "var(--prd-muted)" }}>
              ציינו אתרים של מתחרים ישירים או אתרים באותו התחום. נתחו מה עובד ומה לא.
            </p>

            <button onClick={addCompetitor} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all" style={{ background: "linear-gradient(135deg, #6C63FF, #00F0FF)" }}>
              <Plus size={16} /> הוסף מתחרה
            </button>

            <AnimatePresence mode="popLayout">
              {data.competitors.map((comp, i) => (
                <motion.div key={comp.id} {...stagger(i)} exit={{ opacity: 0, height: 0 }} layout className="glass rounded-xl p-5 group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold" style={{ backgroundColor: "rgba(255,107,107,0.12)", color: "#FF6B6B" }}>
                        {i + 1}
                      </div>
                      <input
                        type="url"
                        value={comp.url}
                        onChange={(e) => updateCompetitor(comp.id, { url: e.target.value })}
                        placeholder="https://www.competitor.co.il"
                        className="prd-input text-sm flex-1"
                        dir="ltr"
                      />
                    </div>
                    <button onClick={() => deleteCompetitor(comp.id)} className="p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all mr-2" style={{ color: "#FF6B6B" }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="flex items-center gap-1 text-[10px] uppercase tracking-wider mb-1" style={{ color: "#00FF88" }}>
                        <Heart size={10} /> מה אהבתם
                      </label>
                      <textarea value={comp.likes} onChange={(e) => updateCompetitor(comp.id, { likes: e.target.value })} placeholder="עיצוב, חוויית משתמש, תוכן, פיצ׳רים..." rows={2} className="prd-textarea text-sm" />
                    </div>
                    <div>
                      <label className="flex items-center gap-1 text-[10px] uppercase tracking-wider mb-1" style={{ color: "#FF6B6B" }}>
                        <AlertTriangle size={10} /> מה לא אהבתם
                      </label>
                      <textarea value={comp.dislikes} onChange={(e) => updateCompetitor(comp.id, { dislikes: e.target.value })} placeholder="מה הייתם עושים אחרת? מה חסר?" rows={2} className="prd-textarea text-sm" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {data.competitors.length === 0 && (
              <div className="glass-inset rounded-xl p-10 text-center">
                <Target size={32} className="mx-auto mb-3 opacity-30" style={{ color: "var(--prd-muted)" }} />
                <p className="text-sm" style={{ color: "var(--prd-muted)" }}>טרם הוספו מתחרים</p>
                <p className="text-xs mt-1" style={{ color: "var(--prd-muted)", opacity: 0.6 }}>
                  ניתוח מתחרים עוזר להבין מה עובד בתחום ומה אפשר לעשות טוב יותר
                </p>
              </div>
            )}
          </motion.div>
        );

      /* ═══ SUMMARY ═══ */
      case "summary": {
        const baseCost = dynamicBaseCosts[data.siteType] || 5000;
        const featuresTotalCost = data.selectedFeatures.reduce((sum, f) => sum + (f.estimatedCost || 0), 0);
        const designExtra = data.hasLogo === "צריך עיצוב" ? (dynamicExtrasCosts["עיצוב לוגו"] || 2500) : 0;
        const copyExtra = data.needsCopywriting === "כן" ? (dynamicExtrasCosts["קופירייטינג מלא"] || 3000) : data.needsCopywriting === "חלקית" ? (dynamicExtrasCosts["קופירייטינג חלקי"] || 1500) : 0;
        const seoExtra = data.targetKeywords.length > 0 ? (dynamicExtrasCosts["SEO בסיסי"] || 2000) : 0;
        const multiLangExtra = data.contentLanguages.length > 1 ? (data.contentLanguages.length - 1) * (dynamicExtrasCosts["שפה נוספת (לשפה)"] || 2500) : 0;
        const totalEstimate = baseCost + featuresTotalCost + designExtra + copyExtra + seoExtra + multiLangExtra;
        const mustHaveCost = data.selectedFeatures.filter((f) => f.priority === "חובה").reduce((s, f) => s + (f.estimatedCost || 0), 0);
        const niceCost = data.selectedFeatures.filter((f) => f.priority === "רצוי").reduce((s, f) => s + (f.estimatedCost || 0), 0);
        const futureCost = data.selectedFeatures.filter((f) => f.priority === "עתידי").reduce((s, f) => s + (f.estimatedCost || 0), 0);

        const calcMonthly = data.selectedMonthly.reduce((s, name) => s + (dynamicMonthlyCosts[name] || 0), 0);
        const calcYearly = data.selectedYearly.reduce((s, name) => s + (dynamicYearlyCosts[name] || 0), 0);

        const displayOneTime = data.finalPriceOverride ?? totalEstimate;
        const displayMonthly = data.finalMonthlyOverride ?? calcMonthly;
        const displayYearly = data.finalYearlyOverride ?? (calcYearly + calcMonthly * 12);

        const monthlySelectedTotal = displayMonthly;
        const yearlySelectedTotal = displayYearly;

        const firstYearTotal = displayOneTime + displayYearly;

        return (
          <motion.div {...fadeIn} className="space-y-6">
            {/* ─── Pricing hero ─── */}
            <div className="glass-heavy rounded-2xl overflow-hidden">
              {/* Main price */}
              <div className="p-6 pb-5 text-center relative group/main" style={{ background: "linear-gradient(180deg, rgba(0,255,136,0.06) 0%, transparent 100%)" }}>
                <p className="text-[10px] uppercase tracking-widest mb-2 font-semibold" style={{ color: "var(--prd-muted)" }}>הערכת עלות הקמת הפרויקט</p>
                <div className="flex items-center justify-center gap-2">
                  {data.finalPriceOverride !== null ? (
                    <input
                      type="number"
                      value={data.finalPriceOverride}
                      onChange={(e) => update({ finalPriceOverride: e.target.value === "" ? null : Number(e.target.value) })}
                      className="text-5xl font-black font-mono leading-none text-center bg-transparent border-none outline-none w-64"
                      style={{ color: "#00FF88" }}
                      dir="ltr"
                    />
                  ) : (
                    <p className="text-5xl font-black font-mono leading-none" style={{ color: "#00FF88" }} dir="ltr">{formatCurrency(totalEstimate)}</p>
                  )}
                  <div className="flex gap-1">
                    <button
                      onClick={() => update({ finalPriceOverride: data.finalPriceOverride !== null ? null : totalEstimate })}
                      className="p-1.5 rounded-lg transition-all opacity-0 group-hover/main:opacity-100"
                      style={{ backgroundColor: "rgba(0,255,136,0.1)", color: "#00FF88" }}
                      title={data.finalPriceOverride !== null ? "חזור לחישוב אוטומטי" : "ערוך מחיר סופי"}
                    >
                      {data.finalPriceOverride !== null ? <RotateCcw size={14} /> : <Pencil size={14} />}
                    </button>
                  </div>
                </div>
                {data.finalPriceOverride !== null && (
                  <p className="text-[10px] mt-1" style={{ color: "#00FF88", opacity: 0.7 }}>מחיר ידני (מקור: {formatCurrency(totalEstimate)})</p>
                )}
                <p className="text-xs mt-2" style={{ color: "var(--prd-muted)" }}>תשלום חד-פעמי</p>
              </div>

              {/* Recurring costs bar */}
              <div className="grid grid-cols-2" style={{ borderTop: "0.5px solid var(--prd-border)" }}>
                <div className="p-4 text-center relative group/mo" style={{ borderLeft: "0.5px solid var(--prd-border)" }}>
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#00F0FF" }} />
                    <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: "var(--prd-muted)" }}>חודשי</p>
                    <button
                      onClick={() => update({ finalMonthlyOverride: data.finalMonthlyOverride !== null ? null : calcMonthly })}
                      className="p-1 rounded-lg transition-all opacity-0 group-hover/mo:opacity-100"
                      style={{ backgroundColor: "rgba(0,240,255,0.1)", color: "#00F0FF" }}
                      title={data.finalMonthlyOverride !== null ? "חזור לחישוב אוטומטי" : "ערוך מחיר חודשי"}
                    >
                      {data.finalMonthlyOverride !== null ? <RotateCcw size={12} /> : <Pencil size={12} />}
                    </button>
                  </div>
                  {data.finalMonthlyOverride !== null ? (
                    <>
                      <input
                        type="number"
                        value={data.finalMonthlyOverride}
                        onChange={(e) => update({ finalMonthlyOverride: e.target.value === "" ? null : Number(e.target.value) })}
                        className="text-xl font-black font-mono text-center bg-transparent border-none outline-none w-full"
                        style={{ color: "#00F0FF" }}
                        dir="ltr"
                      />
                      <p className="text-[10px]" style={{ color: "#00F0FF", opacity: 0.6 }}>מקור: {formatCurrency(calcMonthly)}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-xl font-black font-mono" style={{ color: calcMonthly > 0 ? "#00F0FF" : "var(--prd-muted)" }} dir="ltr">
                        {formatCurrency(calcMonthly)}
                      </p>
                      <p className="text-[10px]" style={{ color: "var(--prd-muted)" }}>
                        {data.selectedMonthly.length > 0 ? `${data.selectedMonthly.length} שירותים` : "בחרו למטה"}
                      </p>
                    </>
                  )}
                </div>
                <div className="p-4 text-center relative group/yr">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#FF6B6B" }} />
                    <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: "var(--prd-muted)" }}>שנתי (כולל חודשי)</p>
                    <button
                      onClick={() => update({ finalYearlyOverride: data.finalYearlyOverride !== null ? null : (calcYearly + calcMonthly * 12) })}
                      className="p-1 rounded-lg transition-all opacity-0 group-hover/yr:opacity-100"
                      style={{ backgroundColor: "rgba(255,107,107,0.1)", color: "#FF6B6B" }}
                      title={data.finalYearlyOverride !== null ? "חזור לחישוב אוטומטי" : "ערוך מחיר שנתי"}
                    >
                      {data.finalYearlyOverride !== null ? <RotateCcw size={12} /> : <Pencil size={12} />}
                    </button>
                  </div>
                  {data.finalYearlyOverride !== null ? (
                    <>
                      <input
                        type="number"
                        value={data.finalYearlyOverride}
                        onChange={(e) => update({ finalYearlyOverride: e.target.value === "" ? null : Number(e.target.value) })}
                        className="text-xl font-black font-mono text-center bg-transparent border-none outline-none w-full"
                        style={{ color: "#FF6B6B" }}
                        dir="ltr"
                      />
                      <p className="text-[10px]" style={{ color: "#FF6B6B", opacity: 0.6 }}>מקור: {formatCurrency(calcYearly + calcMonthly * 12)}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-xl font-black font-mono" style={{ color: (calcYearly > 0 || calcMonthly > 0) ? "#FF6B6B" : "var(--prd-muted)" }} dir="ltr">
                        {formatCurrency(calcYearly + calcMonthly * 12)}
                      </p>
                      <p className="text-[10px]" style={{ color: "var(--prd-muted)" }}>
                        {(data.selectedYearly.length + data.selectedMonthly.length) > 0 ? `${data.selectedYearly.length + data.selectedMonthly.length} שירותים` : "בחרו למטה"}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* First year total */}
              <div className="px-5 py-3 flex items-center justify-between" style={{ background: "linear-gradient(90deg, rgba(108,99,255,0.08), rgba(0,240,255,0.08))", borderTop: "0.5px solid var(--prd-border)" }}>
                <span className="text-xs font-bold" style={{ color: "var(--prd-heading)" }}>עלות שנה ראשונה כוללת</span>
                <span className="text-base font-black font-mono" style={{ color: "#6C63FF" }} dir="ltr">
                  {formatCurrency(firstYearTotal)}
                </span>
              </div>
            </div>

            <p className="text-[10px] text-center -mt-3" style={{ color: "var(--prd-muted)" }}>
              * לחצו על העיפרון כדי לערוך את המחיר הסופי — {data.finalPriceOverride !== null || data.finalMonthlyOverride !== null || data.finalYearlyOverride !== null ? "מחירים ידניים פעילים" : "כרגע מוצג חישוב אוטומטי"}
            </p>

            {/* ─── Cost breakdown ─── */}
            <div className="glass rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold" style={{ color: "var(--prd-heading)" }}>פירוט הקמה (חד-פעמי)</h4>
                <span className="text-xs font-mono font-bold" style={{ color: "#00FF88" }} dir="ltr">{formatCurrency(totalEstimate)}</span>
              </div>

              <div className="space-y-1.5">
                {/* Each cost line as a clean row with progress-bar-style background */}
                {[
                  { label: `בסיס — ${data.siteType || "אתר"}`, amount: baseCost, color: "#00F0FF", icon: Globe, show: true },
                  { label: `פיצ׳רי חובה (${data.selectedFeatures.filter(f => f.priority === "חובה").length})`, amount: mustHaveCost, color: "#FF6B6B", icon: ArrowUp, show: mustHaveCost > 0 },
                  { label: `פיצ׳רים רצויים (${data.selectedFeatures.filter(f => f.priority === "רצוי").length})`, amount: niceCost, color: "#FFD93D", icon: Minus, show: niceCost > 0 },
                  { label: `פיצ׳רים עתידיים (${data.selectedFeatures.filter(f => f.priority === "עתידי").length})`, amount: futureCost, color: "#00FF88", icon: ArrowDown, show: futureCost > 0 },
                  { label: "עיצוב לוגו", amount: designExtra, color: "#6C63FF", icon: Palette, show: designExtra > 0 },
                  { label: "קופירייטינג", amount: copyExtra, color: "#6C63FF", icon: Type, show: copyExtra > 0 },
                  { label: "SEO בסיסי", amount: seoExtra, color: "#6C63FF", icon: TrendingUp, show: seoExtra > 0 },
                  { label: `רב-שפתיות (${data.contentLanguages.length} שפות)`, amount: multiLangExtra, color: "#6C63FF", icon: Globe, show: multiLangExtra > 0 },
                ].filter(r => r.show).map((row) => {
                  const Icon = row.icon;
                  const pct = totalEstimate > 0 ? Math.max(4, (row.amount / totalEstimate) * 100) : 0;
                  return (
                    <div key={row.label} className="relative rounded-xl overflow-hidden" style={{ backgroundColor: "var(--prd-surface)" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="absolute inset-y-0 right-0 rounded-xl"
                        style={{ backgroundColor: `${row.color}10` }}
                      />
                      <div className="relative flex items-center justify-between py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <Icon size={13} style={{ color: row.color }} />
                          <span className="text-xs font-medium" style={{ color: "var(--prd-heading)" }}>{row.label}</span>
                        </div>
                        <span className="text-xs font-mono font-bold" style={{ color: row.color }} dir="ltr">{formatCurrency(row.amount)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ─── Feature cost table ─── */}
            {data.selectedFeatures.length > 0 && (
              <div className="glass rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold" style={{ color: "var(--prd-heading)" }}>פיצ׳רים ({data.selectedFeatures.length})</h4>
                  <span className="text-xs font-mono font-bold" style={{ color: "var(--prd-muted)" }} dir="ltr">{formatCurrency(featuresTotalCost)}</span>
                </div>
                <div className="space-y-0.5">
                  {data.selectedFeatures.map((f) => {
                    const pri = PRIORITY_CONFIG[f.priority];
                    return (
                      <div key={f.id} className="flex items-center justify-between py-2 px-3 rounded-lg transition-all" style={{ backgroundColor: "transparent" }}>
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: pri.color }} />
                          <span className="text-xs truncate" style={{ color: "var(--prd-heading)" }}>{f.name}</span>
                          <span className="text-[8px] pill shrink-0 px-1.5" style={{ backgroundColor: pri.bg, color: pri.color }}>
                            {f.priority}
                          </span>
                        </div>
                        <span className="text-xs font-mono shrink-0 mr-2" style={{ color: "var(--prd-muted)" }} dir="ltr">{formatCurrency(f.estimatedCost)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─── Project summary ─── */}
            <div className="glass rounded-xl p-5">
              <h4 className="text-sm font-bold mb-4" style={{ color: "var(--prd-heading)" }}>כרטיס פרויקט</h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "שם הפרויקט", value: data.projectName || "—", color: "var(--prd-heading)" },
                  { label: "לקוח", value: data.clientName || "—", color: "var(--prd-heading)" },
                  { label: "סוג אתר", value: data.siteType || "—", color: "#00F0FF" },
                  { label: "סוג עסק", value: data.businessType || "—", color: "var(--prd-heading)" },
                  { label: "CMS", value: data.cmsPreference || "—", color: "#6C63FF" },
                  { label: "דומיין", value: data.domainName || data.domainStatus || "—", color: "var(--prd-heading)" },
                  { label: "שפות", value: data.contentLanguages.join(", ") || "—", color: "var(--prd-heading)" },
                  { label: "דדליין", value: data.deadline || "—", color: data.deadline ? "#FF6B6B" : "var(--prd-muted)" },
                ].map((item) => (
                  <div key={item.label} className="py-2 px-3 rounded-lg" style={{ backgroundColor: "var(--prd-surface)" }}>
                    <p className="text-[9px] uppercase tracking-wider" style={{ color: "var(--prd-muted)" }}>{item.label}</p>
                    <p className="text-xs font-semibold mt-0.5 truncate" style={{ color: item.color }}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ─── Sections status ─── */}
            <div className="glass rounded-xl p-5">
              <h4 className="text-sm font-bold mb-4" style={{ color: "var(--prd-heading)" }}>סטטוס סעיפים</h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {[
                  { label: "עמודים", value: data.pages.length, icon: Layout, color: "#00F0FF" },
                  { label: "פיצ׳רים", value: data.selectedFeatures.length, icon: Zap, color: "#6C63FF" },
                  { label: "חובה", value: data.selectedFeatures.filter((f) => f.priority === "חובה").length, icon: ArrowUp, color: "#FF6B6B" },
                  { label: "תוכן", value: data.contentSections.length, icon: Type, color: "#00FF88" },
                  { label: "שלבים", value: data.phases.length, icon: Calendar, color: "#FFD93D" },
                  { label: "מתחרים", value: data.competitors.length, icon: Target, color: "#FF6B6B" },
                  { label: "רשתות", value: data.socialMedia.length, icon: Megaphone, color: "#6C63FF" },
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
            <div className="glass rounded-xl p-5">
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

            {/* ─── Monthly services selection ─── */}
            {Object.keys(dynamicMonthlyCosts).length > 0 && (
              <div className="glass rounded-xl p-5">
                <h4 className="text-sm font-bold mb-1" style={{ color: "var(--prd-heading)" }}>שירותים חודשיים</h4>
                <p className="text-[10px] mb-4" style={{ color: "var(--prd-muted)" }}>בחרו שירותים חוזרים שתרצו לכלול</p>
                <div className="space-y-2">
                  {Object.entries(dynamicMonthlyCosts).map(([name, cost]) => {
                    const selected = data.selectedMonthly.includes(name);
                    return (
                      <div
                        key={name}
                        onClick={() => update({ selectedMonthly: selected ? data.selectedMonthly.filter((n) => n !== name) : [...data.selectedMonthly, name] })}
                        className="flex items-center justify-between py-2 px-3 rounded-xl cursor-pointer transition-all"
                        style={{ backgroundColor: selected ? "rgba(0,240,255,0.08)" : "var(--prd-surface)", border: `0.5px solid ${selected ? "rgba(0,240,255,0.2)" : "transparent"}` }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: selected ? "rgba(0,240,255,0.2)" : "var(--prd-surface)", border: `1px solid ${selected ? "#00F0FF" : "var(--prd-border)"}` }}>
                            {selected && <Check size={10} style={{ color: "#00F0FF" }} />}
                          </div>
                          <span className="text-xs" style={{ color: selected ? "var(--prd-heading)" : "var(--prd-muted)" }}>{name}</span>
                        </div>
                        <span className="text-xs font-mono font-bold" style={{ color: selected ? "#00F0FF" : "var(--prd-muted)" }} dir="ltr">{formatCurrency(cost)}/חודש</span>
                      </div>
                    );
                  })}
                </div>
                {data.selectedMonthly.length > 0 && (
                  <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: "0.5px solid var(--prd-border)" }}>
                    <span className="text-xs font-bold" style={{ color: "var(--prd-heading)" }}>סה״כ חודשי</span>
                    <span className="text-sm font-mono font-bold" style={{ color: "#00F0FF" }} dir="ltr">{formatCurrency(monthlySelectedTotal)}/חודש</span>
                  </div>
                )}
              </div>
            )}

            {/* ─── Yearly services selection ─── */}
            {Object.keys(dynamicYearlyCosts).length > 0 && (
              <div className="glass rounded-xl p-5">
                <h4 className="text-sm font-bold mb-1" style={{ color: "var(--prd-heading)" }}>שירותים שנתיים</h4>
                <p className="text-[10px] mb-4" style={{ color: "var(--prd-muted)" }}>בחרו שירותים שנתיים שתרצו לכלול</p>
                <div className="space-y-2">
                  {Object.entries(dynamicYearlyCosts).map(([name, cost]) => {
                    const selected = data.selectedYearly.includes(name);
                    return (
                      <div
                        key={name}
                        onClick={() => update({ selectedYearly: selected ? data.selectedYearly.filter((n) => n !== name) : [...data.selectedYearly, name] })}
                        className="flex items-center justify-between py-2 px-3 rounded-xl cursor-pointer transition-all"
                        style={{ backgroundColor: selected ? "rgba(255,107,107,0.08)" : "var(--prd-surface)", border: `0.5px solid ${selected ? "rgba(255,107,107,0.2)" : "transparent"}` }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: selected ? "rgba(255,107,107,0.2)" : "var(--prd-surface)", border: `1px solid ${selected ? "#FF6B6B" : "var(--prd-border)"}` }}>
                            {selected && <Check size={10} style={{ color: "#FF6B6B" }} />}
                          </div>
                          <span className="text-xs" style={{ color: selected ? "var(--prd-heading)" : "var(--prd-muted)" }}>{name}</span>
                        </div>
                        <span className="text-xs font-mono font-bold" style={{ color: selected ? "#FF6B6B" : "var(--prd-muted)" }} dir="ltr">{formatCurrency(cost)}/שנה</span>
                      </div>
                    );
                  })}
                </div>
                {data.selectedYearly.length > 0 && (
                  <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: "0.5px solid var(--prd-border)" }}>
                    <span className="text-xs font-bold" style={{ color: "var(--prd-heading)" }}>סה״כ שנתי</span>
                    <span className="text-sm font-mono font-bold" style={{ color: "#FF6B6B" }} dir="ltr">{formatCurrency(yearlySelectedTotal)}/שנה</span>
                  </div>
                )}
              </div>
            )}

            {/* ─── Notes ─── */}
            <div className="glass-inset rounded-xl p-4 text-center">
              <p className="text-xs" style={{ color: "var(--prd-muted)" }}>
                💡 העלויות המוצגות הן הערכה ראשונית בלבד ועשויות להשתנות בהתאם לדרישות מפורטות.
                <br />
                ניתן לערוך את העלות של כל פיצ׳ר בטאב ״פונקציונליות״.
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
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg, #6C63FF, #00F0FF)", boxShadow: "0 4px 16px rgba(0,240,255,0.2)" }}>
                <Globe size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold" style={{ color: "var(--prd-heading)" }}>
                  אפיון אתר
                </h1>
                <p className="text-xs" style={{ color: "var(--prd-muted)" }}>מסמך אפיון מקצועי לבניית אתר</p>
              </div>
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
                      className="absolute left-0 top-full mt-2 z-50 glass rounded-xl p-2 min-w-[180px] shadow-2xl"
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 -mb-1">
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
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2" size={15} style={{ color: "var(--prd-muted)" }} />
              <input
                type="text"
                placeholder="חיפוש באפיון..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="prd-input pr-10"
              />
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
                  { label: "תוכן", value: data.contentSections.length, icon: Type, color: "#00FF88" },
                  { label: "שלבים", value: data.phases.length, icon: Calendar, color: "#FFD93D" },
                  { label: "מתחרים", value: data.competitors.length, icon: Target, color: "#FF6B6B" },
                  { label: "שפות", value: data.contentLanguages.length, icon: Globe, color: "#00F0FF" },
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

            {/* Features breakdown */}
            {data.selectedFeatures.length > 0 && (
              <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Zap size={16} style={{ color: "#00F0FF" }} />
                  <h3 className="text-sm font-semibold" style={{ color: "var(--prd-heading)" }}>פיצ׳רים לפי עדיפות</h3>
                </div>
                <div className="space-y-2">
                  {(["חובה", "רצוי", "עתידי"] as const).map((priority) => {
                    const count = data.selectedFeatures.filter((f) => f.priority === priority).length;
                    const cfg = PRIORITY_CONFIG[priority];
                    const Icon = cfg.icon;
                    return (
                      <div key={priority} className="flex items-center justify-between py-0.5">
                        <div className="flex items-center gap-2">
                          <Icon size={12} style={{ color: cfg.color }} />
                          <span className="text-xs" style={{ color: cfg.color }}>{priority}</span>
                        </div>
                        <span className="text-xs font-mono font-bold" style={{ color: "var(--prd-heading)" }}>{count}</span>
                      </div>
                    );
                  })}
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
