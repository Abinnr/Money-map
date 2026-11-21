


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