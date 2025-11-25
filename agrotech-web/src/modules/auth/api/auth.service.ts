// agrotech-web/src/modules/auth/api/auth.service.ts
import api from '@/shared/api/client';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
  ResendVerificationRequest,
  ResendVerificationResponse,
  RequestResetRequest,
  RequestResetResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  LogoutResponse,
} from '../model/types';
import { mapUserFromBackend } from '../model/mappers';

/* ===========================
 * REGISTER
 * =========================== */
export async function register(request: RegisterRequest): Promise<RegisterResponse> {
  const { data } = await api.post('/auth/register', request);
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

  const user = mapUserFromBackend(data.user);

  return { user };
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
