import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Poppins } from "next/font/google";

import { LocaleProvider } from "@/components/locale-provider";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { ThemeScript } from "@/components/theme-script";
import { getLocale } from "@/lib/i18n/locale";
import { t } from "@/lib/i18n/translate";

import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  preload: false,
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return {
    title: {
      default: "Resonance",
      template: "%s · Resonance",
    },
    description: t(locale, "brand.meta"),
    applicationName: "Resonance",
    manifest: "/manifest.webmanifest",
    icons: {
      icon: [
        { url: "/icon.svg", type: "image/svg+xml" },
        { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      ],
      apple: "/apple-touch-icon.png",
    },
    appleWebApp: {
      capable: true,
      title: "Resonance",
      statusBarStyle: "black-translucent",
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f4f8" },
    { media: "(prefers-color-scheme: dark)", color: "#121018" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className={`${poppins.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full bg-background font-sans text-text" suppressHydrationWarning>
        <ServiceWorkerRegister enabled={process.env.NODE_ENV === "production"} />
        <LocaleProvider locale={locale}>{children}</LocaleProvider>
      </body>
    </html>
  );
}
