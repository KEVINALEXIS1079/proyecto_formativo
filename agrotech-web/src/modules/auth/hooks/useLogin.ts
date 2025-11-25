// src/modules/auth/hooks/useLogin.ts
import { useMutation } from "@tanstack/react-query";
import { login } from "../api/auth.service";
import type { LoginRequest, LoginResponse } from "../model/types";

type LoginErr = Error;

export function useLogin() {
  return useMutation<LoginResponse, LoginErr, LoginRequest>({
    mutationKey: ["auth", "login"],
    mutationFn: (request) => login(request),
  });
}