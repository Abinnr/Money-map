// const API_BASE_URL = "http://localhost:8080";

// function getAuthHeaders() {
//   const token = localStorage.getItem("fintrack_token");

//   return {
//     Authorization: `Bearer ${token}`,
//     "Content-Type": "application/json",
//   };
// }

// export async function getCategories() {
//   const response = await fetch(`${API_BASE_URL}/api/categories`, {
//     method: "GET",
//     headers: getAuthHeaders(),
//   });

//   if (!response.ok) {
//     throw new Error("Failed to fetch categories");
//   }

//   return await response.json();
// }

// export async function createCategory(name, type) {
//   const response = await fetch(`${API_BASE_URL}/api/categories`, {
//     method: "POST",
//     headers: getAuthHeaders(),
//     body: JSON.stringify({
//       name,
//       type,
//     }),
//   });

//   if (!response.ok) {
//     throw new Error("Failed to create category");
//   }

//   return await response.json();
// }

// export async function updateCategory(id, name, type) {
//   const response = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
//     method: "PUT",
//     headers: getAuthHeaders(),
//     body: JSON.stringify({
//       name,
//       type,
//     }),
//   });

//   if (!response.ok) {
//     throw new Error("Failed to update category");
//   }

//   return await response.json();
// }

// export async function deleteCategory(id) {
//   const response = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
//     method: "DELETE",
//     headers: getAuthHeaders(),
//   });

//   if (!response.ok) {
//     throw new Error("Failed to delete category");
//   }
// }


import { apiFetch } from "./apiClient";

export function getCategories() {
  return apiFetch("/api/categories");
}

export function createCategory(name, type) {
  return apiFetch("/api/categories", {
    method: "POST",
    body: JSON.stringify({ name, type }),
  });
}

export function updateCategory(id, name, type) {
  return apiFetch(`/api/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify({ name, type }),
  });
}

export function deleteCategory(id) {
  return apiFetch(`/api/categories/${id}`, {
    method: "DELETE",
  });
}