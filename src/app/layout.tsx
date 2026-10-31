import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { Navbar } from "@/components/layout/Navbar";
import { ConditionalFooter } from "@/components/layout/ConditionalFooter";
import { AgeGate } from "@/components/layout/AgeGate";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#1e1a28",
};

export const metadata: Metadata = {
  title: "LibertyPlace, La plateforme de streaming indépendante",
  description:
    "Plateforme premium de streaming 18+. Liberté maximale, 100% des subs et tips pour les créateurs.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans min-h-screen min-h-[100dvh] flex flex-col`}>
        <Providers>
          <AgeGate>
            <Navbar />
            <div className="flex min-w-0 flex-1 flex-col pb-[calc(var(--mobile-bottom-nav-height)+env(safe-area-inset-bottom,0px)+0.75rem)] lg:pb-0">
              <main className="min-w-0 flex-1">{children}</main>
              <ConditionalFooter />
            </div>
          </AgeGate>
        </Providers>
      </body>
    </html>
  );
}
