import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error inside Learner\'s Den Applet:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    try {
      localStorage.clear();
      window.location.reload();
    } catch (e) {
      window.location.reload();
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-8 shadow-xl shadow-slate-100 flex flex-col items-center text-center relative overflow-hidden">
            {/* Ambient error red bar */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-rose-500"></div>

            {/* Glowing Warning Icon */}
            <div className="h-16 w-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-5 relative shrink-0">
              <AlertTriangle className="h-8 w-8 animate-bounce text-rose-500" />
            </div>

            {/* Heading */}
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
              An Unexpected Error Occurred
            </h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
              Application Crash Prevented
            </p>
            <p className="text-xs text-slate-500 mt-3 max-w-sm">
              Learner's Den's Error Boundary successfully intercepted an unhandled runtime exception. Your data has been protected.
            </p>

            {/* Error Message Box */}
            <div className="w-full bg-slate-50 border border-slate-150 rounded-2xl p-4 mt-6 text-left space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-xxs font-black text-rose-700 bg-rose-50 border border-rose-150 px-2 py-0.5 rounded uppercase">
                  Error
                </span>
                <span className="text-xs font-bold text-slate-700 font-mono break-all">
                  {this.state.error?.message || 'Unknown runtime error'}
                </span>
              </div>
              {this.state.errorInfo && (
                <details className="text-xxs font-medium text-slate-400 cursor-pointer">
                  <summary className="font-bold text-slate-500 hover:text-slate-600 outline-none pb-1">
                    Show component stack trace
                  </summary>
                  <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl overflow-auto max-h-40 font-mono mt-1 text-[10px] leading-relaxed select-all whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>

            {/* Recovery Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mt-6">
              <button
                onClick={this.handleReload}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-sm transition-all cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Reload Application</span>
              </button>
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                title="Clears all local storage cache and loads fresh default states"
              >
                <Trash2 className="h-4 w-4 text-slate-500" />
                <span>Reset Cache & Storage</span>
              </button>
            </div>

            <div className="mt-6 text-[10px] font-bold text-slate-400">
              Need assistance? Email support or switch back to main panel.
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
