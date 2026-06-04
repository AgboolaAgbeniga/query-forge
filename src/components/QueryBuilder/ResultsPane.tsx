'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useQueryStore } from '@/lib/store';
import { executeQuery } from '@/lib/executor';
import { MOCK_DATASETS, MOCK_USERS } from '@/lib/mock-data';
import { getSchemaById } from '@/lib/schema';
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
  field: string;
  direction: 'asc' | 'desc';
} | null;

export interface ResultsPaneProps {
  results: Record<string, unknown>[];
  executionTime: number;
  isLoading: boolean;
  hasExecuted: boolean;
}

export function ResultsPane({
  results,
  executionTime,
  isLoading,
  hasExecuted,
}: ResultsPaneProps) {
  const activeSchemaId = useQueryStore((s) => s.activeSchemaId);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  const schema = getSchemaById(activeSchemaId);
  
  // Need to get total dataset count
  const activeDatasetSize = typeof window !== 'undefined' ? 
    require('@/lib/mock-data')[`MOCK_${activeSchemaId.toUpperCase()}`]?.length || 0 
    : 0;

  // Reset page and sort when schema changes
  useEffect(() => {
    setSortConfig(null);
    setPage(1);
  }, [activeSchemaId]);

  // Reset page on new execution results
  useEffect(() => {
    setPage(1);
  }, [results]);

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
    (field: string) => {
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

  // Derive columns dynamically from schema
  const columns = useMemo(() => {
    return Object.values(schema).map((field) => {
      let width = 'min-w-[120px]';
      if (field.name === 'id' || field.name === 'sku' || field.name === 'orderId') {
        width = 'w-[120px]';
      } else if (field.name === 'age' || field.name === 'stock') {
        width = 'w-[85px]';
      } else if (field.name === 'status' || field.name === 'category' || field.name === 'orderStatus' || field.name === 'paymentMethod') {
        width = 'w-[140px]';
      } else if (field.name === 'isVerified' || field.name === 'isAvailable' || field.name === 'isPaid') {
        width = 'w-[100px]';
      } else if (field.name === 'createdAt' || field.name === 'listedAt' || field.name === 'orderDate') {
        width = 'w-[130px]';
      }
      return {
        key: field.name,
        label: field.label,
        width,
      };
    });
  }, [schema]);

  const SortIcon = ({ field }: { field: string }) => {
    if (sortConfig?.field !== field) return <ArrowUpDown size={12} className="text-zinc-400" />;
    if (sortConfig.direction === 'asc') return <ArrowUp size={12} className="text-blue-500" />;
    return <ArrowDown size={12} className="text-blue-500" />;
  };

  const renderCell = (value: unknown, type: string, key: string) => {
    if (value === null || value === undefined) return <span className="text-zinc-400">—</span>;

    if (type === 'boolean') {
      return (
        <span
          className={cn(
            'inline-flex w-5 h-5 rounded-full items-center justify-center text-[10px] font-bold',
            value
              ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
              : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-400'
          )}
        >
          {value ? '✓' : '—'}
        </span>
      );
    }

    if (type === 'enum') {
      const displayVal = String(value);
      return (
        <span
          className={cn(
            'inline-flex px-2 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider text-[10px]',
            (displayVal === 'active' || displayVal === 'delivered' || displayVal === 'shipped' || displayVal === 'electronics') &&
              'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400',
            (displayVal === 'pending' || displayVal === 'processing' || displayVal === 'placed' || displayVal === 'clothing' || displayVal === 'credit_card' || displayVal === 'paypal') &&
              'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400',
            (displayVal === 'suspended' || displayVal === 'cancelled' || displayVal === 'refunded' || displayVal === 'sports') &&
              'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400',
            (displayVal === 'inactive' || displayVal === 'books' || displayVal === 'home' || displayVal === 'food' || displayVal === 'debit_card' || displayVal === 'bank_transfer' || displayVal === 'crypto') &&
              'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400'
          )}
        >
          {displayVal.replace(/_/g, ' ')}
        </span>
      );
    }

    if (type === 'date') {
      return <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">{String(value)}</span>;
    }

    if (key === 'id' || key === 'sku' || key === 'orderId') {
      return <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400 font-semibold">{String(value)}</span>;
    }

    if (type === 'number') {
      if (key === 'price' || key === 'total') {
        return <span className="font-medium text-slate-700 dark:text-zinc-200">${Number(value).toFixed(2)}</span>;
      }
      return <span className="font-medium text-slate-700 dark:text-zinc-200">{String(value)}</span>;
    }

    // Default text representation
    return <span className="font-medium text-slate-700 dark:text-zinc-200">{String(value)}</span>;
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Database size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100">
              Query Results
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              Running against simulated {activeSchemaId} dataset
            </p>
          </div>
        </div>

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
              <strong className="text-slate-700 dark:text-zinc-200">{activeDatasetSize}</strong> total
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
                  {paginatedResults.map((record, idx) => {
                    const rowKey = (record.id || record.sku || record.orderId || idx) as string | number;
                    return (
                      <tr
                        key={rowKey}
                        className={cn(
                          'border-b border-zinc-100 dark:border-zinc-800 last:border-0 transition-colors',
                          'hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30',
                          idx % 2 === 0 ? 'bg-white dark:bg-zinc-900' : 'bg-zinc-50/30 dark:bg-zinc-900/50'
                        )}
                      >
                        {columns.map((col) => {
                          const val = record[col.key];
                          const fieldSchema = schema[col.key];
                          const fieldType = fieldSchema ? fieldSchema.type : 'string';
                          return (
                            <td key={col.key} className="px-4 py-3 align-middle text-sm">
                              {renderCell(val, fieldType, col.key)}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
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
