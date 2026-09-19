import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Clock, Calendar, Sun, Moon, Building2, Shield, Menu } from 'lucide-react';

export const Header = ({ onToggleMobileSidebar }) => {
    const { user, businessName, businessLogo } = useContext(AuthContext);
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();
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
    const formattedTime = currentTime.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit', 
        hour12: true 
    });

    const isSuperAdmin = user?.role === 'super_admin';
    const displayName = isSuperAdmin ? 'Super Admin' : (businessName || 'My Business');

    return (
        <header className="header-content">
            {/* Left: Mobile Trigger & Business Brand Identity */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: 0 }}>
                {/* Mobile Hamburger Button */}
                <button 
                    onClick={onToggleMobileSidebar}
                    className="btn-icon mobile-menu-btn"
                    style={{ padding: '0.55rem', border: '1px solid var(--border-main)' }}
                    aria-label="Open navigation menu"
                >
                    <Menu size={20} style={{ color: 'var(--blue-600)' }} />
                </button>

                {/* Brand Identity / Storefront Info */}
                <div 
                    onClick={() => navigate(isSuperAdmin ? '/admin/dashboard' : '/business/dashboard')}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', minWidth: 0 }}
                    title="Go to Dashboard"
                >
                    <div className="header-brand-logo">
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
                    <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'nowrap' }}>
                            <h2 className="header-store-name">
                                {displayName}
                            </h2>
                            {isSuperAdmin ? (
                                <span className="header-badge-admin">
                                    <Shield size={10} /> Admin
                                </span>
                            ) : (
                                <span className="header-badge-store">
                                    <span className="pulse-indicator"></span> Active
                                </span>
                            )}
                        </div>
                        <p className="header-user-text" style={{
                            fontSize: '0.725rem',
                            color: 'var(--text-muted)',
                            margin: '0.1rem 0 0',
                            fontWeight: 500,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>
                            Logged in as <strong style={{ color: 'var(--blue-600)' }}>@{user?.username || 'user'}</strong>
                        </p>
                    </div>
                </div>
            </div>

            {/* Right: Real-time Live Clock, Theme Toggle & User Avatar Profile */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                {/* Live Clock & Date Widget */}
                <div className="header-clock-pill">
                    <div className="header-clock-date">
                        <Calendar size={13} style={{ color: 'var(--blue-500)' }} />
                        <span>{dayName}, {formattedDate}</span>
                        <span className="clock-divider"></span>
                    </div>
                    <div className="header-clock-time">
                        <Clock size={13} style={{ color: 'var(--blue-500)' }} />
                        <span>{formattedTime}</span>
                    </div>
                </div>

                {/* Interactive Theme Toggle Switch */}
                <button 
                    onClick={toggleTheme}
                    className={`header-theme-toggle ${isDark ? 'dark-active' : 'light-active'}`}
                    title={isDark ? "Dark Mode Active — Click to switch to Light Mode" : "Light Mode Active — Click to switch to Dark Mode"}
                    aria-label="Toggle dark and light mode"
                >
                    {isDark ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24' }}>
                            <Sun size={18} style={{ filter: 'drop-shadow(0 0 6px rgba(251, 191, 36, 0.6))' }} />
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5' }}>
                            <Moon size={18} style={{ filter: 'drop-shadow(0 0 6px rgba(79, 70, 229, 0.4))' }} />
                        </div>
                    )}
                </button>

                {/* User Avatar & Settings Link */}
                <div 
                    onClick={() => navigate(isSuperAdmin ? '/admin/dashboard' : '/business/settings')}
                    className="header-user-avatar"
                    title={`Account & Settings (@${user?.username || 'user'})`}
                >
                    {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                </div>
            </div>
        </header>
    );
};
