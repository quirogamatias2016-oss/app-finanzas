import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('App error:', error, info.componentStack);
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="app-error">
          <div className="app-error__card">
            <h1>Algo salió mal</h1>
            <p>Recarga la aplicación para continuar.</p>
            <button type="button" className="btn btn--primary btn--block" onClick={this.handleReload}>
              Recargar app
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
