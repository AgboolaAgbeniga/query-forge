import React from 'react';

interface SVGLogoProps {
  size?: number;
  className?: string;
}

/**
 * Prism — Inline SVG wordmark + monogram.
 * Monochrome by default, auto-adapts in dark mode via currentColor.
 */
export function SVGLogo({ size = 32, className = '' }: SVGLogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Monogram mark - Abstract geometric prism */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-label="Prism logo"
      >
        {/* Outer bounds - subtle glow background */}
        <circle cx="20" cy="20" r="18" fill="currentColor" className="text-indigo-500/10 dark:text-indigo-400/10" />
        {/* Main Prism Triangle (Left-facing edge) */}
        <path
          d="M20 6L8 28H32L20 6Z"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
          className="text-slate-900 dark:text-white"
        />
        {/* Inner Refracting Lines */}
        <path
          d="M8 28L20 20L32 28"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
          className="text-indigo-600 dark:text-indigo-400"
        />
        <path
          d="M20 6V20"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
          className="text-emerald-500 dark:text-emerald-400"
        />
      </svg>

      {/* Wordmark */}
      <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white" style={{ fontFamily: 'var(--font-heading)' }}>
        Prism
      </span>
    </div>
  );
}

/** Compact monogram-only variant */
export function SVGLogoMark({ size = 28, className = '' }: SVGLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="Prism logo mark"
    >
      <circle cx="20" cy="20" r="18" fill="currentColor" className="text-indigo-500/10 dark:text-indigo-400/10" />
      <path
        d="M20 6L8 28H32L20 6Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
        className="text-slate-900 dark:text-white"
      />
      <path
        d="M8 28L20 20L32 28"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
        className="text-indigo-600 dark:text-indigo-400"
      />
      <path
        d="M20 6V20"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
        className="text-emerald-500 dark:text-emerald-400"
      />
    </svg>
  );
}
