'use client';

import React from 'react';
import { DATA_SOURCES, DataSource } from '@/lib/schema';
import { Database } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SchemaSelectorProps {
  activeSchemaId: string;
  onSelect: (dataSource: DataSource) => void;
}

export function SchemaSelector({ activeSchemaId, onSelect }: SchemaSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="heading text-[14px] text-slate-500 dark:text-zinc-400 flex items-center gap-2 uppercase tracking-wider">
        <Database size={14} />
        Data Source
      </h3>
      <div className="flex gap-2 flex-wrap">
        {DATA_SOURCES.map((source) => (
          <button
            key={source.id}
            onClick={() => onSelect(source)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border",
              "hover:scale-[1.02] active:scale-[0.98]",
              activeSchemaId === source.id
                ? "bg-blue-600 dark:bg-blue-500 text-white border-blue-600 dark:border-blue-500 shadow-md shadow-blue-500/20"
                : "bg-white dark:bg-white/10 text-slate-600 dark:text-zinc-300 border-zinc-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-500/50 hover:text-blue-600 dark:hover:text-blue-400"
            )}
          >
            <div className="flex flex-col items-start">
              <span>{source.name}</span>
              <span className={cn(
                "text-[11px] font-normal",
                activeSchemaId === source.id
                  ? "text-blue-200 dark:text-blue-200"
                  : "text-zinc-400 dark:text-zinc-500"
              )}>
                {source.description}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
