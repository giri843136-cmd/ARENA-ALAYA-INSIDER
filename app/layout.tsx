import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { CommandPaletteProvider } from "@/components/CommandPalette";
import { OfflineBanner } from "@/components/ui/OfflineBanner";
import { PWAInstallPrompt } from "@/components/ui/PWAInstallPrompt";
import { ServiceWorkerRegister } from "@/components/providers/ServiceWorkerRegister";
import { CurrencyProvider } from "@/lib/currency/useCurrency";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  preload: true,
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://alayainsider.com"),
  manifest: "/manifest.json",

  title: {
    default: "ALAYA INSIDER | Curated Editorial Discovery",
    template: "%s | ALAYA INSIDER",
  },
  description: "An editorial sanctuary for the discerning woman. Thoughtfully curated discoveries in home, beauty, style, and living — each selected with intention, each story told with care.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "ALAYA INSIDER | Curated Editorial Discovery",
    description: "An editorial sanctuary for the discerning woman. Thoughtfully curated discoveries in home, beauty, style, and living — each selected with intention.",
    images: [{ url: "/og-image.jpg" }],
  },
  other: {
    "x-currency-code": "USD",
    "x-currency-symbol": "$",
    "x-currency-locale": "en-US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[#F5F0EA] text-[#2C2522] selection:bg-[#C5A26F] selection:text-white">
        <CurrencyProvider>
          <CommandPaletteProvider>
            <OfflineBanner />
            <ServiceWorkerRegister />
            {children}
            <PWAInstallPrompt />
          </CommandPaletteProvider>
        </CurrencyProvider>
        <Toaster 
          position="top-center" 
          richColors 
          closeButton 
          className="font-sans"
        />
      </body>
    </html>
  );
}
