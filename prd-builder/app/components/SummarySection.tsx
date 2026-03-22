'use client';

import React from 'react';
import { Download, Copy } from 'lucide-react';
import { calculateScreenCost, formatPrice, generatePricingSummary } from '@/lib/pricing-calculator';

interface SummarySectionProps {
  data: {
    title: string;
    businessType: string;
    contactName: string;
    contactEmail: string;
    screens?: number;
    features?: string[];
  };
  onExportPDF: () => void;
  onCopyToClipboard: () => void;
}

export default function SummarySection({
  data,
  onExportPDF,
  onCopyToClipboard,
}: SummarySectionProps) {
  const screenCount = data.screens || 0;
  const pricing = calculateScreenCost(screenCount, data.businessType);

  const handleCopy = () => {
    const summary = generatePricingSummary(pricing);
    navigator.clipboard.writeText(summary);
    onCopyToClipboard();
  };

  return (
    <div className="space-y-6">
      <div className="glass-heavy rounded-3xl p-8 border border-white/20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Project Summary */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-4">📋 סיכום הפרויקט</h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-slate-400">שם הפרויקט:</span>
                <span className="text-white font-semibold">{data.title || '—'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-slate-400">סוג העסק:</span>
                <span className="text-white font-semibold">{data.businessType || '—'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-slate-400">מספר מסכים:</span>
                <span className="text-white font-semibold">{screenCount}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-slate-400">איש קשר:</span>
                <span className="text-white font-semibold text-sm">{data.contactName || '—'}</span>
              </div>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-4">💰 חישוב מחיר</h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-slate-400">מחיר בסיס:</span>
                <span className="text-white font-semibold">{formatPrice(pricing.basePrice)}</span>
              </div>

              {pricing.screenCost > 0 && (
                <div className="flex justify-between py-2 border-b border-white/10 text-orange-400">
                  <span className="text-slate-400">
                    {pricing.paidScreens} מסכים נוספים ×100:
                  </span>
                  <span className="font-semibold">{formatPrice(pricing.screenCost)}</span>
                </div>
              )}

              {pricing.screenCost === 0 && screenCount > 0 && (
                <div className="flex justify-between py-2 border-b border-white/10 text-green-400">
                  <span className="text-slate-400">
                    {screenCount} מסכים (חינם):
                  </span>
                  <span className="font-semibold">0 ₪</span>
                </div>
              )}

              <div className="flex justify-between py-3 border-b border-white/20">
                <span className="text-slate-300">סה״כ לפני מס:</span>
                <span className="text-white font-bold text-lg">{formatPrice(pricing.subtotal)}</span>
              </div>

              <div className="flex justify-between py-2 text-slate-400">
                <span>מע״מ (17%):</span>
                <span>{formatPrice(pricing.tax)}</span>
              </div>

              <div className="flex justify-between py-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 px-4 rounded-xl border border-cyan-400/30">
                <span className="text-white font-bold text-lg">סה״כ סופי:</span>
                <span className="text-cyan-300 font-bold text-2xl">{formatPrice(pricing.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={onExportPDF}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:opacity-90 transition"
        >
          <Download size={20} />
          ייצוא קבלה
        </button>
        <button
          onClick={handleCopy}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/20 transition"
        >
          <Copy size={20} />
          העתק לקליפבורד
        </button>
      </div>

      {/* Notes */}
      <div className="glass rounded-xl p-4 border border-white/10">
        <p className="text-xs text-slate-400 text-center">
          💡 <strong>5 מסכים ראשונים חינם</strong> • כל מסך נוסף: 100 ₪ • מחיר כולל מע״מ 17%
        </p>
      </div>
    </div>
  );
}
