import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Camera, Lock, Save, Building } from 'lucide-react';

export const Settings = () => {
    const [name, setName] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [logo, setLogo] = useState(null);
    const [logoPreview, setLogoPreview] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        API.get('/business/settings').then(res => {
            setName(res.data.name || '');
            if (res.data.logo_url) {
                setLogoPreview(`http://localhost:5000${res.data.logo_url}`);
            }
        }).catch(err => console.error(err));
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        const formData = new FormData();
        formData.append('name', name);
        if (currentPassword) formData.append('currentPassword', currentPassword);
        if (newPassword) formData.append('newPassword', newPassword);
        if (logo) formData.append('logo', logo);

        try {
            const res = await API.put('/business/settings', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMessage(res.data.message);
            setCurrentPassword('');
            setNewPassword('');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update settings.');
        }
    };

    return (
        <div className="p-8 max-w-3xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h1 className="text-2xl font-bold text-slate-900">Business Settings</h1>
                <p className="text-sm text-slate-500">Manage your business profile, branding, and security credentials</p>
            </div>

            {message && <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm">{message}</div>}
            {error && <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm">{error}</div>}

            <form onSubmit={handleUpdate} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                {/* Profile Photo / Logo Upload */}
                <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                        {logoPreview ? (
                            <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                            <Building className="text-slate-400" size={32} />
                        )}
                    </div>
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Business Logo / Photo</label>
                        <input type="file" accept="image/*" onChange={e => { setLogo(e.target.files[0]); setLogoPreview(URL.createObjectURL(e.target.files[0])); }} className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800" />
                    </div>
                </div>

                <hr className="border-slate-100" />

                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Business Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Current Password (Required for Password Change)</label>
                        <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="••••••••" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">New Password</label>
                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900" />
                    </div>
                </div>

                <button type="submit" className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors">
                    <Save size={16} /> Save Changes
                </button>
            </form>
        </div>
    );
};