import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, textAlign: 'center', background: '#fef2f2', borderRadius: 12, border: '1px solid #fecaca', margin: 20 }}>
          <h2 style={{ color: '#991b1b', marginBottom: 16 }}>Ops! Algo deu errado.</h2>
          <p style={{ color: '#7f1d1d', marginBottom: 24 }}>Ocorreu um erro inesperado nesta parte da aplicação.</p>
          
          {process.env.NODE_ENV === 'development' && (
            <details style={{ whiteSpace: 'pre-wrap', textAlign: 'left', background: '#fff', padding: 16, borderRadius: 8, fontSize: 12, color: '#444', marginBottom: 24 }}>
              {this.state.error && this.state.error.toString()}
              <br />
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </details>
          )}

          <button 
            onClick={() => window.location.reload()}
            style={{ background: '#991b1b', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
          >
            Recarregar Página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
