"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/components/providers/AuthProvider";
import type { TranslationKey } from "@/lib/i18n/translations";

interface AuthModalProps {
  open: boolean;
  mode: "login" | "signup";
  onClose: () => void;
  onSwitchMode: (mode: "login" | "signup") => void;
}

export function AuthModal({ open, mode, onClose, onSwitchMode }: AuthModalProps) {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { login, register, recoverAdminAccount } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [forgotMode, setForgotMode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const errKey =
      forgotMode
        ? recoverAdminAccount(email, password)
        : mode === "login"
          ? login(email, password)
          : await register(username, email, password);

    if (errKey) {
      setError(t(errKey as TranslationKey));
      return;
    }

    showToast(
      forgotMode
        ? t("authForgotSuccess")
        : mode === "login"
          ? t("authLoginSuccess")
          : t("authSignupSuccess"),
    );
    onClose();
    setEmail("");
    setPassword("");
    setUsername("");
    setForgotMode(false);
  };

  const fillDemo = () => {
    setEmail("demo@libertyplace.com");
    setPassword("demo123");
    setError(null);
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        setForgotMode(false);
        onClose();
      }}
      title={forgotMode ? t("authForgotPassword") : mode === "login" ? t("authLogin") : t("authSignup")}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "login" && !forgotMode && (
          <div className="px-3 py-2.5 rounded-lg bg-neon-cyan/5 border border-neon-cyan/20">
            <p className="text-xs text-neon-cyan font-medium mb-1">{t("demoAccounts")}</p>
            <p className="text-xs text-white/50">{t("demoHint")}</p>
            <button type="button" onClick={fillDemo} className="text-xs text-neon-cyan hover:underline mt-1">
              → Remplir automatiquement
            </button>
          </div>
        )}
        {forgotMode && (
          <p className="text-xs text-white/50">{t("authForgotHint")}</p>
        )}

        {error && (
          <p className="text-sm text-red-400 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
            {error}
          </p>
        )}

        {mode === "signup" && !forgotMode && (
          <div>
            <label className="text-xs text-white/40 mb-1.5 block">{t("username")}</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-glass border border-glass-border text-sm focus:outline-none focus:border-neon-cyan/40"
              required
              minLength={3}
              maxLength={25}
              pattern="[a-zA-Z0-9_]+"
              autoComplete="username"
            />
          </div>
        )}
        <div>
          <label className="text-xs text-white/40 mb-1.5 block">{t("email")}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-glass border border-glass-border text-sm focus:outline-none focus:border-neon-cyan/40"
            required
          />
        </div>
        <div>
          <label className="text-xs text-white/40 mb-1.5 block">{t("password")}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-glass border border-glass-border text-sm focus:outline-none focus:border-neon-cyan/40"
            required
            minLength={6}
          />
        </div>
        <button type="submit" className="w-full btn-primary !py-3">
          {forgotMode ? t("authForgotBtn") : mode === "login" ? t("authLoginBtn") : t("authSignupBtn")}
        </button>
        {mode === "login" && !forgotMode && (
          <p className="text-center text-sm">
            <button
              type="button"
              onClick={() => {
                setForgotMode(true);
                setError(null);
                setEmail("antonnbot2005@gmail.com");
                setPassword("");
              }}
              className="text-neon-cyan hover:underline"
            >
              {t("authForgotPassword")}
            </button>
          </p>
        )}
        <p className="text-center text-sm text-white/40">
          {forgotMode ? (
            <button type="button" onClick={() => { setForgotMode(false); setError(null); }} className="text-neon-cyan hover:underline">
              {t("login")}
            </button>
          ) : mode === "login" ? (
            <>
              {t("noAccount")}{" "}
              <button type="button" onClick={() => { onSwitchMode("signup"); setError(null); }} className="text-neon-cyan hover:underline">
                {t("signup")}
              </button>
            </>
          ) : (
            <>
              {t("hasAccount")}{" "}
              <button type="button" onClick={() => { onSwitchMode("login"); setError(null); }} className="text-neon-cyan hover:underline">
                {t("login")}
              </button>
            </>
          )}
        </p>
      </form>
    </Modal>
  );
}
