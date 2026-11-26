import {
  getValidToken,
  triggerUnauthorizedLogout,
} from "./authStorage";
import { extractErrorMessage } from "./errorParser";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

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
    const message = await extractErrorMessage(
      response,
      `Something went wrong (error ${response.status}). Please try again.`
    );
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  const responseText = await response.text();
  if (!responseText) {
    return null;
  }

  return JSON.parse(responseText);
}