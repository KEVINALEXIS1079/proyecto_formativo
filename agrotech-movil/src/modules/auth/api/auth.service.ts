// agrotech-movil/src/modules/auth/api/auth.service.ts
import api from '../../../shared/services/api';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  CompleteRegisterRequest,
  CompleteRegisterResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
  ResendVerificationRequest,
  ResendVerificationResponse,
  RequestResetRequest,
  RequestResetResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  LogoutResponse,
  User,
} from '../model/types';

// Mapper para convertir usuario del backend
function mapUserFromBackend(backendUser: any): User {
  return {
    id: backendUser.id,
    nombre: backendUser.nombre,
    apellido: backendUser.apellido,
    correo: backendUser.correo,
    rol: backendUser.rol,
    permisos: backendUser.permisos || [],
  };
}

/* ===========================
 * REGISTER
 * =========================== */
export async function register(request: RegisterRequest): Promise<RegisterResponse> {
  const { data } = await api.post('/auth/register', request);
  return data;
}

export async function completeRegister(request: CompleteRegisterRequest): Promise<CompleteRegisterResponse> {
  const { data } = await api.post('/auth/complete-register', request);
  return data;
}

/* ===========================
 * VERIFY EMAIL
 * =========================== */
export async function verifyEmail(request: VerifyEmailRequest): Promise<VerifyEmailResponse> {
  const { data } = await api.post('/auth/verify-email', request);
  return data;
}

/* ===========================
 * RESEND VERIFICATION
 * =========================== */
export async function resendVerification(request: ResendVerificationRequest): Promise<ResendVerificationResponse> {
  const { data } = await api.post('/auth/resend-verification', request);
  return data;
}

/* ===========================
 * LOGIN
 * =========================== */
export async function login(request: LoginRequest): Promise<LoginResponse> {
  const body = {
    correo: request.username,
    password: request.password,
  };

  const { data } = await api.post('/auth/login', body);

  if (data.success === false || !data.user) {
    const error: any = new Error(data.message || 'Credenciales incorrectas');
    // Mocking axios error structure for compatibility with LoginScreen error handling
    error.response = {
      status: 401,
      data: data
    };
    throw error;
  }

  const user = mapUserFromBackend(data.user);

  return { user, token: data.token };
}

/* ===========================
 * LOGOUT
 * =========================== */
export async function logout(): Promise<LogoutResponse> {
  const { data } = await api.post('/auth/logout');
  return data;
}

/* ===========================
 * REQUEST PASSWORD RESET
 * =========================== */
export async function requestPasswordReset(request: RequestResetRequest): Promise<RequestResetResponse> {
  const { data } = await api.post('/auth/request-reset', request);
  return data;
}

/* ===========================
 * RESET PASSWORD
 * =========================== */
export async function resetPassword(request: ResetPasswordRequest): Promise<ResetPasswordResponse> {
  const { data } = await api.post('/auth/reset-password', request);
  return data;
}