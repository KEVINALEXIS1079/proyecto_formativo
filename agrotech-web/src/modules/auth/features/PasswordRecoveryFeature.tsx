// src/modules/auth/features/PasswordRecoveryFeature.tsx
import { useState } from 'react';
import AuthRecoverForm, { type AuthRecoverValues } from '../ui/AuthRecoverForm';
import AuthCodeForm, { type AuthCodeValues } from '../ui/AuthCodeForm';
import AuthChangePasswordForm, { type AuthChangePasswordValues } from '../ui/AuthChangePasswordForm';
import { useRequestPasswordReset, useRecoverChange } from '../hooks/useRecover';

type Step = 'request' | 'code' | 'password';

interface PasswordRecoveryFeatureProps {
  onBack: () => void;
}

export function PasswordRecoveryFeature({ onBack }: PasswordRecoveryFeatureProps) {
  const [step, setStep] = useState<Step>('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');

  const requestMutation = useRequestPasswordReset();
  const resetMutation = useRecoverChange();

  const handleRequest = async (values: AuthRecoverValues) => {
    setEmail(values.email);
    await requestMutation.mutateAsync({ correo: values.email });
    setStep('code');
  };

  const handleCode = (values: AuthCodeValues) => {
    setCode(values.codigo);
    setStep('password');
  };

  const handleReset = async (values: AuthChangePasswordValues) => {
    if (values.nuevaContrasena !== values.confirmar) {
      throw new Error('Las contraseñas no coinciden');
    }
    await resetMutation.mutateAsync({ email, nuevaContrasena: values.nuevaContrasena, codigo: code });
    // On success, navigate to login
    onBack();
  };

  if (step === 'request') {
    return (
      <AuthRecoverForm
        onSubmit={handleRequest}
        loading={requestMutation.isPending}
      />
    );
  }

  if (step === 'code') {
    return (
      <AuthCodeForm
        onSubmit={handleCode}
        loading={false}
      />
    );
  }

  return (
    <AuthChangePasswordForm
      onSubmit={handleReset}
      loading={resetMutation.isPending}
    />
  );
}