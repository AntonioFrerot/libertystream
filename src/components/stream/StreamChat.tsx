"use client";

import { useState } from "react";
import { Crown, Settings, Smile, ChevronDown, LogIn } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { useAppUI } from "@/components/providers/AppUIProvider";

interface ChatMessage {
  user: string;
  msg: string;
  color: string;
  badge?: string;
}

const initialMessages: ChatMessage[] = [
  { user: "CyberFan42", msg: "Lets gooo 🔥", color: "text-pink-400", badge: "SUB" },
  { user: "NeonGirl", msg: "Sub envoyé !", color: "text-neon-cyan", badge: "VIP" },
  { user: "LibertyMax", msg: "100% au streamer 💪", color: "text-neon-purple" },
  { user: "DarkPulse", msg: "GG WP", color: "text-emerald-400" },
];

const USER_COLORS = ["text-pink-400", "text-neon-cyan", "text-neon-purple", "text-emerald-400", "text-neon-gold"];

export function StreamChat({ streamerName, streamerUsername }: { streamerName: string; streamerUsername: string }) {
  const { t } = useLanguage();
  const { user, isSubscribed } = useAuth();
  const { openAuth } = useAppUI();
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!user) {
      openAuth("login");
      return;
    }
    const msg = input.trim();
    if (!msg) return;

    const color = USER_COLORS[user.username.length % USER_COLORS.length];
    const badge = isSubscribed(streamerUsername) ? "SUB" : undefined;

    setMessages((prev) => [...prev, { user: user.username, msg, color, badge }]);
    setInput("");
  };

  return (
    <aside className="w-full lg:w-[340px] flex-shrink-0 flex flex-col bg-kick-surface border-t lg:border-t-0 lg:border-l border-kick-border h-[400px] lg:h-[calc(100vh-3.5rem)] lg:sticky lg:top-14">
      <div className="flex items-center justify-between px-4 py-3 border-b border-glass-border flex-shrink-0">
        <h3 className="text-sm font-semibold">{t("chat")}</h3>
        <div className="flex items-center gap-2">
          <button type="button" className="p-1.5 rounded hover:bg-glass-hover transition-colors">
            <Crown className="w-4 h-4 text-neon-gold" />
          </button>
          <button type="button" className="p-1.5 rounded hover:bg-glass-hover transition-colors">
            <ChevronDown className="w-4 h-4 text-white/50" />
          </button>
        </div>
      </div>

      <div className="mx-3 mt-3 px-3 py-2 rounded-lg bg-glass border border-glass-border flex-shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold text-neon-cyan uppercase">{t("pinned")}</span>
          <span className="text-xs font-semibold text-neon-purple">LibertyBot</span>
        </div>
        <p className="text-xs text-white/60">{t("pinnedMsg", { name: streamerName })}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5 min-h-0">
        {messages.map((m, i) => (
          <div key={i} className="text-[13px] leading-relaxed break-words">
            {m.badge && (
              <span className="inline-block px-1 py-0.5 rounded text-[9px] font-bold bg-neon-cyan/20 text-neon-cyan mr-1 align-middle">{m.badge}</span>
            )}
            <span className={`font-semibold ${m.color}`}>{m.user}</span>
            <span className="text-white/30 mx-1">:</span>
            <span className="text-white/80">{m.msg}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-glass-border p-3 flex-shrink-0">
        {user ? (
          <>
            <p className="text-[10px] text-neon-cyan/60 mb-2 text-center">
              {isSubscribed(streamerUsername) ? "✓ Abonné, badge SUB actif" : t("followersOnly")}
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder={t("sendMessage")}
                  className="w-full pl-3 pr-9 py-2.5 rounded-lg bg-void-100 border border-glass-border text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-neon-cyan/40"
                />
                <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-white/30 hover:text-white/60">
                  <Smile className="w-4 h-4" />
                </button>
              </div>
              <button type="button" onClick={sendMessage} className="px-4 py-2.5 rounded-lg bg-kick-green text-white text-xs font-semibold hover:bg-kick-green/90 transition-colors">
                {t("chat")}
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => openAuth("login")}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-sm font-medium hover:bg-neon-cyan/20 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            {t("chatLoginRequired")}
          </button>
        )}
      </div>
    </aside>
  );
}
