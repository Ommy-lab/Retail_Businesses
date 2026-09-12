import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { Login } from './pages/auth/Login';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { BusinessDashboard } from './pages/business/BusinessDashboard';
import { Transactions } from './pages/business/Transactions';
import { Reports } from './pages/business/Reports';
import { Settings } from './pages/business/Settings';

export const App = () => {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    {/* Super Admin Route */}
                    <Route 
                        path="/admin/dashboard" 
                        element={
                            <ProtectedRoute allowedRole="super_admin">
                                <AppLayout><AdminDashboard /></AppLayout>
                            </ProtectedRoute>
                        } 
                    />

                    {/* Business Tenant Routes */}
                    <Route 
                        path="/business/dashboard" 
                        element={
                            <ProtectedRoute allowedRole="business_user">
                                <AppLayout><BusinessDashboard /></AppLayout>
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/business/transactions" 
                        element={
                            <ProtectedRoute allowedRole="business_user">
                                <AppLayout><Transactions /></AppLayout>
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/business/reports" 
                        element={
                            <ProtectedRoute allowedRole="business_user">
                                <AppLayout><Reports /></AppLayout>
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/business/settings" 
                        element={
                            <ProtectedRoute allowedRole="business_user">
                                <AppLayout><Settings /></AppLayout>
                            </ProtectedRoute>
                        } 
                    />

                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;