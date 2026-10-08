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
            <div className="w-14 h-14 rounded-2xl bg-[#D2F843]/10 text-neutral-900 dark:text-[#D2F843] flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-bold tracking-tight">Something went wrong</h2>
              <p className="text-xs text-neutral-500 leading-relaxed">
                An unexpected interface issue occurred. Please refresh to load the latest verified state of CHIP NG.
              </p>
            </div>

            <button
              onClick={this.handleReload}
              className="w-full py-3 px-6 rounded-full bg-neutral-950 text-white dark:bg-[#D2F843] dark:text-neutral-950 text-xs font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload CHIP NG</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
