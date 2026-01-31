import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
    const { token } = useSelector((state) => state.admin);

    if (!token) {
        return <Navigate to="/admin/login" replace />;
    }

    return children;
};

export default AdminRoute;
