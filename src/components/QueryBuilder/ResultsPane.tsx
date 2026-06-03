'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useQueryStore } from '@/lib/store';
import { executeQuery } from '@/lib/executor';
import { MOCK_DATA, MockRecord } from '@/lib/mock-data';
import { mockSchema } from '@/lib/schema';
import {
  Play,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Database,
  Clock,
  Hash,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const PAGE_SIZES = [10, 25, 50, 100];

type SortConfig = {
  field: keyof MockRecord;
  direction: 'asc' | 'desc';
} | null;

export function ResultsPane() {
  const store = useQueryStore();
  const [results, setResults] = useState<MockRecord[]>([]);
  const [executionTime, setExecutionTime] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasExecuted, setHasExecuted] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  // Reset page on new execution
  useEffect(() => {
    setPage(1);
  }, [results]);

  const handleExecute = useCallback(() => {
    setIsLoading(true);
    setHasExecuted(true);

    // Simulate a brief loading state for UX
    setTimeout(() => {
      const { results: queryResults, executionTimeMs } = executeQuery(
        { groups: store.groups, rules: store.rules, rootGroupId: store.rootGroupId },
        mockSchema,
        MOCK_DATA
      );
      setResults(queryResults);
      setExecutionTime(executionTimeMs);
      setIsLoading(false);
    }, 300);
  }, [store.groups, store.rules, store.rootGroupId]);

  // Sort results
  const sortedResults = useMemo(() => {
    if (!sortConfig) return results;
    const { field, direction } = sortConfig;

    return [...results].sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      let comparison: number;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      } else if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
        comparison = (aVal ? 1 : 0) - (bVal ? 1 : 0);
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }

      return direction === 'asc' ? comparison : -comparison;
    });
  }, [results, sortConfig]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedResults.length / pageSize));
  const paginatedResults = useMemo(
    () => sortedResults.slice((page - 1) * pageSize, page * pageSize),
    [sortedResults, page, pageSize]
  );

  const handleSort = useCallback(
    (field: keyof MockRecord) => {
      setSortConfig((prev) => {
        if (prev?.field === field) {
          if (prev.direction === 'asc') return { field, direction: 'desc' };
          return null; // Third click removes sort
        }
        return { field, direction: 'asc' };
      });
    },
    []
  );

  const columns: { key: keyof MockRecord; label: string; width?: string }[] = [
    { key: 'id', label: 'ID', width: 'w-[100px]' },
    { key: 'name', label: 'Name', width: 'min-w-[160px]' },
    { key: 'age', label: 'Age', width: 'w-[70px]' },
    { key: 'status', label: 'Status', width: 'w-[100px]' },
    { key: 'country', label: 'Country', width: 'min-w-[120px]' },
    { key: 'createdAt', label: 'Created At', width: 'w-[120px]' },
    { key: 'isVerified', label: 'Verified', width: 'w-[90px]' },
  ];

  const SortIcon = ({ field }: { field: keyof MockRecord }) => {
    if (sortConfig?.field !== field) return <ArrowUpDown size={12} className="text-zinc-400" />;
    if (sortConfig.direction === 'asc') return <ArrowUp size={12} className="text-blue-500" />;
    return <ArrowDown size={12} className="text-blue-500" />;
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Execute bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <button
          onClick={handleExecute}
          disabled={isLoading}
          className={cn(
            "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200",
            "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600",
            "text-white shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/25",
            "hover:scale-[1.02] active:scale-[0.98]",
            isLoading && "opacity-75 cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Play size={18} />
          )}
          {isLoading ? 'Executing...' : 'Execute Query'}
        </button>

        {hasExecuted && !isLoading && (
          <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-zinc-400">
            <span className="inline-flex items-center gap-1.5">
              <Hash size={14} />
              <strong className="text-slate-700 dark:text-zinc-200">{results.length}</strong> results
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock size={14} />
              <strong className="text-slate-700 dark:text-zinc-200">{executionTime}</strong>ms
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Database size={14} />
              <strong className="text-slate-700 dark:text-zinc-200">{MOCK_DATA.length}</strong> total
            </span>
          </div>
        )}
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="surface-base rounded-xl overflow-hidden">
          <div className="animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex gap-4 px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 last:border-0"
              >
                {columns.map((col) => (
                  <div
                    key={col.key}
                    className={cn('h-4 bg-zinc-200 dark:bg-zinc-700 rounded', col.width ?? 'flex-1')}
                    style={{ width: col.width ? undefined : `${60 + Math.random() * 40}%` }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && hasExecuted && results.length === 0 && (
        <div className="surface-base rounded-xl p-12 flex flex-col items-center justify-center gap-3 text-center">
          <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-2xl">
            <Database size={32} className="text-zinc-400 dark:text-zinc-500" />
          </div>
          <h3 className="heading text-[18px] text-slate-700 dark:text-zinc-300">
            No matching records
          </h3>
          <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-xs">
            Your query didn&apos;t match any records in the dataset. Try adjusting your conditions.
          </p>
        </div>
      )}

      {/* Initial state */}
      {!hasExecuted && !isLoading && (
        <div className="surface-base rounded-xl p-12 flex flex-col items-center justify-center gap-3 text-center">
          <div className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-2xl">
            <Play size={32} className="text-blue-500 dark:text-blue-400" />
          </div>
          <h3 className="heading text-[18px] text-slate-700 dark:text-zinc-300">
            Ready to execute
          </h3>
          <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-xs">
            Build your query above, then click &quot;Execute Query&quot; to filter the dataset and see results.
          </p>
        </div>
      )}

      {/* Results table */}
      {!isLoading && hasExecuted && results.length > 0 && (
        <>
          <div className="surface-base rounded-xl overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50">
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        className={cn(
                          'text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 cursor-pointer select-none hover:text-slate-700 dark:hover:text-zinc-200 transition-colors',
                          col.width
                        )}
                        onClick={() => handleSort(col.key)}
                      >
                        <span className="inline-flex items-center gap-1.5">
                          {col.label}
                          <SortIcon field={col.key} />
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedResults.map((record, idx) => (
                    <tr
                      key={record.id}
                      className={cn(
                        'border-b border-zinc-100 dark:border-zinc-800 last:border-0 transition-colors',
                        'hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30',
                        idx % 2 === 0 ? 'bg-white dark:bg-zinc-900' : 'bg-zinc-50/30 dark:bg-zinc-900/50'
                      )}
                    >
                      <td className="px-4 py-2.5 font-mono text-xs text-zinc-500 dark:text-zinc-400">
                        {record.id}
                      </td>
                      <td className="px-4 py-2.5 font-medium text-slate-700 dark:text-zinc-200">
                        {record.name}
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 dark:text-zinc-300">
                        {record.age}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={cn(
                            'inline-flex px-2 py-0.5 rounded-full text-xs font-medium',
                            record.status === 'active' && 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400',
                            record.status === 'inactive' && 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400',
                            record.status === 'pending' && 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400',
                            record.status === 'suspended' && 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400'
                          )}
                        >
                          {record.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 dark:text-zinc-300">
                        {record.country}
                      </td>
                      <td className="px-4 py-2.5 text-slate-500 dark:text-zinc-400 font-mono text-xs">
                        {record.createdAt}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={cn(
                            'inline-flex w-5 h-5 rounded-full items-center justify-center text-[10px] font-bold',
                            record.isVerified
                              ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                              : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-400'
                          )}
                        >
                          {record.isVerified ? '✓' : '—'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {PAGE_SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <span>per page</span>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-slate-500 dark:text-zinc-400 mr-3">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronsLeft size={16} />
              </button>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronsRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
