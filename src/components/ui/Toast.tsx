"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle } from "lucide-react";

interface ToastContextValue {
  showToast: (message: ReactNode) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<ReactNode | null>(null);

  const showToast = useCallback((msg: ReactNode) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <AnimatePresence>
        {message && (
          <div className="toast-overlay fixed inset-0 z-[200] pointer-events-none flex items-end justify-center px-4 pt-4 pb-[calc(var(--mobile-bottom-nav-height)+env(safe-area-inset-bottom,0px)+12px)] min-[900px]:pb-6">
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="toast-popup pointer-events-auto flex items-center gap-2 max-w-[min(92vw,360px)] px-5 py-3 rounded-xl glass-panel border-neon-cyan/30 shadow-glow"
            >
              <CheckCircle className="w-4 h-4 text-neon-cyan flex-shrink-0" />
              <span className="text-sm inline-flex items-center justify-center gap-1 flex-wrap text-center">
                {message}
              </span>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
