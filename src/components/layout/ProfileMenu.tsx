"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { UserProfileMenu } from "@/components/layout/UserProfileMenu";
import { TipModal } from "@/components/modals/TipModal";
import { useProfileStats } from "@/lib/user/useProfileStats";
import type { PublicUser } from "@/lib/auth/types";

interface ProfileMenuProps {
  user: PublicUser;
}

export function ProfileMenu({ user }: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const [tipOpen, setTipOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const stats = useProfileStats();
  const progress = stats.isMaxRank ? 100 : Math.max(stats.progress, 6);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`profile-trigger ${open ? "profile-trigger-open" : ""}`}
      >
        <span className="profile-trigger-avatar">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={user.avatar} alt={user.username} />
        </span>

        <span className="profile-trigger-divider" aria-hidden />

        <span className="profile-trigger-body">
          <span className="profile-trigger-name-row">
            <span className="profile-trigger-name">{user.username}</span>
            {open ? (
              <ChevronUp className="profile-trigger-chevron" strokeWidth={2.5} />
            ) : (
              <ChevronDown className="profile-trigger-chevron" strokeWidth={2.5} />
            )}
          </span>
          <span className="profile-trigger-track" aria-hidden>
            <span className="profile-trigger-fill" style={{ width: `${progress}%` }} />
            <span className="profile-trigger-dot" style={{ left: `${progress}%` }} />
          </span>
        </span>
      </button>

      {open && (
        <UserProfileMenu
          user={user}
          onClose={() => setOpen(false)}
          onOpenTip={() => {
            setOpen(false);
            setTipOpen(true);
          }}
        />
      )}

      <TipModal
        open={tipOpen}
        onClose={() => setTipOpen(false)}
        streamerName=""
        streamerUsername=""
        editableRecipient
      />
    </div>
  );
}
