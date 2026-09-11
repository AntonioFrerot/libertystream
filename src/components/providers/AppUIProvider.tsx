"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { AuthModal } from "@/components/modals/AuthModal";
import { WheelModal } from "@/components/wheel/WheelModal";

type AuthMode = "login" | "signup";

interface AppUIContextValue {
  openAuth: (mode?: AuthMode) => void;
  closeAuth: () => void;
  openWheel: () => void;
  closeWheel: () => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const AppUIContext = createContext<AppUIContextValue | null>(null);

export function AppUIProvider({ children }: { children: React.ReactNode }) {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [wheelOpen, setWheelOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const openAuth = useCallback((mode: AuthMode = "login") => {
    setAuthMode(mode);
    setAuthOpen(true);
  }, []);

  const closeAuth = useCallback(() => setAuthOpen(false), []);

  const openWheel = useCallback(() => setWheelOpen(true), []);
  const closeWheel = useCallback(() => setWheelOpen(false), []);

  return (
    <AppUIContext.Provider
      value={{ openAuth, closeAuth, openWheel, closeWheel, sidebarCollapsed, setSidebarCollapsed }}
    >
      {children}
      <AuthModal open={authOpen} mode={authMode} onClose={closeAuth} onSwitchMode={setAuthMode} />
      <WheelModal open={wheelOpen} onClose={closeWheel} />
    </AppUIContext.Provider>
  );
}

export function useAppUI() {
  const ctx = useContext(AppUIContext);
  if (!ctx) throw new Error("useAppUI must be used within AppUIProvider");
  return ctx;
}
