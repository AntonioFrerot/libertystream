"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";

export type PlinkoSelectOption<T extends string | number> = {
  value: T;
  label: string;
};

interface PlinkoSelectProps<T extends string | number> {
  value: T;
  options: PlinkoSelectOption<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
  /** Sur mobile, affiche le menu en superposition (portal) au-dessus du reste de la page */
  mobileOverlay?: boolean;
}

const MOBILE_OVERLAY_QUERY = "(max-width: 899px)";

export function PlinkoSelect<T extends string | number>({
  value,
  options,
  onChange,
  disabled = false,
  mobileOverlay = false,
}: PlinkoSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [isMobileOverlay, setIsMobileOverlay] = useState(false);
  const [menuRect, setMenuRect] = useState({ top: 0, left: 0, width: 0 });
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  const selected = options.find((option) => option.value === value);
  const usePortalMenu = mobileOverlay && isMobileOverlay && open;

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_OVERLAY_QUERY);
    const update = () => setIsMobileOverlay(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!usePortalMenu || !triggerRef.current) return;

    const updateMenuRect = () => {
      const rect = triggerRef.current!.getBoundingClientRect();
      setMenuRect({
        top: rect.bottom,
        left: rect.left,
        width: rect.width,
      });
    };

    updateMenuRect();
    window.addEventListener("resize", updateMenuRect);
    window.addEventListener("scroll", updateMenuRect, true);
    return () => {
      window.removeEventListener("resize", updateMenuRect);
      window.removeEventListener("scroll", updateMenuRect, true);
    };
  }, [usePortalMenu]);

  useEffect(() => {
    if (disabled) {
      setOpen(false);
    }
  }, [disabled]);

  const menu = (
    <ul
      ref={menuRef}
      className={`plinko-stake-select-menu${usePortalMenu ? " plinko-stake-select-menu-portal" : ""}`}
      role="listbox"
      style={
        usePortalMenu
          ? {
              position: "fixed",
              top: menuRect.top,
              left: menuRect.left,
              width: menuRect.width,
              zIndex: 10050,
            }
          : undefined
      }
    >
      {options.map((option) => {
        const isActive = option.value === value;

        return (
          <li key={String(option.value)}>
            <button
              type="button"
              role="option"
              aria-selected={isActive}
              className={`plinko-stake-select-option${isActive ? " plinko-stake-select-option-active" : ""}`}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              {option.label}
            </button>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div
      ref={rootRef}
      className={`plinko-stake-select${open ? " plinko-stake-select-open" : ""}${
        usePortalMenu ? " plinko-stake-select-portal-open" : ""
      }`}
    >
      <button
        ref={triggerRef}
        type="button"
        className="plinko-stake-select-trigger"
        onClick={() => setOpen((current) => !current)}
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span>{selected?.label ?? String(value)}</span>
        <ChevronDown className="plinko-stake-select-chevron" size={16} aria-hidden />
      </button>

      {open && !usePortalMenu && menu}
      {open && usePortalMenu && typeof document !== "undefined" && createPortal(menu, document.body)}
    </div>
  );
}
