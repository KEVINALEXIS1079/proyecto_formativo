import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Esperar a que AuthProvider cargue la cookie
  if (loading) return <div>Cargando...</div>;

  // Si no está autenticado, enviarlo a login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};
