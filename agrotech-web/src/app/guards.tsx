// src/routes/guards.tsx
import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/modules/auth/hooks/useAuth";

const LS_KEYS = { email: "recoveryEmail", code: "recoveryCode" } as const;
const getRecoveryEmail = () => localStorage.getItem(LS_KEYS.email) || "";
const getRecoveryCode = () => localStorage.getItem(LS_KEYS.code) || "";

/* PRIVADAS */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  return isAuthenticated
    ? <>{children}</>
    : <Navigate to="/login" replace state={{ from: location }} />; // ← antes no enviaba state
}

/* PÚBLICAS SOLO SIN LOGIN */
export function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated
    ? <Navigate to="/home" replace />
    : <>{children}</>;
}

/* /code requiere email */
export function RequireRecoveryEmail({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const state = (location.state as { email?: string; type?: string } | null) || {};
  const stateEmail = state.email || "";
  const type = state.type || "recover";

  useEffect(() => {
    if (stateEmail && (type === "recover" || type === "registration")) {
      localStorage.setItem(LS_KEYS.email, stateEmail);
    }
  }, [stateEmail, type]);

  const email = stateEmail || getRecoveryEmail();
  if (!email) return <Navigate to="/recover" replace state={{ from: location }} />;
  return <>{children}</>;
}

/* /change-password requiere email + code */
export function RequireRecoveryCode({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const fromState = (location.state as { email?: string; codigo?: string } | null) || {};
  const stateEmail = fromState.email || "";
  const stateCode = fromState.codigo || "";

  useEffect(() => {
    if (stateEmail) localStorage.setItem(LS_KEYS.email, stateEmail);
    if (stateCode) localStorage.setItem(LS_KEYS.code, stateCode);
  }, [stateEmail, stateCode]);

  const email = getRecoveryEmail();
  const code = getRecoveryCode();

  if (!email) return <Navigate to="/recover" replace state={{ from: location }} />;
  if (!code) return <Navigate to="/code" replace state={{ from: location, email }} />;
  return <>{children}</>;
}
