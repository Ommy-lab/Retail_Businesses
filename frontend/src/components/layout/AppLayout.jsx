import React from 'react';
import { Sidebar } from './Sidebar';

export const AppLayout = ({ children }) => {
    return (
        <div className="flex bg-slate-950 min-h-screen">
            <Sidebar />
            <div className="flex-1 overflow-y-auto">
                {children}
            </div>
        </div>
    );
};