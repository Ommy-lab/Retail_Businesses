import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { LayoutDashboard, ReceiptText, FileText, Settings, LogOut, Building2 } from 'lucide-react';

export const Sidebar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (user?.role === 'super_admin') {
        return (
            <div className="w-64 bg-slate-900 border-r border-slate-800 min-h-screen p-6 flex flex-col justify-between text-slate-100">
                <div className="space-y-6">
                    <div className="flex items-center gap-3 px-2">
                        <Building2 className="text-emerald-400" size={24} />
                        <span className="font-bold text-lg tracking-wide">Super Admin</span>
                    </div>
                    <nav className="space-y-1">
                        <button 
                            onClick={() => navigate('/admin/dashboard')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                                location.pathname === '/admin/dashboard' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                            }`}
                        >
                            <LayoutDashboard size={18} /> Businesses
                        </button>
                    </nav>
                </div>
                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors w-full"
                >
                    <LogOut size={18} /> Logout
                </button>
            </div>
        );
    }

    return (
        <div className="w-64 bg-slate-900 border-r border-slate-800 min-h-screen p-6 flex flex-col justify-between text-slate-100">
            <div className="space-y-6">
                <div className="flex items-center gap-3 px-2">
                    <Building2 className="text-emerald-400" size={24} />
                    <span className="font-bold text-lg tracking-wide">Retail Portal</span>
                </div>
                <nav className="space-y-1">
                    <button 
                        onClick={() => navigate('/business/dashboard')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                            location.pathname === '/business/dashboard' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                        }`}
                    >
                        <LayoutDashboard size={18} /> Dashboard
                    </button>
                    <button 
                        onClick={() => navigate('/business/transactions')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                            location.pathname === '/business/transactions' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                        }`}
                    >
                        <ReceiptText size={18} /> Transactions
                    </button>
                    <button 
                        onClick={() => navigate('/business/reports')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                            location.pathname === '/business/reports' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                        }`}
                    >
                        <FileText size={18} /> Reports
                    </button>
                    <button 
                        onClick={() => navigate('/business/settings')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                            location.pathname === '/business/settings' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                        }`}
                    >
                        <Settings size={18} /> Settings
                    </button>
                </nav>
            </div>
            <button 
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors w-full"
            >
                <LogOut size={18} /> Logout
            </button>
        </div>
    );
};