"use client";

import { useRef } from "react";
import Image from "next/image";
import { Pencil } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { readImageFile } from "@/lib/user/imageUpload";

interface AvatarUploaderProps {
  avatar: string;
  alt: string;
  size?: number;
  rounded?: "full" | "md";
  className?: string;
  onUpdated?: () => void;
}

export function AvatarUploader({
  avatar,
  alt,
  size = 56,
  rounded = "md",
  className = "",
  onUpdated,
}: AvatarUploaderProps) {
  const { t } = useLanguage();
  const { updateAvatar } = useAuth();
  const { showToast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const radiusClass = rounded === "full" ? "rounded-full" : "rounded-[8px]";

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      const dataUrl = await readImageFile(file);
      updateAvatar(dataUrl);
      onUpdated?.();
      showToast(t("avatarUpdated"));
    } catch (error) {
      const message = error instanceof Error ? error.message : "avatarErrorRead";
      const key =
        message === "avatarErrorInvalid" || message === "avatarErrorSize" || message === "avatarErrorRead"
          ? message
          : "avatarErrorRead";
      showToast(t(key));
    }
  };

  return (
    <div className={`relative flex-shrink-0 ${className}`}>
      <Image
        src={avatar}
        alt={alt}
        width={size}
        height={size}
        unoptimized={avatar.startsWith("data:")}
        className={`${radiusClass} object-cover`}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="absolute -top-1.5 -left-1.5 w-6 h-6 rounded-md bg-kick-hover border border-kick-border flex items-center justify-center hover:bg-kick-border transition-colors"
        aria-label={t("changeAvatar")}
      >
        <Pencil className="w-3 h-3 text-white/65" />
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
