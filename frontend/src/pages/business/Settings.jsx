import React, { useState, useEffect, useContext } from 'react';
import API from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { 
    Building2, 
    Camera, 
    Lock, 
    Save, 
    CheckCircle2, 
    AlertCircle, 
    Shield, 
    Sparkles, 
    Eye, 
    EyeOff 
} from 'lucide-react';

export const Settings = () => {
    const { updateBusinessProfile, businessName: currentContextName } = useContext(AuthContext);

    const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'security'
    const [name, setName] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPw, setShowCurrentPw] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);

    const [logo, setLogo] = useState(null);
    const [logoPreview, setLogoPreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        API.get('/business/settings').then(res => {
            setName(res.data.name || '');
            if (res.data.logo_url) {
                setLogoPreview(`http://localhost:5000${res.data.logo_url}`);
            }
        }).catch(err => {
            console.error("Failed to load settings:", err);
        });
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSuccessMessage('');
        setError('');

        if (activeTab === 'security') {
            if (!currentPassword) {
                setError("Please enter your current password to set a new password.");
                return;
            }
            if (newPassword !== confirmPassword) {
                setError("New passwords do not match. Please re-enter.");
                return;
            }
            if (newPassword.length < 6) {
                setError("New password must be at least 6 characters.");
                return;
            }
        }

        setLoading(true);
        const formData = new FormData();
        if (name) formData.append('name', name);
        if (currentPassword) formData.append('currentPassword', currentPassword);
        if (newPassword) formData.append('newPassword', newPassword);
        if (logo) formData.append('logo', logo);

        try {
            const res = await API.put('/business/settings', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSuccessMessage(res.data.message || "Settings updated successfully.");
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');

            // Sync with global context immediately
            updateBusinessProfile(name, logo ? logoPreview : undefined);
            setTimeout(() => setSuccessMessage(''), 4000);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to update business settings.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '960px' }}>
            {/* Header */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <span className="badge-blue">System Settings</span>
                    <span className="badge-outline">Organization Config</span>
                </div>
                <h1 style={{ fontSize: '1.9rem', fontWeight: 800, margin: 0 }}>
                    Business & Account Settings
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.3rem 0 0' }}>
                    Customize your business storefront branding, public name, and administrative security.
                </p>
            </div>

            {/* Notification Messages */}
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

            {error && (
                <div className="animate-fade-in" style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-main)',
                    borderLeft: '4px solid var(--blue-700)',
                    padding: '1rem 1.5rem',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    color: 'var(--text-primary)'
                }}>
                    <AlertCircle size={20} style={{ color: 'var(--blue-700)', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{error}</span>
                </div>
            )}

            {/* Navigation Tabs */}
            <div className="tabs-container">
                <button 
                    onClick={() => setActiveTab('profile')}
                    className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                >
                    <Building2 size={16} /> Store Profile & Logo
                </button>
                <button 
                    onClick={() => setActiveTab('security')}
                    className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
                >
                    <Lock size={16} /> Security & Password
                </button>
            </div>

            {/* Form Section */}
            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {activeTab === 'profile' && (
                    <div className="blue-card animate-fade-in" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                        {/* Logo Upload & Live Preview */}
                        <div>
                            <label className="input-label" style={{ marginBottom: '0.75rem', display: 'block' }}>
                                Business Storefront Logo / Photo
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                                <div style={{
                                    width: '84px',
                                    height: '84px',
                                    borderRadius: 'var(--radius-lg)',
                                    backgroundColor: 'var(--bg-subtle)',
                                    border: '2px dashed var(--border-main)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden',
                                    position: 'relative'
                                }}>
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="Logo Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <Building2 size={36} style={{ color: 'var(--blue-400)' }} />
                                    )}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label className="btn-secondary" style={{ cursor: 'pointer', width: 'fit-content' }}>
                                        <Camera size={16} /> Choose Image File
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    setLogo(file);
                                                    setLogoPreview(URL.createObjectURL(file));
                                                }
                                            }}
                                        />
                                    </label>
                                    <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                                        PNG, JPG or SVG formats up to 5MB.
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Business Name */}
                        <div className="input-group">
                            <label className="input-label">Registered Business Name</label>
                            <input 
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Apex Hardware Supplies"
                                className="input-control"
                            />
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                This name displays in the top navigation, invoices, and live dashboard header.
                            </span>
                        </div>

                        {/* Live Branding Preview Card */}
                        <div style={{
                            padding: '1.25rem',
                            backgroundColor: 'var(--bg-base)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-subtle)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <Sparkles size={16} style={{ color: 'var(--blue-500)' }} />
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                                    Live Branding Preview
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{
                                    width: '38px',
                                    height: '38px',
                                    borderRadius: 'var(--radius-md)',
                                    background: 'var(--blue-gradient)',
                                    color: '#ffffff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden'
                                }}>
                                    {logoPreview ? <img src={logoPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Building2 size={18} />}
                                </div>
                                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                                    {name || 'Your Business Name'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="blue-card animate-fade-in" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <Shield size={20} style={{ color: 'var(--blue-500)' }} />
                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                                    Change Account Password
                                </h3>
                                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
                                    Update your business credentials to maintain authorized access.
                                </p>
                            </div>
                        </div>

                        {/* Current Password */}
                        <div className="input-group">
                            <label className="input-label">Current Password</label>
                            <div style={{ position: 'relative' }}>
                                <input 
                                    type={showCurrentPw ? "text" : "password"}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="input-control"
                                    style={{ paddingRight: '2.5rem' }}
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                                >
                                    {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* New Password & Confirm */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                            <div className="input-group">
                                <label className="input-label">New Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input 
                                        type={showNewPw ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="input-control"
                                        style={{ paddingRight: '2.5rem' }}
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowNewPw(!showNewPw)}
                                        style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                                    >
                                        {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="input-group">
                                <label className="input-label">Confirm New Password</label>
                                <input 
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="input-control"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Submit button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="btn-primary"
                        style={{ padding: '0.75rem 2rem' }}
                    >
                        <Save size={17} /> {loading ? 'Saving Changes...' : 'Save Settings'}
                    </button>
                </div>
            </form>
        </div>
    );
};