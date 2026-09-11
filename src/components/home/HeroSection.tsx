"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Shield, Percent, Globe } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-neon-cyan/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-40 right-1/4 w-80 h-80 bg-neon-purple/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-neon-blue/3 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-sm text-neon-cyan mb-8">
            <Globe className="w-4 h-4" />
            <span>La plateforme de streaming indépendante</span>
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            <span className="text-white">Stream sans</span>
            <br />
            <span className="neon-text">limites.</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            Liberté maximale pour les créateurs. Gaming, Casino, IRL, Combat, Porno et plus.
            <span className="text-neon-gold font-medium"> 100% des subs et tips</span> vont directement aux streamers.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/browse" className="btn-primary flex items-center gap-2 text-base !px-8 !py-4">
              Explorer les lives
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/dashboard" className="btn-gold flex items-center gap-2 text-base !px-8 !py-4">
              Commencer à streamer
            </Link>
          </div>

          {/* Value props */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {[
              { icon: Percent, label: "100% Revenus", desc: "Subs & tips intégralement reversés" },
              { icon: Shield, label: "Liberté Totale", desc: "Toutes catégories, zéro censure arbitraire" },
              { icon: Globe, label: "Communauté Globale", desc: "Streamers du monde entier" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                className="glass-panel p-5 text-center"
              >
                <item.icon className="w-6 h-6 text-neon-cyan mx-auto mb-3" />
                <h3 className="font-display font-semibold text-sm mb-1">{item.label}</h3>
                <p className="text-xs text-white/50">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
