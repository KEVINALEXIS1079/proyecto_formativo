import React from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';

interface CanProps {
    permission: string;
    children: ReactNode;
    fallback?: ReactNode;
}

export const Can = ({ permission, children, fallback = null }: CanProps) => {
    const { can } = useAuth();

    if (can(permission)) {
        return <>{children}</>;
    }

    return <>{fallback}</>;
};
