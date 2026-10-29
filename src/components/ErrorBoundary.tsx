import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
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
  }

  private handleReload = () => {
    // Clear any temporary cache and reload
    try {
      sessionStorage.clear();
    } catch (e) {
      // Ignore
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
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

            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={this.handleReload}
                className="w-full py-3 px-6 rounded-full bg-neutral-950 text-white dark:bg-[#16a34a] dark:text-neutral-950 text-xs font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload CHIP NG</span>
              </button>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: undefined });
                  window.location.href = '/dashboard';
                }}
                className="w-full py-2.5 px-6 rounded-full border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-neutral-300 text-xs font-bold hover:bg-neutral-100 dark:hover:bg-white/5 transition-all cursor-pointer"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
