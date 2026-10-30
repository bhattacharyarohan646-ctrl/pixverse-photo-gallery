import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an uncaught error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0B0F19',
            color: '#fff',
            fontFamily: 'Inter, sans-serif',
            padding: '20px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              maxWidth: '500px',
              padding: '40px',
              borderRadius: '24px',
              background: 'rgba(20, 25, 35, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
            }}
          >
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '16px' }}>
              Something went wrong.
            </h1>
            <p style={{ color: '#94a3b8', marginBottom: '32px', lineHeight: 1.6 }}>
              An unexpected error occurred. Please try reloading the page.
            </p>
            <button
              onClick={this.handleReload}
              style={{
                padding: '12px 28px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)',
                color: '#fff',
                fontSize: '0.95rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(59, 130, 246, 0.35)',
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
