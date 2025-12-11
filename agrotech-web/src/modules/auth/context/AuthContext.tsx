import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    const checkAuth = async () => {
      // Optimización: Si no hay "marca" de sesión, asumimos deslogueado para evitar 401 en consola
      const hasSession = localStorage.getItem('agrotech_session');
      if (!hasSession) {
        setLoading(false);
        return;
      }

      try {
        // Limpiar datos corruptos en storage
        const validKeys = ['recoveryEmail', 'recoveryCode', 'agrotech_session']; // Preserve session flag
        cleanCorruptLocalStorage(validKeys);
        cleanCorruptSessionStorage(validKeys);

        // Verificar sesión obteniendo el perfil
        const { getMyProfile } = await import('@/modules/profile/api/profile.api');
        const userProfile = await getMyProfile();

        setState({
          isAuthenticated: true,
          user: {
            id: userProfile.id,
            nombre: userProfile.nombre,
            apellido: userProfile.apellido,
            correo: userProfile.correo,
            rol: userProfile.rol?.nombre ?? "Sin rol",
          },
          token: null,
        });
      } catch (error) {
        // Si falla (401), asumimos no autenticado y limpiamos marca
        localStorage.removeItem('agrotech_session');
        setState({
          isAuthenticated: false,
          user: null,
          token: null,
        });
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // --- Manejo de login ---
  const handleLogin = async (request: LoginRequest) => {
    const response = await login(request);
    localStorage.setItem('agrotech_session', 'true'); // Marcar sesión activa
    setState({
      isAuthenticated: true,
      user: response.user,
      token: null, // No manejamos token en cliente
    });
  };

  const navigate = useNavigate();

  // --- Manejo de logout ---
  const handleLogout = async () => {
    await logout();
    localStorage.removeItem('agrotech_session'); // Eliminar marca
    setState({
      isAuthenticated: false,
      user: null,
      token: null,
    });
    // Forzar navegación al login con estado limpio para que la "flechita" apunte a Inicio
    navigate('/login', { replace: true, state: { from: '/start' } });
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
