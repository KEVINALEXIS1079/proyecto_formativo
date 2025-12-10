// agrotech-movil/src/modules/auth/hooks/useRecover.ts
import { useState } from "react";
import { requestPasswordReset, resetPassword, verifyEmail } from "../api/auth.service";
import type {
  RequestResetRequest,
  RequestResetResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
} from "../model/types";

type RecoverErr = Error;

// -------- Solicitar reset de contraseña
export function useRequestPasswordReset() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<RecoverErr | null>(null);
  const [data, setData] = useState<RequestResetResponse | null>(null);

  const mutate = async (request: RequestResetRequest) => {
    setLoading(true);
    setError(null);
    try {
      const result = await requestPasswordReset(request);
      setData(result);
    } catch (err) {
      setError(err as RecoverErr);
    } finally {
      setLoading(false);
    }
  };

  return {
    mutate,
    isLoading: loading,
    error,
    data,
  };
}

// -------- Resetear contraseña
export function useResetPassword() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<RecoverErr | null>(null);
  const [data, setData] = useState<ResetPasswordResponse | null>(null);

  const mutate = async (request: ResetPasswordRequest) => {
    setLoading(true);
    setError(null);
    try {
      const result = await resetPassword(request);
      setData(result);
    } catch (err) {
      setError(err as RecoverErr);
    } finally {
      setLoading(false);
    }
  };

  return {
    mutate,
    isLoading: loading,
    error,
    data,
  };
}

// -------- Verificar email
export function useVerifyEmail() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<RecoverErr | null>(null);
  const [data, setData] = useState<VerifyEmailResponse | null>(null);

  const mutate = async (request: VerifyEmailRequest) => {
    setLoading(true);
    setError(null);
    try {
      const result = await verifyEmail(request);
      setData(result);
    } catch (err) {
      setError(err as RecoverErr);
    } finally {
      setLoading(false);
    }
  };

  return {
    mutate,
    isLoading: loading,
    error,
    data,
  };
}