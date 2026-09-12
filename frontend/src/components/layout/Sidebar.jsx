import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
    LayoutDashboard, 
    ReceiptText, 
    FileText, 
    Settings, 
    LogOut, 
    Building2, 
    Shield, 
    Store, 
    Sun, 
    Moon,
    X 
} from 'lucide-react';

export const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
    const { user, businessName, logout } = useContext(AuthContext);
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isSuperAdmin = user?.role === 'super_admin';

    const businessNavItems = [
        { path: '/business/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/business/transactions', label: 'Transactions', icon: ReceiptText },
        { path: '/business/reports', label: 'Financial Reports', icon: FileText },
        { path: '/business/settings', label: 'Business Settings', icon: Settings },
    ];

    const adminNavItems = [
        { path: '/admin/dashboard', label: 'Tenants & Stats', icon: LayoutDashboard },
    ];

    const navItems = isSuperAdmin ? adminNavItems : businessNavItems;

    return (
        <aside className={`app-sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                {/* Brand Header with Close Button on Mobile */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.25rem 0.5rem',
                }}>
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
                            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
                            flexShrink: 0
                        }}>
                            {isSuperAdmin ? <Shield size={22} /> : <Store size={22} />}
                        </div>
                        <div>
                            <h1 style={{
                                fontSize: '1.2rem',
                                fontWeight: 800,
                                color: 'var(--text-primary)',
                                margin: 0,
                                lineHeight: 1.15
                            }}>
                                Retail<span style={{ color: 'var(--blue-500)' }}>Pulse</span>
                            </h1>
                            <span style={{
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                color: 'var(--blue-600)',
                                letterSpacing: '0.06em',
                                textTransform: 'uppercase'
                            }}>
                                {isSuperAdmin ? 'Platform Suite' : 'Retail Manager'}
                            </span>
                        </div>
                    </div>

                    {/* Mobile Close Button */}
                    {onCloseMobile && (
                        <button 
                            onClick={onCloseMobile}
                            className="btn-icon mobile-menu-btn"
                            style={{ padding: '0.45rem' }}
                            aria-label="Close sidebar"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>

                {/* Navigation Links */}
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <div style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: 'var(--text-muted)',
                        padding: '0 0.75rem 0.4rem',
                    }}>
                        Navigation
                    </div>

                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <button
                                key={item.path}
                                onClick={() => {
                                    navigate(item.path);
                                    if (onCloseMobile) onCloseMobile();
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.85rem',
                                    width: '100%',
                                    padding: '0.8rem 1rem',
                                    borderRadius: 'var(--radius-md)',
                                    fontSize: '0.875rem',
                                    fontWeight: isActive ? 700 : 500,
                                    border: isActive ? '1px solid var(--blue-400)' : '1px solid transparent',
                                    background: isActive ? 'var(--blue-gradient)' : 'transparent',
                                    color: isActive ? '#ffffff' : 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    transition: 'all var(--transition-fast)',
                                    boxShadow: isActive ? '0 4px 14px rgba(37, 99, 235, 0.35)' : 'none',
                                    textAlign: 'left'
                                }}
                                onMouseEnter={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
                                        e.currentTarget.style.color = 'var(--blue-600)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.color = 'var(--text-secondary)';
                                    }
                                }}
                            >
                                <Icon size={19} style={{ color: isActive ? '#ffffff' : 'var(--blue-500)' }} />
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Bottom Actions: Theme & Logout */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                {/* Theme Mode Switch Button */}
                <button
                    onClick={toggleTheme}
                    className="btn-secondary"
                    style={{
                        width: '100%',
                        justifyContent: 'space-between',
                        padding: '0.65rem 1rem',
                        fontSize: '0.825rem'
                    }}
                >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {isDark ? <Sun size={16} /> : <Moon size={16} />}
                        <span>{isDark ? 'Light Theme' : 'Dark Theme'}</span>
                    </span>
                    <span className="badge-outline" style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem' }}>
                        {isDark ? 'Dark' : 'Light'}
                    </span>
                </button>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="btn-outline"
                    style={{
                        width: '100%',
                        justifyContent: 'center',
                        color: 'var(--blue-600)',
                        borderColor: 'var(--border-main)',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--blue-50)';
                        e.currentTarget.style.borderColor = 'var(--blue-400)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.borderColor = 'var(--border-main)';
                    }}
                >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
};