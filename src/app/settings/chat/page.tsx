"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useToast } from "@/components/ui/Toast";
import {
  SettingsField,
  SettingsInput,
  SettingsSaveButton,
  SettingsSection,
  SettingsToggle,
} from "@/components/settings/SettingsShell";

export default function SettingsChatPage() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [slowMode, setSlowMode] = useState(false);
  const [followersOnly, setFollowersOnly] = useState(false);
  const [subscribersOnly, setSubscribersOnly] = useState(false);
  const [blockedWords, setBlockedWords] = useState("");

  const handleSave = () => {
    showToast(t("settingsSaved"));
  };

  return (
    <SettingsSection title={t("settingsChatTitle")} description={t("settingsChatDesc")}>
      <div className="space-y-1 divide-y divide-kick-border mb-5">
        <SettingsToggle
          label={t("settingsChatSlowMode")}
          description={t("settingsChatSlowModeDesc")}
          checked={slowMode}
          onChange={setSlowMode}
        />
        <SettingsToggle
          label={t("followersOnly")}
          description={t("settingsChatFollowersDesc")}
          checked={followersOnly}
          onChange={setFollowersOnly}
        />
        <SettingsToggle
          label={t("settingsChatSubsOnly")}
          description={t("settingsChatSubsDesc")}
          checked={subscribersOnly}
          onChange={setSubscribersOnly}
        />
      </div>

      <SettingsField label={t("settingsChatBlockedWords")} hint={t("settingsChatBlockedWordsHint")}>
        <SettingsInput
          value={blockedWords}
          onChange={(e) => setBlockedWords(e.target.value)}
          placeholder={t("settingsChatBlockedWordsPlaceholder")}
        />
      </SettingsField>

      <SettingsSaveButton label={t("save")} onClick={handleSave} />
    </SettingsSection>
  );
}
