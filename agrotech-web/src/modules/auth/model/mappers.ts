// Mapeadores para convertir respuestas del backend a tipos del frontend

import type { User } from './types';

export function mapUserFromBackend(backendUser: any): User {
  return {
    id: backendUser.id,
    nombre: backendUser.nombre,
    apellido: backendUser.apellido,
    correo: backendUser.correo,
    rol: backendUser.rol,
  };
}