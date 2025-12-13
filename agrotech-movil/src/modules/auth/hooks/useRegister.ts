import { useMutation } from "@tanstack/react-query";
import { register } from "../api/auth.service";
import type { RegisterRequest, RegisterResponse } from "../model/types";
import { AxiosError } from "axios";

export function useRegister() {
  const mutation = useMutation<RegisterResponse, AxiosError, RegisterRequest>({
    mutationFn: register,
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