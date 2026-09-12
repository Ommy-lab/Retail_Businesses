import React, { useState, useEffect, useContext } from 'react';
import API from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { Play, Square, PlusCircle, Sun, Moon, Clock, AlertTriangle } from 'lucide-react';

export const BusinessDashboard = () => {
    const { user } = useContext(AuthContext);
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Theme & Time States
    const [darkMode, setDarkMode] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Modal & Form States
    const [incomeModal, setIncomeModal] = useState(false);
    const [expenseModal, setExpenseModal] = useState(false);
    const [amount, setAmount] = useState('');
    const [source, setSource] = useState('');
    const [category, setCategory] = useState('');
    const [expenseType, setExpenseType] = useState('direct');
    const [description, setDescription] = useState('');

    // Live Clock Timer
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchDashboard = async () => {
        try {
            const res = await API.get('/business/dashboard');
            setDashboard(res.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load dashboard metrics.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    const handleOpenDay = async () => {
        try {
            await API.post('/business/session/open');
            fetchDashboard();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to open day.');
        }
    };

    const handleCloseDay = async () => {
        if (!window.confirm("Are you sure you want to close today's session? Transactions will be locked.")) return;
        try {
            const res = await API.post('/business/session/close');
            alert(`Day closed successfully! Gross Profit: ${res.data.summary.grossProfit}, Net Profit: ${res.data.summary.netProfit}`);
            fetchDashboard();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to close day.');
        }
    };

    const handleAddIncome = async (e) => {
        e.preventDefault();
        try {
            await API.post('/business/incomes', { amount, source, description });
            setAmount(''); setSource(''); setDescription('');
            setIncomeModal(false);
            fetchDashboard();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to add income.');
        }
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        try {
            await API.post('/business/expenses', { amount, category, expense_type: expenseType, description });
            setAmount(''); setCategory(''); setDescription('');
            setExpenseModal(false);
            fetchDashboard();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to add expense.');
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading dashboard...</div>;

    const metrics = dashboard?.todayMetrics || {};
    const isSessionOpen = dashboard?.sessionStatus === 'open';

    return (
        <div className={`min-h-screen p-8 transition-colors duration-200 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Top Bar: Welcome, Live Clock & Theme Toggle */}
                <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 rounded-2xl border shadow-sm transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                    <div>
                        <h1 className="text-2xl font-bold">Welcome back, {user?.username || 'Business'}</h1>
                        <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                            <Clock size={16} />
                            <span>{currentTime.toLocaleDateString()} — {currentTime.toLocaleTimeString()}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setDarkMode(!darkMode)}
                            className={`p-2 rounded-xl border transition-colors ${darkMode ? 'bg-slate-800 border-slate-700 text-amber-400' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                            title="Toggle Theme"
                        >
                            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                    </div>
                </div>

                {/* Session Warning Banner if Not Opened */}
                {dashboard?.sessionStatus === 'not_opened' && (
                    <div className={`p-4 rounded-xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors ${darkMode ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                        <div className="flex items-center gap-3">
                            <AlertTriangle size={20} className="shrink-0" />
                            <div>
                                <h3 className="font-bold">Business Day Not Open</h3>
                                <p className="text-sm opacity-90">You must open today's business session before recording any incomes or expenses.</p>
                            </div>
                        </div>
                        <button onClick={handleOpenDay} className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
                            Open Business Day Now
                        </button>
                    </div>
                )}

                {/* Header & Controls */}
                <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 rounded-2xl border shadow-sm transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                    <div>
                        <h2 className="text-xl font-bold">Daily Financial Operations</h2>
                        <p className="text-sm text-slate-400">Real-time tracking and session controls</p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                            isSessionOpen ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        }`}>
                            Status: {dashboard?.sessionStatus}
                        </span>
                        {!isSessionOpen && dashboard?.sessionStatus !== 'closed' && (
                            <button onClick={handleOpenDay} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                <Play size={16} /> Open Business Day
                            </button>
                        )}
                        {isSessionOpen && (
                            <>
                                <button onClick={() => setIncomeModal(true)} className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-sm font-medium">
                                    <PlusCircle size={16} /> Add Income
                                </button>
                                <button onClick={() => setExpenseModal(true)} className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-sm font-medium">
                                    <PlusCircle size={16} /> Add Expense
                                </button>
                                <button onClick={handleCloseDay} className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 rounded-lg text-sm font-medium">
                                    <Square size={16} /> Close Day
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {error && <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-lg text-sm">{error}</div>}

                {/* Metrics Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div className={`p-5 rounded-xl border shadow-sm transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Today's Incomes</p>
                        <p className="text-2xl font-bold mt-2">${metrics.totalIncome?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div className={`p-5 rounded-xl border shadow-sm transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Direct Expenses</p>
                        <p className="text-2xl font-bold text-rose-500 mt-2">${metrics.totalDirectExp?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div className={`p-5 rounded-xl border shadow-sm transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Operating Expenses</p>
                        <p className="text-2xl font-bold text-rose-500 mt-2">${metrics.totalOperatingExp?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div className={`p-5 rounded-xl border shadow-sm transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gross Profit / Loss</p>
                        <p className={`text-2xl font-bold mt-2 ${metrics.grossProfit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            ${metrics.grossProfit?.toFixed(2) || '0.00'}
                        </p>
                    </div>
                    <div className={`p-5 rounded-xl border shadow-sm transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Net Profit / Loss</p>
                        <p className={`text-2xl font-bold mt-2 ${metrics.netProfit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            ${metrics.netProfit?.toFixed(2) || '0.00'}
                        </p>
                    </div>
                </div>

                {/* Modals for Income & Expense */}
                {incomeModal && (
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <form onSubmit={handleAddIncome} className={`rounded-2xl p-6 max-w-md w-full space-y-4 border ${darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-100 text-slate-900'}`}>
                            <h3 className="text-lg font-bold">Record Income</h3>
                            <input type="number" step="0.01" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} required className={`w-full p-2.5 border rounded-lg ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`} />
                            <input type="text" placeholder="Source (e.g., Sales)" value={source} onChange={e => setSource(e.target.value)} required className={`w-full p-2.5 border rounded-lg ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`} />
                            <input type="text" placeholder="Description (Optional)" value={description} onChange={e => setDescription(e.target.value)} className={`w-full p-2.5 border rounded-lg ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`} />
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setIncomeModal(false)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium">Save Income</button>
                            </div>
                        </form>
                    </div>
                )}

                {expenseModal && (
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <form onSubmit={handleAddExpense} className={`rounded-2xl p-6 max-w-md w-full space-y-4 border ${darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-100 text-slate-900'}`}>
                            <h3 className="text-lg font-bold">Record Expense</h3>
                            <input type="number" step="0.01" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} required className={`w-full p-2.5 border rounded-lg ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`} />
                            <input type="text" placeholder="Category (e.g., Rent, Inventory)" value={category} onChange={e => setCategory(e.target.value)} required className={`w-full p-2.5 border rounded-lg ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`} />
                            <select value={expenseType} onChange={e => setExpenseType(e.target.value)} className={`w-full p-2.5 border rounded-lg ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                <option value="direct">Direct Expense (COGS / Stock)</option>
                                <option value="operating">Operating Expense (Rent / Salaries)</option>
                            </select>
                            <input type="text" placeholder="Description (Optional)" value={description} onChange={e => setDescription(e.target.value)} className={`w-full p-2.5 border rounded-lg ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`} />
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setExpenseModal(false)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium">Save Expense</button>
                            </div>
                        </form>
                    </div>
                )}

            </div>
        </div>
    );
};