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
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

export function useRequestPasswordReset() {
  const mutation = useMutation<RequestResetResponse, AxiosError, RequestResetRequest>({
    mutationFn: requestPasswordReset,
  });

  return {
    mutate: mutation.mutate,
    isLoading: mutation.isLoading,
    error: mutation.error,
    data: mutation.data,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError
  };
}

// -------- Resetear contraseña
// -------- Resetear contraseña
export function useResetPassword() {
  const mutation = useMutation<ResetPasswordResponse, AxiosError, ResetPasswordRequest>({
    mutationFn: resetPassword,
  });

  return {
    mutate: mutation.mutate,
    isLoading: mutation.isLoading,
    error: mutation.error,
    data: mutation.data,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError
  };
}

// -------- Verificar email
export function useVerifyEmail() {
  const mutation = useMutation<VerifyEmailResponse, AxiosError, VerifyEmailRequest>({
    mutationFn: verifyEmail,
  });

  return {
    mutate: mutation.mutate,
    isLoading: mutation.isLoading,
    error: mutation.error,
    data: mutation.data,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError
  };
}