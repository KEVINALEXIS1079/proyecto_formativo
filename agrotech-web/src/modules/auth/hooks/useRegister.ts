// src/modules/auth/hooks/useRegister.ts
import { useMutation } from "@tanstack/react-query";
import { register } from "../api/auth.service";
// type RegisterErr = Error;

export function useRegister() {
  return useMutation({
    mutationFn: register,
    mutationKey: ["auth", "register"]
  });
}

export function useCompleteRegister() {
  return useMutation({
    mutationFn: ({ correo, code }: { correo: string; code: string }) =>
      import("../api/auth.service").then(m => m.completeRegistration({ correo, code })),
  });
}
