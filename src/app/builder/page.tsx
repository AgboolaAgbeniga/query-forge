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
        <div className="w-12 h-12 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded" />
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
        <div className="absolute left-0 right-0 top-[64px] border-b border-zinc-200 dark:border-zinc-700" />
      </div>

      <MobileSidebar 
        isOpen={isMobileSidebarOpen} 
        onClose={() => setIsMobileSidebarOpen(false)} 
      />

      {/* ─── Header ─── */}
      <header className="relative z-50 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-6 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 lg:gap-0">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 hover:text-slate-800 dark:hover:text-white transition-all active:scale-95"
            title="Open Menu"
          >
            <Menu size={18} />
          </button>
          
          <Link href="/" className="flex items-center gap-2 group focus:outline-none">
            <div className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <ArrowLeft size={18} className="text-zinc-500 dark:text-zinc-400 group-hover:text-slate-900 dark:group-hover:text-white" />
            </div>
            <SVGLogo size={24} />
            <span className="badge-sm badge-blue text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ml-1">
              Builder
            </span>
          </Link>
        </div>

        {/* Validator Status Indicator */}
        <div className="hidden md:flex items-center gap-4">
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium flex items-center gap-1.5">
            <span className={cn("w-2 h-2 rounded-full", isValid ? "bg-emerald-500" : "bg-amber-500")} />
            {store.activeSchemaId.toUpperCase()} Schema
          </span>
          <span
            className={cn(
              "px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider",
              isValid ? "bg-emerald-100 dark:bg-emerald-500/25 text-emerald-700 dark:text-emerald-400" : "bg-amber-100 dark:bg-amber-500/25 text-amber-700 dark:text-amber-400"
            )}
          >
            {isValid ? 'Valid' : 'Invalid'}
          </span>
        </div>

        {/* Toolbar Header Buttons */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/docs"
            className="hidden sm:inline-flex px-3 h-9 items-center justify-center text-xs font-bold text-zinc-550 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-xl transition-all uppercase tracking-wider font-sans"
            id="builder-header-docs-link"
          >
            Docs
          </Link>
          <button
            onClick={() => setActiveRightTab('history')}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 hover:text-slate-800 dark:hover:text-white transition-all hover:scale-105 active:scale-95"
            title="Query History (H)"
          >
            <Clock size={16} />
          </button>
          <ThemeToggle />

          <button
            onClick={() => setShowShortcuts(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 hover:text-slate-800 dark:hover:text-white transition-all hover:scale-105 active:scale-95"
            title="Keyboard Shortcuts"
          >
            <Keyboard size={16} />
          </button>

          <button
            onClick={handleExecute}
            className="px-4 h-9 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Play size={14} fill="currentColor" />
            Execute
          </button>
        </div>
      </header>

      {/* ─── 3-Column Workspace Layout ─── */}
      <div className="relative z-10 flex-1 flex flex-col lg:grid lg:grid-cols-[260px_1fr_360px] overflow-y-auto lg:overflow-hidden h-[calc(100vh-64px)]">
        
        {/* COLUMN 1: Schema Fields + Presets (Sidebar Left) */}
        <aside className="hidden lg:flex flex-col bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 overflow-y-auto p-4 custom-scrollbar">
          
          {/* Schema fields Section */}
          <div className="mb-6">
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3 px-1">
              Schema Fields
            </div>
            <div className="flex flex-col gap-1.5">
              {schemaFieldsList.map((field) => (
                <div
                  key={field.name}
                  className="flex items-center gap-2.5 p-2 rounded-xl border border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/40 hover:border-zinc-150 dark:hover:border-zinc-800/80 transition-all cursor-default"
                >
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
          <div className="mt-8 border-t border-zinc-200 dark:border-zinc-800/50 pt-6">
            <ErrorBoundary>
              <ExportImport />
            </ErrorBoundary>
          </div>
        </aside>

        {/* COLUMN 2: Main Query Editor (Center) */}
        <section className="flex flex-col overflow-y-auto p-4 md:p-6 bg-[var(--surface-muted)] border-r border-zinc-200 dark:border-zinc-800/50 custom-scrollbar relative">
          
          {/* Builder Toolbar Controls */}
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-3">
              <SchemaSelector
                activeSchemaId={store.activeSchemaId}
                onSelect={(src) => store.setActiveSchemaId(src.id)}
              />
            </div>

            <div className="flex items-center flex-wrap gap-2">
              <button
                onClick={() => store.addRule(store.rootGroupId)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all hover:scale-105 active:scale-95"
              >
                <Plus size={14} /> Rule
              </button>
              <button
                onClick={() => store.addGroup(store.rootGroupId)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all hover:scale-105 active:scale-95"
              >
                <Layers size={14} /> Group
              </button>
              <button
                onClick={() => setShowClearAllConfirm(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 bg-white dark:bg-zinc-800 border border-red-200 dark:border-red-500/20 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-all hover:scale-105 active:scale-95"
              >
                <Trash2 size={14} /> Clear All
              </button>
            </div>
          </div>

          {/* The visual builder tree */}
          <div className="flex-1">
            <ErrorBoundary>
              <QueryBuilder />
            </ErrorBoundary>
          </div>
          {/* Validation banner */}
          <div className="mb-4 mt-4">
            <ErrorBoundary>
              <ValidationSummary errors={validationErrors} rulesCount={Object.keys(store.rules).length} />
            </ErrorBoundary>
          </div>
        </section>

        {/* COLUMN 3: Live Preview / Results / History (Sidebar Right) */}
        <aside className="bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden min-w-0">
          
          {/* Tab buttons */}
          <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
            {(['preview', 'results', 'history'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveRightTab(tab)}
                className={cn(
                  "flex-1 py-3 text-center text-xs font-semibold uppercase tracking-wider transition-all border-b-2",
                  activeRightTab === tab
                    ? "color-accent border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-zinc-900"
                    : "text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200 border-transparent"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab contents */}
          <div className="flex-1 overflow-hidden">
            {activeRightTab === 'preview' && (
              <div className="h-full flex flex-col">
                <div className="flex-1 min-h-[400px]">
                  <ErrorBoundary>
                    <PreviewPane />
                  </ErrorBoundary>
                </div>
                <div className="flex gap-2.5 mt-3 mb-3">
                  <button
                    onClick={() => {/* Use active tab or export module */}}
                    className="flex-1 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-xl transition-all"
                  >
                    Share JSON
                  </button>
                  <button
                    onClick={() => {/* Use active tab or preset module */}}
                    className="flex-1 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-xl transition-all"
                  >
                    Save Preset
                  </button>
                </div>
              </div>
            )}

            {/* Tab: Results Execution cards list */}
            {activeRightTab === 'results' && (
              <div className="flex flex-col h-full gap-4">
                {!isValid ? (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-red-750">
                      <AlertTriangle size={16} />
                      <span>Query Execution Blocked</span>
                    </div>
                    <p className="text-xs text-red-600 leading-relaxed">
                      The active query tree contains validation errors. Please correct the highlighted conditions in the query builder before running the execution.
                    </p>
                    <div className="flex flex-col gap-1.5 border-t border-red-150 pt-3">
                      {validationErrors.map((err, idx) => (
                        <div key={idx} className="text-[10.5px] text-red-600 font-medium">
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

            {/* Tab: History query log */}
            {activeRightTab === 'history' && (
              <div className="flex flex-col h-full">
                <ErrorBoundary>
                  <HistoryPanel />
                </ErrorBoundary>
              </div>
            )}

          </div>
        </aside>
      </div>

      {/* ─── MODAL: Shortcuts help ─── */}
      <AnimatePresence>
        {showShortcuts && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setShowShortcuts(false)}
          >
            <div
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Keyboard size={18} />
                Keyboard Shortcuts
              </h3>
              <div className="flex flex-col gap-2.5 text-xs text-slate-600 dark:text-zinc-400">
                {shortcuts.map((s) => (
                  <div key={s.description} className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                    <span>{s.description}</span>
                    <kbd className="px-2 py-0.5 font-mono bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded">
                      {s.key}
                    </kbd>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowShortcuts(false)}
                className="w-full mt-6 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-100"
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
