"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Save,
  RefreshCw,
  DollarSign,
  Globe,
  Zap,
  Mail,
  ShoppingCart,
  BookOpen,
  MessageSquare,
  Users,
  Code,
  Settings,
  Check,
  AlertTriangle,
  ArrowRight,
  Shield,
  Loader2,
  Sun,
  Moon,
  FileText,
  Calendar,
  Repeat,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Types ─── */
interface PricingData {
  featureCosts: Record<string, number>;
  baseCosts: Record<string, number>;
  extrasCosts: Record<string, number>;
  monthlyCosts: Record<string, number>;
  yearlyCosts: Record<string, number>;
  updatedAt: string;
}

/* ─── Feature categories for organized display ─── */
const FEATURE_GROUPS = [
  { name: "טפסים", icon: Mail, color: "#00F0FF", items: ["טופס יצירת קשר", "טופס הרשמה", "טופס הצעת מחיר", "טופס משוב", "טופס הזמנת פגישה", "טופס ניוזלטר"] },
  { name: "מסחר", icon: ShoppingCart, color: "#00FF88", items: ["עגלת קניות", "תשלום אונליין", "ניהול מלאי", "קופונים והנחות", "מעקב הזמנות", "סליקת אשראי"] },
  { name: "תוכן", icon: BookOpen, color: "#6C63FF", items: ["בלוג / חדשות", "גלריית תמונות", "גלריית וידאו", "עמוד שאלות נפוצות", "המלצות לקוחות", "פודקאסט"] },
  { name: "אינטראקציה", icon: MessageSquare, color: "#FFD93D", items: ["צ׳אט חי", "צ׳אטבוט AI", "תגובות", "דירוגים וביקורות", "שיתוף חברתי", "מערכת הודעות"] },
  { name: "משתמשים", icon: Users, color: "#FF6B6B", items: ["הרשמה והתחברות", "פרופיל משתמש", "אזור אישי", "היסטוריית הזמנות", "רשימת מועדפים", "התחברות עם Google/Facebook"] },
  { name: "מתקדם", icon: Code, color: "#00F0FF", items: ["חיפוש באתר", "מפת אתר", "רב-שפתיות", "נגישות (AA/AAA)", "אנימציות", "מפה אינטראקטיבית"] },
];

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};

const stagger = (i: number) => ({
  initial: { opacity: 0, y: 12 } as const,
  animate: { opacity: 1, y: 0 } as const,
  transition: { delay: i * 0.03, duration: 0.25 },
});

