


import { apiFetch } from "./apiClient";

export function getDashboard(month, year) {
  return apiFetch(`/api/dashboard?month=${month}&year=${year}`);
}