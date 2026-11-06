import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('CHIP NG uncaught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.clear();
      }
    } catch (e) {}
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    window.location.reload();
  };

  private handleResetToHome = () => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.clear();
      }
    } catch (e) {}
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    window.location.href = '/';
  };

  private handleResetToDashboard = () => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.clear();
      }
    } catch (e) {}
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    window.location.href = '/dashboard';
  };

  private handleClearAndReset = () => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.clear();
        localStorage.removeItem('chipng_referrer');
        localStorage.removeItem('theme');
      }
    } catch (e) {}
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      const err = this.state.error;
      const errorMsg = (err && typeof err.message === 'string' && err.message.trim())
        ? err.message
        : (typeof err === 'string' ? err : 'An unexpected interface issue occurred.');
      const stack = err?.stack || this.state.errorInfo?.componentStack;

      return (
        <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0B0E] text-neutral-900 dark:text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-[#12141B] border border-neutral-200/80 dark:border-neutral-800 text-center shadow-lg space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-[#16a34a]/10 text-neutral-900 dark:text-[#16a34a] flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-bold tracking-tight">Something went wrong</h2>
              <p className="text-xs text-neutral-500 leading-relaxed">
                An unexpected interface issue occurred. Please refresh to load the latest verified state of CHIP NG.
              </p>
            </div>

            {/* Collapsible Technical Details for Admins & Diagnostics */}
            <details className="text-left bg-neutral-100 dark:bg-black/40 p-3 rounded-2xl text-[11px] text-neutral-600 dark:text-neutral-400 border border-neutral-200/60 dark:border-white/5">
              <summary className="font-mono cursor-pointer font-bold select-none text-rose-500 hover:underline">
                View Technical Details
              </summary>
              <div className="mt-2 font-mono whitespace-pre-wrap break-all max-h-36 overflow-y-auto text-[10px] text-neutral-700 dark:text-neutral-300">
                {errorMsg}
                {stack ? `\n\n${stack}` : ''}
              </div>
            </details>

            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={this.handleReload}
                className="w-full py-3 px-6 rounded-full bg-neutral-950 text-white dark:bg-[#16a34a] dark:text-neutral-950 text-xs font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload CHIP NG</span>
              </button>
              <button
                onClick={this.handleResetToDashboard}
                className="w-full py-2.5 px-6 rounded-full border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-neutral-300 text-xs font-bold hover:bg-neutral-100 dark:hover:bg-white/5 transition-all cursor-pointer"
              >
                Return to Dashboard
              </button>
              <button
                onClick={this.handleResetToHome}
                className="w-full py-2 px-6 rounded-full text-neutral-500 hover:text-neutral-900 dark:hover:text-white text-xs font-semibold transition-all cursor-pointer"
              >
                Go to Homepage
              </button>
              <button
                onClick={this.handleClearAndReset}
                className="w-full py-1.5 px-4 text-neutral-400 hover:text-rose-500 text-[10px] font-mono transition-all cursor-pointer"
              >
                Clear Cache & Reset
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
