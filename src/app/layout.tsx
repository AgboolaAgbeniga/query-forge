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
      <body className="min-h-full flex flex-col font-sans bg-[var(--background)] text-[var(--foreground)] overflow-x-hidden selection:bg-blue-200 dark:selection:bg-blue-900">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
