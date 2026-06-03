import type { Metadata } from "next";
import { BioRhyme, Manrope } from "next/font/google";
import "./globals.css";

const biorhyme = BioRhyme({
  variable: "--font-biorhyme",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Premium Visual Query Builder",
  description: "Enterprise-grade visual query builder platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${biorhyme.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-stone-100 text-slate-900 overflow-x-hidden selection:bg-zinc-300 selection:text-slate-900">
        {children}
      </body>
    </html>
  );
}
