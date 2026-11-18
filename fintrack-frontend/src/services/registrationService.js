
const API_BASE_URL = "http://localhost:8080";

export async function register(name, email, password) {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
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

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(
      responseText || "Registration failed. Please try again."
    );
  }

  return responseText;
}
