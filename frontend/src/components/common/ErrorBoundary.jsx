import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error captured by ErrorBoundary:", error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-900">
                    <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm max-w-md w-full text-center space-y-4">
                        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mx-auto">
                            <AlertTriangle size={24} />
                        </div>
                        <h2 className="text-xl font-bold">Something went wrong</h2>
                        <p className="text-sm text-slate-500">
                            An unexpected error occurred while rendering this page. You can try reloading the application.
                        </p>
                        <button 
                            onClick={this.handleReload}
                            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
                        >
                            <RefreshCw size={16} /> Reload Application
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}