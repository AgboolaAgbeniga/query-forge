'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] p-6 text-center border-2 border-dashed border-red-200 dark:border-red-900/30 rounded-2xl bg-red-50/50 dark:bg-red-950/20 m-4">
          <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400 mb-4">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-zinc-100 mb-2">Something went wrong</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md mb-6">
            An unexpected error occurred in this component. Our military-grade fail-safes caught it, preventing a full crash.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all shadow-sm active:scale-95 text-slate-700 dark:text-zinc-200"
          >
            <RefreshCcw size={16} />
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
