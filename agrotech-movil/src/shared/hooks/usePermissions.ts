import { useAuth } from '../../modules/auth/context/AuthContext';

/**
 * Hook para verificar si el usuario tiene un permiso específico
 */
export const usePermission = (permission: string): boolean => {
  const { user } = useAuth();
  
  if (!user || !user.permisos) {
    return false;
  }
  
  return user.permisos.includes(permission);
};

/**
 * Hook para verificar si el usuario tiene al menos uno de los permisos especificados
 */
export const useHasAnyPermission = (permissions: string[]): boolean => {
  const { user } = useAuth();
  
  if (!user || !user.permisos) {
    return false;
  }
  
  return permissions.some(permission => user.permisos.includes(permission));
};

/**
 * Hook para verificar si el usuario tiene todos los permisos especificados
 */
export const useHasAllPermissions = (permissions: string[]): boolean => {
  const { user } = useAuth();
  
  if (!user || !user.permisos) {
    return false;
  }
  
  return permissions.every(permission => user.permisos.includes(permission));
};

/**
 * Hook para verificar si el usuario tiene un rol específico
 */
export const useHasRole = (role: string): boolean => {
  const { user } = useAuth();
  
  if (!user || !user.rol) {
    return false;
  }
  
  return user.rol === role;
};
