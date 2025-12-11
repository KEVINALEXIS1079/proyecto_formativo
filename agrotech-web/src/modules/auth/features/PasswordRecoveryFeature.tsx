// src/modules/auth/features/PasswordRecoveryFeature.tsx
import { useState } from 'react';
import AuthRecoverForm, { type AuthRecoverValues } from '../ui/AuthRecoverForm';
import AuthCodeForm, { type AuthCodeValues } from '../ui/AuthCodeForm';
import AuthChangePasswordForm, { type AuthChangePasswordValues } from '../ui/AuthChangePasswordForm';
import { useRequestPasswordReset, useRecoverChange, useVerifyResetCode } from '../hooks/useRecover';
import { AnimatePresence, motion } from 'framer-motion';
import ToastDialog from '../widgets/ToastDialog';

type Step = 'request' | 'code' | 'password';

interface PasswordRecoveryFeatureProps {
  onBack: () => void;
}

export function PasswordRecoveryFeature({ onBack }: PasswordRecoveryFeatureProps) {
  const [step, setStep] = useState<Step>('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');

  // Toast state
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastVariant, setToastVariant] = useState<'success' | 'danger'>('success');

  const requestMutation = useRequestPasswordReset();
  const verifyCodeMutation = useVerifyResetCode();
  const resetMutation = useRecoverChange();

  const handleRequest = async (values: AuthRecoverValues) => {
    try {
      setEmail(values.email);
      const res = await requestMutation.mutateAsync({ correo: values.email });

      if (res.success === false) {
        setToastMsg(res.message);
        setToastVariant('danger');
        setToastOpen(true);
        return;
      }

      setToastMsg('Código enviado a tu correo. Por favor revísalo.');
      setToastVariant('success');
      setToastOpen(true);
      // Wait a bit or let user close toast? Let's just move to next step after a delay or immediately
      // If we move immediately, the toast shows in the next step which is fine.
      setStep('code');
    } catch (error: any) {
      // Fallback for other errors (network, etc)
      setToastMsg(error?.message || 'Error al solicitar código');
      setToastVariant('danger');
      setToastOpen(true);
    }
  };

  const handleCode = async (values: AuthCodeValues) => {
    try {
      // First verify code with backend
      const res = await verifyCodeMutation.mutateAsync({ correo: email, code: values.codigo });

      if (!res.valid) {
        setToastMsg(res.message || 'Código inválido o expirado');
        setToastVariant('danger');
        setToastOpen(true);
        return;
      }

      setCode(values.codigo);
      setStep('password');
    } catch (error: any) {
      setToastMsg(error?.message || 'Error al validar código');
      setToastVariant('danger');
      setToastOpen(true);
    }
  };

  const handleReset = async (values: AuthChangePasswordValues) => {
    try {
      if (values.nuevaContrasena !== values.confirmar) {
        throw new Error('Las contraseñas no coinciden');
      }
      await resetMutation.mutateAsync({ email, nuevaContrasena: values.nuevaContrasena, codigo: code });

      setToastMsg('Contraseña actualizada con éxito');
      setToastVariant('success');
      setToastOpen(true);

      // Wait a small moment before onBack?
      setTimeout(() => {
        onBack();
      }, 1500);
    } catch (error: any) {
      setToastMsg(error?.response?.data?.message || error?.message || 'Error al actualizar contraseña');
      setToastVariant('danger');
      setToastOpen(true);
    }
  };

  const closeToast = () => setToastOpen(false);

  return (
    <>
      {step === 'request' && (
        <AuthRecoverForm
          onSubmit={handleRequest}
          loading={requestMutation.isPending}
        />
      )}

      {step === 'code' && (
        <AuthCodeForm
          onSubmit={handleCode}
          loading={verifyCodeMutation.isPending}
        />
      )}

      {step === 'password' && (
        <AuthChangePasswordForm
          onSubmit={handleReset}
          loading={resetMutation.isPending}
        />
      )}

      <AnimatePresence>
        {toastOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center sm:items-end sm:justify-end sm:p-4"
          >
            <div className="pointer-events-auto w-full max-w-sm">
              <ToastDialog
                open={toastOpen}
                onClose={closeToast}
                title={toastVariant === 'success' ? 'Éxito' : 'Error'}
                message={toastMsg}
                variant={toastVariant}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
