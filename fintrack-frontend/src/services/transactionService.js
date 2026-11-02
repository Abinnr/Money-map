const API_BASE_URL = "http://localhost:8080";

function getAuthHeaders() {
  const token = localStorage.getItem("fintrack_token");

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function getTransactions({
  page = 0,
  size = 5,
  type,
  categoryId,
  from,
  to,
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  if (type) params.set("type", type);
  if (categoryId) params.set("categoryId", String(categoryId));
  if (from) params.set("from", from);
  if (to) params.set("to", to);

  const response = await fetch(
    `${API_BASE_URL}/api/transactions?${params.toString()}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch transactions");
  }

  return await response.json();
}

export async function createTransaction(transaction) {
  const response = await fetch(`${API_BASE_URL}/api/transactions`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(transaction),
  });

  if (!response.ok) {
    throw new Error("Failed to create transaction");
  }

  return await response.json();
}

export async function updateTransaction(id, transaction) {
  const response = await fetch(`${API_BASE_URL}/api/transactions/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(transaction),
  });

  if (!response.ok) {
    throw new Error("Failed to update transaction");
  }

  return await response.json();
}

export async function deleteTransaction(id) {
  const response = await fetch(`${API_BASE_URL}/api/transactions/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to delete transaction");
  }
}
