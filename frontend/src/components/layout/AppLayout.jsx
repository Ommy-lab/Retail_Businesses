import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const AppLayout = ({ children }) => {
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            backgroundColor: 'var(--bg-base)',
            color: 'var(--text-primary)',
            transition: 'background-color var(--transition-normal)',
            position: 'relative'
        }}>
            {/* Mobile Backdrop Overlay */}
            {mobileSidebarOpen && (
                <div 
                    className="sidebar-backdrop" 
                    onClick={() => setMobileSidebarOpen(false)} 
                />
            )}

            {/* Sidebar Drawer */}
            <Sidebar 
                isMobileOpen={mobileSidebarOpen} 
                onCloseMobile={() => setMobileSidebarOpen(false)} 
            />

            {/* Main Application Canvas */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                minWidth: 0,
                overflowX: 'hidden'
            }}>
                <Header onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />
                <main className="app-main" style={{
                    flex: 1,
                    padding: '2rem 2.5rem',
                    overflowY: 'auto'
                }}>
                    <div className="animate-fade-in" style={{ maxWidth: '1400px', margin: '0 auto' }}>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};