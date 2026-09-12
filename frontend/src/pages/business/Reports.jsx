import React, { useState, useEffect, useCallback } from 'react';
import API from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { 
    FileText, 
    Calendar, 
    TrendingUp, 
    DollarSign, 
    Filter, 
    ArrowUpRight, 
    ArrowDownRight,
    CheckCircle2,
    Layers,
    Clock
} from 'lucide-react';

export const Reports = () => {
    const [reports, setReports] = useState([]);
    const [filter, setFilter] = useState('daily'); // 'daily', 'weekly', 'monthly', 'custom'
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchReports = useCallback(async (selectedFilter = filter, customStart = startDate, customEnd = endDate) => {
        setLoading(true);
        try {
            let url = `/business/reports?filter=${selectedFilter}`;
            if (selectedFilter === 'custom' && customStart && customEnd) {
                url += `&startDate=${customStart}&endDate=${customEnd}`;
            }
            const res = await API.get(url);
            setReports(res.data.report || []);
        } catch (err) {
            console.error("Failed to load reports:", err);
        } finally {
            setLoading(false);
        }
    }, [filter, startDate, endDate]);

    useEffect(() => {
        if (filter !== 'custom') {
            fetchReports(filter);
        }
    }, [filter, fetchReports]);

    const handleApplyCustomFilter = (e) => {
        e.preventDefault();
        if (!startDate || !endDate) {
            alert("Please select both a start date and an end date.");
            return;
        }
        fetchReports('custom', startDate, endDate);
    };

    // Calculate aggregate summary metrics for the selected period
    const aggregatedMetrics = reports.reduce((acc, row) => {
        acc.income += (row.totalIncome || 0);
        acc.direct += (row.totalDirectExp || 0);
        acc.operating += (row.totalOperatingExp || 0);
        acc.gross += (row.grossProfit || 0);
        acc.net += (row.netProfit || 0);
        return acc;
    }, { income: 0, direct: 0, operating: 0, gross: 0, net: 0 });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Page Header */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.25rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                        <span className="badge-blue">Analytics Engine</span>
                        <span className="badge-outline">Financial Reports</span>
                    </div>
                    <h1 style={{ fontSize: '1.9rem', fontWeight: 800, margin: 0 }}>
                        Financial Performance Reports
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.3rem 0 0' }}>
                        Aggregate session logs across daily, weekly, monthly, or customized timeframe intervals.
                    </p>
                </div>

                {/* Filter Tabs */}
                <div className="tabs-container">
                    <button 
                        onClick={() => setFilter('daily')} 
                        className={`tab-btn ${filter === 'daily' ? 'active' : ''}`}
                    >
                        Today (Daily)
                    </button>
                    <button 
                        onClick={() => setFilter('weekly')} 
                        className={`tab-btn ${filter === 'weekly' ? 'active' : ''}`}
                    >
                        Last 7 Days
                    </button>
                    <button 
                        onClick={() => setFilter('monthly')} 
                        className={`tab-btn ${filter === 'monthly' ? 'active' : ''}`}
                    >
                        Last 30 Days
                    </button>
                    <button 
                        onClick={() => setFilter('custom')} 
                        className={`tab-btn ${filter === 'custom' ? 'active' : ''}`}
                    >
                        Custom Range
                    </button>
                </div>
            </div>

            {/* Custom Date Range Picker (shown when 'custom' is active) */}
            {filter === 'custom' && (
                <form 
                    onSubmit={handleApplyCustomFilter}
                    className="blue-card animate-fade-in"
                    style={{ padding: '1.25rem 1.75rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem' }}
                >
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Calendar size={16} style={{ color: 'var(--blue-500)' }} /> Date Interval:
                    </span>
                    <input 
                        type="date" 
                        required
                        value={startDate} 
                        onChange={(e) => setStartDate(e.target.value)} 
                        className="input-control"
                        style={{ width: '160px', padding: '0.5rem 0.75rem', fontSize: '0.825rem' }}
                    />
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>to</span>
                    <input 
                        type="date" 
                        required
                        value={endDate} 
                        onChange={(e) => setEndDate(e.target.value)} 
                        className="input-control"
                        style={{ width: '160px', padding: '0.5rem 0.75rem', fontSize: '0.825rem' }}
                    />
                    <button type="submit" className="btn-primary" style={{ padding: '0.55rem 1.25rem', fontSize: '0.85rem' }}>
                        Filter Sessions
                    </button>
                </form>
            )}

            {/* Aggregated Period Metrics Cards */}
            <div className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                <div className="blue-card" style={{ padding: '1.25rem 1.5rem' }}>
                    <span style={{ fontSize: '0.725rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                        Period Total Incomes
                    </span>
                    <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.4rem 0 0' }}>
                        {formatCurrency(aggregatedMetrics.income)}
                    </h3>
                    <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--blue-600)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <ArrowUpRight size={13} /> {reports.length} Recorded Sessions
                    </div>
                </div>

                <div className="blue-card" style={{ padding: '1.25rem 1.5rem' }}>
                    <span style={{ fontSize: '0.725rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                        Period Direct Expenses
                    </span>
                    <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--blue-800)', margin: '0.4rem 0 0' }}>
                        {formatCurrency(aggregatedMetrics.direct)}
                    </h3>
                    <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Wholesale & Goods Cost
                    </div>
                </div>

                <div className="blue-card" style={{ padding: '1.25rem 1.5rem' }}>
                    <span style={{ fontSize: '0.725rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                        Period Operating Exp
                    </span>
                    <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-secondary)', margin: '0.4rem 0 0' }}>
                        {formatCurrency(aggregatedMetrics.operating)}
                    </h3>
                    <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Rent, Overhead & Utilities
                    </div>
                </div>

                <div className="blue-card" style={{ padding: '1.25rem 1.5rem' }}>
                    <span style={{ fontSize: '0.725rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                        Period Gross Profit
                    </span>
                    <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--blue-600)', margin: '0.4rem 0 0' }}>
                        {formatCurrency(aggregatedMetrics.gross)}
                    </h3>
                    <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Revenue minus COGS
                    </div>
                </div>

                <div className="blue-card" style={{ 
                    padding: '1.25rem 1.5rem',
                    background: 'var(--blue-gradient-subtle)',
                    border: '2px solid var(--blue-500)'
                }}>
                    <span style={{ fontSize: '0.725rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--blue-700)' }}>
                        Period Net Profit
                    </span>
                    <h3 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0.4rem 0 0' }}>
                        {formatCurrency(aggregatedMetrics.net)}
                    </h3>
                    <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--blue-700)' }}>
                        Final Net Financial Bottom Line
                    </div>
                </div>
            </div>

            {/* Session Breakdown Table */}
            <div className="blue-card" style={{ padding: '0.5rem', overflow: 'hidden' }}>
                <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>Session Date</th>
                                <th>Status</th>
                                <th>Total Inflow</th>
                                <th>Direct Exp</th>
                                <th>Operating Exp</th>
                                <th>Gross Profit</th>
                                <th>Net Profit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        Generating financial reports...
                                    </td>
                                </tr>
                            ) : reports.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                                        <FileText size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.5, color: 'var(--blue-400)' }} />
                                        <p style={{ fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>No session reports available</p>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
                                            No business day sessions match this reporting timeframe.
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                reports.map((row) => (
                                    <tr key={row.session_id}>
                                        <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                                            {formatDate(row.date)}
                                        </td>
                                        <td>
                                            <span className={row.status === 'open' ? "badge-blue" : "badge-outline"}>
                                                {row.status === 'open' ? 'Active' : 'Closed'}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: 600, color: 'var(--blue-600)' }}>
                                            {formatCurrency(row.totalIncome)}
                                        </td>
                                        <td style={{ color: 'var(--blue-800)' }}>
                                            {formatCurrency(row.totalDirectExp)}
                                        </td>
                                        <td style={{ color: 'var(--text-secondary)' }}>
                                            {formatCurrency(row.totalOperatingExp)}
                                        </td>
                                        <td style={{ fontWeight: 700, color: 'var(--blue-600)' }}>
                                            {formatCurrency(row.grossProfit)}
                                        </td>
                                        <td style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                                            {formatCurrency(row.netProfit)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};