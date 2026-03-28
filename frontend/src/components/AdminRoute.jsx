import React from 'react';
import { useSelector } from 'react-redux';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import Loading from './Loading';

const AdminRoute = ({ children }) => {
    const { token: reduxToken } = useSelector((state) => state.admin || {});
    const { user, loading } = useAuth();

    // Check if admin token exists in Redux or if user is admin
    const adminToken = reduxToken || localStorage.getItem('adminToken');
    const isAdmin = user?.role === 'admin' || adminToken;

    if (loading) {
        return <Loading fullScreen />;
    }

    if (!isAdmin) {
        return <Navigate to="/admin/login" replace />;
    }

    return children;
};

export default AdminRoute;
