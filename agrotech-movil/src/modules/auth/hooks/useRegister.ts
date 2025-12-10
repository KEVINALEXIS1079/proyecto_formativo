// agrotech-movil/src/modules/auth/hooks/useRegister.ts
import { useState } from "react";
import { register } from "../api/auth.service";
import type { RegisterRequest, RegisterResponse } from "../model/types";

type RegisterErr = Error;

export function useRegister() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<RegisterErr | null>(null);
  const [data, setData] = useState<RegisterResponse | null>(null);

  const mutate = async (request: RegisterRequest) => {
    setLoading(true);
    setError(null);
    try {
      const result = await register(request);
      setData(result);
    } catch (err) {
      setError(err as RegisterErr);
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