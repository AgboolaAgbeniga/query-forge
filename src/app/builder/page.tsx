'use client';

import React, { useEffect, useCallback, useState, useMemo } from 'react';
import Link from 'next/link';
import { QueryBuilder } from '@/components/QueryBuilder/QueryBuilder';
import { PreviewPane } from '@/components/QueryBuilder/PreviewPane';
import { SchemaSelector } from '@/components/QueryBuilder/SchemaSelector';
import { ValidationSummary } from '@/components/QueryBuilder/ValidationSummary';
import { ResultsPane } from '@/components/QueryBuilder/ResultsPane';
import { HistoryPanel } from '@/components/QueryBuilder/HistoryPanel';
import { PresetsPanel } from '@/components/QueryBuilder/PresetsPanel';
import { ExportImport } from '@/components/QueryBuilder/ExportImport';
import { SVGLogo } from '@/components/ui/SVGLogo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useQueryStore } from '@/lib/store';
import { useQueryExecution } from '@/lib/useQueryExecution';
import { useBuilderShortcuts } from '@/lib/useBuilderShortcuts';
import { MobileSidebar } from '@/components/QueryBuilder/MobileSidebar';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

import { DATA_SOURCES, getSchemaById } from '@/lib/schema';
import { validateQueryTree } from '@/lib/engine';
import {
  Keyboard,
  Clock,
  Play,
  Trash2,
  AlertTriangle,
  Menu,
  ArrowLeft,
  Plus,
  Layers,
  Database,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

export default function BuilderPage() {
  const [activeRightTab, setActiveRightTab] = useState<'preview' | 'results' | 'history'>('preview');
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);

  const store = useQueryStore();
  const { results: executionResults, executionTime, isLoading, hasExecuted, execute: runExecution } = useQueryExecution();
  
  const activeSchema = getSchemaById(store.activeSchemaId);
  const schemaFieldsList = Object.values(activeSchema);

  useEffect(() => {
    useQueryStore.persist.rehydrate();
    setIsHydrated(true);
  }, []);

  // Validation Check
  const validationErrors = useMemo(() => {
    return validateQueryTree(store, activeSchema);
  }, [store.rules, store.groups, store.rootGroupId, activeSchema]);

  const isValid = validationErrors.length === 0;

  const shortcuts = useBuilderShortcuts({
    setShowShortcuts,
    setShowClearAllConfirm,
    setActiveRightTab
  });

  const handleExecute = () => {
    if (!isValid) {
      setActiveRightTab('results');
      return;
    }
    setActiveRightTab('results');
    runExecution();
  };


  if (!isHydrated) {
    return <main className="min-h-screen bg-[var(--background)] flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-zinc-200 dark:bg-white/10" />
        <div className="h-4 w-24 bg-zinc-200 dark:bg-white/10 rounded" />
      </div>
    </main>;
  }

  return (
    <main className="min-h-screen bg-[var(--background)] selection:bg-blue-200 dark:selection:bg-blue-900 overflow-hidden flex flex-col">
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

      <div className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-10 z-0">
        <div className="absolute left-0 right-0 top-[64px] border-b border-zinc-200 dark:border-white/10" />
      </div>

      <MobileSidebar 
        isOpen={isMobileSidebarOpen} 
        onClose={() => setIsMobileSidebarOpen(false)} 
        mobileActions={
          <div className="flex flex-col gap-2">
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/20 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-white/10 flex items-center justify-center">
                <ArrowLeft size={16} />
              </div>
              Back to Home
            </Link>
            <Link
              href="/docs"
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/20 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-white/10 flex items-center justify-center font-bold">?</div>
              Documentation
            </Link>
            <button
              onClick={() => { setActiveRightTab('history'); setIsMobileSidebarOpen(false); }}
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/20 rounded-lg transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-white/10 flex items-center justify-center"><Clock size={16} /></div>
              Query History
            </button>
            <button
              onClick={() => { setShowShortcuts(true); setIsMobileSidebarOpen(false); }}
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/20 rounded-lg transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-white/10 flex items-center justify-center"><Keyboard size={16} /></div>
              Keyboard Shortcuts
            </button>
            <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/20 rounded-lg transition-colors">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-white/10 flex items-center justify-center">
                <ThemeToggle />
              </div>
              Toggle Theme
            </div>
          </div>
        }
      />

      {/* ─── Header ─── */}
      <header className="h-16 flex items-center justify-between border-b border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-black/60 backdrop-blur-xl px-4 shrink-0 relative z-50 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 lg:gap-0">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-white/10 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-white transition-all active:scale-95"
            title="Open Menu"
          >
            <Menu size={18} />
          </button>
          
          <Link href="/" className="flex items-center gap-2 group focus:outline-none">
            <div className="hidden sm:block p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/20 transition-colors shrink-0">
              <ArrowLeft size={18} className="text-zinc-500 dark:text-zinc-400 group-hover:text-slate-900 dark:group-hover:text-white" />
            </div>
            <div className="shrink-0">
              <SVGLogo size={24} />
            </div>
            <span className="hidden sm:inline-block badge-sm badge-blue text-[10px] uppercase font-bold tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full ml-1 whitespace-nowrap shrink-0">
              Builder
            </span>
          </Link>
        </div>


        {/* Toolbar Header Buttons */}
        <div className="flex items-center gap-1 sm:gap-2.5 ml-auto">
          <div className="hidden sm:flex items-center gap-2.5">
            <Link
              href="/docs"
              className="inline-flex px-3 h-9 items-center justify-center text-xs font-bold text-zinc-550 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/10 rounded-xl transition-all uppercase tracking-wider font-sans"
              id="builder-header-docs-link"
            >
              Docs
            </Link>
            <button
              onClick={() => setActiveRightTab('history')}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/10 text-zinc-550 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-white transition-all hover:scale-105 active:scale-95"
              title="Query History (H)"
            >
              <Clock size={16} />
            </button>
            <ThemeToggle />
            <button
              onClick={() => setShowShortcuts(true)}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/10 text-zinc-550 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-white transition-all hover:scale-105 active:scale-95"
              title="Keyboard Shortcuts"
            >
              <Keyboard size={16} />
            </button>
          </div>

          <button
            onClick={handleExecute}
            className="shrink-0 whitespace-nowrap px-3 sm:px-4 h-8 sm:h-9 inline-flex items-center justify-center gap-1 sm:gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            title="Execute Query (Ctrl + Enter)"
          >
            <Play size={14} fill="currentColor" className="shrink-0" />
            <span className="hidden sm:inline">Execute</span>
          </button>
        </div>
      </header>

      {/* ─── Spatial Canvas Workspace ─── */}
      <div className="relative z-10 flex-1 w-full overflow-y-auto lg:overflow-hidden bg-zinc-50/50 dark:bg-black bg-dot-pattern flex flex-col lg:h-[calc(100vh-64px)] h-full">
        
        {/* FLOATING LEFT PANEL (Schema & Presets) */}
        <aside className="hidden lg:flex flex-col absolute top-6 left-6 w-[280px] max-h-[calc(100vh-112px)] bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-2xl border border-zinc-200 dark:border-white/10 shadow-2xl rounded-2xl overflow-y-auto custom-scrollbar z-40 p-5">
          {/* Schema fields Section */}
          <div className="mb-6">
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3 px-1">
              Schema Fields
            </div>
            <div className="flex flex-col gap-1.5">
              {schemaFieldsList.map((field) => (
                <div
                  key={field.name}
                  className="flex items-center gap-2.5 p-2 rounded-xl border border-transparent hover:bg-zinc-50 dark:hover:bg-white/10 hover:border-zinc-150 dark:hover:border-white/20 transition-all cursor-default">
                  <span
                    className={cn(
                      "text-[9px] font-bold px-1.5 py-0.5 rounded-md min-w-[50px] text-center tracking-wide uppercase",
                      field.type === 'string' && "bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400",
                      field.type === 'number' && "bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400",
                      field.type === 'date' && "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400",
                      field.type === 'enum' && "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400",
                      field.type === 'boolean' && "bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400"
                    )}
                  >
                    {field.type}
                  </span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 truncate">
                    {field.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <ErrorBoundary>
            <PresetsPanel />
          </ErrorBoundary>
          <div className="mt-8 border-t border-zinc-200 dark:border-white/10 pt-6">
            <ErrorBoundary>
              <ExportImport />
            </ErrorBoundary>
          </div>
        </aside>

        {/* TOP-LEFT STATUS PILLS (Mobile overlay or Float) */}
        <div className="lg:absolute top-6 left-6 lg:left-[320px] flex items-center gap-3 z-30 p-4 lg:p-0">
          <div className="hidden sm:block">
            <SchemaSelector
              activeSchemaId={store.activeSchemaId}
              onSelect={(src) => store.setActiveSchemaId(src.id)}
            />
          </div>
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="sm:hidden flex items-center gap-2 px-3 py-1.5 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl rounded-xl border border-zinc-200 dark:border-white/10 shadow-sm active:scale-95 transition-all text-xs font-semibold text-slate-700 dark:text-zinc-200">
            <Database size={14} className="text-blue-500 dark:text-blue-400" />
            {store.activeSchemaId.toUpperCase()}
          </button>
          <div className="flex items-center gap-2 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-white/10 shadow-sm">
            <span className={cn("w-2 h-2 rounded-full", isValid ? "bg-emerald-500" : "bg-amber-500")} />
            <span className="text-xs font-semibold text-slate-700 dark:text-zinc-200">
              {isValid ? 'Valid Setup' : 'Invalid Setup'}
            </span>
          </div>
        </div>

        {/* BOTTOM FLOATING COMMAND DOCK */}
        <div className="fixed lg:absolute bottom-4 lg:bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-2xl border border-zinc-200 dark:border-white/10 shadow-2xl rounded-2xl z-50 w-[max-content]">
          <button
            onClick={() => store.addRule(store.rootGroupId)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 dark:text-zinc-200 bg-transparent hover:bg-zinc-100 dark:hover:bg-white/10 rounded-xl transition-all active:scale-95">
            <Plus size={14} /> Add Rule
          </button>
          <div className="w-px h-6 bg-zinc-200 dark:bg-white/10" />
          <button
            onClick={() => store.addGroup(store.rootGroupId)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 dark:text-zinc-200 bg-transparent hover:bg-zinc-100 dark:hover:bg-white/10 rounded-xl transition-all active:scale-95">
            <Layers size={14} /> Add Group
          </button>
          <div className="w-px h-6 bg-zinc-200 dark:bg-white/10" />
          <button
            onClick={() => setShowClearAllConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-600 dark:text-red-400 bg-transparent hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all active:scale-95">
            <Trash2 size={14} /> Clear All
          </button>
        </div>

        {/* THE MAIN CANVAS (Query Tree & Results) */}
        <div className="w-full flex-1 lg:h-full overflow-visible lg:overflow-auto pt-4 lg:pt-24 pb-32 px-4 lg:px-[340px] custom-scrollbar flex justify-center">
          <div className="max-w-4xl w-full flex flex-col gap-12">
            <div>
              <div className="mb-6 flex justify-center">
                <ErrorBoundary>
                  <ValidationSummary errors={validationErrors} rulesCount={Object.keys(store.rules).length} />
                </ErrorBoundary>
              </div>
              <ErrorBoundary>
                <QueryBuilder />
              </ErrorBoundary>
            </div>

            {/* INLINE PREVIEW & RESULTS PANEL */}
            <div className="w-full flex flex-col bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-2xl border border-zinc-200 dark:border-white/10 shadow-2xl rounded-2xl overflow-hidden z-40">
              {/* Tab buttons */}
              <div className="flex border-b border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-transparent">
                {(['preview', 'results', 'history'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveRightTab(tab)}
                    className={cn(
                      "flex-1 py-3 text-center text-[11px] font-bold uppercase tracking-wider transition-all border-b-2",
                      activeRightTab === tab
                        ? "border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 bg-white/50 dark:bg-white/5"
                        : "text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200 border-transparent"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab contents */}
              <div className="flex-1 p-5">
                {activeRightTab === 'preview' && (
                  <div className="flex flex-col">
                    <div className="min-h-[300px]">
                      <ErrorBoundary>
                        <PreviewPane />
                      </ErrorBoundary>
                    </div>
                    <div className="flex gap-2.5 mt-3 mb-3">
                      <button className="flex-1 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 bg-zinc-50 dark:bg-white/5 hover:bg-zinc-100 dark:hover:bg-white/10 border border-zinc-200 dark:border-white/10 rounded-xl transition-all">
                        Share JSON
                      </button>
                      <button className="flex-1 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 bg-zinc-50 dark:bg-white/5 hover:bg-zinc-100 dark:hover:bg-white/10 border border-zinc-200 dark:border-white/10 rounded-xl transition-all">
                        Save Preset
                      </button>
                    </div>
                  </div>
                )}

                {activeRightTab === 'results' && (
                  <div className="flex flex-col gap-4">
                    {!isValid ? (
                      <div className="p-4 bg-red-50/80 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-red-700 dark:text-red-400">
                          <AlertTriangle size={16} />
                          <span>Execution Blocked</span>
                        </div>
                        <p className="text-xs text-red-600 dark:text-red-300 leading-relaxed">
                          The query tree contains errors. Please correct the highlighted conditions.
                        </p>
                        <div className="flex flex-col gap-1.5 border-t border-red-200/50 dark:border-red-500/20 pt-3">
                          {validationErrors.map((err, idx) => (
                            <div key={idx} className="text-[10.5px] text-red-600 dark:text-red-400 font-medium">
                              • <strong>{err.field || 'General'}:</strong> {err.message}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <ErrorBoundary>
                        <ResultsPane 
                          results={executionResults} 
                          executionTime={executionTime} 
                          isLoading={isLoading} 
                          hasExecuted={hasExecuted} 
                        />
                      </ErrorBoundary>
                    )}
                  </div>
                )}

                {activeRightTab === 'history' && (
                  <div className="flex flex-col">
                    <ErrorBoundary>
                      <HistoryPanel />
                    </ErrorBoundary>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ─── MODAL: Shortcuts help ─── */}
      <AnimatePresence>
        {showShortcuts && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setShowShortcuts(false)}
          >
            <div
              className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Keyboard size={18} />
                Keyboard Shortcuts
              </h3>
              <div className="flex flex-col gap-2.5 text-xs text-slate-600 dark:text-zinc-400">
                {shortcuts.map((s) => (
                  <div key={s.description} className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-white/10 last:border-0">
                    <span>{s.description}</span>
                    <kbd className="px-2 py-0.5 font-mono bg-zinc-50 dark:bg-white/10 border border-zinc-200 dark:border-white/10 rounded">
                      {s.key}
                    </kbd>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowShortcuts(false)}
                className="w-full mt-6 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 bg-zinc-50 dark:bg-white/10 border border-zinc-200 dark:border-white/10 rounded-xl hover:bg-zinc-100"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={showClearAllConfirm}
        title="Clear Query Builder"
        message="Are you sure you want to clear all rules and groups? This action cannot be undone."
        confirmLabel="Clear All"
        onConfirm={() => {
          store.resetQuery();
          setShowClearAllConfirm(false);
        }}
        onCancel={() => setShowClearAllConfirm(false)}
      />

    </main>
  );
}
