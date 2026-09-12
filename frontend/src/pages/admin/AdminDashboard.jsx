import React, { useState, useEffect, useCallback } from 'react';
import API from '../../services/api';
import { Modal } from '../../components/common/Modal';
import { formatDate } from '../../utils/formatters';
import { 
    Building2, 
    UserPlus, 
    Shield, 
    Archive, 
    Search, 
    CheckCircle2, 
    AlertCircle, 
    FileText, 
    Calendar, 
    Layers, 
    Users,
    ExternalLink
} from 'lucide-react';

export const AdminDashboard = () => {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [tabFilter, setTabFilter] = useState('all'); // 'all', 'active', 'archived'

    // Modal: Register Business
    const [registerModal, setRegisterModal] = useState(false);
    const [newBizName, setNewBizName] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [registerLoading, setRegisterLoading] = useState(false);

    // Modal: Tenant Reports inspection
    const [reportsModal, setReportsModal] = useState(false);
    const [selectedTenantReport, setSelectedTenantReport] = useState(null);
    const [reportsLoading, setReportsLoading] = useState(false);

    // Notifications
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

    const fetchAdminDashboard = useCallback(async () => {
        try {
            const res = await API.get('/admin/dashboard');
            setDashboard(res.data);
        } catch (err) {
            console.error("Failed to load admin metrics:", err);
            setStatusMessage({ type: 'error', text: err.response?.data?.error || 'Failed to fetch admin metrics.' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAdminDashboard();
    }, [fetchAdminDashboard]);

    // Handle Business Registration
    const handleRegisterBusiness = async (e) => {
        e.preventDefault();
        setRegisterLoading(true);
        try {
            await API.post('/admin/businesses', {
                name: newBizName,
                username: newUsername,
                password: newPassword
            });
            setNewBizName('');
            setNewUsername('');
            setNewPassword('');
            setRegisterModal(false);
            setStatusMessage({ type: 'success', text: `New business "${newBizName}" onboarded successfully.` });
            setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000);
            await fetchAdminDashboard();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to register business tenant.');
        } finally {
            setRegisterLoading(false);
        }
    };

    // Handle Archive Business
    const handleArchive = async (businessId, bizName) => {
        if (!window.confirm(`Are you sure you want to archive "${bizName}"? Tenant login will be permanently disabled.`)) {
            return;
        }
        try {
            await API.patch(`/admin/businesses/${businessId}/archive`);
            setStatusMessage({ type: 'success', text: `Business "${bizName}" has been safely archived.` });
            setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000);
            await fetchAdminDashboard();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to archive business.');
        }
    };

    // View Tenant Financial / Session History
    const handleViewReports = async (businessId) => {
        setReportsLoading(true);
        setReportsModal(true);
        try {
            const res = await API.get(`/admin/businesses/${businessId}/reports`);
            setSelectedTenantReport(res.data);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to load business session records.');
            setReportsModal(false);
        } finally {
            setReportsLoading(false);
        }
    };

    const businesses = dashboard?.businesses || [];

    // Filter by Tab and Search
    const filteredBusinesses = businesses.filter(b => {
        if (tabFilter === 'active' && b.is_archived) return false;
        if (tabFilter === 'archived' && !b.is_archived) return false;

        const query = search.toLowerCase();
        const nameMatch = (b.name || '').toLowerCase().includes(query);
        const userMatch = (b.username || '').toLowerCase().includes(query);
        return nameMatch || userMatch;
    });

    const totalBusinesses = dashboard?.totalBusinesses || businesses.length;
    const archivedCount = businesses.filter(b => b.is_archived).length;
    const activeCount = totalBusinesses - archivedCount;
    const totalSessions = businesses.reduce((acc, b) => acc + parseInt(b.total_sessions || 0), 0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Header Section */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.25rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                        <span className="badge-blue">
                            <Shield size={13} /> Global Control
                        </span>
                        <span className="badge-outline">Multi-Tenant Management</span>
                    </div>
                    <h1 style={{ fontSize: '1.9rem', fontWeight: 800, margin: 0 }}>
                        Super Admin Center
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.3rem 0 0' }}>
                        Provision new retail businesses, monitor session counts, and audit tenant records.
                    </p>
                </div>

                {/* Primary Action: Register New Business */}
                <button 
                    onClick={() => setRegisterModal(true)}
                    className="btn-primary"
                    style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem' }}
                >
                    <UserPlus size={18} /> Register New Business
                </button>
            </div>

            {/* Notification alert */}
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

            {/* Platform Metrics Cards */}
            <div className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem' }}>
                <div className="blue-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <span style={{ fontSize: '0.725rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                                Total Businesses
                            </span>
                            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.35rem 0 0' }}>
                                {totalBusinesses}
                            </h2>
                        </div>
                        <div style={{ padding: '0.65rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--blue-100)', color: 'var(--blue-600)' }}>
                            <Building2 size={20} />
                        </div>
                    </div>
                    <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Registered platform accounts
                    </div>
                </div>

                <div className="blue-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <span style={{ fontSize: '0.725rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                                Active Tenants
                            </span>
                            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--blue-600)', margin: '0.35rem 0 0' }}>
                                {activeCount}
                            </h2>
                        </div>
                        <div style={{ padding: '0.65rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-subtle)', color: 'var(--blue-600)' }}>
                            <CheckCircle2 size={20} />
                        </div>
                    </div>
                    <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Operational retail stores
                    </div>
                </div>

                <div className="blue-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <span style={{ fontSize: '0.725rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                                Archived Accounts
                            </span>
                            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-secondary)', margin: '0.35rem 0 0' }}>
                                {archivedCount}
                            </h2>
                        </div>
                        <div style={{ padding: '0.65rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-subtle)', color: 'var(--text-muted)' }}>
                            <Archive size={20} />
                        </div>
                    </div>
                    <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Decommissioned organizations
                    </div>
                </div>

                <div className="blue-card" style={{ padding: '1.5rem', background: 'var(--blue-gradient-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <span style={{ fontSize: '0.725rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--blue-700)' }}>
                                Day Sessions Processed
                            </span>
                            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0.35rem 0 0' }}>
                                {totalSessions}
                            </h2>
                        </div>
                        <div style={{ padding: '0.65rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--blue-600)', color: '#ffffff' }}>
                            <Calendar size={20} />
                        </div>
                    </div>
                    <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-main)', fontSize: '0.75rem', color: 'var(--blue-700)', fontWeight: 600 }}>
                        Total days recorded across tenants
                    </div>
                </div>
            </div>

            {/* Filter Bar & Search */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                <div className="tabs-container">
                    <button 
                        onClick={() => setTabFilter('all')}
                        className={`tab-btn ${tabFilter === 'all' ? 'active' : ''}`}
                    >
                        All Tenants ({businesses.length})
                    </button>
                    <button 
                        onClick={() => setTabFilter('active')}
                        className={`tab-btn ${tabFilter === 'active' ? 'active' : ''}`}
                    >
                        Active ({activeCount})
                    </button>
                    <button 
                        onClick={() => setTabFilter('archived')}
                        className={`tab-btn ${tabFilter === 'archived' ? 'active' : ''}`}
                    >
                        Archived ({archivedCount})
                    </button>
                </div>

                <div style={{ position: 'relative', width: '300px', maxWidth: '100%' }}>
                    <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--blue-400)' }} />
                    <input 
                        type="text"
                        placeholder="Search business or username..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input-control"
                        style={{ paddingLeft: '2.5rem', borderRadius: 'var(--radius-full)' }}
                    />
                </div>
            </div>

            {/* Tenants Table */}
            <div className="blue-card" style={{ padding: '0.5rem', overflow: 'hidden' }}>
                <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>Business Storefront</th>
                                <th>Admin User</th>
                                <th>Total Sessions</th>
                                <th>Created On</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        Loading registered businesses...
                                    </td>
                                </tr>
                            ) : filteredBusinesses.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                                        <Building2 size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.5, color: 'var(--blue-400)' }} />
                                        <p style={{ fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>No matching tenants</p>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
                                            Try adjusting your filter or search query.
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filteredBusinesses.map((biz) => {
                                    const isArchived = biz.is_archived;
                                    return (
                                        <tr key={biz.id}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <div style={{
                                                        width: '38px',
                                                        height: '38px',
                                                        borderRadius: 'var(--radius-md)',
                                                        backgroundColor: 'var(--bg-subtle)',
                                                        border: '1px solid var(--border-subtle)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'var(--blue-600)',
                                                        fontWeight: 800
                                                    }}>
                                                        {biz.name?.charAt(0)?.toUpperCase() || 'B'}
                                                    </div>
                                                    <div>
                                                        <span style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>
                                                            {biz.name}
                                                        </span>
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                            Tenant ID: #{biz.id}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ fontWeight: 600, color: 'var(--blue-600)' }}>
                                                {biz.username || 'No user assigned'}
                                            </td>
                                            <td>
                                                <span className="badge-outline">
                                                    {biz.total_sessions || 0} Sessions
                                                </span>
                                            </td>
                                            <td style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>
                                                {formatDate(biz.created_at)}
                                            </td>
                                            <td>
                                                <span className={isArchived ? "badge-outline" : "badge-blue"}>
                                                    {isArchived ? 'Archived' : 'Active'}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                                                    <button 
                                                        onClick={() => handleViewReports(biz.id)}
                                                        className="btn-secondary"
                                                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.775rem' }}
                                                        title="Inspect session history"
                                                    >
                                                        <FileText size={14} /> Sessions
                                                    </button>
                                                    {!isArchived && (
                                                        <button 
                                                            onClick={() => handleArchive(biz.id, biz.name)}
                                                            className="btn-icon"
                                                            style={{ padding: '0.4rem' }}
                                                            title="Archive Tenant"
                                                        >
                                                            <Archive size={15} style={{ color: 'var(--blue-700)' }} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL: Register New Business */}
            <Modal 
                isOpen={registerModal} 
                onClose={() => setRegisterModal(false)} 
                title="Register New Retail Business"
                footer={
                    <>
                        <button type="button" onClick={() => setRegisterModal(false)} className="btn-outline">
                            Cancel
                        </button>
                        <button type="submit" form="register-form" disabled={registerLoading} className="btn-primary">
                            Create Business Account
                        </button>
                    </>
                }
            >
                <form id="register-form" onSubmit={handleRegisterBusiness} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="input-group">
                        <label className="input-label">Business Organization Name</label>
                        <input 
                            type="text"
                            required
                            placeholder="e.g. Skyline Supermarket"
                            value={newBizName}
                            onChange={(e) => setNewBizName(e.target.value)}
                            className="input-control"
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Business Admin Username</label>
                        <input 
                            type="text"
                            required
                            placeholder="e.g. skyline_admin"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            className="input-control"
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Initial Access Password</label>
                        <input 
                            type="password"
                            required
                            placeholder="••••••••"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="input-control"
                        />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            The business user can modify this password later from their settings.
                        </span>
                    </div>
                </form>
            </Modal>

            {/* MODAL: Tenant Session History & Reports */}
            <Modal isOpen={reportsModal} onClose={() => setReportsModal(false)} title="Tenant Session Log & Reports" maxWidth="680px">
                {reportsLoading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        Fetching session history...
                    </div>
                ) : selectedTenantReport ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div style={{ padding: '1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                <span className="badge-blue">Tenant Information</span>
                            </div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                                {selectedTenantReport.business?.name}
                            </h3>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
                                Account created: {formatDate(selectedTenantReport.business?.created_at)}
                            </p>
                        </div>

                        <div>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                                Historical Day Sessions ({selectedTenantReport.sessions?.length || 0})
                            </h4>

                            {selectedTenantReport.sessions?.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No daily sessions have been started by this business yet.</p>
                            ) : (
                                <div className="table-container" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                                    <table className="custom-table">
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Status</th>
                                                <th>Opened At</th>
                                                <th>Closed At</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedTenantReport.sessions?.map((sess) => (
                                                <tr key={sess.id}>
                                                    <td style={{ fontWeight: 700 }}>{sess.session_date}</td>
                                                    <td>
                                                        <span className={sess.status === 'open' ? "badge-blue" : "badge-outline"}>
                                                            {sess.status}
                                                        </span>
                                                    </td>
                                                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                        {sess.opened_at ? new Date(sess.opened_at).toLocaleTimeString() : '—'}
                                                    </td>
                                                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                        {sess.closed_at ? new Date(sess.closed_at).toLocaleTimeString() : 'Active'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                            <button onClick={() => setReportsModal(false)} className="btn-secondary">
                                Done
                            </button>
                        </div>
                    </div>
                ) : null}
            </Modal>
        </div>
    );
};