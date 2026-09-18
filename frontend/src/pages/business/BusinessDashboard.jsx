import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import API from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { Modal } from '../../components/common/Modal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { 
    Play, 
    Square, 
    PlusCircle, 
    DollarSign, 
    TrendingUp, 
    ArrowUpRight, 
    ArrowDownRight, 
    Clock, 
    Calendar, 
    AlertCircle, 
    CheckCircle2, 
    Lock, 
    Receipt, 
    Building2,
    Layers,
    FileSpreadsheet,
    X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const BusinessDashboard = () => {
    const { user, businessName, businessLogo } = useContext(AuthContext);
    const navigate = useNavigate();

    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Inline flexible form section state ('income' | 'expense' | null)
    const [activeForm, setActiveForm] = useState(null);
    const formSectionRef = useRef(null);

    // Modals
    const [daySummaryModal, setDaySummaryModal] = useState(false);
    const [daySummaryData, setDaySummaryData] = useState(null);

    // Form inputs
    const [incomeAmount, setIncomeAmount] = useState('');
    const [incomeSource, setIncomeSource] = useState('');
    const [incomeDesc, setIncomeDesc] = useState('');

    const [expenseAmount, setExpenseAmount] = useState('');
    const [expenseCategory, setExpenseCategory] = useState('');
    const [expenseType, setExpenseType] = useState('direct');
    const [expenseDesc, setExpenseDesc] = useState('');

    // Recent transactions preview
    const [recentTransactions, setRecentTransactions] = useState([]);

    // Live clock
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchDashboard = useCallback(async () => {
        try {
            const [dashRes, txRes] = await Promise.all([
                API.get('/business/dashboard'),
                API.get('/business/transactions').catch(() => ({ data: { transactions: [] } }))
            ]);
            setDashboard(dashRes.data);
            setRecentTransactions((txRes.data.transactions || []).slice(0, 5));
            setError('');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load business metrics from server.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    // Session controls
    const handleOpenDay = async () => {
        setActionLoading(true);
        setError('');
        try {
            await API.post('/business/session/open');
            setSuccessMessage("Business session opened successfully. You can now record transactions!");
            setTimeout(() => setSuccessMessage(''), 4000);
            await fetchDashboard();
        } catch (err) {
            setError(err.response?.data?.error || "Failed to open today's business session.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleCloseDay = async () => {
        if (!window.confirm("Are you sure you want to close today's session? All transactions will be locked.")) {
            return;
        }
        setActionLoading(true);
        setError('');
        try {
            const res = await API.post('/business/session/close');
            setDaySummaryData(res.data.summary);
            setDaySummaryModal(true);
            await fetchDashboard();
        } catch (err) {
            setError(err.response?.data?.error || "Failed to close business day session.");
        } finally {
            setActionLoading(false);
        }
    };

    const toggleForm = (type) => {
        setActiveForm((prev) => {
            const next = prev === type ? null : type;
            if (next) {
                setTimeout(() => {
                    formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 60);
            }
            return next;
        });
    };

    // Add Income
    const handleAddIncome = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            await API.post('/business/incomes', {
                amount: parseFloat(incomeAmount),
                source: incomeSource,
                description: incomeDesc
            });
            setIncomeAmount('');
            setIncomeSource('');
            setIncomeDesc('');
            setActiveForm(null);
            setSuccessMessage("Income entry recorded successfully.");
            setTimeout(() => setSuccessMessage(''), 3000);
            await fetchDashboard();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to record income.');
        } finally {
            setActionLoading(false);
        }
    };

    // Add Expense
    const handleAddExpense = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            await API.post('/business/expenses', {
                amount: parseFloat(expenseAmount),
                category: expenseCategory,
                expense_type: expenseType,
                description: expenseDesc
            });
            setExpenseAmount('');
            setExpenseCategory('');
            setExpenseDesc('');
            setExpenseType('direct');
            setActiveForm(null);
            setSuccessMessage("Expense entry recorded successfully.");
            setTimeout(() => setSuccessMessage(''), 3000);
            await fetchDashboard();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to record expense.');
        } finally {
            setActionLoading(false);
        }
    };

    const sessionStatus = dashboard?.sessionStatus || 'not_opened';
    const isSessionOpen = sessionStatus === 'open';
    const isSessionClosed = sessionStatus === 'closed';
    const metrics = dashboard?.todayMetrics || {};

    const formattedLiveDate = currentTime.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const formattedLiveTime = currentTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', border: '3px solid var(--blue-200)', borderTopColor: 'var(--blue-600)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Loading business financial data...</p>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* 1. Header Banner with Business Name & Real-time Live Clock */}
            <section className="blue-card-gradient" style={{ padding: '2rem 2.5rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem', position: 'relative', zIndex: 2 }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                            <span className="badge-white">
                                <Building2 size={13} /> {businessName}
                            </span>
                            <span className="badge-white">
                                Retail Operations
                            </span>
                        </div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                            {businessName}
                        </h1>
                        <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.95rem', margin: '0.4rem 0 0', fontWeight: 500 }}>
                            Track daily gross vs. net profits, sales revenue, and expenses in real-time.
                        </p>
                    </div>

                    {/* Live Clock Card */}
                    <div style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '1.25rem 1.75rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        gap: '0.35rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff', fontSize: '0.85rem', fontWeight: 600 }}>
                            <Calendar size={16} />
                            <span>{formattedLiveDate}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff', fontSize: '1.75rem', fontWeight: 800, letterSpacing: '0.04em', fontVariantNumeric: 'tabular-nums' }}>
                            <Clock size={20} />
                            <span>{formattedLiveTime}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Notifications / Alerts */}
            {error && (
                <div className="animate-fade-in" style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-main)',
                    borderLeft: '4px solid var(--blue-600)',
                    padding: '1rem 1.5rem',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    color: 'var(--text-primary)'
                }}>
                    <AlertCircle size={20} style={{ color: 'var(--blue-600)', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{error}</span>
                </div>
            )}

            {successMessage && (
                <div className="animate-fade-in" style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--blue-300)',
                    borderLeft: '4px solid var(--blue-500)',
                    padding: '1rem 1.5rem',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    color: 'var(--text-primary)'
                }}>
                    <CheckCircle2 size={20} style={{ color: 'var(--blue-500)', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{successMessage}</span>
                </div>
            )}

            {/* 2. Interactive Daily Session Control Bar */}
            <section className="blue-card" style={{ padding: '1.5rem 2rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '46px',
                            height: '46px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'var(--bg-subtle)',
                            border: '1px solid var(--border-subtle)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--blue-600)'
                        }}>
                            {isSessionOpen ? <Play size={22} /> : isSessionClosed ? <Lock size={22} /> : <AlertCircle size={22} />}
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                                    Daily Business Session
                                </h3>
                                <span className="badge-blue" style={{
                                    backgroundColor: isSessionOpen ? 'var(--blue-100)' : 'var(--bg-subtle)',
                                    color: 'var(--blue-800)',
                                    borderColor: 'var(--blue-300)'
                                }}>
                                    {isSessionOpen ? 'Session Active / Open' : isSessionClosed ? 'Session Closed & Locked' : 'Session Not Opened'}
                                </span>
                            </div>
                            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
                                {isSessionOpen 
                                    ? 'Incomes and expenses are currently being accepted for today.' 
                                    : isSessionClosed 
                                    ? "Today's books are finalized. New entries are disabled until tomorrow."
                                    : 'You must open the day session before adding sales or expense records.'}
                            </p>
                        </div>
                    </div>

                    {/* Action Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        {!isSessionOpen && !isSessionClosed && (
                            <button 
                                onClick={handleOpenDay}
                                disabled={actionLoading}
                                className="btn-primary"
                                style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem' }}
                            >
                                <Play size={18} /> Open Business Day
                            </button>
                        )}

                        {isSessionOpen && (
                            <>
                                <button 
                                    type="button"
                                    onClick={() => toggleForm('income')}
                                    className="btn-primary"
                                    style={{ 
                                        background: activeForm === 'income' ? 'var(--blue-700)' : 'var(--blue-gradient)',
                                        outline: activeForm === 'income' ? '2px solid var(--blue-400)' : 'none'
                                    }}
                                >
                                    <PlusCircle size={17} /> {activeForm === 'income' ? 'Close Income Form' : 'Record Income'}
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => toggleForm('expense')}
                                    className="btn-secondary"
                                    style={{
                                        borderColor: activeForm === 'expense' ? 'var(--blue-500)' : undefined,
                                        backgroundColor: activeForm === 'expense' ? 'var(--bg-subtle)' : undefined,
                                        outline: activeForm === 'expense' ? '2px solid var(--blue-400)' : 'none'
                                    }}
                                >
                                    <PlusCircle size={17} /> {activeForm === 'expense' ? 'Close Expense Form' : 'Record Expense'}
                                </button>
                                <button 
                                    type="button"
                                    onClick={handleCloseDay}
                                    disabled={actionLoading}
                                    className="btn-outline"
                                    style={{ color: 'var(--blue-700)', borderColor: 'var(--blue-400)' }}
                                >
                                    <Square size={17} /> Finalize & Close Day
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Inline Flexible Filling Section (Scrollable with the page) */}
            {activeForm === 'income' && (
                <section ref={formSectionRef} className="filling-card-section animate-fade-in">
                    <div className="filling-card-header">
                        <div className="filling-card-title-group">
                            <div className="filling-card-icon">
                                <ArrowUpRight size={20} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                                    Record New Income
                                </h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
                                    Add revenue to today's active business session
                                </p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <span className="badge-blue">Live Entry</span>
                            <button 
                                type="button"
                                onClick={() => setActiveForm(null)}
                                className="btn-icon"
                                aria-label="Close form"
                                style={{ padding: '0.45rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-full)' }}
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleAddIncome} className="filling-card-body">
                        <div className="input-group">
                            <label className="input-label">Income Amount (TSh)</label>
                            <input 
                                type="number" 
                                step="any" 
                                min="1"
                                required
                                placeholder="e.g. 50000"
                                value={incomeAmount}
                                onChange={(e) => setIncomeAmount(e.target.value)}
                                className="input-control"
                                style={{ fontSize: '1.15rem', fontWeight: 700 }}
                                autoFocus
                            />
                            {/* Quick Amount Helper Chips */}
                            <div className="quick-chips">
                                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 600 }}>Quick Add:</span>
                                {[10000, 20000, 50000, 100000].map((val) => (
                                    <button
                                        key={val}
                                        type="button"
                                        onClick={() => {
                                            const current = parseFloat(incomeAmount) || 0;
                                            setIncomeAmount(String(current + val));
                                        }}
                                        className="chip-btn"
                                    >
                                        +{val.toLocaleString()}
                                    </button>
                                ))}
                                {incomeAmount && (
                                    <button
                                        type="button"
                                        onClick={() => setIncomeAmount('')}
                                        className="chip-btn chip-btn-clear"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Revenue Source</label>
                            <input 
                                type="text" 
                                required
                                placeholder="e.g. Cash Sale, M-Pesa, POS"
                                value={incomeSource}
                                onChange={(e) => setIncomeSource(e.target.value)}
                                className="input-control"
                            />
                            {/* Quick Source Chips */}
                            <div className="quick-chips">
                                {['Cash Sale', 'M-Pesa / Tigo Pesa', 'POS Card', 'Bank Transfer'].map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => setIncomeSource(s)}
                                        className={`chip-btn ${incomeSource === s ? 'active' : ''}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Description (Optional)</label>
                            <textarea 
                                rows={2}
                                placeholder="Receipt number, customer note, or details"
                                value={incomeDesc}
                                onChange={(e) => setIncomeDesc(e.target.value)}
                                className="input-control"
                                style={{ resize: 'vertical' }}
                            />
                        </div>

                        <div className="filling-card-footer">
                            <button 
                                type="button" 
                                onClick={() => setActiveForm(null)} 
                                className="btn-outline"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={actionLoading} 
                                className="btn-primary" 
                                style={{ minWidth: '150px' }}
                            >
                                {actionLoading ? 'Saving...' : 'Save Income'}
                            </button>
                        </div>
                    </form>
                </section>
            )}

            {activeForm === 'expense' && (
                <section ref={formSectionRef} className="filling-card-section animate-fade-in">
                    <div className="filling-card-header">
                        <div className="filling-card-title-group">
                            <div className="filling-card-icon" style={{ backgroundColor: 'var(--blue-100)', color: 'var(--blue-700)' }}>
                                <ArrowDownRight size={20} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                                    Record Business Expense
                                </h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
                                    Log operational or direct expenses for today's session
                                </p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <span className="badge-outline">Cost Entry</span>
                            <button 
                                type="button"
                                onClick={() => setActiveForm(null)}
                                className="btn-icon"
                                aria-label="Close form"
                                style={{ padding: '0.45rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-full)' }}
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleAddExpense} className="filling-card-body">
                        <div className="input-group">
                            <label className="input-label">Expense Amount (TSh)</label>
                            <input 
                                type="number" 
                                step="any" 
                                min="1"
                                required
                                placeholder="e.g. 25000"
                                value={expenseAmount}
                                onChange={(e) => setExpenseAmount(e.target.value)}
                                className="input-control"
                                style={{ fontSize: '1.15rem', fontWeight: 700 }}
                                autoFocus
                            />
                            {/* Quick Expense Amount Chips */}
                            <div className="quick-chips">
                                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 600 }}>Quick Add:</span>
                                {[5000, 10000, 20000, 50000].map((val) => (
                                    <button
                                        key={val}
                                        type="button"
                                        onClick={() => {
                                            const current = parseFloat(expenseAmount) || 0;
                                            setExpenseAmount(String(current + val));
                                        }}
                                        className="chip-btn"
                                    >
                                        +{val.toLocaleString()}
                                    </button>
                                ))}
                                {expenseAmount && (
                                    <button
                                        type="button"
                                        onClick={() => setExpenseAmount('')}
                                        className="chip-btn chip-btn-clear"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Expense Category</label>
                            <input 
                                type="text" 
                                required
                                placeholder="e.g. Stock Purchase, Rent, Transport"
                                value={expenseCategory}
                                onChange={(e) => setExpenseCategory(e.target.value)}
                                className="input-control"
                            />
                            {/* Quick Category Suggestions */}
                            <div className="quick-chips">
                                {['Stock / Goods', 'Shop Rent', 'Transport / Fare', 'Electricity / Water', 'Staff Wages'].map((cat) => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setExpenseCategory(cat)}
                                        className={`chip-btn ${expenseCategory === cat ? 'active' : ''}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Expense Classification</label>
                            <select 
                                value={expenseType}
                                onChange={(e) => setExpenseType(e.target.value)}
                                className="input-control"
                            >
                                <option value="direct">Direct Expense (Stock / Raw materials - impacts Gross Profit)</option>
                                <option value="operating">Operating Expense (Rent, Power, Wages - impacts Net Profit)</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Description (Optional)</label>
                            <textarea 
                                rows={2}
                                placeholder="Vendor invoice, receipt note, or details"
                                value={expenseDesc}
                                onChange={(e) => setExpenseDesc(e.target.value)}
                                className="input-control"
                                style={{ resize: 'vertical' }}
                            />
                        </div>

                        <div className="filling-card-footer">
                            <button 
                                type="button" 
                                onClick={() => setActiveForm(null)} 
                                className="btn-outline"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={actionLoading} 
                                className="btn-primary" 
                                style={{ minWidth: '150px' }}
                            >
                                {actionLoading ? 'Saving...' : 'Save Expense'}
                            </button>
                        </div>
                    </form>
                </section>
            )}

            {/* 3. Core Financial Metrics Grid (Strict Blue & White Palette) */}
            <section className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem' }}>
                {/* 1. Today's Incomes */}
                <div className="blue-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
                                Today's Income
                            </span>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.4rem 0 0' }}>
                                {formatCurrency(metrics.totalIncome || 0)}
                            </h2>
                        </div>
                        <div style={{
                            padding: '0.65rem',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'var(--blue-100)',
                            color: 'var(--blue-700)',
                            border: '1px solid var(--blue-200)'
                        }}>
                            <ArrowUpRight size={20} />
                        </div>
                    </div>
                    <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Revenue Inflows</span>
                        <span className="badge-blue" style={{ fontSize: '0.65rem' }}>Active Session</span>
                    </div>
                </div>

                {/* 2. Direct Expenses (COGS) */}
                <div className="blue-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
                                Direct Expenses (COGS)
                            </span>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--blue-800)', margin: '0.4rem 0 0' }}>
                                {formatCurrency(metrics.totalDirectExp || 0)}
                            </h2>
                        </div>
                        <div style={{
                            padding: '0.65rem',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'var(--bg-subtle)',
                            color: 'var(--blue-600)',
                            border: '1px solid var(--border-main)'
                        }}>
                            <ArrowDownRight size={20} />
                        </div>
                    </div>
                    <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Inventory & Goods</span>
                        <span className="badge-outline" style={{ fontSize: '0.65rem' }}>Direct Cost</span>
                    </div>
                </div>

                {/* 3. Operating Expenses */}
                <div className="blue-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
                                Operating Expenses
                            </span>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-secondary)', margin: '0.4rem 0 0' }}>
                                {formatCurrency(metrics.totalOperatingExp || 0)}
                            </h2>
                        </div>
                        <div style={{
                            padding: '0.65rem',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'var(--bg-subtle)',
                            color: 'var(--text-muted)',
                            border: '1px solid var(--border-main)'
                        }}>
                            <Layers size={20} />
                        </div>
                    </div>
                    <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rent, Utilities, Staff</span>
                        <span className="badge-outline" style={{ fontSize: '0.65rem' }}>Overhead</span>
                    </div>
                </div>

                {/* 4. Gross Profit / Loss */}
                <div className="blue-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
                                Gross Profit
                            </span>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--blue-600)', margin: '0.4rem 0 0' }}>
                                {formatCurrency(metrics.grossProfit || 0)}
                            </h2>
                        </div>
                        <div style={{
                            padding: '0.65rem',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'var(--blue-100)',
                            color: 'var(--blue-700)',
                            border: '1px solid var(--blue-300)'
                        }}>
                            <TrendingUp size={20} />
                        </div>
                    </div>
                    <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Revenue - Direct Exp</span>
                        <span className="badge-blue" style={{ fontSize: '0.65rem' }}>Formula</span>
                    </div>
                </div>

                {/* 5. Net Profit / Loss */}
                <div className="blue-card" style={{ 
                    padding: '1.5rem', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between',
                    border: '2px solid var(--blue-500)',
                    background: 'var(--blue-gradient-subtle)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--blue-700)' }}>
                                Today's Net Profit
                            </span>
                            <h2 style={{ fontSize: '1.9rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0.4rem 0 0' }}>
                                {formatCurrency(metrics.netProfit || 0)}
                            </h2>
                        </div>
                        <div style={{
                            padding: '0.65rem',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'var(--blue-600)',
                            color: '#ffffff',
                            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)'
                        }}>
                            <DollarSign size={20} />
                        </div>
                    </div>
                    <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-main)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--blue-700)' }}>Gross - Operating</span>
                        <span className="badge-blue" style={{ fontSize: '0.65rem' }}>Final Bottom Line</span>
                    </div>
                </div>
            </section>

            {/* 4. Recent Transactions Preview Section */}
            <section className="blue-card" style={{ padding: '1.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <Receipt size={20} style={{ color: 'var(--blue-500)' }} />
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                            Recent Transactions Preview
                        </h3>
                    </div>
                    <button 
                        onClick={() => navigate('/business/transactions')}
                        className="btn-secondary"
                        style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}
                    >
                        View Full History &rarr;
                    </button>
                </div>

                {recentTransactions.length === 0 ? (
                    <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)', backgroundColor: 'var(--bg-base)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-main)' }}>
                        <FileSpreadsheet size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.6, color: 'var(--blue-400)' }} />
                        <p style={{ fontWeight: 600, margin: 0 }}>No transactions recorded for this business yet.</p>
                        <p style={{ fontSize: '0.8rem', margin: '0.25rem 0 0' }}>Open today's day session to start entering sales and costs.</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="custom-table">
                            <thead>
                                <tr>
                                    <th>Entry Type</th>
                                    <th>Source / Category</th>
                                    <th>Description</th>
                                    <th>Amount</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentTransactions.map((tx) => {
                                    const isIncome = tx.type === 'income';
                                    return (
                                        <tr key={`${tx.type}-${tx.id}`}>
                                            <td>
                                                <span className={isIncome ? "badge-blue" : "badge-outline"}>
                                                    {isIncome ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                                    {isIncome ? 'Income' : tx.type === 'direct' ? 'Direct Exp' : 'Operating Exp'}
                                                </span>
                                            </td>
                                            <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                                {tx.source || tx.category}
                                            </td>
                                            <td>{tx.description || '—'}</td>
                                            <td style={{ fontWeight: 700, color: isIncome ? 'var(--blue-600)' : 'var(--text-primary)' }}>
                                                {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                                            </td>
                                            <td>{formatDate(tx.created_at)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>


            {/* MODAL: Day Summary (Shown on Day Close) */}
            <Modal isOpen={daySummaryModal} onClose={() => setDaySummaryModal(false)} title="Day Closed — Session Summary">
                {daySummaryData && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                            <span className="badge-blue" style={{ marginBottom: '0.5rem' }}>Date: {daySummaryData.date}</span>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                                Session Finalized
                            </h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
                                Here is the financial calculation for today's trade:
                            </p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Total Income:</span>
                                <strong style={{ color: 'var(--blue-600)' }}>{formatCurrency(daySummaryData.totalIncome)}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Direct Expenses (COGS):</span>
                                <strong>{formatCurrency(daySummaryData.totalDirectExp)}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
                                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Gross Profit:</span>
                                <strong style={{ color: 'var(--blue-600)', fontWeight: 800 }}>{formatCurrency(daySummaryData.grossProfit)}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Operating Expenses:</span>
                                <strong>{formatCurrency(daySummaryData.totalOperatingExp)}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.85rem', background: 'var(--blue-gradient)', color: '#ffffff', borderRadius: 'var(--radius-md)' }}>
                                <span style={{ fontWeight: 700, color: '#ffffff' }}>Net Profit / Loss:</span>
                                <strong style={{ fontSize: '1.2rem', color: '#ffffff', fontWeight: 900 }}>{formatCurrency(daySummaryData.netProfit)}</strong>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                            <button onClick={() => setDaySummaryModal(false)} className="btn-primary" style={{ width: '100%' }}>
                                Close Summary
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};