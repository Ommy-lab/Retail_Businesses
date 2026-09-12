import React, { createContext, useState, useEffect, useCallback } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [businessName, setBusinessName] = useState(() => localStorage.getItem('rb_biz_name') || '');
    const [businessLogo, setBusinessLogo] = useState(() => localStorage.getItem('rb_biz_logo') || '');

    const fetchBusinessProfile = useCallback(async () => {
        try {
            const res = await API.get('/business/settings');
            if (res.data?.name) {
                setBusinessName(res.data.name);
                localStorage.setItem('rb_biz_name', res.data.name);
            }
            if (res.data?.logo_url) {
                setBusinessLogo(res.data.logo_url);
                localStorage.setItem('rb_biz_logo', res.data.logo_url);
            }
        } catch (err) {
            // Non-critical, fallback to username or default
            console.warn("Could not load business settings profile:", err?.message);
        }
    }, []);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser && token) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            if (parsedUser.role === 'business_user') {
                fetchBusinessProfile();
            }
        }
    }, [token, fetchBusinessProfile]);

    const login = (userData, jwtToken) => {
        setUser(userData);
        setToken(jwtToken);
        localStorage.setItem('token', jwtToken);
        localStorage.setItem('user', JSON.stringify(userData));
        if (userData.role === 'business_user') {
            fetchBusinessProfile();
        }
    };

    const updateBusinessProfile = (name, logoUrl) => {
        if (name) {
            setBusinessName(name);
            localStorage.setItem('rb_biz_name', name);
        }
        if (logoUrl) {
            setBusinessLogo(logoUrl);
            localStorage.setItem('rb_biz_logo', logoUrl);
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        setBusinessName('');
        setBusinessLogo('');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('rb_biz_name');
        localStorage.removeItem('rb_biz_logo');
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            token, 
            businessName: businessName || (user?.username ? `${user.username}'s Store` : 'Business Portal'),
            businessLogo,
            login, 
            logout,
            updateBusinessProfile,
            refreshProfile: fetchBusinessProfile
        }}>
            {children}
        </AuthContext.Provider>
    );
};