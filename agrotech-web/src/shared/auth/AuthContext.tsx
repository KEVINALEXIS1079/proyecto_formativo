import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AuthState, LoginRequest } from '../../modules/auth/model/types';
import { login, logout } from '../../modules/auth/api/auth.service';
import { cleanCorruptLocalStorage, cleanCorruptSessionStorage } from '@/lib/storage';
import { permisoService } from '../../modules/permisos/permisos/api/permiso.service';

interface AuthContextType extends AuthState {
  loading: boolean;
  login: (request: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
  });

  const [loading, setLoading] = useState(true);

  // Mantener la sesión al recargar
  useEffect(() => {
    // Limpiar datos corruptos en storage
    const validKeys = ['recoveryEmail', 'recoveryCode'];
    cleanCorruptLocalStorage(validKeys);
    cleanCorruptSessionStorage(validKeys);

    // Como usamos cookies httpOnly, no podemos verificar desde cliente
    setLoading(false);
  }, []);

  // --- Manejo de login ---
  const handleLogin = async (request: LoginRequest) => {
    const response = await login(request);
    setState({
      isAuthenticated: true,
      user: response.user,
      token: null,
    });
  };

  // --- Manejo de logout ---
  const handleLogout = async () => {
    await logout();
    setState({
      isAuthenticated: false,
      user: null,
      token: null,
    });
  };

  // Listener WebSocket para cambios en permisos
  useEffect(() => {
    if (!state.isAuthenticated || !state.user) return;

    const unsubscribe = permisoService.onPermissionsChanged(async (data: { userId: number }) => {
      if (data.userId === state.user?.id) {
        await handleLogout();
        alert('Tus permisos han cambiado. Has sido desconectado por seguridad.');
      }
    });

    return unsubscribe;
  }, [state.isAuthenticated, state.user?.id]);

  const value: AuthContextType = {
    ...state,
    loading,
    login: handleLogin,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};