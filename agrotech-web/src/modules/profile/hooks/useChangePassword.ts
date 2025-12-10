import { useMutation } from '@tanstack/react-query';
import { api } from '@/shared/api/client';

export interface ChangePasswordInput {
    oldPassword: string;
    newPassword: string;
}

export async function changePassword(input: ChangePasswordInput): Promise<void> {
    await api.post('/auth/change-password', input);
}

export function useChangePassword() {
    return useMutation({
        mutationFn: changePassword,
    });
}
