"use client";

import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { AppUIProvider } from "@/components/providers/AppUIProvider";
import { WalletProvider } from "@/components/providers/WalletProvider";
import { WalletModal } from "@/components/modals/WalletModal";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <ToastProvider>
        <AuthProvider>
          <WalletProvider>
            <AppUIProvider>
              {children}
              <WalletModal />
            </AppUIProvider>
          </WalletProvider>
        </AuthProvider>
      </ToastProvider>
    </LanguageProvider>
  );
}
