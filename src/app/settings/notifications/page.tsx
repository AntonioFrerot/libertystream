"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useToast } from "@/components/ui/Toast";
import {
  SettingsSaveButton,
  SettingsSection,
  SettingsToggle,
} from "@/components/settings/SettingsShell";

export default function SettingsNotificationsPage() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [liveAlerts, setLiveAlerts] = useState(true);
  const [followAlerts, setFollowAlerts] = useState(true);
  const [tipAlerts, setTipAlerts] = useState(true);
  const [subAlerts, setSubAlerts] = useState(true);
  const [emailDigest, setEmailDigest] = useState(false);
  const [marketing, setMarketing] = useState(false);

  const handleSave = () => {
    showToast(t("settingsSaved"));
  };

  return (
    <SettingsSection title={t("settingsNotificationsTitle")} description={t("settingsNotificationsDesc")}>
      <div className="space-y-1 divide-y divide-kick-border">
        <SettingsToggle
          label={t("settingsNotifLive")}
          description={t("settingsNotifLiveDesc")}
          checked={liveAlerts}
          onChange={setLiveAlerts}
        />
        <SettingsToggle
          label={t("settingsNotifFollow")}
          description={t("settingsNotifFollowDesc")}
          checked={followAlerts}
          onChange={setFollowAlerts}
        />
        <SettingsToggle
          label={t("settingsNotifTip")}
          description={t("settingsNotifTipDesc")}
          checked={tipAlerts}
          onChange={setTipAlerts}
        />
        <SettingsToggle
          label={t("settingsNotifSub")}
          description={t("settingsNotifSubDesc")}
          checked={subAlerts}
          onChange={setSubAlerts}
        />
        <SettingsToggle
          label={t("settingsNotifEmail")}
          description={t("settingsNotifEmailDesc")}
          checked={emailDigest}
          onChange={setEmailDigest}
        />
        <SettingsToggle
          label={t("settingsNotifMarketing")}
          description={t("settingsNotifMarketingDesc")}
          checked={marketing}
          onChange={setMarketing}
        />
      </div>

      <SettingsSaveButton label={t("save")} onClick={handleSave} />
    </SettingsSection>
  );
}
