'use client';

import React, { useEffect, useState } from 'react';
import { useQueryStore } from '@/lib/store';
import { generateSQL, generateMongo } from '@/lib/engine';
import { getSchemaById } from '@/lib/schema';
import { Code2, Database, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PreviewPane() {
  const store = useQueryStore();
  const [activeTab, setActiveTab] = useState<'sql' | 'mongo'>('sql');
  const [sqlQuery, setSqlQuery] = useState('');
  const [mongoQuery, setMongoQuery] = useState('');
  const [copied, setCopied] = useState(false);

  // Subscribe to changes efficiently by generating queries in an effect
  useEffect(() => {
    try {
      const schema = getSchemaById(store.activeSchemaId);
      setSqlQuery(generateSQL(store, schema));
      setMongoQuery(generateMongo(store, schema));
    } catch (e) {
      console.error(e);
    }
  }, [store.rules, store.groups, store.rootGroupId, store.activeSchemaId]);

  const activeQuery = activeTab === 'sql' ? sqlQuery : mongoQuery;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeQuery);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for environments without clipboard API
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 dark:bg-zinc-950 rounded-2xl border border-zinc-800 dark:border-zinc-800 shadow-2xl overflow-hidden text-slate-300">
      {/* Tab bar */}
      <div className="flex items-center justify-between border-b border-zinc-800 dark:border-zinc-800 p-2 bg-slate-950 dark:bg-black/50">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('sql')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              activeTab === 'sql'
                ? "bg-slate-800 dark:bg-zinc-800 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 dark:hover:bg-zinc-800/50"
            )}
          >
            <Database size={16} />
            SQL
          </button>
          <button
            onClick={() => setActiveTab('mongo')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              activeTab === 'mongo'
                ? "bg-slate-800 dark:bg-zinc-800 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 dark:hover:bg-zinc-800/50"
            )}
          >
            <Code2 size={16} />
            MongoDB
          </button>
        </div>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
          title="Copy query"
        >
          {copied ? (
            <>
              <Check size={14} className="text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              Copy
            </>
          )}
        </button>
      </div>

      {/* Query output */}
      <div className="flex-1 p-4 overflow-auto font-mono text-sm leading-relaxed whitespace-pre-wrap custom-scrollbar">
        {activeTab === 'sql' ? (
          <span className="text-blue-300">{sqlQuery}</span>
        ) : (
          <span className="text-emerald-300">{mongoQuery}</span>
        )}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-zinc-800 dark:border-zinc-800 bg-slate-950/50 dark:bg-black/30">
        <span className="text-[11px] text-zinc-500 font-mono">
          {activeTab === 'sql' ? 'SQL' : 'MongoDB'} • {activeQuery.length} chars
        </span>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] text-zinc-500">Live</span>
        </div>
      </div>
    </div>
  );
}
