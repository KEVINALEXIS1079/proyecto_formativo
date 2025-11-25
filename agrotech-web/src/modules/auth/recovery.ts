const KEYS = { email: "recoveryEmail", code: "recoveryCode" } as const;

export function setRecoveryEmail(email: string) {
  localStorage.setItem(KEYS.email, email);
}
export function getRecoveryEmail() {
  return localStorage.getItem(KEYS.email) || "";
}

export function setRecoveryCode(code: string) {
  localStorage.setItem(KEYS.code, code);
}
export function getRecoveryCode() {
  return localStorage.getItem(KEYS.code) || "";
}

export function clearRecovery() {
  localStorage.removeItem(KEYS.email);
  localStorage.removeItem(KEYS.code);
}
