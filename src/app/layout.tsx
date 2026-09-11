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
            <main className="flex-1 min-w-0 pb-[calc(4.25rem+env(safe-area-inset-bottom,0px))] lg:pb-0">{children}</main>
            <ConditionalFooter />
          </AgeGate>
        </Providers>
      </body>
    </html>
  );
}
