import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Clock, Calendar, Sun, Moon, Building2, Shield, Menu } from 'lucide-react';

export const Header = ({ onToggleMobileSidebar }) => {
    const { user, businessName, businessLogo } = useContext(AuthContext);
    const { isDark, toggleTheme } = useTheme();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Formatted date and time
    const dayName = currentTime.toLocaleDateString('en-US', { weekday: 'short' });
    const formattedDate = currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const formattedTime = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

    const isSuperAdmin = user?.role === 'super_admin';
    const displayName = isSuperAdmin ? 'Super Admin' : businessName;

    return (
        <header className="header-content" style={{
            height: '72px',
            backgroundColor: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-main)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1.75rem',
            position: 'sticky',
            top: 0,
            zIndex: 40,
            boxShadow: 'var(--blue-card-glow)',
            transition: 'all var(--transition-normal)'
        }}>
            {/* Left: Mobile Trigger & Business Name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                {/* Mobile Hamburger Button */}
                <button 
                    onClick={onToggleMobileSidebar}
                    className="btn-icon mobile-menu-btn"
                    style={{ padding: '0.55rem', border: '1px solid var(--border-main)' }}
                    aria-label="Open navigation menu"
                >
                    <Menu size={20} style={{ color: 'var(--blue-600)' }} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--blue-gradient)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                        overflow: 'hidden',
                        flexShrink: 0
                    }}>
                        {businessLogo ? (
                            <img 
                                src={`http://localhost:5000${businessLogo}`} 
                                alt="Logo" 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            />
                        ) : isSuperAdmin ? (
                            <Shield size={20} />
                        ) : (
                            <Building2 size={20} />
                        )}
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <h2 style={{
                                fontSize: '1.05rem',
                                fontWeight: 800,
                                color: 'var(--text-primary)',
                                margin: 0,
                                letterSpacing: '-0.02em',
                                maxWidth: '180px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                {displayName}
                            </h2>
                            <span className="badge-blue" style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem' }}>
                                {isSuperAdmin ? 'Admin' : 'Active'}
                            </span>
                        </div>
                        <p className="header-user-text" style={{
                            fontSize: '0.725rem',
                            color: 'var(--text-muted)',
                            margin: 0,
                            fontWeight: 500
                        }}>
                            Logged in as <strong style={{ color: 'var(--blue-600)' }}>{user?.username || 'User'}</strong>
                        </p>
                    </div>
                </div>
            </div>

            {/* Right: Real-time Live Clock, Theme Toggle & User Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {/* Live Clock & Date Widget */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    backgroundColor: 'var(--bg-subtle)',
                    border: '1px solid var(--border-subtle)',
                    padding: '0.4rem 0.8rem',
                    borderRadius: 'var(--radius-full)',
                }}>
                    <div className="header-clock-date" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.775rem', fontWeight: 600 }}>
                        <Calendar size={13} style={{ color: 'var(--blue-500)' }} />
                        <span>{dayName}, {formattedDate}</span>
                        <span style={{ width: '3px', height: '3px', borderRadius: '50%', backgroundColor: 'var(--blue-400)', margin: '0 0.2rem' }}></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--blue-600)', fontSize: '0.8rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                        <Clock size={13} style={{ color: 'var(--blue-500)' }} />
                        <span>{formattedTime}</span>
                    </div>
                </div>

                {/* Theme Toggle Button */}
                <button 
                    onClick={toggleTheme}
                    className="btn-icon"
                    title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    style={{
                        position: 'relative',
                        width: '38px',
                        height: '38px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'var(--bg-subtle)',
                        flexShrink: 0
                    }}
                >
                    {isDark ? (
                        <Sun size={17} style={{ color: '#ffffff' }} />
                    ) : (
                        <Moon size={17} style={{ color: 'var(--blue-700)' }} />
                    )}
                </button>

                {/* User Avatar Circle */}
                <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--blue-gradient-subtle)',
                    border: '2px solid var(--blue-400)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--blue-600)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    flexShrink: 0
                }}>
                    {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                </div>
            </div>
        </header>
    );
};
