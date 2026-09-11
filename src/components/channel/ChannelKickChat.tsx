"use client";

import { useState } from "react";
import {
  ExternalLink,
  Users,
  Settings,
  Smile,
  Shield,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { useAppUI } from "@/components/providers/AppUIProvider";
import { isOwnChannel } from "@/lib/channel/userChannel";

const EMOTES = ["😀", "🔥", "💜", "😂", "👀", "❤️", "🎮", "⚡"];

interface ChannelKickChatProps {
  streamerName: string;
  streamerUsername: string;
  empty?: boolean;
}

export function ChannelKickChat({ streamerName, streamerUsername, empty = false }: ChannelKickChatProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { openAuth } = useAppUI();
  const [input, setInput] = useState("");
  const ownChannel = isOwnChannel(user, streamerUsername);

  const sendMessage = () => {
    if (!user) {
      openAuth("login");
      return;
    }
    if (!input.trim()) return;
    setInput("");
  };

  return (
    <aside className="w-full lg:w-[340px] xl:w-[360px] flex-shrink-0 flex flex-col bg-[#0e0e10] border-t lg:border-t-0 lg:border-l border-kick-border h-[420px] lg:h-[calc(100vh-3.5rem)] lg:sticky lg:top-14">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-kick-border flex-shrink-0 bg-kick-surface">
        <button type="button" className="p-2 rounded hover:bg-kick-hover text-white/40 hover:text-white transition-colors">
          <ExternalLink className="w-4 h-4" />
        </button>
        <h3 className="text-sm font-semibold text-white">{t("chat")}</h3>
        <button type="button" className="p-2 rounded hover:bg-kick-hover text-white/40 hover:text-white transition-colors relative">
          <Users className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-kick-green" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 bg-[#0e0e10]" />

      <div className="border-t border-kick-border bg-kick-surface flex-shrink-0">
        <div className="flex items-center gap-1.5 px-3 py-2 overflow-x-auto scrollbar-hide border-b border-kick-border/50">
          {EMOTES.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setInput((v) => v + e)}
              className="w-8 h-8 flex-shrink-0 rounded-full bg-kick-hover hover:bg-kick-border text-base flex items-center justify-center transition-colors"
            >
              {e}
            </button>
          ))}
        </div>

        <div className="p-3 space-y-2">
          <div className="flex items-center gap-2 rounded-lg bg-kick-bg border border-kick-border px-3 py-2">
            <Shield className="w-4 h-4 text-white/25 flex-shrink-0" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder={t("sendMessage")}
              disabled={empty && ownChannel}
              className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none min-w-0"
            />
            <button type="button" className="p-1 text-white/30 hover:text-white/60 transition-colors">
              <Smile className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between gap-2">
            <button type="button" className="p-2 rounded-lg hover:bg-kick-hover text-white/40 hover:text-white transition-colors">
              <Settings className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={sendMessage}
              className="px-5 py-2 rounded-lg bg-kick-green text-white text-sm font-semibold hover:bg-kick-green-dim transition-colors"
            >
              {t("chat")}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
