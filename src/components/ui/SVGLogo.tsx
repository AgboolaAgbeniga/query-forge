import React from 'react';

interface SVGLogoProps {
  size?: number;
  className?: string;
}

/**
 * QueryForge — Inline SVG wordmark + monogram.
 * Monochrome by default, auto-adapts in dark mode via currentColor.
 */
export function SVGLogo({ size = 32, className = '' }: SVGLogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Monogram mark */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-label="QueryForge logo"
      >
        {/* Outer rounded square */}
        <rect
          x="2"
          y="2"
          width="36"
          height="36"
          rx="10"
          stroke="currentColor"
          strokeWidth="2.5"
          className="text-slate-900 dark:text-white"
        />
        {/* Q letterform — circle */}
        <circle
          cx="20"
          cy="18"
          r="8"
          stroke="currentColor"
          strokeWidth="2.5"
          fill="none"
          className="text-blue-600 dark:text-blue-400"
        />
        {/* Q letterform — tail / query arrow */}
        <path
          d="M24 22L30 30"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="text-emerald-500 dark:text-emerald-400"
        />
        {/* Filter dots representing query conditions */}
        <circle cx="16" cy="18" r="1.5" fill="currentColor" className="text-slate-900 dark:text-white" />
        <circle cx="20" cy="18" r="1.5" fill="currentColor" className="text-slate-900 dark:text-white" />
        <circle cx="24" cy="18" r="1.5" fill="currentColor" className="text-slate-900 dark:text-white" />
      </svg>

      {/* Wordmark */}
      <span className="text-xl font-bold tracking-wide text-slate-900 dark:text-white" style={{ fontFamily: 'var(--font-heading)' }}>
        Query<span className="text-blue-600 dark:text-blue-400">Forge</span>
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
      aria-label="QueryForge logo mark"
    >
      <rect
        x="2"
        y="2"
        width="36"
        height="36"
        rx="10"
        stroke="currentColor"
        strokeWidth="2.5"
        className="text-slate-900 dark:text-white"
      />
      <circle
        cx="20"
        cy="18"
        r="8"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
        className="text-blue-600 dark:text-blue-400"
      />
      <path
        d="M24 22L30 30"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="text-emerald-500 dark:text-emerald-400"
      />
      <circle cx="16" cy="18" r="1.5" fill="currentColor" className="text-slate-900 dark:text-white" />
      <circle cx="20" cy="18" r="1.5" fill="currentColor" className="text-slate-900 dark:text-white" />
      <circle cx="24" cy="18" r="1.5" fill="currentColor" className="text-slate-900 dark:text-white" />
    </svg>
  );
}
