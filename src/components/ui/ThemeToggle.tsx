'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className={cn("w-9 h-9 rounded-xl", className)} />;
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className={cn(
        "flex items-center justify-center w-9 h-9 rounded-xl transition-all",
        "bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700",
        "hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-slate-900 dark:hover:text-zinc-200",
        "shadow-sm hover:shadow hover:scale-[1.02] active:scale-[0.98]",
        className
      )}
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  );
}
