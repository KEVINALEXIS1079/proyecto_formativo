import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AuthState, LoginRequest } from '../model/types';
import { login, logout } from '../api/auth.service';
import { cleanCorruptLocalStorage, cleanCorruptSessionStorage } from '@/lib/storage';

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

    // Como usamos cookies httpOnly, no podemos verificar el token desde el cliente
    // Asumimos autenticado si no hay error en requests
    setLoading(false);
  }, []);

  // --- Manejo de login ---
  const handleLogin = async (request: LoginRequest) => {
    const response = await login(request);
    setState({
      isAuthenticated: true,
      user: response.user,
      token: null, // No manejamos token en cliente
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
