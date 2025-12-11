import React from "react";
import { Spinner } from "@heroui/react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Esperar a que AuthProvider cargue la cookie
  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-gray-50">
      <Spinner size="lg" color="success" label="Iniciando sesión..." />
    </div>
  );

  // Si no está autenticado, enviarlo a login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};
