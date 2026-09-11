"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  hideHeader?: boolean;
  panelClassName?: string;
}

export function Modal({ open, onClose, title, children, hideHeader = false, panelClassName = "" }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] pt-[calc(1rem+env(safe-area-inset-top,0px))]">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative glass-panel w-full max-w-md max-h-[min(88dvh,calc(100dvh-2rem-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px)))] overflow-y-auto p-5 sm:p-6 rounded-2xl animate-in fade-in zoom-in duration-200 z-[251] ${panelClassName}`}>
        {!hideHeader && (
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-lg font-bold">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-glass-hover transition-colors"
            >
              <X className="w-5 h-5 text-white/60" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body
  );
}
