import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user } = useAuth();
    const location = useLocation();

    if (!user) {
        // Redirect them to the /login page, but save the current location they were trying to go to
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // If a user tries to access a route they don't have access to
        if (user.role === 'admin') {
            return <Navigate to="/app/dashboard" replace />;
        } else {
            return <Navigate to="/portal-cliente" replace />;
        }
    }

    return children;
};
