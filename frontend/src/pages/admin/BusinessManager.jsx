import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { Building, ArrowLeft, Shield, DollarSign, Calendar, Lock } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const BusinessManager = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [business, setBusiness] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newPassword, setNewPassword] = useState('');

    const fetchTenantDetails = async () => {
        try {
            const res = await API.get(`/admin/businesses/${id}`);
            setBusiness(res.data);
        } catch (err) {
            console.error("Failed to load business details:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTenantDetails();
    }, [id]);

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!newPassword) return;
        try {
            await API.patch(`/admin/businesses/${id}/password`, { newPassword });
            setNewPassword('');
            alert('Business admin password reset successfully.');
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to reset password.');
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading business tenant profile...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <button 
                onClick={() => navigate('/admin/dashboard')}
                className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
                <ArrowLeft size={16} /> Back to Dashboard
            </button>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-700 font-bold text-xl">
                        {business?.name?.charAt(0) || <Building size={24} />}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{business?.name}</h1>
                        <p className="text-sm text-slate-500">Admin Username: <span className="font-semibold text-slate-700">{business?.username}</span></p>
                    </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                    business?.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                }`}>
                    {business?.is_active ? 'Active Tenant' : 'Suspended'}
                </span>
            </div>

            {/* Tenant Actions / Settings Override */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Lock size={18} className="text-slate-400" /> Reset Tenant Password
                    </h2>
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <input 
                            type="password" 
                            placeholder="New Admin Password" 
                            value={newPassword} 
                            onChange={e => setNewPassword(e.target.value)} 
                            required 
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" 
                        />
                        <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
                            Update Password
                        </button>
                    </form>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Shield size={18} className="text-slate-400" /> Tenant Meta Information
                    </h2>
                    <div className="space-y-3 text-sm text-slate-600">
                        <div className="flex justify-between py-2 border-b border-slate-50">
                            <span>Account Created:</span>
                            <span className="font-medium text-slate-900">{formatDate(business?.created_at)}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-50">
                            <span>Total Registered Sessions:</span>
                            <span className="font-medium text-slate-900">{business?.total_sessions || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};