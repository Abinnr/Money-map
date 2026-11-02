const API_BASE_URL = "http://localhost:8080";

function getAuthHeaders() {
  const token = localStorage.getItem("fintrack_token");

  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function getCategories() {
  const response = await fetch(`${API_BASE_URL}/api/categories`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }

  return await response.json();
}
