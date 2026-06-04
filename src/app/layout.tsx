import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Prism — Visual Query Builder",
  description:
    "Build complex database and API queries through an intuitive graphical interface. Zero syntax required. Enterprise-grade execution.",
};

import { ThemeProvider } from 'next-themes';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Iconify Icon Web Component — loaded before interactive for brand logos */}
        <Script
          src="https://cdn.jsdelivr.net/npm/iconify-icon@2/dist/iconify-icon.min.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[var(--background)] text-[var(--foreground)] overflow-x-hidden selection:bg-orange-200 dark:selection:bg-orange-900">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {/* AMBIENT SUNSET MESH GRADIENT */}
          <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
            <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-orange-500/10 dark:bg-orange-500/15 blur-[120px]" />
            <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-rose-500/10 dark:bg-rose-500/10 blur-[120px]" />
            <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[50%] rounded-full bg-amber-500/10 dark:bg-amber-500/10 blur-[120px]" />
          </div>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
