import { API_BASE_URL } from "./apiClient";
import { setToken } from "./authStorage";

export async function login(email, password) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });
  } catch {
    throw new Error("Unable to reach the server. Check your connection.");
  }

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(responseText || "Invalid email or password.");
  }

  setToken(responseText);
  return responseText;
}