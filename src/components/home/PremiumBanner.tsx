"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Crown, Percent, Shield, Zap } from "lucide-react";

export function PremiumBanner() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-3xl border border-neon-gold/20 bg-gradient-to-br from-neon-gold/5 via-void-100 to-neon-purple/5"
      >
        <div className="absolute inset-0 bg-mesh-gradient opacity-50" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-neon-gold/10 rounded-full blur-3xl" />

        <div className="relative p-8 sm:p-12 flex flex-col lg:flex-row items-center gap-8">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-gold/10 border border-neon-gold/20 text-neon-gold text-xs font-semibold uppercase tracking-wider mb-4">
              <Crown className="w-3.5 h-3.5" />
              Programme Créateur
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
              Gardez <span className="gold-accent">100%</span> de vos revenus
            </h2>
            <p className="text-white/60 max-w-lg mb-6 leading-relaxed">
              Contrairement aux autres plateformes, LibertyPlace ne prend aucune commission
              sur vos abonnements et vos tips. Votre contenu, vos règles, vos gains.
            </p>
            <Link href="/dashboard" className="btn-gold inline-flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Rejoindre LibertyPlace
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full lg:w-auto">
            {[
              { icon: Percent, value: "0%", label: "Commission plateforme" },
              { icon: Shield, value: "∞", label: "Liberté de contenu" },
              { icon: Crown, value: "VIP", label: "Statut premium" },
            ].map((stat) => (
              <div key={stat.label} className="glass-panel p-5 text-center min-w-[140px]">
                <stat.icon className="w-5 h-5 text-neon-gold mx-auto mb-2" />
                <div className="font-display text-2xl font-bold gold-accent">{stat.value}</div>
                <div className="text-xs text-white/40 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
