// src/modules/auth/hooks/useRecover.ts
import { useMutation } from "@tanstack/react-query";
import { requestPasswordReset, resetPassword, verifyEmail, verifyResetCode } from "../api/auth.service";

// -------- Solicitar reset de contraseña
type RequestResetData = { success?: boolean; message: string };
type RequestResetVars = { correo: string };
type RecoverErr = Error;

export function useRequestPasswordReset() {
  return useMutation<RequestResetData, RecoverErr, RequestResetVars>({
    mutationKey: ["auth", "reset", "request"],
    mutationFn: ({ correo }) => requestPasswordReset({ correo }),
  });
}

// -------- Resetear contraseña
type RecoverChangeData = { message: string };
type RecoverChangeVars = { email: string; nuevaContrasena: string; codigo: string };

export function useRecoverChange() {
  return useMutation<RecoverChangeData, RecoverErr, RecoverChangeVars>({
    mutationKey: ["auth", "reset", "password"],
    mutationFn: ({ email, nuevaContrasena, codigo }) =>
      resetPassword({ correo: email, code: codigo, nuevaPassword: nuevaContrasena }),
  });
}

// -------- Verificar email
type VerifyEmailData = { message: string };
type VerifyEmailVars = { correo: string; code: string };

export function useVerifyEmail() {
  return useMutation<VerifyEmailData, RecoverErr, VerifyEmailVars>({
    mutationKey: ["auth", "verify", "email"],
    mutationFn: ({ correo, code }) => verifyEmail({ correo, code }),
  });
}

// -------- Verificar código de reset (sin cambiar password)
type VerifyResetCodeData = { valid: boolean; message: string };
type VerifyResetCodeVars = { correo: string; code: string };

export function useVerifyResetCode() {
  return useMutation<VerifyResetCodeData, RecoverErr, VerifyResetCodeVars>({
    mutationKey: ["auth", "verify", "reset-code"],
    mutationFn: ({ correo, code }) => verifyResetCode({ correo, code }),
  });
}
