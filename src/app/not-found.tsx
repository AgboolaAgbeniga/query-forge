'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { DatabaseZap, ArrowLeft, SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[var(--background)] flex items-center justify-center relative overflow-hidden px-4">
      {/* Background Grid */}
      <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }} />

      <div className="relative z-10 w-full max-w-lg text-center flex flex-col items-center">
        {/* Floating animated icon */}
        <motion.div 
          animate={{ 
            y: [0, -15, 0],
            rotate: [0, -5, 5, 0]
          }} 
          transition={{ 
            duration: 5, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="relative mb-8"
        >
          <div className="absolute -inset-4 bg-red-500/20 dark:bg-red-500/10 rounded-full blur-2xl animate-pulse" />
          <div className="w-24 h-24 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl flex items-center justify-center shadow-2xl relative">
            <SearchX size={48} className="text-red-500 dark:text-red-400" />
            
            <motion.div 
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              className="absolute -top-2 -right-2 w-8 h-8 bg-zinc-900 dark:bg-white rounded-full flex items-center justify-center shadow-lg"
            >
              <span className="text-white dark:text-zinc-900 text-xs font-bold font-mono">404</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Text content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-4xl sm:text-5xl font-heading font-black text-slate-900 dark:text-white mb-4 tracking-tight">
            Query Returned Empty
          </h1>
          <p className="text-lg text-slate-600 dark:text-zinc-400 mb-10 max-w-sm mx-auto leading-relaxed">
            The page you're looking for doesn't exist in our current schema. It might have been deleted, moved, or never existed at all.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold hover:bg-slate-800 dark:hover:bg-zinc-100 transition-all active:scale-95 shadow-xl shadow-slate-900/20 dark:shadow-white/10"
            >
              <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
              Return Home
            </Link>
            
            <Link
              href="/builder"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-2xl font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all active:scale-95"
            >
              <DatabaseZap size={18} className="text-blue-500" />
              Open Builder
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
