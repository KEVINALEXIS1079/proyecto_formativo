/**
 * Sets the JWT token in a secure cookie.
 * Note: httpOnly cannot be set from client-side JavaScript; it must be set server-side.
 */
export const setToken = (token: string): void => {
  const expires = new Date();
  expires.setDate(expires.getDate() + 7); // Expires in 7 days
  const isSecure = window.location.protocol === 'https:';
  document.cookie = `authToken=${encodeURIComponent(token)}; expires=${expires.toUTCString()}; ${isSecure ? 'secure;' : ''} sameSite=strict; path=/`;
};

/**
 * Retrieves the JWT token from the cookie.
 */
export const getToken = (): string | undefined => {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'authToken') {
      return decodeURIComponent(value);
    }
  }
  return undefined;
};

/**
 * Removes the JWT token cookie.
 */
export const removeToken = (): void => {
  document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
};