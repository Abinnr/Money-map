
const API_BASE_URL = "http://localhost:8080";

async function fetchReport(endpoint) {
  const token = localStorage.getItem("fintrack_token");

  if (!token) {
    throw new Error("Authentication required. Please log in again.");
  }

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (response.status === 401 || response.status === 403) {
    throw new Error("Session expired or unauthorized. Please log in again.");
  }

  if (!response.ok) {
    throw new Error("Failed to fetch report data.");
  }

  return response.json();
}

export async function getMonthlyReport(from, to) {
  return fetchReport(
    `/api/reports/monthly?from=${from}&to=${to}`
  );
}

export async function getCategoryReport(month, year) {
  return fetchReport(
    `/api/reports/categories?month=${month}&year=${year}`
  );
}

export async function getBudgetReport(month, year) {
  return fetchReport(
    `/api/reports/budgets?month=${month}&year=${year}`
  );
}
