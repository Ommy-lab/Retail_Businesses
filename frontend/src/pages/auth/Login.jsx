import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import API from '../../services/api';
import { 
    Lock, 
    User, 
    Loader2, 
    Store, 
    Shield, 
    Eye, 
    EyeOff, 
    Sun, 
    Moon,
    ArrowRight,
    AlertCircle
} from 'lucide-react';

export const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useContext(AuthContext);
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await API.post('/auth/login', { username, password });
            const { token, user } = response.data;

            login(user, token);

            if (user.role === 'super_admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/business/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Authentication failed. Please verify credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-base)',
            padding: '1.5rem',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Ambient Animated Blue Glow Elements */}
            <div style={{
                position: 'absolute',
                top: '-15%',
                left: '-10%',
                width: '500px',
                height: '500px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(37, 99, 235, 0.2) 0%, transparent 70%)',
                pointerEvents: 'none'
            }} />
            <div style={{
                position: 'absolute',
                bottom: '-20%',
                right: '-10%',
                width: '600px',
                height: '600px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.18) 0%, transparent 70%)',
                pointerEvents: 'none'
            }} />

            {/* Top Right Theme Toggle */}
            <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}>
                <button 
                    onClick={toggleTheme}
                    className="btn-icon"
                    title={isDark ? "Light Mode" : "Dark Mode"}
                    style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-full)' }}
                >
                    {isDark ? <Sun size={18} style={{ color: '#ffffff' }} /> : <Moon size={18} style={{ color: 'var(--blue-700)' }} />}
                </button>
            </div>

            {/* Card Container */}
            <div 
                className="blue-card animate-scale-in"
                style={{
                    width: '100%',
                    maxWidth: '440px',
                    padding: '2.5rem',
                    boxShadow: 'var(--blue-card-hover)',
                    position: 'relative',
                    zIndex: 10
                }}
            >
                {/* Brand Logo & Heading */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '54px',
                        height: '54px',
                        borderRadius: 'var(--radius-lg)',
                        background: 'var(--blue-gradient)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        boxShadow: '0 8px 20px rgba(37, 99, 235, 0.4)',
                        marginBottom: '1rem'
                    }}>
                        <Store size={28} />
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                        Retail<span style={{ color: 'var(--blue-500)' }}>Pulse</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0.4rem 0 0' }}>
                        Multi-Tenant Financial & Session Management
                    </p>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="animate-fade-in" style={{
                        backgroundColor: 'var(--bg-subtle)',
                        border: '1px solid var(--blue-300)',
                        borderLeft: '4px solid var(--blue-600)',
                        padding: '0.85rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        marginBottom: '1.5rem',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem'
                    }}>
                        <AlertCircle size={18} style={{ color: 'var(--blue-600)', flexShrink: 0 }} />
                        <span>{error}</span>
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {/* Username Input */}
                    <div className="input-group">
                        <label className="input-label">Account Username</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--blue-400)' }} />
                            <input 
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter username"
                                className="input-control"
                                style={{ paddingLeft: '2.6rem' }}
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="input-group">
                        <label className="input-label">Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--blue-400)' }} />
                            <input 
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="input-control"
                                style={{ paddingLeft: '2.6rem', paddingRight: '2.6rem' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Sign In Button */}
                    <button 
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                        style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', fontSize: '0.95rem' }}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" /> Verifying...
                            </>
                        ) : (
                            <>
                                Sign In to Portal <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                {/* Footer Notes */}
                <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', margin: 0 }}>
                        Powered by Secure JWT Authentication & PostgreSQL
                    </p>
                </div>
            </div>
        </div>
    );
};