import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from './Loading';

const PrivateRoute = ({ children }) => {
    const { token, loading, user } = useAuth();

    if (loading) {
        return <Loading fullScreen />;
    }

    // If no token, redirect to login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Route is protected, user is authenticated
    return children;
};

export default PrivateRoute;
