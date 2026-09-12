import React, { useState, useEffect, useCallback } from 'react';
import API from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { 
    Search, 
    Trash2, 
    ArrowUpRight, 
    ArrowDownRight, 
    Receipt, 
    Filter, 
    AlertCircle, 
    CheckCircle2, 
    Layers,
    FileSpreadsheet
} from 'lucide-react';

export const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'income', 'direct', 'operating'
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        try {
            const res = await API.get('/business/transactions');
            setTransactions(res.data.transactions || []);
        } catch (err) {
            console.error("Failed to load transactions:", err);
            setStatusMessage({ type: 'error', text: err.response?.data?.error || 'Failed to fetch transaction logs.' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const handleDelete = async (id, type) => {
        if (!window.confirm("Are you sure you want to delete this entry? Note: Entries on closed sessions are locked.")) {
            return;
        }

        try {
            // Check whether backend endpoint is GET or DELETE for /income/:id and /expense/:id
            const endpointType = type === 'income' ? 'income' : 'expense';
            try {
                await API.delete(`/business/${endpointType}/${id}`);
            } catch (delErr) {
                // If 404 or method not allowed, try GET as configured in backend route
                if (delErr.response?.status === 404 || delErr.response?.status === 405) {
                    await API.get(`/business/${endpointType}/${id}`);
                } else {
                    throw delErr;
                }
            }

            setStatusMessage({ type: 'success', text: 'Transaction removed successfully.' });
            setTimeout(() => setStatusMessage({ type: '', text: '' }), 3000);
            fetchTransactions();
        } catch (err) {
            const errText = err.response?.data?.error || 'Could not delete entry. The day session might already be closed.';
            setStatusMessage({ type: 'error', text: errText });
            setTimeout(() => setStatusMessage({ type: '', text: '' }), 5000);
        }
    };

    // Tab Filtering
    const filteredByTab = transactions.filter(tx => {
        if (activeTab === 'all') return true;
        if (activeTab === 'income') return tx.type === 'income';
        if (activeTab === 'direct') return tx.type === 'direct';
        if (activeTab === 'operating') return tx.type === 'operating';
        return true;
    });

    // Search Query Filtering
    const displayedTransactions = filteredByTab.filter(tx => {
        const query = search.toLowerCase();
        const src = (tx.source || '').toLowerCase();
        const cat = (tx.category || '').toLowerCase();
        const desc = (tx.description || '').toLowerCase();
        const amt = String(tx.amount || '');
        return src.includes(query) || cat.includes(query) || desc.includes(query) || amt.includes(query);
    });

    // Tab Counts
    const incomeCount = transactions.filter(t => t.type === 'income').length;
    const directCount = transactions.filter(t => t.type === 'direct').length;
    const operatingCount = transactions.filter(t => t.type === 'operating').length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Header & Title */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.25rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                        <span className="badge-blue">Financial Audit</span>
                        <span className="badge-outline">All Time Records</span>
                    </div>
                    <h1 style={{ fontSize: '1.9rem', fontWeight: 800, margin: 0 }}>
                        Transactions Registry
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.3rem 0 0' }}>
                        Review, audit, and search all income revenues and expense postings.
                    </p>
                </div>

                {/* Search Bar */}
                <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
                    <Search size={17} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--blue-400)' }} />
                    <input 
                        type="text"
                        placeholder="Search source, note, category..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input-control"
                        style={{ paddingLeft: '2.5rem', borderRadius: 'var(--radius-full)' }}
                    />
                </div>
            </div>

            {/* Status alerts */}
            {statusMessage.text && (
                <div className="animate-fade-in" style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-main)',
                    borderLeft: statusMessage.type === 'error' ? '4px solid var(--blue-700)' : '4px solid var(--blue-500)',
                    padding: '1rem 1.5rem',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    color: 'var(--text-primary)'
                }}>
                    {statusMessage.type === 'error' ? (
                        <AlertCircle size={20} style={{ color: 'var(--blue-700)', flexShrink: 0 }} />
                    ) : (
                        <CheckCircle2 size={20} style={{ color: 'var(--blue-500)', flexShrink: 0 }} />
                    )}
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{statusMessage.text}</span>
                </div>
            )}

            {/* Filter Tabs */}
            <div className="tabs-container">
                <button 
                    onClick={() => setActiveTab('all')}
                    className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                >
                    <Receipt size={15} /> All Entries ({transactions.length})
                </button>
                <button 
                    onClick={() => setActiveTab('income')}
                    className={`tab-btn ${activeTab === 'income' ? 'active' : ''}`}
                >
                    <ArrowUpRight size={15} /> Incomes ({incomeCount})
                </button>
                <button 
                    onClick={() => setActiveTab('direct')}
                    className={`tab-btn ${activeTab === 'direct' ? 'active' : ''}`}
                >
                    <ArrowDownRight size={15} /> Direct Costs ({directCount})
                </button>
                <button 
                    onClick={() => setActiveTab('operating')}
                    className={`tab-btn ${activeTab === 'operating' ? 'active' : ''}`}
                >
                    <Layers size={15} /> Operating ({operatingCount})
                </button>
            </div>

            {/* Transactions Table Card */}
            <div className="blue-card" style={{ padding: '0.5rem', overflow: 'hidden' }}>
                <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>Classification</th>
                                <th>Source / Category</th>
                                <th>Description</th>
                                <th>Amount</th>
                                <th>Session Date</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        Loading transactions...
                                    </td>
                                </tr>
                            ) : displayedTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                                        <FileSpreadsheet size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.5, color: 'var(--blue-400)' }} />
                                        <p style={{ fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>No transactions found</p>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
                                            {search ? 'Try clearing or changing your search criteria.' : 'No entries recorded for this category yet.'}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                displayedTransactions.map((tx) => {
                                    const isIncome = tx.type === 'income';
                                    return (
                                        <tr key={`${tx.type}-${tx.id}`}>
                                            <td>
                                                <span className={isIncome ? "badge-blue" : "badge-outline"}>
                                                    {isIncome ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                                    {isIncome ? 'Income' : tx.type === 'direct' ? 'Direct Exp' : 'Operating'}
                                                </span>
                                            </td>
                                            <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                                {tx.source || tx.category}
                                            </td>
                                            <td style={{ color: 'var(--text-secondary)' }}>
                                                {tx.description || '—'}
                                            </td>
                                            <td style={{ fontWeight: 700, color: isIncome ? 'var(--blue-600)' : 'var(--text-primary)', fontSize: '0.95rem' }}>
                                                {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                                            </td>
                                            <td style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>
                                                {formatDate(tx.created_at)}
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <button 
                                                    onClick={() => handleDelete(tx.id, tx.type)}
                                                    className="btn-icon"
                                                    style={{ padding: '0.45rem', border: '1px solid var(--border-subtle)' }}
                                                    title="Delete transaction (active session only)"
                                                >
                                                    <Trash2 size={15} style={{ color: 'var(--blue-600)' }} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};