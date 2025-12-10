import { useState } from 'react';
import { Input, Button } from '@heroui/react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { useChangePassword } from '../hooks/useChangePassword';

interface ChangePasswordFormProps {
    onSuccess?: () => void;
}

export function ChangePasswordForm({ onSuccess }: ChangePasswordFormProps) {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');

    const changePasswordMutation = useChangePassword();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validations
        if (!oldPassword || !newPassword || !confirmPassword) {
            setError('Todos los campos son obligatorios');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Las contraseñas nuevas no coinciden');
            return;
        }

        if (newPassword.length < 6) {
            setError('La nueva contraseña debe tener al menos 6 caracteres');
            return;
        }

        if (oldPassword === newPassword) {
            setError('La nueva contraseña debe ser diferente a la actual');
            return;
        }

        try {
            await changePasswordMutation.mutateAsync({
                oldPassword,
                newPassword,
            });

            // Clear form
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');

            onSuccess?.();
        } catch (err: any) {
            const message = err?.response?.data?.message || err?.message || 'Error al cambiar la contraseña';
            setError(Array.isArray(message) ? message.join(', ') : message);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <Lock className="h-5 w-5 text-success-600" />
                <h3 className="text-lg font-semibold">Cambiar Contraseña</h3>
            </div>

            {error && (
                <div className="bg-danger-50 dark:bg-danger-900/20 text-danger-600 dark:text-danger-400 p-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {changePasswordMutation.isSuccess && !error && (
                <div className="bg-success-50 dark:bg-success-900/20 text-success-600 dark:text-success-400 p-3 rounded-lg text-sm">
                    ¡Contraseña cambiada exitosamente!
                </div>
            )}

            <Input
                type={showOldPassword ? 'text' : 'password'}
                label="Contraseña Actual"
                value={oldPassword}
                onValueChange={setOldPassword}
                isRequired
                endContent={
                    <button
                        className="focus:outline-none"
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                    >
                        {showOldPassword ? (
                            <EyeOff className="h-4 w-4 text-default-400" />
                        ) : (
                            <Eye className="h-4 w-4 text-default-400" />
                        )}
                    </button>
                }
            />

            <Input
                type={showNewPassword ? 'text' : 'password'}
                label="Nueva Contraseña"
                value={newPassword}
                onValueChange={setNewPassword}
                isRequired
                description="Mínimo 6 caracteres"
                endContent={
                    <button
                        className="focus:outline-none"
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                        {showNewPassword ? (
                            <EyeOff className="h-4 w-4 text-default-400" />
                        ) : (
                            <Eye className="h-4 w-4 text-default-400" />
                        )}
                    </button>
                }
            />

            <Input
                type={showConfirmPassword ? 'text' : 'password'}
                label="Confirmar Nueva Contraseña"
                value={confirmPassword}
                onValueChange={setConfirmPassword}
                isRequired
                endContent={
                    <button
                        className="focus:outline-none"
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                        {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-default-400" />
                        ) : (
                            <Eye className="h-4 w-4 text-default-400" />
                        )}
                    </button>
                }
            />

            <div className="flex justify-end gap-3 pt-2">
                <Button
                    type="submit"
                    color="success"
                    className="text-black font-semibold"
                    isLoading={changePasswordMutation.isPending}
                >
                    {changePasswordMutation.isPending ? 'Cambiando...' : 'Cambiar Contraseña'}
                </Button>
            </div>
        </form>
    );
}
