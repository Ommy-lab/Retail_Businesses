import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Building, UserPlus, ShieldAlert, ShieldCheck, Archive, DollarSign, Activity } from 'lucide-react';

export const AdminDashboard = () => {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(false);
    const [search, setSearch] = useState('');
    
    // New Business Form State
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const fetchDashboard = async () => {
        try {
            const res = await API.get('/admin/dashboard');
            setDashboard(res.data);
        } catch (err) {
            console.error("Failed to load admin metrics:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    const handleCreateBusiness = async (e) => {
        e.preventDefault();
        try {
            await API.post('/admin/businesses', { name, username, password });
            setName(''); setUsername(''); setPassword('');
            setModal(false);
            fetchDashboard();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to create business.');
        }
    };

    const handleToggleStatus = async (businessId, currentStatus) => {
        try {
            await API.patch(`/admin/businesses/${businessId}/status`, { is_active: !currentStatus });
            fetchDashboard();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to update tenant status.');
        }
    };

    const handleArchive = async (businessId) => {
        if (!window.confirm("Are you sure you want to archive this tenant? Access will be permanently disabled.")) return;
        try {
            await API.patch(`/admin/businesses/${businessId}/archive`);
            fetchDashboard();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to archive tenant.');
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading platform analytics...</div>;

    const businesses = dashboard?.businesses || [];
    const filteredBusinesses = businesses.filter(b => 
        b.name?.toLowerCase().includes(search.toLowerCase()) || 
        b.username?.toLowerCase().includes(search.toLowerCase())
    );

    const activeCount = businesses.filter(b => b.is_active).length;
    const suspendedCount = businesses.length - activeCount;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Super Admin Control Center</h1>
                    <p className="text-sm text-slate-500">Monitor multi-tenant activity, platform statistics, and status controls</p>
                </div>
                <button onClick={() => setModal(true)} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
                    <UserPlus size={16} /> Register New Business
                </button>
            </div>

            {/* Global Metric Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Businesses</p>
                        <Building size={18} className="text-slate-400" />
                    </div>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{dashboard?.totalBusinesses || 0}</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Tenants</p>
                        <ShieldCheck size={18} className="text-emerald-500" />
                    </div>
                    <p className="text-3xl font-bold text-emerald-600 mt-2">{activeCount}</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Suspended Tenants</p>
                        <ShieldAlert size={18} className="text-rose-500" />
                    </div>
                    <p className="text-3xl font-bold text-rose-600 mt-2">{suspendedCount}</p>
                </div>
            </div>

            {/* Businesses Management Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden space-y-4">
                <div className="p-6 pb-0 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-900">Tenant Directory</h2>
                    <input 
                        type="text" 
                        placeholder="Search tenants..." 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                                <th className="p-4">Business Name</th>
                                <th className="p-4">Admin Username</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Total Sessions</th>
                                <th className="p-4">Created At</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                            {filteredBusinesses.length === 0 ? (
                                <tr><td colSpan="6" className="p-6 text-center text-slate-400">No matching business tenants found.</td></tr>
                            ) : (
                                filteredBusinesses.map((b) => (
                                    <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4 font-medium text-slate-900 flex items-center gap-2">
                                            <Building size={16} className="text-slate-400" /> {b.name}
                                        </td>
                                        <td className="p-4">{b.username || 'N/A'}</td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                                                b.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                            }`}>
                                                {b.is_active ? 'Active' : 'Suspended'}
                                            </span>
                                        </td>
                                        <td className="p-4">{b.total_sessions}</td>
                                        <td className="p-4 text-slate-500">{new Date(b.created_at).toLocaleDateString()}</td>
                                        <td className="p-4 text-right space-x-2">
                                            <button 
                                                onClick={() => handleToggleStatus(b.id, b.is_active)} 
                                                className={`px-3 py-1 rounded-lg text-xs font-medium ${b.is_active ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                                            >
                                                {b.is_active ? 'Suspend' : 'Activate'}
                                            </button>
                                            <button 
                                                onClick={() => handleArchive(b.id)} 
                                                className="px-3 py-1 rounded-lg text-xs font-medium bg-rose-50 text-rose-700 hover:bg-rose-100"
                                            >
                                                Archive
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Register Business Modal */}
            {modal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <form onSubmit={handleCreateBusiness} className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4">
                        <h3 className="text-lg font-bold text-slate-900">Register New Business Tenant</h3>
                        <input type="text" placeholder="Business Name" value={name} onChange={e => setName(e.target.value)} required className="w-full p-2.5 border rounded-lg text-sm" />
                        <input type="text" placeholder="Admin Username" value={username} onChange={e => setUsername(e.target.value)} required className="w-full p-2.5 border rounded-lg text-sm" />
                        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full p-2.5 border rounded-lg text-sm" />
                        <div className="flex justify-end gap-2 pt-2">
                            <button type="button" onClick={() => setModal(false)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium">Create Business</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};