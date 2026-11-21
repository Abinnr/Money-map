


import { apiFetch } from "./apiClient";

export function getTransactions({
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

  return apiFetch(`/api/transactions?${params.toString()}`);
}

export function createTransaction(transaction) {
  return apiFetch("/api/transactions", {
    method: "POST",
    body: JSON.stringify(transaction),
  });
}

export function updateTransaction(id, transaction) {
  return apiFetch(`/api/transactions/${id}`, {
    method: "PUT",
    body: JSON.stringify(transaction),
  });
}

export function deleteTransaction(id) {
  return apiFetch(`/api/transactions/${id}`, {
    method: "DELETE",
  });
}
