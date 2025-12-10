// Tipos basados en los DTOs del backend agrotech/backend-agrotech/src/modules/auth/dtos/

export interface RegisterRequest {
  nombre: string;
  apellido: string;
  identificacion: string;
  idFicha?: string;
  telefono?: string;
  correo: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
}

export interface VerifyEmailRequest {
  correo: string;
  code: string;
}

export interface VerifyEmailResponse {
  message: string;
}

export interface ResendVerificationRequest {
  correo: string;
}

export interface ResendVerificationResponse {
  message: string;
}

export interface LoginRequest {
  username: string; // correo
  password: string;
}

export interface User {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  rol: string;
  permisos: string[];
  // otros campos si es necesario
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface LogoutResponse {
  message: string;
}

export interface RequestResetRequest {
  correo: string;
}

export interface RequestResetResponse {
  message: string;
}

export interface ResetPasswordRequest {
  correo: string;
  code: string;
  nuevaPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

// Tipos adicionales para el frontend
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}