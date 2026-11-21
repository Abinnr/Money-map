const TOKEN_KEY = "fintrack_token";
export const UNAUTHORIZED_EVENT = "fintrack:unauthorized";

/**
 * Decodes the middle Base64URL payload section of a JWT.
 * Returns the parsed JSON object, or null if the token is malformed.
 */
export function parseJwtPayload(token) {
  if (!token || typeof token !== "string") {
    return null;
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }

  try {
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "="
    );

    const jsonString = atob(padded);
    return JSON.parse(jsonString);
  } catch {
    return null;
  }
}

/**
 * Checks whether a JWT is missing, malformed, or past its 'exp' claim.
 * Includes a 10-second buffer to avoid race conditions during network transit.
 */
export function isTokenExpired(token, bufferSeconds = 10) {
  const payload = parseJwtPayload(token);

  if (!payload || typeof payload.exp !== "number") {
    return true;
  }

  const expiryTimeMs = payload.exp * 1000;
  const currentTimeMs = Date.now() + bufferSeconds * 1000;

  return currentTimeMs >= expiryTimeMs;
}

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  sessionStorage.removeItem(TOKEN_KEY);
}

/**
 * Returns a valid (non-expired) token for the current tab, or clears storage and returns null.
 */
export function getValidToken() {
  const token = getToken();

  if (!token) {
    return null;
  }

  if (isTokenExpired(token)) {
    clearToken();
    return null;
  }

  return token;
}

/**
 * Clears invalid auth state in the current tab and broadcasts an event so App.jsx redirects to Login.
 */
export function triggerUnauthorizedLogout(
  message = "Your session has expired. Please log in again."
) {
  clearToken();
  window.dispatchEvent(
    new CustomEvent(UNAUTHORIZED_EVENT, {
      detail: { message },
    })
  );
}