export default function AdminPricing() {
  const [pricing, setPricing] = useState<PricingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState<"features" | "base" | "extras" | "monthly" | "yearly">("base");

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

  /* ─── Load pricing ─── */
  const loadPricing = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/pricing");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setPricing(data);
    } catch {
      setError("שגיאה בטעינת נתוני מחירים");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPricing();
  }, [loadPricing]);

  /* ─── Save pricing ─── */
  const savePricing = async () => {
    if (!pricing) return;
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const res = await fetch("/api/pricing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pricing),
      });
      if (!res.ok) throw new Error("Failed to save");
      const result = await res.json();
      setPricing(result.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("שגיאה בשמירת מחירים");
    } finally {
      setSaving(false);
    }
  };

  /* ─── Update helpers ─── */
  const updateFeatureCost = (name: string, value: number) => {
    if (!pricing) return;
    setPricing({ ...pricing, featureCosts: { ...pricing.featureCosts, [name]: value } });
  };

  const updateBaseCost = (name: string, value: number) => {
    if (!pricing) return;
    setPricing({ ...pricing, baseCosts: { ...pricing.baseCosts, [name]: value } });
  };

  const updateExtraCost = (name: string, value: number) => {
    if (!pricing) return;
    setPricing({ ...pricing, extrasCosts: { ...pricing.extrasCosts, [name]: value } });
  };

  const addFeature = (name: string) => {
    if (!pricing || name in pricing.featureCosts) return;
    setPricing({ ...pricing, featureCosts: { ...pricing.featureCosts, [name]: 1000 } });
  };

  const addBaseCost = (name: string) => {
    if (!pricing || name in pricing.baseCosts) return;
    setPricing({ ...pricing, baseCosts: { ...pricing.baseCosts, [name]: 5000 } });
  };

  const addExtra = (name: string) => {
    if (!pricing || name in pricing.extrasCosts) return;
    setPricing({ ...pricing, extrasCosts: { ...pricing.extrasCosts, [name]: 1000 } });
  };

  const deleteFeatureCost = (name: string) => {
    if (!pricing) return;
    const { [name]: _, ...rest } = pricing.featureCosts;
    setPricing({ ...pricing, featureCosts: rest });
  };

  const deleteBaseCost = (name: string) => {
    if (!pricing) return;
    const { [name]: _, ...rest } = pricing.baseCosts;
    setPricing({ ...pricing, baseCosts: rest });
  };

  const deleteExtraCost = (name: string) => {
    if (!pricing) return;
    const { [name]: _, ...rest } = pricing.extrasCosts;
    setPricing({ ...pricing, extrasCosts: rest });
  };

  /* ─── Monthly CRUD ─── */
  const updateMonthlyCost = (name: string, value: number) => {
    if (!pricing) return;
    setPricing({ ...pricing, monthlyCosts: { ...pricing.monthlyCosts, [name]: value } });
  };
  const addMonthlyCost = (name: string) => {
    if (!pricing || name in pricing.monthlyCosts) return;
    setPricing({ ...pricing, monthlyCosts: { ...pricing.monthlyCosts, [name]: 100 } });
  };
  const deleteMonthlyCost = (name: string) => {
    if (!pricing) return;
    const { [name]: _, ...rest } = pricing.monthlyCosts;
    setPricing({ ...pricing, monthlyCosts: rest });
  };

  /* ─── Yearly CRUD ─── */
  const updateYearlyCost = (name: string, value: number) => {
    if (!pricing) return;
    setPricing({ ...pricing, yearlyCosts: { ...pricing.yearlyCosts, [name]: value } });
  };
  const addYearlyCost = (name: string) => {
    if (!pricing || name in pricing.yearlyCosts) return;
    setPricing({ ...pricing, yearlyCosts: { ...pricing.yearlyCosts, [name]: 500 } });
  };
  const deleteYearlyCost = (name: string) => {
    if (!pricing) return;
    const { [name]: _, ...rest } = pricing.yearlyCosts;
    setPricing({ ...pricing, yearlyCosts: rest });
  };

  /* ─── New item state ─── */
  const [newItemName, setNewItemName] = useState("");

  const handleAddNew = () => {
    if (!newItemName.trim()) return;
    if (activeSection === "features") addFeature(newItemName.trim());
    else if (activeSection === "base") addBaseCost(newItemName.trim());
    else if (activeSection === "monthly") addMonthlyCost(newItemName.trim());
    else if (activeSection === "yearly") addYearlyCost(newItemName.trim());
    else addExtra(newItemName.trim());
    setNewItemName("");
  };

  /* ─── Totals ─── */
  const featureTotal = pricing ? Object.values(pricing.featureCosts).reduce((a, b) => a + b, 0) : 0;
  const baseTotal = pricing ? Object.values(pricing.baseCosts).reduce((a, b) => a + b, 0) : 0;
  const extrasTotal = pricing ? Object.values(pricing.extrasCosts).reduce((a, b) => a + b, 0) : 0;
  const monthlyTotal = pricing?.monthlyCosts ? Object.values(pricing.monthlyCosts).reduce((a, b) => a + b, 0) : 0;
  const yearlyTotal = pricing?.yearlyCosts ? Object.values(pricing.yearlyCosts).reduce((a, b) => a + b, 0) : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={40} className="mx-auto mb-4 animate-spin" style={{ color: "#00F0FF" }} />
          <p style={{ color: "var(--prd-muted)" }}>טוען נתוני מחירים...</p>
        </div>
      </div>
    );
  }

  if (!pricing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass rounded-2xl p-8 text-center max-w-md">
          <AlertTriangle size={40} className="mx-auto mb-4" style={{ color: "#FF6B6B" }} />
          <p className="text-lg font-bold mb-2" style={{ color: "var(--prd-heading)" }}>שגיאה</p>
          <p className="text-sm mb-4" style={{ color: "var(--prd-muted)" }}>{error}</p>
          <button onClick={loadPricing} className="px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg, #6C63FF, #00F0FF)" }}>
            <RefreshCw size={14} className="inline ml-2" /> נסה שוב
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* ═══════ STICKY HEADER ═══════ */}
      <div className="sticky top-0 z-50" style={{ background: "var(--header-bg)", backdropFilter: "blur(40px) saturate(180%)", borderBottom: "0.5px solid var(--prd-border)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg, #FF6B6B, #FFD93D)", boxShadow: "0 4px 16px rgba(255,107,107,0.2)" }}>
                <Shield size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: "var(--prd-heading)" }}>ניהול מחירון</h1>
                <p className="text-xs" style={{ color: "var(--prd-muted)" }}>
                  פאנל אדמין — עדכון אחרון: {pricing.updatedAt ? new Date(pricing.updatedAt).toLocaleString("he-IL") : "טרם עודכן"}
                </p>
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
              <a href="/" className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all" style={{ color: "var(--prd-muted)", border: "0.5px solid var(--prd-border)" }}>
                <ArrowRight size={13} /> חזרה לטופס
              </a>
              <button onClick={loadPricing} className="p-2 rounded-xl transition-all" style={{ color: "var(--prd-muted)", border: "0.5px solid var(--prd-border)" }}>
                <RefreshCw size={15} />
              </button>
              <button
                onClick={savePricing}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
                style={{ background: saved ? "#00FF88" : "linear-gradient(135deg, #6C63FF, #00F0FF)" }}
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : <Save size={14} />}
                {saving ? "שומר..." : saved ? "נשמר!" : "שמור שינויים"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════ CONTENT ═══════ */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Error banner */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="glass rounded-xl p-4 mb-6 flex items-center gap-3" style={{ borderColor: "rgba(255,107,107,0.3)" }}>
              <AlertTriangle size={18} style={{ color: "#FF6B6B" }} />
              <span className="text-sm" style={{ color: "#FF6B6B" }}>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Stats row ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {[
            { label: "סוגי אתרים", count: Object.keys(pricing.baseCosts).length, total: baseTotal, color: "#00F0FF", icon: Globe },
            { label: "פיצ׳רים", count: Object.keys(pricing.featureCosts).length, total: featureTotal, color: "#6C63FF", icon: Zap },
            { label: "תוספות", count: Object.keys(pricing.extrasCosts).length, total: extrasTotal, color: "#FFD93D", icon: Settings },
            { label: "חודשי", count: pricing.monthlyCosts ? Object.keys(pricing.monthlyCosts).length : 0, total: monthlyTotal, color: "#00FF88", icon: Repeat, suffix: "/חודש" },
            { label: "שנתי", count: pricing.yearlyCosts ? Object.keys(pricing.yearlyCosts).length : 0, total: yearlyTotal, color: "#FF6B6B", icon: Calendar, suffix: "/שנה" },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={s.label} {...stagger(i)} className="glass rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={16} style={{ color: s.color }} />
                  <span className="text-xs font-semibold" style={{ color: "var(--prd-heading)" }}>{s.label}</span>
                </div>
                <p className="text-2xl font-black font-mono" style={{ color: s.color }}>{s.count}</p>
                <p className="text-[10px] mt-1" style={{ color: "var(--prd-muted)" }}>סה״כ: ₪{s.total.toLocaleString("he-IL")}</p>
              </motion.div>
            );
          })}
        </div>

        {/* ─── Section tabs ─── */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {([
            { id: "base" as const, label: "בסיס", icon: Globe, color: "#00F0FF" },
            { id: "features" as const, label: "פיצ׳רים", icon: Zap, color: "#6C63FF" },
            { id: "extras" as const, label: "תוספות", icon: Settings, color: "#FFD93D" },
            { id: "monthly" as const, label: "חודשי", icon: Repeat, color: "#00FF88" },
            { id: "yearly" as const, label: "שנתי", icon: Calendar, color: "#FF6B6B" },
          ]).map((tab) => {
            const Icon = tab.icon;
            const active = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium transition-all"
                style={{
                  backgroundColor: active ? `${tab.color}18` : "transparent",
                  color: active ? tab.color : "var(--prd-muted)",
                  border: `0.5px solid ${active ? tab.color + "40" : "var(--prd-border)"}`,
                }}
              >
                <Icon size={14} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* ─── Add new item ─── */}
        <motion.div {...fadeIn} className="glass rounded-xl p-4 mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddNew()}
              placeholder={activeSection === "base" ? "הוסף סוג אתר חדש..." : activeSection === "features" ? "הוסף פיצ׳ר חדש..." : activeSection === "monthly" ? "הוסף שירות חודשי חדש..." : activeSection === "yearly" ? "הוסף שירות שנתי חדש..." : "הוסף תוספת חדשה..."}
              className="prd-input flex-1"
            />
            <button onClick={handleAddNew} className="px-4 py-2 rounded-xl text-sm font-semibold text-white shrink-0" style={{ background: "linear-gradient(135deg, #6C63FF, #00F0FF)" }}>
              הוסף
            </button>
          </div>
        </motion.div>

        {/* ═══════ BASE COSTS ═══════ */}
        {activeSection === "base" && (
          <motion.div {...fadeIn} className="space-y-3">
            {Object.entries(pricing.baseCosts).map(([name, cost], i) => (
              <motion.div key={name} {...stagger(i)} className="glass rounded-xl p-4 flex items-center gap-4 group">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(0,240,255,0.12)" }}>
                  <Globe size={16} style={{ color: "#00F0FF" }} />
                </div>
                <span className="text-sm font-semibold flex-1" style={{ color: "var(--prd-heading)" }}>{name}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs" style={{ color: "var(--prd-muted)" }}>₪</span>
                  <input
                    type="number"
                    value={cost}
                    onChange={(e) => updateBaseCost(name, Number(e.target.value) || 0)}
                    className="prd-input w-28 text-center font-mono text-sm"
                    dir="ltr"
                  />
                </div>
                <button onClick={() => deleteBaseCost(name)} className="p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all text-xs" style={{ color: "#FF6B6B" }}>
                  מחק
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ═══════ FEATURE COSTS ═══════ */}
        {activeSection === "features" && (
          <motion.div {...fadeIn} className="space-y-6">
            {FEATURE_GROUPS.map((group) => {
              const GroupIcon = group.icon;
              const groupFeatures = group.items.filter((item) => item in pricing.featureCosts);
              if (groupFeatures.length === 0) return null;
              return (
                <div key={group.name}>
                  <div className="flex items-center gap-2 mb-3">
                    <GroupIcon size={16} style={{ color: group.color }} />
                    <h3 className="text-sm font-bold" style={{ color: "var(--prd-heading)" }}>{group.name}</h3>
                    <span className="text-[10px] pill" style={{ backgroundColor: `${group.color}18`, color: group.color, border: `1px solid ${group.color}30` }}>
                      {groupFeatures.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {groupFeatures.map((name, i) => (
                      <motion.div key={name} {...stagger(i)} className="glass rounded-xl p-3.5 flex items-center gap-3 group">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: group.color }} />
                        <span className="text-sm flex-1" style={{ color: "var(--prd-heading)" }}>{name}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs" style={{ color: "var(--prd-muted)" }}>₪</span>
                          <input
                            type="number"
                            value={pricing.featureCosts[name]}
                            onChange={(e) => updateFeatureCost(name, Number(e.target.value) || 0)}
                            className="prd-input w-24 text-center font-mono text-sm"
                            dir="ltr"
                          />
                        </div>
                        <button onClick={() => deleteFeatureCost(name)} className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all text-xs" style={{ color: "#FF6B6B" }}>
                          מחק
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Uncategorized features */}
            {(() => {
              const categorized = new Set(FEATURE_GROUPS.flatMap((g) => g.items));
              const uncategorized = Object.entries(pricing.featureCosts).filter(([name]) => !categorized.has(name));
              if (uncategorized.length === 0) return null;
              return (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign size={16} style={{ color: "var(--prd-muted)" }} />
                    <h3 className="text-sm font-bold" style={{ color: "var(--prd-heading)" }}>פיצ׳רים מותאמים אישית</h3>
                  </div>
                  <div className="space-y-2">
                    {uncategorized.map(([name, cost], i) => (
                      <motion.div key={name} {...stagger(i)} className="glass rounded-xl p-3.5 flex items-center gap-3 group">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: "var(--prd-muted)" }} />
                        <span className="text-sm flex-1" style={{ color: "var(--prd-heading)" }}>{name}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs" style={{ color: "var(--prd-muted)" }}>₪</span>
                          <input
                            type="number"
                            value={cost}
                            onChange={(e) => updateFeatureCost(name, Number(e.target.value) || 0)}
                            className="prd-input w-24 text-center font-mono text-sm"
                            dir="ltr"
                          />
                        </div>
                        <button onClick={() => deleteFeatureCost(name)} className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all text-xs" style={{ color: "#FF6B6B" }}>
                          מחק
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}

        {/* ═══════ EXTRAS COSTS ═══════ */}
        {activeSection === "extras" && (
          <motion.div {...fadeIn} className="space-y-3">
            {Object.entries(pricing.extrasCosts).map(([name, cost], i) => (
              <motion.div key={name} {...stagger(i)} className="glass rounded-xl p-4 flex items-center gap-4 group">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(255,217,61,0.12)" }}>
                  <Settings size={16} style={{ color: "#FFD93D" }} />
                </div>
                <span className="text-sm font-semibold flex-1" style={{ color: "var(--prd-heading)" }}>{name}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs" style={{ color: "var(--prd-muted)" }}>₪</span>
                  <input
                    type="number"
                    value={cost}
                    onChange={(e) => updateExtraCost(name, Number(e.target.value) || 0)}
                    className="prd-input w-28 text-center font-mono text-sm"
                    dir="ltr"
                  />
                </div>
                <button onClick={() => deleteExtraCost(name)} className="p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all text-xs" style={{ color: "#FF6B6B" }}>
                  מחק
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ═══════ MONTHLY COSTS ═══════ */}
        {activeSection === "monthly" && pricing.monthlyCosts && (
          <motion.div {...fadeIn} className="space-y-3">
            <div className="glass-inset rounded-xl p-3 flex items-center justify-between">
              <span className="text-xs" style={{ color: "var(--prd-muted)" }}>שירותים חודשיים — תשלום חוזר מדי חודש</span>
              <span className="text-xs font-mono font-bold" style={{ color: "#00FF88" }}>₪{monthlyTotal.toLocaleString("he-IL")}/חודש</span>
            </div>
            {Object.entries(pricing.monthlyCosts).map(([name, cost], i) => (
              <motion.div key={name} {...stagger(i)} className="glass rounded-xl p-4 flex items-center gap-4 group">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(0,255,136,0.12)" }}>
                  <Repeat size={16} style={{ color: "#00FF88" }} />
                </div>
                <span className="text-sm font-semibold flex-1" style={{ color: "var(--prd-heading)" }}>{name}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs" style={{ color: "var(--prd-muted)" }}>₪</span>
                  <input
                    type="number"
                    value={cost}
                    onChange={(e) => updateMonthlyCost(name, Number(e.target.value) || 0)}
                    className="prd-input w-28 text-center font-mono text-sm"
                    dir="ltr"
                  />
                  <span className="text-[10px]" style={{ color: "var(--prd-muted)" }}>/חודש</span>
                </div>
                <button onClick={() => deleteMonthlyCost(name)} className="p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all text-xs" style={{ color: "#FF6B6B" }}>
                  מחק
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ═══════ YEARLY COSTS ═══════ */}
        {activeSection === "yearly" && pricing.yearlyCosts && (
          <motion.div {...fadeIn} className="space-y-3">
            <div className="glass-inset rounded-xl p-3 flex items-center justify-between">
              <span className="text-xs" style={{ color: "var(--prd-muted)" }}>שירותים שנתיים — תשלום חוזר מדי שנה</span>
              <span className="text-xs font-mono font-bold" style={{ color: "#FF6B6B" }}>₪{yearlyTotal.toLocaleString("he-IL")}/שנה</span>
            </div>
            {Object.entries(pricing.yearlyCosts).map(([name, cost], i) => (
              <motion.div key={name} {...stagger(i)} className="glass rounded-xl p-4 flex items-center gap-4 group">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(255,107,107,0.12)" }}>
                  <Calendar size={16} style={{ color: "#FF6B6B" }} />
                </div>
                <span className="text-sm font-semibold flex-1" style={{ color: "var(--prd-heading)" }}>{name}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs" style={{ color: "var(--prd-muted)" }}>₪</span>
                  <input
                    type="number"
                    value={cost}
                    onChange={(e) => updateYearlyCost(name, Number(e.target.value) || 0)}
                    className="prd-input w-28 text-center font-mono text-sm"
                    dir="ltr"
                  />
                  <span className="text-[10px]" style={{ color: "var(--prd-muted)" }}>/שנה</span>
                </div>
                <button onClick={() => deleteYearlyCost(name)} className="p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all text-xs" style={{ color: "#FF6B6B" }}>
                  מחק
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="max-w-6xl mx-auto px-4 sm:px-6 py-8 mt-8" style={{ borderTop: "0.5px solid var(--prd-border)" }}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #FF6B6B, #FFD93D)" }}>
              <Shield size={14} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold" style={{ color: "var(--prd-heading)" }}>פאנל ניהול מחירון</p>
              <p className="text-[10px]" style={{ color: "var(--prd-muted)" }}>שינויים משפיעים על טופס האפיון</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center gap-1.5 text-xs font-medium transition-all hover:opacity-80" style={{ color: "var(--prd-accent-2)" }}>
              <FileText size={13} /> טופס אפיון
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
