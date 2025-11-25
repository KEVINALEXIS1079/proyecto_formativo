// src/modules/auth/hooks/useRegister.ts
import { useMutation } from "@tanstack/react-query";
import { register } from "../api/auth.service";
import type { RegisterRequest, RegisterResponse } from "../model/types";

type RegisterErr = Error;

export function useRegister() {
  return useMutation<RegisterResponse, RegisterErr, RegisterRequest>({
    mutationKey: ["auth", "register"],
    mutationFn: (request) => register(request),
  });
}
