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
                <div className="blue-card" style={{ 
                    padding: '1.25rem 1.5rem', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between',
                    borderTop: '3px solid var(--color-income, #10b981)' 
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <span style={{ fontSize: '0.725rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-income, #10b981)' }}>
                                Period Total Inflows
                            </span>
                            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-income, #10b981)', margin: '0.4rem 0 0' }}>
                                {formatCurrency(aggregatedMetrics.income)}
                            </h3>
                        </div>
                        <div style={{
                            padding: '0.5rem',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'var(--color-income-bg)',
                            color: 'var(--color-income)',
                            border: '1px solid var(--color-income-border)'
                        }}>
                            <ArrowUpRight size={18} />
                        </div>
                    </div>
                    <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Revenue Volume</span>
                        <span className="badge-income" style={{ fontSize: '0.65rem' }}>{reports.length} Sessions</span>
                    </div>
                </div>

                <div className="blue-card" style={{ 
                    padding: '1.25rem 1.5rem', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between',
                    borderTop: '3px solid var(--color-direct-accent, #f59e0b)' 
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <span style={{ fontSize: '0.725rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-direct, #d97706)' }}>
                                Period Direct Costs
                            </span>
                            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-direct, #d97706)', margin: '0.4rem 0 0' }}>
                                {formatCurrency(aggregatedMetrics.direct)}
                            </h3>
                        </div>
                        <div style={{
                            padding: '0.5rem',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'var(--color-direct-bg)',
                            color: 'var(--color-direct)',
                            border: '1px solid var(--color-direct-border)'
                        }}>
                            <ArrowDownRight size={18} />
                        </div>
                    </div>
                    <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Wholesale & Stock</span>
                        <span className="badge-direct" style={{ fontSize: '0.65rem' }}>Direct Cost</span>
                    </div>
                </div>

                <div className="blue-card" style={{ 
                    padding: '1.25rem 1.5rem', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between',
                    borderTop: '3px solid var(--color-operating, #ef4444)' 
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <span style={{ fontSize: '0.725rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-operating, #ef4444)' }}>
                                Period Operating Exp
                            </span>
                            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-operating, #ef4444)', margin: '0.4rem 0 0' }}>
                                {formatCurrency(aggregatedMetrics.operating)}
                            </h3>
                        </div>
                        <div style={{
                            padding: '0.5rem',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'var(--color-operating-bg)',
                            color: 'var(--color-operating)',
                            border: '1px solid var(--color-operating-border)'
                        }}>
                            <Layers size={18} />
                        </div>
                    </div>
                    <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rent, Power, Wages</span>
                        <span className="badge-operating" style={{ fontSize: '0.65rem' }}>Overhead</span>
                    </div>
                </div>

                <div className="blue-card" style={{ 
                    padding: '1.25rem 1.5rem', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between',
                    borderTop: '3px solid var(--color-gross, #2563eb)' 
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <span style={{ fontSize: '0.725rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-gross, #2563eb)' }}>
                                Period Gross Profit
                            </span>
                            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-gross, #2563eb)', margin: '0.4rem 0 0' }}>
                                {formatCurrency(aggregatedMetrics.gross)}
                            </h3>
                        </div>
                        <div style={{
                            padding: '0.5rem',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'var(--color-gross-bg)',
                            color: 'var(--color-gross)',
                            border: '1px solid var(--color-gross-border)'
                        }}>
                            <TrendingUp size={18} />
                        </div>
                    </div>
                    <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Inflow - COGS</span>
                        <span className="badge-gross" style={{ fontSize: '0.65rem' }}>Trading Margin</span>
                    </div>
                </div>

                {(() => {
                    const isNetPos = (aggregatedMetrics.net || 0) >= 0;
                    return (
                        <div className="blue-card" style={{ 
                            padding: '1.25rem 1.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            backgroundColor: isNetPos ? 'var(--color-income-bg)' : 'var(--color-operating-bg)',
                            border: isNetPos ? '2px solid var(--color-income, #10b981)' : '2px solid var(--color-operating, #ef4444)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <span style={{ 
                                        fontSize: '0.725rem', 
                                        fontWeight: 800, 
                                        textTransform: 'uppercase', 
                                        color: isNetPos ? 'var(--color-income, #10b981)' : 'var(--color-operating, #ef4444)' 
                                    }}>
                                        {isNetPos ? 'Period Net Profit' : 'Period Net Loss'}
                                    </span>
                                    <h3 style={{ 
                                        fontSize: '1.75rem', 
                                        fontWeight: 900, 
                                        color: isNetPos ? 'var(--color-income, #10b981)' : 'var(--color-operating, #ef4444)', 
                                        margin: '0.4rem 0 0' 
                                    }}>
                                        {formatCurrency(aggregatedMetrics.net)}
                                    </h3>
                                </div>
                                <div style={{
                                    padding: '0.5rem',
                                    borderRadius: 'var(--radius-md)',
                                    background: isNetPos 
                                        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                                        : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                    color: '#ffffff',
                                    boxShadow: isNetPos 
                                        ? '0 4px 12px rgba(16, 185, 129, 0.4)' 
                                        : '0 4px 12px rgba(239, 68, 68, 0.4)'
                                }}>
                                    <DollarSign size={18} />
                                </div>
                            </div>
                            <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: isNetPos ? 'var(--color-income, #10b981)' : 'var(--color-operating, #ef4444)' }}>
                                    Gross - Operating
                                </span>
                                <span className={isNetPos ? "badge-income" : "badge-operating"} style={{ fontSize: '0.65rem' }}>
                                    {isNetPos ? 'Net Surplus' : 'Net Deficit'}
                                </span>
                            </div>
                        </div>
                    );
                })()}
            </div>

            {/* Session Breakdown Table */}
            <div className="blue-card" style={{ padding: '0.5rem', overflow: 'hidden' }}>
                <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>Session Date</th>
                                <th>Status</th>
                                <th style={{ color: 'var(--color-income, #10b981)' }}>Total Inflow</th>
                                <th style={{ color: 'var(--color-direct, #d97706)' }}>Direct Exp</th>
                                <th style={{ color: 'var(--color-operating, #ef4444)' }}>Operating Exp</th>
                                <th style={{ color: 'var(--color-gross, #2563eb)' }}>Gross Profit</th>
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
                                reports.map((row) => {
                                    const isRowNetPos = (row.netProfit || 0) >= 0;
                                    return (
                                        <tr key={row.session_id}>
                                            <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                                                {formatDate(row.date)}
                                            </td>
                                            <td>
                                                <span className={row.status === 'open' ? "badge-income" : "badge-outline"}>
                                                    {row.status === 'open' ? 'Active Session' : 'Closed & Locked'}
                                                </span>
                                            </td>
                                            <td style={{ fontWeight: 700, color: 'var(--color-income, #10b981)' }}>
                                                +{formatCurrency(row.totalIncome)}
                                            </td>
                                            <td style={{ fontWeight: 700, color: 'var(--color-direct, #d97706)' }}>
                                                -{formatCurrency(row.totalDirectExp)}
                                            </td>
                                            <td style={{ fontWeight: 700, color: 'var(--color-operating, #ef4444)' }}>
                                                -{formatCurrency(row.totalOperatingExp)}
                                            </td>
                                            <td style={{ fontWeight: 800, color: 'var(--color-gross, #2563eb)' }}>
                                                {formatCurrency(row.grossProfit)}
                                            </td>
                                            <td style={{ 
                                                fontWeight: 800, 
                                                color: isRowNetPos ? 'var(--color-income, #10b981)' : 'var(--color-operating, #ef4444)', 
                                                fontSize: '0.95rem' 
                                            }}>
                                                {isRowNetPos ? '+' : ''}{formatCurrency(row.netProfit)}
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