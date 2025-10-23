import React from 'react';

import {
  IErrorBoundaryProps,
  IErrorBoundaryState,
} from 'types/components/ErrorBoundary/ErrorBoundary';

class ErrorBoundary extends React.Component<
  IErrorBoundaryProps,
  IErrorBoundaryState
> {
  private _fallback: () => React.ReactElement | null;

  constructor(props: IErrorBoundaryProps) {
    super(props);
    this.state = {
      error: null,
    };

    this._fallback = () => props.fallback ?? <h1>Something went wrong.</h1>;
  }

  static getDerivedStateFromError(error: Error): IErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error);
    console.error('Error info:', errorInfo);
    // Log error to reporting service
  }

  render(): React.ReactNode {
    if (this.state.error) {
      return <this._fallback />;
    }

    return this.props.children ?? null;
  }
}

export default ErrorBoundary;
