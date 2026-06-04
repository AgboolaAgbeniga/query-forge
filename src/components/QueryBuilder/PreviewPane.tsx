'use client';

import React, { useState, useMemo } from 'react';
import { useQueryStore } from '@/lib/store';
import { generateSQL, generateMongo, generateGraphQL } from '@/lib/engine';
import { getSchemaById } from '@/lib/schema';
import { Code2, Database, Braces, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PreviewPane() {
  const rules = useQueryStore(s => s.rules);
  const groups = useQueryStore(s => s.groups);
  const rootGroupId = useQueryStore(s => s.rootGroupId);
  const activeSchemaId = useQueryStore(s => s.activeSchemaId);

  const [activeTab, setActiveTab] = useState<'sql' | 'mongo' | 'graphql'>('sql');
  const [copied, setCopied] = useState(false);

  const activeQuery = useMemo(() => {
    try {
      const schema = getSchemaById(activeSchemaId);
      const queryState = { rules, groups, rootGroupId };
      if (activeTab === 'sql') return generateSQL(queryState, schema);
      if (activeTab === 'mongo') return generateMongo(queryState, schema);
      return generateGraphQL(queryState, schema, activeSchemaId);
    } catch (e) {
      return 'Error generating query';
    }
  }, [rules, groups, rootGroupId, activeSchemaId, activeTab]);

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
    <div className="flex flex-col h-full bg-slate-900 dark:bg-[#0a0a0a] rounded-2xl border border-zinc-800 dark:border-white/10 shadow-2xl overflow-hidden text-slate-300">
      {/* Tab bar */}
      <div className="flex items-center justify-between gap-2 border-b border-zinc-800 dark:border-white/10 p-2 bg-slate-950 dark:bg-black/50 flex-wrap">
        <div className="flex items-center gap-1 min-w-0 flex-shrink">
          <button
            onClick={() => setActiveTab('sql')}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
              activeTab === 'sql'
                ? "bg-slate-800 dark:bg-white/10 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 dark:hover:bg-white/10"
            )}
          >
            <Database size={14} />
            SQL
          </button>
          <button
            onClick={() => setActiveTab('mongo')}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
              activeTab === 'mongo'
                ? "bg-slate-800 dark:bg-white/10 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 dark:hover:bg-white/10"
            )}
          >
            <Code2 size={14} />
            MongoDB
          </button>
          <button
            onClick={() => setActiveTab('graphql')}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
              activeTab === 'graphql'
                ? "bg-slate-800 dark:bg-white/10 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 dark:hover:bg-white/10"
            )}
          >
            <Braces size={14} />
            GraphQL
          </button>
        </div>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="flex items-center justify-center p-1.5 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 flex-shrink-0"
          title="Copy query"
        >
          {copied ? (
            <Check size={16} className="text-emerald-400" />
          ) : (
            <Copy size={16} />
          )}
        </button>
      </div>

      {/* Query output */}
      <div className="flex-1 p-4 overflow-auto font-mono text-sm leading-relaxed whitespace-pre-wrap custom-scrollbar">
        {activeTab === 'sql' ? (
          <span className="text-indigo-300">{activeQuery}</span>
        ) : activeTab === 'mongo' ? (
          <span className="text-emerald-300">{activeQuery}</span>
        ) : (
          <span className="text-amber-300">{activeQuery}</span>
        )}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-zinc-800 dark:border-white/10 bg-slate-950/50 dark:bg-black/30">
        <span className="text-[11px] text-zinc-500 font-mono">
          {activeTab === 'sql' ? 'SQL' : activeTab === 'mongo' ? 'MongoDB' : 'GraphQL'} • {activeQuery.length} chars
        </span>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] text-zinc-500">Live</span>
        </div>
      </div>
    </div>
  );
}
