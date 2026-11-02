const API_BASE_URL = "http://localhost:8080";

export async function getDashboard(month, year) {
  const token = localStorage.getItem("fintrack_token");

  const response = await fetch(
    `${API_BASE_URL}/api/dashboard?month=${month}&year=${year}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard");
  }

  return await response.json();
}