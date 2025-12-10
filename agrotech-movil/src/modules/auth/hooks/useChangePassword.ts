// agrotech-movil/src/modules/auth/hooks/useChangePassword.ts
import { useState } from "react";
import { resetPassword } from "../api/auth.service";
import type { ResetPasswordRequest, ResetPasswordResponse } from "../model/types";

type ChangePwdError = Error;

export function useChangePassword() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ChangePwdError | null>(null);
  const [data, setData] = useState<ResetPasswordResponse | null>(null);

  const mutate = async (request: ResetPasswordRequest) => {
    setLoading(true);
    setError(null);
    try {
      const result = await resetPassword(request);
      setData(result);
    } catch (err) {
      setError(err as ChangePwdError);
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