export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

export interface RecoverRequest {
  email: string;
}

export interface RecoverVerifyRequest {
  email: string;
  codigo: string;
}

export interface RecoverChangeRequest {
  email: string;
  codigo: string;
  nuevaContrasena: string;
}

export interface CreateUsuarioPublicRequest {
  cedula_usuario: string;
  nombre_usuario: string;
  apellido_usuario: string;
  telefono_usuario: string;
  id_ficha: string;
  correo_usuario: string;
  contrasena_usuario: string;
  img_usuario?: File;
}