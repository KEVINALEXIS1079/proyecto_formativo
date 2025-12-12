import React from 'react';
import { useAuth } from '../hooks/useAuth';

interface CanProps {
    I: string; // La clave del permiso: 'usuarios.crear', 'cultivos.ver'
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export const Can: React.FC<CanProps> = ({ I, children, fallback = null }) => {
    const { can } = useAuth();

    if (can(I)) {
        return <>{children}</>;
    }

    return <>{fallback}</>;
};
