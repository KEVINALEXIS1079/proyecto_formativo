import { useMutation } from '@tanstack/react-query';
import { api } from '@/shared/api/client';

export interface VerifyEmailInput {
    email: string;
    code: string;
}

export async function verifyEmail(input: VerifyEmailInput): Promise<void> {
    await api.post('/auth/verify-email', input);
}

export async function resendVerificationCode(email: string): Promise<void> {
    await api.post('/auth/resend-verification', { email });
}

export function useVerifyEmail() {
    return useMutation({
        mutationFn: verifyEmail,
    });
}

export function useResendVerificationCode() {
    return useMutation({
        mutationFn: resendVerificationCode,
    });
}
