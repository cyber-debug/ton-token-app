import React from 'react';

class AppErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        if (process.env.NODE_ENV !== 'production') {
            // Keep the console useful during local debugging.
            console.error('App error boundary caught an error:', error, info);
        }
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="app-error-shell">
                    <div className="card card-pad app-error-card">
                        <div className="section-kicker">Application error</div>
                        <h1 className="page-title">Something went wrong</h1>
                        <p className="page-subtitle">
                            The app hit an unexpected runtime error. The session is still intact, so try reloading the page or
                            reopening the section after this screen.
                        </p>
                        <pre className="app-error-stack">{String(this.state.error?.message || 'Unknown error')}</pre>
                        <button type="button" className="primary-button" onClick={this.handleRetry}>
                            Try again
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default AppErrorBoundary;
