import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button, Card, CardBody } from '@heroui/react';
import { Mail, CheckCircle } from 'lucide-react';
import { useVerifyEmail, useResendVerificationCode } from '../hooks/useVerifyEmail';

export function EmailVerificationPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [resendSuccess, setResendSuccess] = useState(false);

    const verifyMutation = useVerifyEmail();
    const resendMutation = useResendVerificationCode();

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email || !code) {
            setError('Email y código son requeridos');
            return;
        }

        try {
            await verifyMutation.mutateAsync({ email, code });
            // Success - redirect to login
            setTimeout(() => navigate('/login'), 2000);
        } catch (err: any) {
            const message = err?.response?.data?.message || err?.message || 'Error al verificar el correo';
            setError(Array.isArray(message) ? message.join(', ') : message);
        }
    };

    const handleResend = async () => {
        setError('');
        setResendSuccess(false);

        if (!email) {
            setError('Ingresa tu correo electrónico');
            return;
        }

        try {
            await resendMutation.mutateAsync(email);
            setResendSuccess(true);
        } catch (err: any) {
            const message = err?.response?.data?.message || err?.message || 'Error al reenviar el código';
            setError(Array.isArray(message) ? message.join(', ') : message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 p-4">
            <Card className="w-full max-w-md">
                <CardBody className="p-8">
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-success-100 dark:bg-success-900/20 rounded-full mb-4">
                            <Mail className="h-8 w-8 text-success-600" />
                        </div>
                        <h1 className="text-2xl font-bold mb-2">Verificar Correo Electrónico</h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Ingresa el código de 6 dígitos que enviamos a tu correo
                        </p>
                    </div>

                    {error && (
                        <div className="bg-danger-50 dark:bg-danger-900/20 text-danger-600 dark:text-danger-400 p-3 rounded-lg text-sm mb-4">
                            {error}
                        </div>
                    )}

                    {resendSuccess && (
                        <div className="bg-success-50 dark:bg-success-900/20 text-success-600 dark:text-success-400 p-3 rounded-lg text-sm mb-4">
                            ¡Código reenviado exitosamente! Revisa tu correo.
                        </div>
                    )}

                    {verifyMutation.isSuccess && (
                        <div className="bg-success-50 dark:bg-success-900/20 text-success-600 dark:text-success-400 p-4 rounded-lg text-center mb-4">
                            <CheckCircle className="h-12 w-12 mx-auto mb-2" />
                            <p className="font-semibold">¡Correo verificado exitosamente!</p>
                            <p className="text-sm mt-1">Redirigiendo al login...</p>
                        </div>
                    )}

                    <form onSubmit={handleVerify} className="space-y-4">
                        <Input
                            type="email"
                            label="Correo Electrónico"
                            value={email}
                            onValueChange={setEmail}
                            isRequired
                            autoComplete="email"
                        />

                        <Input
                            type="text"
                            label="Código de Verificación"
                            value={code}
                            onValueChange={setCode}
                            isRequired
                            maxLength={6}
                            description="Código de 6 dígitos"
                        />

                        <Button
                            type="submit"
                            color="success"
                            className="w-full text-black font-semibold"
                            isLoading={verifyMutation.isPending}
                            isDisabled={verifyMutation.isSuccess}
                        >
                            {verifyMutation.isPending ? 'Verificando...' : 'Verificar Correo'}
                        </Button>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={resendMutation.isPending}
                                className="text-sm text-success-600 hover:text-success-700 dark:text-success-400 dark:hover:text-success-300 disabled:opacity-50"
                            >
                                {resendMutation.isPending ? 'Reenviando...' : '¿No recibiste el código? Reenviar'}
                            </button>
                        </div>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => navigate('/login')}
                                className="text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                            >
                                Volver al login
                            </button>
                        </div>
                    </form>
                </CardBody>
            </Card>
        </div>
    );
}
