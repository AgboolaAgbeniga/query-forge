'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = stored === 'dark' || (!stored && prefersDark);
    setIsDark(shouldBeDark);
    document.documentElement.classList.toggle('dark', shouldBeDark);
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggle}
      className={cn(
        "relative p-2.5 rounded-xl transition-all duration-300",
        "bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm",
        "border border-zinc-200 dark:border-zinc-700",
        "shadow-sm hover:shadow-md",
        "text-slate-600 dark:text-zinc-300",
        "hover:text-slate-900 dark:hover:text-white",
        "hover:scale-105 active:scale-95"
      )}
      aria-label="Toggle theme"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="relative w-5 h-5 overflow-hidden">
        <Sun
          size={20}
          className={cn(
            "absolute inset-0 transition-all duration-300",
            isDark
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-0 opacity-0"
          )}
        />
        <Moon
          size={20}
          className={cn(
            "absolute inset-0 transition-all duration-300",
            isDark
              ? "rotate-90 scale-0 opacity-0"
              : "rotate-0 scale-100 opacity-100"
          )}
        />
      </div>
    </button>
  );
}
