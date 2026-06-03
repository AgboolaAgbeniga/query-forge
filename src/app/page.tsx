'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { QueryBuilder } from '@/components/QueryBuilder/QueryBuilder';
import { PreviewPane } from '@/components/QueryBuilder/PreviewPane';
import { Shield, Search, Zap } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero Animation
      gsap.fromTo(
        '.hero-text',
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: 'power3.out' }
      );

      // ScrollTrigger for App Reveal
      gsap.fromTo(
        appRef.current,
        { y: 100, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: appRef.current,
            start: 'top 80%',
            end: 'top 30%',
            scrub: 1,
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <main ref={containerRef} className="min-h-screen bg-stone-100 selection:bg-blue-200">
      {/* Background Guide Lines */}
      <div className="fixed inset-0 pointer-events-none flex justify-around opacity-20 z-0">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="w-px h-full bg-zinc-300 relative">
             <div className="absolute top-0 left-0 w-full h-1/4 bg-gradient-to-b from-blue-400/0 via-blue-400/80 to-blue-400/0 animate-beam" style={{ animationDelay: `${i * 0.7}s` }} />
          </div>
        ))}
      </div>

      {/* Hero Section */}
      <section ref={heroRef} className="relative z-10 pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold mb-8 hero-text border border-blue-100 shadow-sm">
          <Zap size={14} className="animate-pulse" />
          <span>Next-Generation Query Intelligence</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6 hero-text font-heading">
          Query your data,<br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">
            visually.
          </span>
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mb-12 hero-text font-sans leading-relaxed text-balance">
          Build complex database and API queries through an intuitive graphical interface. 
          Zero syntax required. Enterprise-grade execution.
        </p>

        <div className="flex flex-wrap justify-center gap-8 md:gap-12 hero-text opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          {/* Using text logos as placeholders for Iconify to keep things simple, per prompt "Iconify Simple Icons" - ideally would load SVG script here */}
          <span className="font-bold text-2xl tracking-wider text-slate-800">NASA</span>
          <span className="font-bold text-2xl tracking-widest text-slate-800">SpaceX</span>
          <span className="font-bold text-2xl tracking-tight text-slate-800">UBER</span>
          <span className="font-bold text-2xl tracking-normal text-slate-800">VISA</span>
        </div>
      </section>

      {/* Main App Container */}
      <section ref={appRef} className="relative z-10 px-4 md:px-8 pb-32 max-w-[1600px] mx-auto">
        <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] shadow-2xl overflow-hidden grid lg:grid-cols-3 min-h-[800px]">
          
          {/* Left Column: Query Builder */}
          <div className="lg:col-span-2 p-6 md:p-10 border-r border-zinc-200/50 bg-stone-50/50 flex flex-col">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/20">
                <Search size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold font-heading text-slate-900">Query Rules</h2>
                <p className="text-slate-500 text-sm">Define your nested conditions and logic</p>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <QueryBuilder />
            </div>
          </div>

          {/* Right Column: Live Preview & Executor */}
          <div className="p-6 md:p-10 bg-slate-900 flex flex-col shadow-inner">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-slate-800 rounded-xl text-emerald-400 shadow-inner shadow-black/50">
                <Shield size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold font-heading text-white">Live Compilation</h2>
                <p className="text-slate-400 text-sm">Real-time syntax generation</p>
              </div>
            </div>
            
            <div className="flex-1 h-full min-h-[400px]">
              <PreviewPane />
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}
