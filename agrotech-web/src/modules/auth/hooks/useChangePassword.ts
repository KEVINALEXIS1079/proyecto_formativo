// src/modules/auth/hooks/useChangePassword.ts
import { useMutation } from "@tanstack/react-query";
import { recoverChange } from "../api/auth.service";
import type { RecoverChangeRequest } from "../api/model/types";

type ChangePwdData = { message: string };
type ChangePwdError = Error;

export function useChangePassword() {
  return useMutation<ChangePwdData, ChangePwdError, RecoverChangeRequest>({
    mutationKey: ["auth", "changePassword"],
    mutationFn: recoverChange,
  });
}
