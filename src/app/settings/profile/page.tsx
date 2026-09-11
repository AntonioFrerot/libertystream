"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { AvatarUploader } from "@/components/user/AvatarUploader";
import {
  SettingsField,
  SettingsInput,
  SettingsSaveButton,
  SettingsSection,
  SettingsTextarea,
} from "@/components/settings/SettingsShell";

export default function SettingsProfilePage() {
  const { t } = useLanguage();
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();
  const [displayName, setDisplayName] = useState(user?.displayName ?? user?.username ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName ?? user.username);
      setBio(user.bio ?? "");
    }
  }, [user]);

  if (!user) return null;

  const handleSave = () => {
    updateProfile({
      displayName: displayName.trim() || user.username,
      bio: bio.trim(),
    });
    showToast(t("settingsSaved"));
  };

  return (
    <SettingsSection title={t("settingsProfileTitle")} description={t("settingsProfileDesc")}>
      <div className="flex flex-col sm:flex-row gap-6 pb-6 border-b border-kick-border mb-6">
        <AvatarUploader avatar={user.avatar} alt={user.username} size={96} rounded="full" />
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium text-white">{t("settingsProfilePicture")}</p>
          <p className="text-xs text-white/40">{t("settingsProfilePictureHint")}</p>
        </div>
      </div>

      <div className="space-y-5">
        <SettingsField label={t("settingsUsername")} hint={t("settingsUsernameHint")}>
          <SettingsInput value={user.username} disabled />
        </SettingsField>

        <SettingsField label={t("settingsDisplayName")} hint={t("settingsDisplayNameHint")}>
          <SettingsInput
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={25}
          />
        </SettingsField>

        <SettingsField label={t("settingsBio")} hint={t("settingsBioHint")}>
          <SettingsTextarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            maxLength={300}
            placeholder={t("settingsBioPlaceholder")}
          />
        </SettingsField>

        <SettingsField label={t("settingsEmail")}>
          <SettingsInput value={user.email} disabled />
        </SettingsField>
      </div>

      <SettingsSaveButton label={t("save")} onClick={handleSave} />
    </SettingsSection>
  );
}
