"use client";

import Link from "next/link";
import { useState } from "react";
import {
  DollarSign, Users, Eye, TrendingUp, Radio, Settings, BarChart3, Crown, Zap,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { useCurrency } from "@/lib/wallet/useCurrency";

const REVENUE_USD = 4280;
const RECENT_TIPS_USD = [
  { user: "CyberFan42", amount: 25, time: "2 min" },
  { user: "NeonGirl", amount: 50, time: "15 min" },
  { user: "LibertyMax", amount: 10, time: "1h" },
  { user: "GoldStreamer", amount: 100, time: "3h" },
];

export default function DashboardPage() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { formatMoney } = useCurrency();
  const [liveOpen, setLiveOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [streamTitle, setStreamTitle] = useState("Mon super stream live");

  const stats = [
    { labelKey: "revenueMonth" as const, value: formatMoney(REVENUE_USD), change: "+12%", icon: DollarSign, color: "text-neon-gold" },
    { labelKey: "activeSubs" as const, value: "1,247", change: "+8%", icon: Users, color: "text-neon-cyan" },
    { labelKey: "avgViewers" as const, value: "3,450", change: "+23%", icon: Eye, color: "text-neon-blue" },
    { labelKey: "hoursStreamed" as const, value: "86h", change: "+5%", icon: TrendingUp, color: "text-neon-purple" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1">{t("dashboardTitle")}</h1>
          <p className="text-white/50">{t("dashboardDesc")}</p>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => setLiveOpen(true)} className="btn-primary flex items-center gap-2">
            <Radio className="w-4 h-4" />{t("goLive")}
          </button>
          <Link href="/settings/preferences" className="p-3 rounded-xl bg-glass border border-glass-border hover:border-white/20 transition-colors">
            <Settings className="w-5 h-5 text-white/70" />
          </Link>
        </div>
      </div>

      <div className="glass-panel p-6 mb-8 border-neon-gold/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-neon-gold/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-neon-gold" />
              <span className="text-sm text-neon-gold font-semibold uppercase tracking-wider">{t("revenueLabel")}</span>
            </div>
            <p className="text-3xl font-display font-bold">{formatMoney(REVENUE_USD)}</p>
            <p className="text-sm text-white/40 mt-1">{t("revenueTotal")}</p>
          </div>
          <button type="button" onClick={() => setWithdrawOpen(true)} className="btn-gold flex items-center gap-2">
            <DollarSign className="w-4 h-4" />{t("withdraw")}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.labelKey} className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <span className="text-xs text-emerald-400 font-medium">{stat.change}</span>
            </div>
            <span className="font-display text-2xl font-bold">{stat.value}</span>
            <span className="text-xs text-white/40">{t(stat.labelKey)}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-semibold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-neon-cyan" />{t("analytics")}
            </h2>
            <select className="px-3 py-1.5 rounded-lg bg-glass border border-glass-border text-sm focus:outline-none">
              <option>{t("last7days")}</option>
              <option>{t("last30days")}</option>
              <option>{t("last90days")}</option>
            </select>
          </div>
          <div className="h-48 flex items-end gap-2">
            {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
              <div key={i} className="flex-1 rounded-t-lg bg-gradient-to-t from-neon-cyan/20 to-neon-cyan/5 hover:from-neon-cyan/30 transition-colors" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>

        <div className="glass-panel p-6">
          <h2 className="font-display font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-neon-gold" />{t("recentTips")}
          </h2>
          <div className="space-y-4">
            {RECENT_TIPS_USD.map((tip) => (
              <div key={tip.user} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{tip.user}</p>
                  <p className="text-xs text-white/40">{tip.time}</p>
                </div>
                <span className="text-sm font-semibold text-neon-gold">{formatMoney(tip.amount)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 glass-panel p-6">
          <h2 className="font-display font-semibold mb-4">{t("streamConfig")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-white/40 mb-1.5 block">{t("streamTitle")}</label>
              <input type="text" value={streamTitle} onChange={(e) => setStreamTitle(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-glass border border-glass-border text-sm focus:outline-none focus:border-neon-cyan/40" />
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1.5 block">{t("category")}</label>
              <input type="text" defaultValue="Gaming" className="w-full px-4 py-2.5 rounded-xl bg-glass border border-glass-border text-sm focus:outline-none focus:border-neon-cyan/40" />
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1.5 block">{t("tags")}</label>
              <input type="text" defaultValue="FPS, Français" className="w-full px-4 py-2.5 rounded-xl bg-glass border border-glass-border text-sm focus:outline-none focus:border-neon-cyan/40" />
            </div>
          </div>
        </div>
      </div>

      <Modal open={liveOpen} onClose={() => setLiveOpen(false)} title={t("liveModalTitle")}>
        <p className="text-sm text-white/50 mb-4">{t("liveModalDesc")}</p>
        <div className="mb-4">
          <label className="text-xs text-white/40 mb-1.5 block">{t("streamTitle")}</label>
          <input type="text" value={streamTitle} onChange={(e) => setStreamTitle(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-glass border border-glass-border text-sm focus:outline-none focus:border-neon-cyan/40" />
        </div>
        <button type="button" onClick={() => { showToast(t("liveModalSuccess")); setLiveOpen(false); }} className="w-full btn-primary !py-3">
          {t("liveModalBtn")}
        </button>
      </Modal>

      <Modal open={withdrawOpen} onClose={() => setWithdrawOpen(false)} title={t("withdrawModalTitle")}>
        <p className="text-sm text-white/50 mb-5">{t("withdrawModalDesc", { amount: formatMoney(REVENUE_USD) })}</p>
        <button type="button" onClick={() => { showToast(t("withdrawModalSuccess", { amount: formatMoney(REVENUE_USD) })); setWithdrawOpen(false); }} className="w-full btn-gold !py-3">
          {t("withdrawModalBtn")}
        </button>
      </Modal>
    </div>
  );
}
