'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error?.message || 'An unexpected error occurred' };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[ErrorBoundary caught error]:', error, errorInfo);
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, errorMessage: '' });
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          role="alert"
          className="min-h-screen w-full bg-[#19060A] text-[#F7F0DF] flex flex-col items-center justify-center p-6 text-center select-none"
        >
          <div className="max-w-md w-full p-8 rounded-2xl bg-[#2A0C11]/80 border border-[#C89B3C]/40 backdrop-blur-xl shadow-2xl flex flex-col items-center">
            {/* Sacred Diamond Kolam Icon */}
            <div className="w-12 h-12 mb-4 rounded-full border border-[#C89B3C]/40 flex items-center justify-center bg-[#C89B3C]/10 text-[#FFD700]">
              ✦
            </div>

            <p className="text-[11px] tracking-[0.28em] uppercase text-[#E4C979] mb-2 font-mono">
              Auspicious Union
            </p>

            <h1 className="font-serif text-2xl md:text-3xl font-light tracking-[0.14em] text-[#F7F0DF] mb-4">
              Krishna & Rishitha
            </h1>

            <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#C89B3C] to-transparent mb-4" />

            <p className="text-sm text-[#F7F0DF]/80 leading-relaxed mb-6 font-sans">
              Welcome to our wedding invitation. If you experience an unexpected visual interruption, you may refresh the page or connect directly with us.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button
                type="button"
                onClick={this.handleRetry}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#C89B3C] to-[#E4C979] text-[#19060A] font-medium text-xs tracking-[0.18em] uppercase shadow-lg transition-transform active:scale-95 cursor-pointer min-h-[44px]"
              >
                Refresh Invitation
              </button>

              <a
                href="https://wa.me/917995120344"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 rounded-xl border border-[#C89B3C]/50 text-[#E4C979] hover:bg-[#C89B3C]/10 font-medium text-xs tracking-[0.18em] uppercase transition-colors flex items-center justify-center min-h-[44px]"
              >
                WhatsApp Host
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
