import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-8">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Something went wrong</h1>
          <p className="text-gray-500 max-w-md mb-12 leading-relaxed">
            An unexpected error occurred. We've been notified and are working to fix it.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-gray-800 transition-all active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            Reload Page
          </button>
          <div className="mt-12 p-6 bg-gray-50 rounded-2xl text-left max-w-2xl overflow-auto border border-gray-100">
            <p className="text-xs font-mono text-red-600 whitespace-pre-wrap">
              {this.state.error?.toString()}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
