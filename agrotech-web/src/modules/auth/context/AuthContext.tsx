import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AuthState, LoginRequest } from '../model/types';
import { login, logout } from '../api/auth.service';
import { cleanCorruptLocalStorage, cleanCorruptSessionStorage } from '@/lib/storage';
import { getUserPermissions } from '@/modules/users/api/permissions.api';
import { connectSocket } from '@/shared/api/client';

interface AuthContextType extends AuthState {
  permissions: string[]; // Lista de claves de permisos (ej. 'usuarios.ver')
  loading: boolean;
  login: (request: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  can: (permission: string) => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
  });
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Mantener la sesión al recargar
  useEffect(() => {
    const checkAuth = async () => {
      const hasSession = localStorage.getItem('agrotech_session');
      if (!hasSession) {
        setLoading(false);
        return;
      }

      try {
        const validKeys = ['recoveryEmail', 'recoveryCode', 'agrotech_session'];
        cleanCorruptLocalStorage(validKeys);
        cleanCorruptSessionStorage(validKeys);

        const { getMyProfile } = await import('@/modules/profile/api/profile.api');
        const userProfile = await getMyProfile();

        // Cargar permisos del usuario
        let userPerms: string[] = [];
        try {
          const permsData = await getUserPermissions(userProfile.id);
          userPerms = permsData.map(p => p.clave);
        } catch (e) {
          console.error("Error cargando permisos", e);
        }

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
        setPermissions(userPerms);

      } catch (error) {
        localStorage.removeItem('agrotech_session');
        setState({
          isAuthenticated: false,
          user: null,
          token: null,
        });
        setPermissions([]);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Listen for real-time permission changes
  useEffect(() => {
    if (!state.isAuthenticated || !state.user) return;

    const socket = connectSocket('/users');

    const handleUserUpdated = async (payload: { userId: number }) => {
      if (state.user?.id === payload.userId) {
        console.log('[Auth] Permissions updated via socket (user)', payload);
        reloadPermissions(state.user.id);
      }
    };

    const handleRoleUpdated = async (payload: { rolId: number }) => {
      // Need to know current user's role ID. ideally user object has rolId.
      // Current user object: { id, nombre, apellido, correo, rol: string }
      // We don't have rolId easily available in state.user right now unless we added it?
      // View AuthContext types to check.
      // If checks strict roleId is hard, we can just reload if we are not sure, or fetch profile.
      // Easiest is to reload permissions.
      console.log('[Auth] Permissions updated via socket (role)', payload);
      if (state.user?.id) reloadPermissions(state.user.id);
    };

    socket.on('permissions:user-updated', handleUserUpdated);
    socket.on('permissions:role-updated', handleRoleUpdated);

    return () => {
      socket.off('permissions:user-updated', handleUserUpdated);
      socket.off('permissions:role-updated', handleRoleUpdated);
    };
  }, [state.isAuthenticated, state.user?.id]);

  const reloadPermissions = async (userId: number) => {
    try {
      const permsData = await getUserPermissions(userId);
      setPermissions(permsData.map(p => p.clave));
    } catch (e) {
      console.error("Error reloading permissions", e);
    }
  };

  // --- Manejo de login ---
  const handleLogin = async (request: LoginRequest) => {
    setLoading(true);
    try {
      const response = await login(request);
      localStorage.setItem('agrotech_session', 'true');

      // Cargar permisos inmediatamente
      let userPerms: string[] = [];
      try {
        const permsData = await getUserPermissions(response.user.id);
        userPerms = permsData.map(p => p.clave);
      } catch (e) {
        console.error("Error cargando permisos en login", e);
      }

      setState({
        isAuthenticated: true,
        user: {
          ...response.user,
          rol: (response.user as any).rol?.nombre || (Number((response.user as any).rolId) === 1 ? 'Administrador' : "Sin rol"),
        },
        token: null,
      });
      setPermissions(userPerms);
    } finally {
      setLoading(false);
    }
  };

  const navigate = useNavigate();

  // --- Manejo de logout ---
  const handleLogout = async () => {
    await logout();
    localStorage.removeItem('agrotech_session');
    setState({
      isAuthenticated: false,
      user: null,
      token: null,
    });
    setPermissions([]);
    navigate('/login', { replace: true, state: { from: '/start' } });
  };

  const can = useCallback((permission: string) => {
    if (!permission) return true;
    if (state.user?.rol === 'Administrador' || state.user?.rol === 'Admin') return true;
    return permissions.includes(permission);
  }, [permissions, state.user]);

  const value: AuthContextType = {
    ...state,
    permissions,
    loading,
    login: handleLogin,
    logout: handleLogout,
    can,
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
