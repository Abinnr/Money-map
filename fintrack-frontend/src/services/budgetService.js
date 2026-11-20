// const API_BASE_URL = "http://localhost:8080";

// function getAuthHeaders() {
//   const token = localStorage.getItem("fintrack_token");

//   return {
//     Authorization: `Bearer ${token}`,
//     "Content-Type": "application/json",
//   };
// }

// export async function getBudgets() {
//   const response = await fetch(`${API_BASE_URL}/api/budgets`, {
//     method: "GET",
//     headers: getAuthHeaders(),
//   });

//   if (!response.ok) {
//     throw new Error("Failed to fetch budgets");
//   }

//   return await response.json();
// }

// export async function createBudget(amount, month, year, categoryId) {
//   const response = await fetch(`${API_BASE_URL}/api/budgets`, {
//     method: "POST",
//     headers: getAuthHeaders(),
//     body: JSON.stringify({
//       amount,
//       month,
//       year,
//       categoryId,
//     }),
//   });

//   if (!response.ok) {
//     throw new Error("Failed to create budget");
//   }

//   return await response.json();
// }

// export async function updateBudget(
//   id,
//   amount,
//   month,
//   year,
//   categoryId
// ) {
//   const response = await fetch(`${API_BASE_URL}/api/budgets/${id}`, {
//     method: "PUT",
//     headers: getAuthHeaders(),
//     body: JSON.stringify({
//       amount,
//       month,
//       year,
//       categoryId,
//     }),
//   });

//   if (!response.ok) {
//     throw new Error("Failed to update budget");
//   }

//   return await response.json();
// }

// export async function deleteBudget(id) {
//   const response = await fetch(`${API_BASE_URL}/api/budgets/${id}`, {
//     method: "DELETE",
//     headers: getAuthHeaders(),
//   });

//   if (!response.ok) {
//     throw new Error("Failed to delete budget");
//   }
// }


import { apiFetch } from "./apiClient";

export function getBudgets() {
  return apiFetch("/api/budgets");
}

export function createBudget(amount, month, year, categoryId) {
  return apiFetch("/api/budgets", {
    method: "POST",
    body: JSON.stringify({ amount, month, year, categoryId }),
  });
}

export function updateBudget(id, amount, month, year, categoryId) {
  return apiFetch(`/api/budgets/${id}`, {
    method: "PUT",
    body: JSON.stringify({ amount, month, year, categoryId }),
  });
}

export function deleteBudget(id) {
  return apiFetch(`/api/budgets/${id}`, {
    method: "DELETE",
  });
}