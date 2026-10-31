"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import type { TranslationKey } from "@/lib/i18n/translations";
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
  const { user, updateProfile, changeUsername } = useAuth();
  const { showToast } = useToast();
  const [displayName, setDisplayName] = useState(user?.displayName ?? user?.username ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName ?? user.username);
      setUsername(user.username);
      setBio(user.bio ?? "");
    }
  }, [user]);

  if (!user) return null;

  const handleSave = async () => {
    setSaving(true);
    const usernameError = await changeUsername(username);
    if (usernameError) {
      showToast(t(usernameError as TranslationKey));
      setSaving(false);
      return;
    }
    updateProfile({
      displayName: displayName.trim() || username.trim() || user.username,
      bio: bio.trim(),
    });
    showToast(t("settingsSaved"));
    setSaving(false);
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
          <SettingsInput
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            maxLength={25}
            minLength={3}
            pattern="[a-zA-Z0-9_]+"
            autoComplete="username"
          />
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

      <SettingsSaveButton label={t("save")} onClick={() => void handleSave()} disabled={saving} />
    </SettingsSection>
  );
}
