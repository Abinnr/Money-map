


import { apiFetch } from "./apiClient";

export function getMonthlyReport(from, to) {
  return apiFetch(`/api/reports/monthly?from=${from}&to=${to}`);
}

export function getCategoryReport(month, year) {
  return apiFetch(`/api/reports/categories?month=${month}&year=${year}`);
}

export function getBudgetReport(month, year) {
  return apiFetch(`/api/reports/budgets?month=${month}&year=${year}`);
}