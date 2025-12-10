import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthState, LoginRequest, LoginResponse } from '../model/types';
import { login, logout } from '../api/auth.service';
import { authAPI } from '../../../shared/services/api';

interface AuthContextType extends AuthState {
  loading: boolean;
  login: (request: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
  });

  const [loading, setLoading] = useState(true);

  // Fetch user profile and permissions
  const fetchProfile = async (token: string) => {
    try {
      const { data: userProfile } = await authAPI.getProfile();
      
      setState({
        isAuthenticated: true,
        user: {
          id: userProfile.id,
          nombre: userProfile.nombre,
          apellido: userProfile.apellido,
          correo: userProfile.correo,
          rol: userProfile.rol?.nombre ?? "Sin rol",
          permisos: userProfile.permisos || [],
        },
        token,
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      // If profile fetch fails, clear auth
      await AsyncStorage.removeItem('token');
      setState({
        isAuthenticated: false,
        user: null,
        token: null,
      });
    }
  };

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          await fetchProfile(token);
        } else {
          setState({
            isAuthenticated: false,
            user: null,
            token: null,
          });
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        await AsyncStorage.removeItem('token');
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

  // Handle login
  const handleLogin = async (request: LoginRequest) => {
    const response: LoginResponse = await login(request);
    await AsyncStorage.setItem('token', response.token);
    
    setState({
      isAuthenticated: true,
      user: response.user,
      token: response.token,
    });
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      await AsyncStorage.removeItem('token');
      setState({
        isAuthenticated: false,
        user: null,
        token: null,
      });
    }
  };

  // Refresh profile (useful after permission changes)
  const handleRefreshProfile = async () => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      await fetchProfile(token);
    }
  };

  const value: AuthContextType = {
    ...state,
    loading,
    login: handleLogin,
    logout: handleLogout,
    refreshProfile: handleRefreshProfile,
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