import {
  getValidToken,
  triggerUnauthorizedLogout,
} from "./authStorage";

export const API_BASE_URL = "http://localhost:8080";

/**
 * Wrapper around native fetch() for authenticated MoneyMap API endpoints.
 */
export async function apiFetch(endpoint, options = {}) {
  const token = getValidToken();

  if (!token) {
    triggerUnauthorizedLogout("Your session has expired. Please log in again.");
    throw new Error("Session expired. Please log in again.");
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...options.headers,
  };

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error("Unable to reach the server. Check your connection.");
  }

  if (response.status === 401) {
    triggerUnauthorizedLogout("Your session has expired. Please log in again.");
    throw new Error("Session expired. Please log in again.");
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed with status ${response.status}`);
  }

  // Handle 204 No Content or empty DELETE responses safely
  if (response.status === 204) {
    return null;
  }

  const responseText = await response.text();
  if (!responseText) {
    return null;
  }

  return JSON.parse(responseText);
}