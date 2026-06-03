'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { QueryBuilder } from '@/components/QueryBuilder/QueryBuilder';
import { PreviewPane } from '@/components/QueryBuilder/PreviewPane';
import { ResultsPane } from '@/components/QueryBuilder/ResultsPane';
import { SchemaSelector } from '@/components/QueryBuilder/SchemaSelector';
import { ValidationSummary } from '@/components/QueryBuilder/ValidationSummary';
import { HistoryPanel } from '@/components/QueryBuilder/HistoryPanel';
import { PresetsPanel } from '@/components/QueryBuilder/PresetsPanel';
import { ExportImport } from '@/components/QueryBuilder/ExportImport';
import { SVGLogo } from '@/components/ui/SVGLogo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useQueryStore } from '@/lib/store';
import { DATA_SOURCES, getSchemaById } from '@/lib/schema';
import { addToHistory } from '@/lib/history';
import { useKeyboardShortcuts, formatShortcut, ShortcutConfig } from '@/lib/keyboard';
import {
  Shield,
  Search,
  Zap,
  Layers,
  Code2,
  ArrowRight,
  Database,
  Filter,
  GitBranch,
  PanelRightOpen,
  PanelRightClose,
  Keyboard,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/* ─── Brand Logos using Iconify Simple Icons ─── */
const BRAND_ICONS = [
  { name: 'NASA', icon: 'simple-icons:nasa' },
  { name: 'SpaceX', icon: 'simple-icons:spacex' },
  { name: 'Uber', icon: 'simple-icons:uber' },
  { name: 'Visa', icon: 'simple-icons:visa' },
  { name: 'Grab', icon: 'simple-icons:grab' },
  { name: 'Bose', icon: 'simple-icons:bose' },
  { name: 'Discover', icon: 'simple-icons:discover' },
  { name: 'DJI', icon: 'simple-icons:dji' },
  { name: 'Nikon', icon: 'simple-icons:nikon' },
  { name: 'Craftsman', icon: 'simple-icons:craftsman' },
  { name: 'Sony', icon: 'simple-icons:sony' },
];

/* ─── Feature cards data ─── */
const FEATURES = [
  {
    icon: Filter,
    title: 'Visual Filters',
    description:
      'Build complex conditions with drag-and-drop. No query syntax needed.',
  },
  {
    icon: GitBranch,
    title: 'Nested Logic',
    description:
      'Unlimited nesting depth with AND/OR groups. Collapse and expand freely.',
  },
  {
    icon: Database,
    title: 'Schema-Aware',
    description:
      'Auto-detects field types. Date pickers, dropdowns, and number inputs appear contextually.',
  },
  {
    icon: Code2,
    title: 'Live Preview',
    description:
      'Watch your SQL and MongoDB queries generate in real-time as you build.',
  },
  {
    icon: Layers,
    title: 'Execute & Inspect',
    description:
      'Run queries against mock datasets. Paginate, sort, and analyze results instantly.',
  },
  {
    icon: Shield,
    title: 'Validated & Safe',
    description:
      'Automatic type validation, operator restrictions, and sanitized output.',
  },
];

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<HTMLDivElement>(null);

  const [showSidebar, setShowSidebar] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const store = useQueryStore();
  const activeSchema = getSchemaById(store.activeSchemaId);

  /* ─── Keyboard shortcuts ─── */
  const shortcuts: ShortcutConfig[] = [
    {
      key: 'n',
      ctrl: true,
      description: 'Add new rule',
      action: () => store.addRule(store.rootGroupId),
    },
    {
      key: 'g',
      ctrl: true,
      description: 'Add new group',
      action: () => store.addGroup(store.rootGroupId),
    },
    {
      key: 's',
      ctrl: true,
      description: 'Save to history',
      action: () => {
        addToHistory({
          groups: store.groups,
          rules: store.rules,
          rootGroupId: store.rootGroupId,
        });
      },
    },
    {
      key: '/',
      ctrl: true,
      description: 'Toggle sidebar',
      action: () => setShowSidebar((s) => !s),
    },
    {
      key: '?',
      shift: true,
      description: 'Show keyboard shortcuts',
      action: () => setShowShortcuts((s) => !s),
    },
  ];
  useKeyboardShortcuts(shortcuts);

  /* ─── Flashlight hover effect ─── */
  const handleFlashlightMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      const rect = target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      target.style.setProperty('--mouse-x', `${x}px`);
      target.style.setProperty('--mouse-y', `${y}px`);
    },
    []
  );

  /* ─── Schema switching ─── */
  const handleSchemaChange = useCallback(
    (source: { id: string }) => {
      store.setActiveSchemaId(source.id);
    },
    [store]
  );

  useEffect(() => {
    const ctx = gsap.context(() => {
      /* ─── Hero: Blur-in staggered entrance ─── */
      gsap.fromTo(
        '.hero-element',
        { y: 40, opacity: 0, filter: 'blur(10px)' },
        {
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 0.9,
          stagger: 0.15,
          ease: 'power3.out',
        }
      );

      /* ─── Brand logos: Fade in with stagger ─── */
      gsap.fromTo(
        '.brand-icon',
        { opacity: 0, y: 12 },
        {
          opacity: 0.5,
          y: 0,
          duration: 0.6,
          stagger: 0.06,
          ease: 'power2.out',
          delay: 0.8,
        }
      );

      /* ─── Features section: Progressive reveal on scroll ─── */
      gsap.utils.toArray<HTMLElement>('.feature-card').forEach((card) => {
        gsap.fromTo(
          card,
          { y: 60, opacity: 0, scale: 0.96 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.7,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              end: 'top 60%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });

      /* ─── Sticky product storytelling ─── */
      if (stickyRef.current && appRef.current) {
        ScrollTrigger.create({
          trigger: stickyRef.current,
          start: 'top top',
          end: 'bottom bottom',
          pin: appRef.current,
          pinSpacing: false,
        });
      }

      /* ─── App reveal: Cinematic scale + blur ─── */
      gsap.fromTo(
        appRef.current,
        { y: 80, opacity: 0, scale: 0.92, filter: 'blur(8px)' },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          filter: 'blur(0px)',
          ease: 'power3.out',
          scrollTrigger: {
            trigger: appRef.current,
            start: 'top 90%',
            end: 'top 40%',
            scrub: 1.2,
          },
        }
      );

      /* ─── Parallax on vertical guide lines ─── */
      gsap.utils.toArray<HTMLElement>('.guide-line').forEach((line, i) => {
        gsap.to(line, {
          y: i % 2 === 0 ? -60 : -30,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1,
          },
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <main
      ref={containerRef}
      className="min-h-screen bg-[var(--background)] selection:bg-blue-200 dark:selection:bg-blue-900"
    >
      {/* ─── Background Guide Lines ─── */}
      <div className="fixed inset-0 pointer-events-none flex justify-around opacity-[0.12] dark:opacity-[0.08] z-0">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="guide-line w-px h-full bg-zinc-300 dark:bg-zinc-600 relative">
            <div
              className="absolute top-0 left-0 w-full h-1/4 bg-gradient-to-b from-blue-400/0 via-blue-500/80 to-blue-400/0 animate-beam"
              style={{
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + i * 0.3}s`,
              }}
            />
          </div>
        ))}
      </div>

      {/* ─── Top Nav ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="hero-element">
            <SVGLogo size={30} />
          </div>
          <div className="hero-element flex items-center gap-3">
            <button
              onClick={() => setShowShortcuts((s) => !s)}
              className="p-2.5 rounded-xl bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm border border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow-md text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white transition-all hover:scale-105 active:scale-95"
              title="Keyboard shortcuts"
            >
              <Keyboard size={18} />
            </button>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* ─── Keyboard Shortcuts Modal ─── */}
      <AnimatePresence>
        {showShortcuts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setShowShortcuts(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="surface-floating rounded-2xl p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="heading text-[20px] text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Keyboard size={20} />
                Keyboard Shortcuts
              </h3>
              <div className="flex flex-col gap-2">
                {shortcuts.map((s) => (
                  <div
                    key={s.description}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  >
                    <span className="text-sm text-slate-600 dark:text-zinc-300">
                      {s.description}
                    </span>
                    <kbd className="px-2 py-0.5 text-xs font-mono bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-zinc-600 dark:text-zinc-400">
                      {formatShortcut(s)}
                    </kbd>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-zinc-400 dark:text-zinc-500 text-center">
                Press <kbd className="px-1 py-0.5 text-[10px] bg-zinc-100 dark:bg-zinc-800 rounded">Esc</kbd> or click outside to close
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Hero Section ─── */}
      <section
        ref={heroRef}
        className="relative z-10 pt-36 pb-24 px-6 max-w-7xl mx-auto flex flex-col items-center text-center"
      >
        <div className="hero-element pill-button inline-flex items-center gap-2 px-5 py-2 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm text-blue-600 dark:text-blue-400 text-sm font-semibold mb-10 border border-zinc-200 dark:border-zinc-700 shadow-sm cursor-default">
          <Zap size={14} className="animate-pulse" />
          <span>Next-Generation Query Intelligence</span>
        </div>

        <h1 className="hero-element heading text-[36px] md:text-[44px] lg:text-[52px] leading-tight text-slate-900 dark:text-white mb-6">
          Query your data,
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500 dark:from-blue-400 dark:to-emerald-400">
            visually.
          </span>
        </h1>

        <p className="hero-element text-[18px] md:text-[22px] text-slate-600 dark:text-zinc-400 max-w-2xl mb-14 font-sans leading-relaxed text-balance">
          Build complex database and API queries through an intuitive graphical
          interface. Zero syntax required. Enterprise-grade execution.
        </p>

        <div className="hero-element flex flex-wrap justify-center gap-4 mb-20">
          <a
            href="#query-builder"
            className="pill-button inline-flex items-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-[15px] font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            Start Building
            <ArrowRight size={18} />
          </a>
          <a
            href="#features"
            className="pill-button inline-flex items-center gap-2 px-7 py-3.5 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm text-slate-700 dark:text-zinc-200 text-[15px] font-semibold border border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            Explore Features
          </a>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-10 lg:gap-12">
          {BRAND_ICONS.map((brand) => (
            <div
              key={brand.name}
              className="brand-icon opacity-0 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500 text-slate-700 dark:text-zinc-400 dark:hover:text-white"
              title={brand.name}
            >
              {/* @ts-expect-error - iconify-icon is a web component */}
              <iconify-icon
                icon={brand.icon}
                width="64"
                height="64"
                style={{ color: 'currentColor' }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features Section ─── */}
      <section
        id="features"
        ref={featuresRef}
        className="relative z-10 py-24 px-6 max-w-7xl mx-auto"
      >
        <div className="text-center mb-16">
          <h2 className="heading text-[32px] md:text-[38px] text-slate-900 dark:text-white mb-4">
            Everything you need
          </h2>
          <p className="text-[18px] md:text-[20px] text-slate-500 dark:text-zinc-400 max-w-xl mx-auto">
            Enterprise-grade query building with an intuitive visual interface.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="feature-card flashlight-card surface-elevated rounded-2xl p-7 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 cursor-default group"
              onMouseMove={handleFlashlightMove}
            >
              <div className="relative z-10">
                <div className="inline-flex p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-5 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon size={24} />
                </div>
                <h3 className="heading text-[20px] text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-[15px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Sticky Product Storytelling Wrapper ─── */}
      <div ref={stickyRef} className="relative min-h-[200vh]">
        <section
          id="query-builder"
          ref={appRef}
          className="relative z-10 px-4 md:px-8 py-16 max-w-[1600px] mx-auto"
        >
          <div
            className="flashlight-card surface-floating rounded-[2rem] overflow-hidden min-h-[800px]"
            onMouseMove={handleFlashlightMove}
          >
            {/* Toolbar row */}
            <div className="flex flex-wrap items-center justify-between gap-4 px-6 md:px-10 pt-6 md:pt-8 pb-4 border-b border-zinc-200/50 dark:border-zinc-700/30 relative z-10">
              <SchemaSelector
                activeSchemaId={store.activeSchemaId}
                onSelect={handleSchemaChange}
              />
              <button
                onClick={() => setShowSidebar((s) => !s)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border",
                  showSidebar
                    ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/30"
                    : "bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
                )}
              >
                {showSidebar ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
                Tools
              </button>
            </div>

            <div className="grid lg:grid-cols-5">
              {/* Left Column: Query Builder */}
              <div
                className={cn(
                  "p-6 md:p-10 border-r border-zinc-200/50 dark:border-zinc-700/50 bg-[var(--surface-muted)] flex flex-col transition-all",
                  showSidebar ? "lg:col-span-2" : "lg:col-span-3"
                )}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-blue-600 dark:bg-blue-500 rounded-xl text-white shadow-lg shadow-blue-500/20">
                    <Search size={24} />
                  </div>
                  <div>
                    <h2 className="heading text-[24px] md:text-[28px] text-slate-900 dark:text-white">
                      Query Rules
                    </h2>
                    <p className="text-slate-500 dark:text-zinc-400 text-[14px]">
                      Define your nested conditions and logic
                    </p>
                  </div>
                </div>

                {/* Validation summary */}
                <div className="mb-4">
                  <ValidationSummary schema={activeSchema} />
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  <QueryBuilder />
                </div>
              </div>

              {/* Side Panel: History / Presets / Export */}
              <AnimatePresence>
                {showSidebar && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 'auto', opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="lg:col-span-1 border-r border-zinc-200/50 dark:border-zinc-700/50 bg-[var(--surface-muted)] overflow-hidden"
                  >
                    <div className="p-4 md:p-6 flex flex-col gap-6 min-w-[260px]">
                      <ExportImport />
                      <hr className="border-zinc-200 dark:border-zinc-700" />
                      <PresetsPanel />
                      <hr className="border-zinc-200 dark:border-zinc-700" />
                      <HistoryPanel />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Right Column: Live Preview */}
              <div className="lg:col-span-2 p-6 md:p-10 bg-slate-900 dark:bg-zinc-950 flex flex-col shadow-inner">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-slate-800 dark:bg-zinc-800 rounded-xl text-emerald-400 shadow-inner shadow-black/50">
                    <Shield size={24} />
                  </div>
                  <div>
                    <h2 className="heading text-[24px] md:text-[28px] text-white">
                      Live Compilation
                    </h2>
                    <p className="text-slate-400 text-[14px]">
                      Real-time syntax generation
                    </p>
                  </div>
                </div>

                <div className="flex-1 h-full min-h-[400px]">
                  <PreviewPane />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ─── Results Execution Section ─── */}
      <section className="relative z-10 px-4 md:px-8 pb-20 max-w-[1600px] mx-auto">
        <div
          className="flashlight-card surface-elevated rounded-[2rem] p-6 md:p-10"
          onMouseMove={handleFlashlightMove}
        >
          <div className="flex items-center gap-4 mb-8 relative z-10">
            <div className="p-3 bg-emerald-600 dark:bg-emerald-500 rounded-xl text-white shadow-lg shadow-emerald-500/20">
              <Database size={24} />
            </div>
            <div>
              <h2 className="heading text-[24px] md:text-[28px] text-slate-900 dark:text-white">
                Query Execution
              </h2>
              <p className="text-slate-500 dark:text-zinc-400 text-[14px]">
                Run queries against the mock dataset and inspect results
              </p>
            </div>
          </div>
          <div className="relative z-10">
            <ResultsPane />
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="relative z-10 py-12 px-6 border-t border-zinc-200/50 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <SVGLogo size={24} />
          <p className="text-[13px] text-slate-500 dark:text-zinc-500">
            &copy; {new Date().getFullYear()} QueryForge. Built with Next.js,
            TypeScript &amp; Zustand.
          </p>
        </div>
      </footer>
    </main>
  );
}
