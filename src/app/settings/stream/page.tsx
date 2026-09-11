"use client";

import { useState } from "react";
import Image from "next/image";
import { Pencil } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { readImageFile } from "@/lib/user/imageUpload";
import {
  SettingsField,
  SettingsInput,
  SettingsSaveButton,
  SettingsSection,
} from "@/components/settings/SettingsShell";

export default function SettingsStreamPage() {
  const { t } = useLanguage();
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();
  const [streamTitle, setStreamTitle] = useState("Mon super stream live");
  const [category, setCategory] = useState("Gaming");
  const banner = user?.banner ?? `https://picsum.photos/seed/${user?.channelSlug}-banner/1200/400`;

  if (!user) return null;

  const handleBannerChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      const dataUrl = await readImageFile(file);
      updateProfile({ banner: dataUrl });
      showToast(t("settingsBannerUpdated"));
    } catch (error) {
      const message = error instanceof Error ? error.message : "avatarErrorRead";
      showToast(t(message === "avatarErrorInvalid" || message === "avatarErrorSize" ? message : "avatarErrorRead"));
    }
  };

  const handleSave = () => {
    showToast(t("settingsSaved"));
  };

  return (
    <div className="space-y-6">
      <SettingsSection title={t("settingsStreamTitle")} description={t("settingsStreamDesc")}>
        <SettingsField label={t("settingsOfflineBanner")} hint={t("settingsOfflineBannerHint")}>
          <div className="relative w-full aspect-[5/1] min-h-[100px] max-h-[160px] rounded-lg overflow-hidden border border-kick-border bg-kick-hover">
            <Image src={banner} alt="" fill className="object-cover" unoptimized={banner.startsWith("data:")} />
            <label className="absolute top-3 right-3 p-2 rounded-md bg-black/50 border border-white/10 hover:bg-black/70 transition-colors cursor-pointer">
              <Pencil className="w-4 h-4 text-white/80" />
              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleBannerChange} />
            </label>
          </div>
        </SettingsField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
          <SettingsField label={t("streamTitle")}>
            <SettingsInput value={streamTitle} onChange={(e) => setStreamTitle(e.target.value)} />
          </SettingsField>
          <SettingsField label={t("category")}>
            <SettingsInput value={category} onChange={(e) => setCategory(e.target.value)} />
          </SettingsField>
        </div>

        <SettingsSaveButton label={t("save")} onClick={handleSave} />
      </SettingsSection>

      <SettingsSection title={t("settingsStreamKeyTitle")} description={t("settingsStreamKeyDesc")}>
        <SettingsField label={t("settingsStreamKey")}>
          <SettingsInput value="live_••••••••••••••••••••••••" disabled />
        </SettingsField>
        <button type="button" className="mt-3 text-sm text-kick-green hover:underline">
          {t("settingsResetStreamKey")}
        </button>
      </SettingsSection>
    </div>
  );
}
