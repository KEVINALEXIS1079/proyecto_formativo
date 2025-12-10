// agrotech-movil/src/modules/auth/hooks/useLogin.ts
import { useState } from "react";
import { login } from "../api/auth.service";
import type { LoginRequest, LoginResponse } from "../model/types";

type LoginErr = Error;

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<LoginErr | null>(null);
  const [data, setData] = useState<LoginResponse | null>(null);

  const mutate = async (request: LoginRequest) => {
    setLoading(true);
    setError(null);
    try {
      const result = await login(request);
      setData(result);
    } catch (err) {
      setError(err as LoginErr);
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