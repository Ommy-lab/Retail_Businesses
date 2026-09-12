import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export const ProtectedRoute = ({ children, allowedRole }) => {
    const { user, token } = useContext(AuthContext);

    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRole && user.role !== allowedRole) {
        return <Navigate to={user.role === 'super_admin' ? '/admin/dashboard' : '/business/dashboard'} replace />;
    }

    return children;
};