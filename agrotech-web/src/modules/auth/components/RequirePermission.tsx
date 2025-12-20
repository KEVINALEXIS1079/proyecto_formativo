import React from 'react';
import { Navigate, Outlet, useOutletContext } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface RequirePermissionProps {
    permission: string;
    redirectTo?: string;
    children?: React.ReactNode;
}

export const RequirePermission = ({ permission, redirectTo = '/home', children }: RequirePermissionProps) => {
    const { can, loading } = useAuth();
    const context = useOutletContext<unknown>();

    if (loading) {
        return null; // Or a spinner
    }

    if (!can(permission)) {
        return <Navigate to={redirectTo} replace />;
    }

    return children ? <>{children}</> : <Outlet context={context} />;
};
