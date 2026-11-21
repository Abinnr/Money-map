import { API_BASE_URL } from "./apiClient";

export async function register(name, email, password) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });
  } catch {
    throw new Error("Unable to reach the server. Check your connection.");
  }

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(
      responseText || "Registration failed. Please try again."
    );
  }

  return responseText;
}