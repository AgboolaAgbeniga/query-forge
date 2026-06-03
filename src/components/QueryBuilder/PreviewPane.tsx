'use client';

import React, { useEffect, useState } from 'react';
import { useQueryStore } from '@/lib/store';
import { generateSQL, generateMongo } from '@/lib/engine';
import { mockSchema } from '@/lib/schema';
import { Code2, Database } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PreviewPane() {
  const store = useQueryStore();
  const [activeTab, setActiveTab] = useState<'sql' | 'mongo'>('sql');
  const [sqlQuery, setSqlQuery] = useState('');
  const [mongoQuery, setMongoQuery] = useState('');

  // Subscribe to changes efficiently by generating queries in an effect
  useEffect(() => {
    try {
      setSqlQuery(generateSQL(store, mockSchema));
      setMongoQuery(generateMongo(store, mockSchema));
    } catch (e) {
      console.error(e);
    }
  }, [store.rules, store.groups, store.rootGroupId]);

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden text-slate-300">
      <div className="flex items-center gap-1 border-b border-zinc-800 p-2 bg-slate-950">
        <button
          onClick={() => setActiveTab('sql')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
            activeTab === 'sql' ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          )}
        >
          <Database size={16} />
          SQL
        </button>
        <button
          onClick={() => setActiveTab('mongo')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
            activeTab === 'mongo' ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          )}
        >
          <Code2 size={16} />
          MongoDB
        </button>
      </div>

      <div className="flex-1 p-4 overflow-auto font-mono text-sm leading-relaxed whitespace-pre-wrap">
        {activeTab === 'sql' ? (
          <span className="text-blue-300">{sqlQuery}</span>
        ) : (
          <span className="text-emerald-300">{mongoQuery}</span>
        )}
      </div>
    </div>
  );
}
