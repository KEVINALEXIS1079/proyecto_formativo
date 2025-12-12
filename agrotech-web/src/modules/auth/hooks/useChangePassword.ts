// src/modules/auth/hooks/useChangePassword.ts
import { useMutation } from "@tanstack/react-query";
import { resetPassword } from "../api/auth.service";
import type { ResetPasswordRequest } from "../model/types";

type ChangePwdData = { message: string };
type ChangePwdError = Error;

export function useChangePassword() {
  return useMutation<ChangePwdData, ChangePwdError, ResetPasswordRequest>({
    mutationKey: ["auth", "changePassword"],
    mutationFn: resetPassword,
  });
}
