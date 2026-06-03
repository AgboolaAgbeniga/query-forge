'use client';

import React, { useEffect, useCallback, useState, useMemo } from 'react';
import Link from 'next/link';
import { QueryBuilder } from '@/components/QueryBuilder/QueryBuilder';
import { PreviewPane } from '@/components/QueryBuilder/PreviewPane';
import { SchemaSelector } from '@/components/QueryBuilder/SchemaSelector';
import { ValidationSummary } from '@/components/QueryBuilder/ValidationSummary';
import { SVGLogo } from '@/components/ui/SVGLogo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useQueryStore } from '@/lib/store';
import { DATA_SOURCES, getSchemaById } from '@/lib/schema';
import { addToHistory, getHistory, clearHistory, removeFromHistory, HistoryEntry } from '@/lib/history';
import { getPresets, createPreset, deletePreset, QueryPreset } from '@/lib/presets';
import { executeQuery } from '@/lib/executor';
import { MOCK_DATASETS } from '@/lib/mock-data';
import { useKeyboardShortcuts, formatShortcut, ShortcutConfig } from '@/lib/keyboard';
import { validateQueryTree } from '@/lib/engine';
import {
  Search,
  Keyboard,
  Database,
  Shield,
  ArrowLeft,
  Clock,
  Upload,
  Download,
  Play,
  Plus,
  Layers,
  Trash2,
  Bookmark,
  Copy,
  Check,
  X,
  FileCode,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

export default function BuilderPage() {
  const [activeRightTab, setActiveRightTab] = useState<'preview' | 'results' | 'history'>('preview');
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showPresetSaveModal, setShowPresetSaveModal] = useState(false);

  const [importJson, setImportJson] = useState('');
  const [presetName, setPresetName] = useState('');
  const [presetDesc, setPresetDesc] = useState('');

  const [presets, setPresets] = useState<QueryPreset[]>([]);
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);
  const [executionResults, setExecutionResults] = useState<any[]>([]);
  const [executionTime, setExecutionTime] = useState<number>(0);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [hasExecuted, setHasExecuted] = useState(false);
  const [copied, setCopied] = useState(false);

  const store = useQueryStore();
  const activeSchema = getSchemaById(store.activeSchemaId);
  const schemaFieldsList = Object.values(activeSchema);
  const activeDataset = MOCK_DATASETS[store.activeSchemaId] || [];

  // Update lists
  useEffect(() => {
    setPresets(getPresets());
    setHistoryEntries(getHistory());
  }, [store.activeSchemaId]);

  const refreshPresets = () => setPresets(getPresets());
  const refreshHistory = () => setHistoryEntries(getHistory());

  // Validation Check
  const validationErrors = useMemo(() => {
    return validateQueryTree(store, activeSchema);
  }, [store.rules, store.groups, store.rootGroupId, activeSchema]);

  const isValid = validationErrors.length === 0;

  // Keyboard shortcuts
  const shortcuts: ShortcutConfig[] = [
    {
      key: 'e',
      ctrl: true,
      description: 'Execute query',
      action: () => handleExecute(),
    },
    {
      key: 's',
      ctrl: true,
      description: 'Save preset',
      action: () => setShowPresetSaveModal(true),
    },
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
      key: 'Delete',
      ctrl: true,
      description: 'Clear builder',
      action: () => store.resetQuery(),
    },
    {
      key: '?',
      shift: true,
      description: 'Show shortcuts modal',
      action: () => setShowShortcuts((s) => !s),
    },
  ];
  useKeyboardShortcuts(shortcuts);

  const handleExecute = () => {
    if (!isValid) {
      setActiveRightTab('preview');
      return;
    }

    setIsLoadingResults(true);
    setHasExecuted(true);
    setActiveRightTab('results');

    setTimeout(() => {
      const { results, executionTimeMs } = executeQuery(
        { groups: store.groups, rules: store.rules, rootGroupId: store.rootGroupId },
        activeSchema,
        activeDataset
      );
      setExecutionResults(results);
      setExecutionTime(executionTimeMs);
      setIsLoadingResults(false);

      // Add to log history
      addToHistory(
        { groups: store.groups, rules: store.rules, rootGroupId: store.rootGroupId },
        `Query on ${store.activeSchemaId.toUpperCase()} (${Object.keys(store.rules).length} rules)`
      );
      refreshHistory();
    }, 800);
  };

  const handleLoadPreset = (preset: QueryPreset) => {
    store.setStoreState(preset.state);
  };

  const handleDeletePreset = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deletePreset(id);
    refreshPresets();
  };

  const handleSavePreset = () => {
    if (!presetName.trim()) return;
    createPreset(
      presetName.trim(),
      presetDesc.trim(),
      { groups: store.groups, rules: store.rules, rootGroupId: store.rootGroupId }
    );
    setPresetName('');
    setPresetDesc('');
    setShowPresetSaveModal(false);
    refreshPresets();
  };

  const handleImport = () => {
    try {
      const parsed = JSON.parse(importJson);
      if (!parsed.query) throw new Error('Missing query property');
      store.setActiveSchemaId(parsed.schema || 'users');
      store.setStoreState(parsed.query);
      setImportJson('');
      setShowImportModal(false);
    } catch (e: any) {
      alert(`Invalid JSON format: ${e.message}`);
    }
  };

  const getExportData = () => {
    return JSON.stringify(
      {
        schema: store.activeSchemaId,
        query: { groups: store.groups, rules: store.rules, rootGroupId: store.rootGroupId },
      },
      null,
      2
    );
  };

  const handleCopyExport = () => {
    navigator.clipboard.writeText(getExportData());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRestoreHistory = (entry: HistoryEntry) => {
    store.setStoreState(entry.state);
  };

  const handleRemoveHistory = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    removeFromHistory(id);
    refreshHistory();
  };

  const handleClearHistory = () => {
    clearHistory();
    refreshHistory();
  };

  // Preset templates depending on the schema
  const examplePresets = useMemo(() => {
    if (store.activeSchemaId === 'users') {
      return [
        {
          name: 'Active Verified Users',
          state: {
            rootGroupId: 'root',
            groups: { root: { id: 'root', type: 'AND', children: ['r1', 'r2'], parentId: null } },
            rules: {
              r1: { id: 'r1', field: 'status', operator: 'equals', value: 'active' },
              r2: { id: 'r2', field: 'isVerified', operator: 'equals', value: true }
            }
          }
        },
        {
          name: 'Nigerian Young Adults',
          state: {
            rootGroupId: 'root',
            groups: { root: { id: 'root', type: 'AND', children: ['r1', 'r2'], parentId: null } },
            rules: {
              r1: { id: 'r1', field: 'age', operator: 'between', value: '18', value2: '30' },
              r2: { id: 'r2', field: 'country', operator: 'equals', value: 'Nigeria' }
            }
          }
        }
      ];
    } else if (store.activeSchemaId === 'products') {
      return [
        {
          name: 'Affordable Electronics',
          state: {
            rootGroupId: 'root',
            groups: { root: { id: 'root', type: 'AND', children: ['r1', 'r2'], parentId: null } },
            rules: {
              r1: { id: 'r1', field: 'category', operator: 'equals', value: 'electronics' },
              r2: { id: 'r2', field: 'price', operator: 'lessThan', value: '100' }
            }
          }
        }
      ];
    } else {
      return [
        {
          name: 'Paid Shipped Orders',
          state: {
            rootGroupId: 'root',
            groups: { root: { id: 'root', type: 'AND', children: ['r1', 'r2'], parentId: null } },
            rules: {
              r1: { id: 'r1', field: 'orderStatus', operator: 'equals', value: 'shipped' },
              r2: { id: 'r2', field: 'isPaid', operator: 'equals', value: true }
            }
          }
        }
      ];
    }
  }, [store.activeSchemaId]);

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

      {/* ─── Header ─── */}
      <header className="relative z-50 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-6 h-16 flex items-center justify-between shadow-sm">
        <Link href="/" className="flex items-center gap-2 group focus:outline-none">
          <div className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <ArrowLeft size={18} className="text-zinc-500 dark:text-zinc-400 group-hover:text-slate-900 dark:group-hover:text-white" />
          </div>
          <SVGLogo size={24} />
          <span className="font-heading font-semibold text-lg text-slate-800 dark:text-white tracking-wide">
            QueryForge
          </span>
          <span className="badge-sm badge-blue text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ml-1">
            Builder
          </span>
        </Link>

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
          <button
            onClick={() => {
              refreshHistory();
              setActiveRightTab('history');
            }}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 hover:text-slate-800 dark:hover:text-white transition-all hover:scale-105 active:scale-95"
            title="Query History (H)"
          >
            <Clock size={16} />
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 hover:text-slate-800 dark:hover:text-white transition-all hover:scale-105 active:scale-95"
            title="Import JSON"
          >
            <Upload size={16} />
          </button>
          <button
            onClick={() => setShowExportModal(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 hover:text-slate-800 dark:hover:text-white transition-all hover:scale-105 active:scale-95"
            title="Export JSON"
          >
            <Download size={16} />
          </button>
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
          <ThemeToggle />
        </div>
      </header>

      {/* ─── 3-Column Workspace Layout ─── */}
      <div className="relative z-10 flex-1 grid lg:grid-cols-[260px_1fr_360px] overflow-hidden h-[calc(100vh-64px)]">
        
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

          {/* Saved Presets Section */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3 px-1 flex items-center justify-between">
              <span>Saved Presets</span>
              <button
                onClick={() => setShowPresetSaveModal(true)}
                className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-semibold"
              >
                + Save Current
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              {presets.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleLoadPreset(p)}
                  className="group flex items-center justify-between gap-2 p-2.5 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer"
                >
                  <span className="text-xs text-slate-600 dark:text-zinc-300 font-medium truncate flex items-center gap-1.5">
                    <Bookmark size={12} className="text-zinc-400" />
                    {p.name}
                  </span>
                  <button
                    onClick={(e) => handleDeletePreset(e, p.id)}
                    className="p-1 rounded text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}

              {/* Loader Examples */}
              {examplePresets.map((ep, idx) => (
                <div
                  key={idx}
                  onClick={() => handleLoadPreset(ep as any)}
                  className="flex items-center gap-1.5 p-2.5 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 hover:text-blue-500 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-500/30 transition-all cursor-pointer text-xs font-medium"
                >
                  <Bookmark size={12} />
                  Example: {ep.name}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* COLUMN 2: Main Query Editor (Center) */}
        <section className="flex flex-col overflow-y-auto p-6 bg-[var(--surface-muted)] border-r border-zinc-200 dark:border-zinc-800/50 custom-scrollbar relative">
          
          {/* Builder Toolbar Controls */}
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-3">
              <SchemaSelector
                activeSchemaId={store.activeSchemaId}
                onSelect={(src) => store.setActiveSchemaId(src.id)}
              />
            </div>

            <div className="flex items-center gap-2">
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
                onClick={() => store.resetQuery()}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 bg-white dark:bg-zinc-800 border border-red-200 dark:border-red-500/20 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-all hover:scale-105 active:scale-95"
              >
                <Trash2 size={14} /> Clear All
              </button>
            </div>
          </div>

          {/* Validation banner */}
          <AnimatePresence>
            {!isValid && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-4 overflow-hidden"
              >
                <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-center gap-2 font-medium">
                  <AlertTriangle size={14} />
                  <span>Validation errors detected. Please correct before running the execution.</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* The visual builder tree */}
          <div className="flex-1">
            <QueryBuilder />
          </div>

          <div className="mt-8">
            <ValidationSummary schema={activeSchema} />
          </div>
        </section>

        {/* COLUMN 3: Live Preview / Results / History (Sidebar Right) */}
        <aside className="bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden">
          
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
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            
            {/* Tab: Preview Code compilations */}
            {activeRightTab === 'preview' && (
              <div className="h-full flex flex-col">
                <div className="flex-1 min-h-[400px]">
                  <PreviewPane />
                </div>
                <div className="flex gap-2.5 mt-3">
                  <button
                    onClick={() => setShowExportModal(true)}
                    className="flex-1 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-xl transition-all"
                  >
                    Share JSON
                  </button>
                  <button
                    onClick={() => setShowPresetSaveModal(true)}
                    className="flex-1 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-xl transition-all"
                  >
                    Save Preset
                  </button>
                </div>
              </div>
            )}

            {/* Tab: Results Execution cards list */}
            {activeRightTab === 'results' && (
              <div className="flex flex-col h-full">
                <button
                  onClick={handleExecute}
                  disabled={isLoadingResults}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/10 hover:translate-y-[-1px] transition-all disabled:opacity-60"
                >
                  <Play size={14} fill="currentColor" />
                  {isLoadingResults ? 'Executing...' : 'Execute Query'}
                </button>

                {isLoadingResults && (
                  <div className="w-full h-1 bg-blue-100 dark:bg-blue-950/40 rounded-full overflow-hidden mt-4">
                    <div className="h-full bg-blue-600 dark:bg-blue-500 rounded-full w-2/3 animate-pulse" />
                  </div>
                )}

                {hasExecuted && !isLoadingResults && (
                  <>
                    <div className="flex justify-between items-center mt-4 mb-3">
                      <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                        {executionResults.length} results
                      </span>
                      <span className="text-[10px] text-zinc-400 font-medium">
                        of {activeDataset.length} records • {executionTime}ms
                      </span>
                    </div>

                    <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto custom-scrollbar">
                      {executionResults.length === 0 ? (
                        <div className="text-center py-10 text-zinc-400">
                          <Database size={24} className="mx-auto mb-2 opacity-40" />
                          <p className="text-xs">No records matched your conditions</p>
                        </div>
                      ) : (
                        executionResults.slice(0, 20).map((record, index) => {
                          const recordKeys = Object.keys(record).slice(0, 5);
                          return (
                            <div
                              key={record.id || index}
                              className="p-3 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800/80 rounded-xl hover:border-zinc-300 dark:hover:border-zinc-700 transition-all text-[11px]"
                            >
                              {recordKeys.map((key) => (
                                <div key={key} className="flex justify-between py-0.5">
                                  <span className="text-zinc-400 capitalize">{key}</span>
                                  <span className="text-slate-700 dark:text-zinc-300 font-medium truncate max-w-[160px]">
                                    {String(record[key])}
                                  </span>
                                </div>
                              ))}
                            </div>
                          );
                        })
                      )}
                      {executionResults.length > 20 && (
                        <div className="text-center py-2 text-[10px] text-zinc-400 font-mono">
                          ... and {executionResults.length - 20} more records
                        </div>
                      )}
                    </div>
                  </>
                )}

                {!hasExecuted && !isLoadingResults && (
                  <div className="text-center py-16 text-zinc-400 flex flex-col items-center justify-center gap-2">
                    <Search size={32} className="opacity-40" />
                    <p className="text-xs">Click Execute Query above to filter data</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab: History query log */}
            {activeRightTab === 'history' && (
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-3.5">
                  <span className="text-xs font-bold text-slate-500">Execution History</span>
                  {historyEntries.length > 0 && (
                    <button
                      onClick={handleClearHistory}
                      className="text-[11px] text-red-500 hover:underline font-semibold"
                    >
                      Clear Log
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  {historyEntries.length === 0 ? (
                    <div className="text-center py-16 text-zinc-400">
                      <Clock size={32} className="mx-auto mb-2 opacity-40" />
                      <p className="text-xs">No queries executed in this session</p>
                    </div>
                  ) : (
                    historyEntries.map((h) => (
                      <div
                        key={h.id}
                        onClick={() => handleRestoreHistory(h)}
                        className="group flex items-start justify-between gap-3 p-2.5 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/20 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer text-xs"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-zinc-400 font-medium">
                            {new Date(h.timestamp).toLocaleTimeString()}
                          </p>
                          <p className="font-mono text-[10px] text-slate-700 dark:text-zinc-300 truncate mt-0.5">
                            {h.label}
                          </p>
                        </div>
                        <button
                          onClick={(e) => handleRemoveHistory(e, h.id)}
                          className="p-1 rounded text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
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
                      {formatShortcut(s)}
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

      {/* ─── MODAL: JSON Import ─── */}
      <AnimatePresence>
        {showImportModal && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setShowImportModal(false)}
          >
            <div
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white mb-2">
                Import Query Config
              </h3>
              <p className="text-xs text-zinc-400 mb-4">
                Paste previously exported Query JSON. The active schema and builder layout will update instantly.
              </p>
              <textarea
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                placeholder='{"schema": "users", "query": {...}}'
                className="w-full h-40 p-3 font-mono text-xs border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl outline-none focus:border-blue-500"
              />
              <div className="flex gap-2.5 mt-5">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  className="flex-1 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
                >
                  Import Query
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── MODAL: JSON Export ─── */}
      <AnimatePresence>
        {showExportModal && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setShowExportModal(false)}
          >
            <div
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white mb-2">
                Export Query Config
              </h3>
              <p className="text-xs text-zinc-400 mb-4">
                Copy this JSON representation. You can store it in files or import it later.
              </p>
              <textarea
                value={getExportData()}
                readOnly
                className="w-full h-40 p-3 font-mono text-xs border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl outline-none"
              />
              <div className="flex gap-2.5 mt-5">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-100"
                >
                  Close
                </button>
                <button
                  onClick={handleCopyExport}
                  className="flex-1 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center justify-center gap-1.5"
                >
                  {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied' : 'Copy JSON'}
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── MODAL: Save Preset ─── */}
      <AnimatePresence>
        {showPresetSaveModal && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setShowPresetSaveModal(false)}
          >
            <div
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white mb-2">
                Save Query Preset
              </h3>
              <p className="text-xs text-zinc-400 mb-4">
                Name this preset to quickly reload it in the left sidebar list.
              </p>
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  placeholder="e.g. Premium Nigerian Users"
                  className="w-full px-3.5 py-2 text-xs border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl outline-none focus:border-blue-500"
                />
                <input
                  type="text"
                  value={presetDesc}
                  onChange={(e) => setPresetDesc(e.target.value)}
                  placeholder="Description (optional)..."
                  className="w-full px-3.5 py-2 text-xs border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex gap-2.5 mt-5">
                <button
                  onClick={() => setShowPresetSaveModal(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePreset}
                  disabled={!presetName.trim()}
                  className="flex-1 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-60"
                >
                  Save Preset
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

    </main>
  );
}
