'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { SVGLogo } from '@/components/ui/SVGLogo';
import {

  Shield,
  Zap,
  Layers,
  Code2,
  ArrowRight,
  Database,
  Filter,
  GitBranch,
  Play,
} from 'lucide-react';

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
    title: 'Schema-Driven UI',
    description:
      'Adapts automatically to your data schema — date pickers, dropdowns, and number inputs appear contextually.',
  },
  {
    icon: Code2,
    title: 'Live Query Preview',
    description:
      'Watch your SQL, MongoDB, and GraphQL queries generate in real-time as you build.',
  },
  {
    icon: Layers,
    title: 'Execute & Inspect',
    description:
      'Run queries against mock datasets. Paginate, sort, and analyze results instantly.',
  },
  {
    icon: Shield,
    title: 'Validation Engine',
    description:
      'Automatic type validation, operator restrictions, and catches empty groups.',
  },
];

// React state-based stats counter
const StatCounter = ({ target, label, suffix = '' }: { target: number | string; label: string; suffix?: string }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (typeof target === 'string') return;
    let current = 0;
    const step = Math.ceil(target / 40);
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      setCount(current);
      if (current >= target) clearInterval(timer);
    }, 35);
    return () => clearInterval(timer);
  }, [target]);

  return (
    <div className="bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-2xl p-6 text-center shadow-md hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300">
      <div className="font-heading text-3xl md:text-4xl font-extrabold text-slate-950 dark:text-white mb-1">
        {typeof target === 'string' ? target : count.toLocaleString()}{suffix}
      </div>
      <div className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
};

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

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
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-[var(--background)]/80 backdrop-blur-md border-b border-zinc-200/50 dark:border-zinc-800/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="hero-element">
            <Link href="/" className="focus:outline-none">
              <SVGLogo size={30} />
            </Link>
          </div>
          <div className="hero-element flex items-center gap-6">
            <Link
              href="/docs"
              className="text-xs font-bold text-zinc-550 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors uppercase tracking-wider font-sans"
            >
              Docs
            </Link>
            <Link
              href="/builder"
              className="pill-button inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm font-semibold shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Launch Builder
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <section
        ref={heroRef}
        className="relative z-10 pt-36 pb-20 px-6 max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center"
      >
        <div className="hero-element blur-in" style={{ animationDelay: '0.1s' }}>
          <div className="pill-button inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-6 border border-blue-200/40 dark:border-blue-500/20 cursor-default">
            <Zap size={12} className="animate-pulse" />
            <span>Visual Query Builder</span>
          </div>

          <h1 className="heading text-[38px] md:text-[46px] lg:text-[56px] leading-tight text-slate-900 dark:text-white mb-6">
            Build <span className="text-blue-600 dark:text-blue-400">complex queries</span>
            <br />
            without writing code
          </h1>

          <p className="text-[16px] md:text-[18px] text-slate-500 dark:text-zinc-400 max-w-lg mb-10 leading-relaxed">
            Construct powerful database filters, nested conditions, and dynamic queries through an intuitive drag-and-drop interface. No SQL syntax required.
          </p>

          <div className="flex flex-wrap gap-4 mb-8">
            <Link
              href="/builder"
              className="pill-button inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm font-semibold shadow-lg shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Play size={12} fill="currentColor" />
              Open Builder
            </Link>
            <a
              href="https://github.com/AgboolaAgbeniga/query-forge"
              target="_blank"
              rel="noopener noreferrer"
              className="pill-button inline-flex items-center gap-2 px-6 py-3 bg-white/95 dark:bg-zinc-800/90 text-slate-700 dark:text-zinc-200 text-sm font-semibold border border-zinc-200 dark:border-zinc-700 shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              View on GitHub
            </a>
          </div>

          {/* Shortcut details below */}
          <div className="flex flex-wrap gap-4 text-xs text-zinc-400 dark:text-zinc-500">
            <span><kbd className="px-1.5 py-0.5 border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 rounded font-mono text-[10px]">⌘N</kbd> Add rule</span>
            <span><kbd className="px-1.5 py-0.5 border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 rounded font-mono text-[10px]">⌘E</kbd> Execute</span>
            <span><kbd className="px-1.5 py-0.5 border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 rounded font-mono text-[10px]">⌘Z</kbd> Undo</span>
          </div>
        </div>

        {/* Hero Right side: Mock card preview */}
        <div className="hero-element hero-visual blur-in w-full max-w-md mx-auto" style={{ animationDelay: '0.3s' }}>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl hover:translate-y-[-6px] transition-all duration-500">
            <div className="flex items-center justify-between mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Live Preview</span>
              <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 text-[10px] font-bold">SQL</span>
            </div>

            {/* Simulated Query tree */}
            <div className="flex flex-col gap-2.5 mb-5">
              <div className="flex gap-2 p-2 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-zinc-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-300">
                <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full text-[10px]">age</span>
                <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full text-[10px]">&gt; greaterThan</span>
                <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full text-[10px]">18</span>
              </div>
              <div className="flex gap-2 p-2 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-zinc-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-300">
                <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full text-[10px]">country</span>
                <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full text-[10px]">= equals</span>
                <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full text-[10px]">&quot;Nigeria&quot;</span>
              </div>
              
              <div className="px-2 py-1 bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 border border-purple-200/30 rounded-lg text-[10px] font-bold inline-flex items-center gap-1.5 self-start">
                <Layers size={10} />
                OR GROUP
              </div>

              <div className="ml-4 pl-3 border-l-2 border-purple-400 flex gap-2 p-2 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-zinc-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-300">
                <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full text-[10px]">status</span>
                <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full text-[10px]">= equals</span>
                <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full text-[10px]">&quot;active&quot;</span>
              </div>
            </div>

            {/* Preview Box */}
            <div className="bg-slate-950 dark:bg-black/60 rounded-xl p-4 font-mono text-xs text-slate-300 leading-relaxed mb-4 border border-zinc-800">
              <span className="text-blue-400 font-semibold">SELECT</span> * <span className="text-blue-400 font-semibold">FROM</span> users <br />
              <span className="text-blue-400 font-semibold">WHERE</span> (age &gt; <span className="text-emerald-400">18</span> <span className="text-blue-400 font-semibold">AND</span> country = <span className="text-orange-400">&apos;Nigeria&apos;</span>)<br />
              <span className="text-blue-400 font-semibold">OR</span> status = <span className="text-orange-400">&apos;active&apos;</span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-zinc-400 border-t border-zinc-100 dark:border-zinc-800 pt-3">
              <span>3 rules • 2 groups</span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold">42 results</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Logos strip ─── */}
      <div className="logos-section bg-white dark:bg-zinc-900/50 border-y border-zinc-200 dark:border-zinc-800 py-10 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-6">
            Trusted in engineering workflows at
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {BRAND_ICONS.map((brand) => (
              <div
                key={brand.name}
                className="brand-icon opacity-40 hover:opacity-100 transition-all duration-300 text-slate-700 dark:text-zinc-400 dark:hover:text-white"
                title={brand.name}
              >
                {/* @ts-expect-error - iconify-icon is a web component */}
                <iconify-icon
                  icon={brand.icon}
                  width="56"
                  height="56"
                  style={{ color: 'currentColor' }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Capabilities Section ─── */}
      <section
        id="features"
        ref={featuresRef}
        className="relative z-10 py-24 px-6 max-w-7xl mx-auto"
      >
        <div className="mb-16 max-w-lg">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-3">
            Capabilities
          </div>
          <h2 className="heading text-3xl md:text-4xl text-slate-900 dark:text-white mb-4">
            Everything you need to query with confidence
          </h2>
          <p className="text-[15px] text-slate-500 dark:text-zinc-400 leading-relaxed">
            From simple filters to deeply nested logic trees — built for engineers who value precision and speed.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="feature-card flashlight-card bg-white dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 shadow-md hover:shadow-lg cursor-default group"
              onMouseMove={handleFlashlightMove}
            >
              <div className="relative z-10">
                <div className="inline-flex p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-5 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon size={20} />
                </div>
                <h3 className="heading text-[18px] text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── "How it Works" Workflow Section ─── */}
      <section id="how-it-works" className="relative z-10 py-16 px-6 max-w-7xl mx-auto border-t border-zinc-200/50 dark:border-zinc-800/50">
        <div className="text-center max-w-lg mx-auto mb-14">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-3">
            Workflow
          </div>
          <h2 className="heading text-3xl text-slate-950 dark:text-white">
            How it works
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center p-6 bg-white/40 dark:bg-zinc-800/20 rounded-2xl border border-zinc-200/20">
            <div className="w-12 h-12 rounded-full bg-slate-900 dark:bg-zinc-800 text-white flex items-center justify-center mx-auto mb-4 font-heading text-lg font-bold">
              1
            </div>
            <h3 className="heading text-[16px] text-slate-800 dark:text-zinc-200 mb-2">Choose Schema</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">Select a data source (Users, Products, or Orders) or load examples.</p>
          </div>
          <div className="text-center p-6 bg-white/40 dark:bg-zinc-800/20 rounded-2xl border border-zinc-200/20">
            <div className="w-12 h-12 rounded-full bg-slate-900 dark:bg-zinc-800 text-white flex items-center justify-center mx-auto mb-4 font-heading text-lg font-bold">
              2
            </div>
            <h3 className="heading text-[16px] text-slate-800 dark:text-zinc-200 mb-2">Build Query</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">Add condition rules and group logic with drag-and-drop reordering.</p>
          </div>
          <div className="text-center p-6 bg-white/40 dark:bg-zinc-800/20 rounded-2xl border border-zinc-200/20">
            <div className="w-12 h-12 rounded-full bg-slate-900 dark:bg-zinc-800 text-white flex items-center justify-center mx-auto mb-4 font-heading text-lg font-bold">
              3
            </div>
            <h3 className="heading text-[16px] text-slate-800 dark:text-zinc-200 mb-2">Preview Output</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">Watch SQL, MongoDB, or GraphQL code syntax compile in real-time.</p>
          </div>
          <div className="text-center p-6 bg-white/40 dark:bg-zinc-800/20 rounded-2xl border border-zinc-200/20">
            <div className="w-12 h-12 rounded-full bg-slate-900 dark:bg-zinc-800 text-white flex items-center justify-center mx-auto mb-4 font-heading text-lg font-bold">
              4
            </div>
            <h3 className="heading text-[16px] text-slate-800 dark:text-zinc-200 mb-2">Execute & Inspect</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">Run the query, check simulated result cards, and copy code.</p>
          </div>
        </div>
      </section>

      {/* ─── Stats Section ─── */}
      <section className="relative z-10 py-12 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCounter target={12} label="Supported operators" />
          <StatCounter target={3} label="Query Formats"  />
          <StatCounter target="∞" label="Nesting Depth" />
          <StatCounter target={250} label="Mock Dataset Records" suffix="+" />
        </div>
      </section>

      {/* ─── Call To Action Section ─── */}
      <section className="relative z-10 py-20 bg-slate-900 dark:bg-zinc-950 text-white text-center rounded-[2rem] max-w-7xl mx-6 md:mx-auto px-6 mb-20 border border-zinc-800 shadow-2xl">
        <h2 className="font-heading text-3xl md:text-4xl font-extrabold mb-4">
          Ready to query smarter?
        </h2>
        <p className="text-zinc-400 text-sm max-w-md mx-auto mb-8">
          Launch the builder and construct your first complex query config in under 60 seconds.
        </p>
        <Link
          href="/builder"
          className="pill-button inline-flex items-center gap-2 px-8 py-3.5 bg-white hover:bg-zinc-150 text-slate-900 text-sm font-semibold transition-all hover:scale-105 active:scale-95"
        >
          <Play size={12} fill="currentColor" />
          Launch QueryForge
        </Link>
      </section>

      {/* ─── Footer ─── */}
      <footer className="relative z-10 py-10 px-6 bg-slate-950 dark:bg-black border-t border-zinc-800 text-center text-xs text-zinc-500 flex flex-col md:flex-row justify-between items-center gap-4 max-w-7xl mx-auto">
        <div>
          Built by Sugar
        </div>
        <div className="text-zinc-400">
          QueryForge &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </main>
  );
}
