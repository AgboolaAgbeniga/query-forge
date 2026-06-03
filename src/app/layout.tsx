import type { Metadata } from "next";
import { BioRhyme, Manrope } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const biorhyme = BioRhyme({
  variable: "--font-biorhyme",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QueryForge — Visual Query Builder",
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
      className={`${biorhyme.variable} ${manrope.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Iconify Icon Web Component — loaded before interactive for brand logos */}
        <Script
          src="https://cdn.jsdelivr.net/npm/iconify-icon@2/dist/iconify-icon.min.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[var(--background)] text-[var(--foreground)] overflow-x-hidden selection:bg-blue-200 dark:selection:bg-blue-900">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
