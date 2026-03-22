/**
 * PRD Pricing Calculator
 * 5 screens free, each additional screen = 100 ILS
 */

export interface PricingBreakdown {
  screens: number;
  freeScreens: number;
  paidScreens: number;
  screenCost: number;
  basePrice: number;
  features: { name: string; cost: number }[];
  monthlyServices: { name: string; cost: number }[];
  yearlyServices: { name: string; cost: number }[];
  extras: { name: string; cost: number }[];
  subtotal: number;
  tax: number;
  total: number;
}

const FREE_SCREENS = 5;
const COST_PER_SCREEN = 100; // ILS
const TAX_RATE = 0.17; // 17% VAT

export function calculateScreenCost(
  screenCount: number,
  baseWebsiteType: string = 'אתר תדמית'
): PricingBreakdown {
  const freeScreens = Math.min(screenCount, FREE_SCREENS);
  const paidScreens = Math.max(0, screenCount - FREE_SCREENS);
  const screenCost = paidScreens * COST_PER_SCREEN;

  const basePrice = getBasePrice(baseWebsiteType);
  const subtotal = basePrice + screenCost;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  return {
    screens: screenCount,
    freeScreens,
    paidScreens,
    screenCost,
    basePrice,
    features: [],
    monthlyServices: [],
    yearlyServices: [],
    extras: [],
    subtotal,
    tax,
    total,
  };
}

function getBasePrice(websiteType: string): number {
  const prices: Record<string, number> = {
    'אתר תדמית': 5000,
    'חנות אונליין': 12000,
    'בלוג / מגזין': 4000,
    'אתר שירותים': 6000,
    'לנדינג פייג׳': 2500,
    'פלטפורמה / SaaS': 25000,
    'אתר קהילה / פורום': 10000,
    'פורטפוליו': 3500,
    'אתר מוסדי': 7000,
    'אפליקציית ווב': 20000,
    'אחר': 5000,
  };

  return prices[websiteType] || prices['אחר'];
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    minimumFractionDigits: 0,
  }).format(price);
}

export function generatePricingSummary(breakdown: PricingBreakdown): string {
  return `
חישוב מחיר:
━━━━━━━━━━━━━━━━
מחיר בסיסי: ${formatPrice(breakdown.basePrice)}
מסכים: ${breakdown.screens} (${breakdown.freeScreens} חינם, ${breakdown.paidScreens} משלם)
עלות מסכים נוספים: ${formatPrice(breakdown.screenCost)} (${breakdown.paidScreens} × 100 ש״ח)
━━━━━━━━━━━━━━━━
סה״כ לפני מס: ${formatPrice(breakdown.subtotal)}
מע״מ (17%): ${formatPrice(breakdown.tax)}
━━━━━━━━━━━━━━━━
סה״כ: ${formatPrice(breakdown.total)}
  `.trim();
}
