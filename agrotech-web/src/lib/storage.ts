/**
 * Utilidades para manejo seguro de localStorage y sessionStorage
 */

/**
 * Intenta parsear un valor JSON de forma segura
 * @param value Valor a parsear
 * @param fallback Valor por defecto si falla el parse
 * @returns El objeto parseado o el fallback
 */
export function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

/**
 * Obtiene un valor de localStorage con parse seguro
 * @param key Clave del storage
 * @param fallback Valor por defecto
 * @returns El valor parseado o el fallback
 */
export function getLocalStorageItem<T>(key: string, fallback: T): T {
  const value = localStorage.getItem(key);
  return safeJsonParse(value, fallback);
}

/**
 * Establece un valor en localStorage con stringify
 * @param key Clave del storage
 * @param value Valor a almacenar
 */
export function setLocalStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignorar errores de storage
  }
}

/**
 * Limpia datos corruptos en localStorage
 * @param validKeys Claves válidas que no deben eliminarse
 */
export function cleanCorruptLocalStorage(validKeys: string[] = []): void {
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key && !validKeys.includes(key)) {
      const value = localStorage.getItem(key);
      if (value !== null) {
        try {
          JSON.parse(value); // Verificar si es JSON válido
        } catch {
          localStorage.removeItem(key);
        }
      }
    }
  }
}

/**
 * Limpia datos corruptos en sessionStorage
 * @param validKeys Claves válidas que no deben eliminarse
 */
export function cleanCorruptSessionStorage(validKeys: string[] = []): void {
  for (let i = sessionStorage.length - 1; i >= 0; i--) {
    const key = sessionStorage.key(i);
    if (key && !validKeys.includes(key)) {
      const value = sessionStorage.getItem(key);
      if (value !== null) {
        try {
          JSON.parse(value);
        } catch {
          sessionStorage.removeItem(key);
        }
      }
    }
  }
}