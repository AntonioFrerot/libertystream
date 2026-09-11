"use client";

import { useState } from "react";
import type { TranslationKey } from "@/lib/i18n/translations";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import {
  SettingsField,
  SettingsInput,
  SettingsSaveButton,
  SettingsSection,
  SettingsToggle,
} from "@/components/settings/SettingsShell";

export default function SettingsSecurityPage() {
  const { t } = useLanguage();
  const { changePassword } = useAuth();
  const { showToast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFactor, setTwoFactor] = useState(false);

  const handlePasswordSave = () => {
    if (newPassword !== confirmPassword) {
      showToast(t("settingsPasswordMismatch"));
      return;
    }
    const error = changePassword(currentPassword, newPassword);
    if (error) {
      showToast(t(error as TranslationKey));
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    showToast(t("settingsPasswordUpdated"));
  };

  const handleTwoFactor = () => {
    setTwoFactor((value) => !value);
    showToast(t(twoFactor ? "settings2faDisabled" : "settings2faEnabled"));
  };

  return (
    <div className="space-y-6">
      <SettingsSection title={t("settingsSecurityTitle")} description={t("settingsSecurityDesc")}>
        <div className="space-y-5">
          <SettingsField label={t("settingsCurrentPassword")}>
            <SettingsInput
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
            />
          </SettingsField>
          <SettingsField label={t("settingsNewPassword")}>
            <SettingsInput
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
          </SettingsField>
          <SettingsField label={t("settingsConfirmPassword")}>
            <SettingsInput
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </SettingsField>
        </div>
        <SettingsSaveButton label={t("settingsUpdatePassword")} onClick={handlePasswordSave} />
      </SettingsSection>

      <SettingsSection title={t("settings2faTitle")} description={t("settings2faDesc")}>
        <SettingsToggle
          label={t("settings2faLabel")}
          description={t("settings2faHint")}
          checked={twoFactor}
          onChange={handleTwoFactor}
        />
      </SettingsSection>
    </div>
  );
}
