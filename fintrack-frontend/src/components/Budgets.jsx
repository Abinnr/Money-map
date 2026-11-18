
import { useEffect, useState } from "react";
import {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
} from "../services/budgetService";
import { getCategories } from "../services/categoryService";

const MONTHS = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
];

const currency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

function Budgets() {
  const today = new Date();

  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);

  const [amount, setAmount] = useState("");
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [categoryId, setCategoryId] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [budgetData, categoryData] = await Promise.all([
        getBudgets(),
        getCategories(),
      ]);

      setBudgets(budgetData || []);

      setCategories(
        (categoryData || []).filter(
          (category) =>
            category.type === "EXPENSE" &&
            (category.isActive ?? category.active ?? true)
        )
      );
    } catch {
      setError("Failed to load budgets. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function resetForm() {
    setAmount("");
    setMonth(today.getMonth() + 1);
    setYear(today.getFullYear());
    setCategoryId("");
    setEditingId(null);
    setError("");
  }

  function startEditing(budget) {
    setEditingId(budget.id);
    setAmount(String(budget.amount));
    setMonth(budget.month);
    setYear(budget.year);
    setCategoryId(String(budget.categoryId));
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!amount || Number(amount) <= 0) {
      setError("Budget amount must be greater than zero.");
      return;
    }

    if (!Number.isInteger(Number(year)) || Number(year) < 2000) {
      setError("Please enter a valid year.");
      return;
    }

    if (!categoryId) {
      setError("Please select a category.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      if (editingId === null) {
        await createBudget(
          Number(amount),
          Number(month),
          Number(year),
          Number(categoryId)
        );
      } else {
        await updateBudget(
          editingId,
          Number(amount),
          Number(month),
          Number(year),
          Number(categoryId)
        );
      }

      resetForm();
      await loadData();
    } catch {
      setError(
        editingId === null
          ? "Failed to create budget."
          : "Failed to update budget."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(budget) {
    const confirmed = window.confirm(
      `Are you sure you want to delete the budget for "${budget.categoryName}"?`
    );

    if (!confirmed) return;

    setError("");

    try {
      await deleteBudget(budget.id);

      if (editingId === budget.id) {
        resetForm();
      }

      await loadData();
    } catch {
      setError("Failed to delete budget.");
    }
  }

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">FINANCIAL PLANNING</span>
          <h1>Budgets</h1>
          <p className="muted">
            Plan your spending and stay in control of your money.
          </p>
        </div>

        <span className="count-badge">
          {budgets.length} budgets
        </span>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      <section className="card">
        <div className="section-title">
          <div className="section-icon">
            <span>₹</span>
          </div>
          <div>
            <h2>{editingId === null ? "Create a budget" : "Edit budget"}</h2>
            <p className="muted">
              Set a monthly spending limit for a category.
            </p>
          </div>
        </div>

        <form className="modern-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Budget amount</span>
            <div className="input-with-prefix">
              <span>₹</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="5000.00"
                disabled={saving}
                required
              />
            </div>
          </label>

          <label className="field">
            <span>Category</span>
            <select
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              disabled={saving}
              required
            >
              <option value="">Select expense category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Month</span>
            <select
              value={month}
              onChange={(event) => setMonth(Number(event.target.value))}
              disabled={saving}
            >
              {MONTHS.map((name, index) => (
                <option key={name} value={index + 1}>
                  {name}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Year</span>
            <input
              type="number"
              min="2000"
              value={year}
              onChange={(event) => setYear(Number(event.target.value))}
              disabled={saving}
              required
            />
          </label>

          <div className="form-actions full-width">
            <button type="submit" disabled={saving}>
              {saving
                ? "Saving..."
                : editingId === null
                  ? "Create budget"
                  : "Update budget"}
            </button>

            {editingId !== null && (
              <button
                type="button"
                className="secondary"
                onClick={resetForm}
                disabled={saving}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="card">
        <div className="section-heading">
          <div>
            <h2>Your budgets</h2>
            <p className="muted">
              All your configured monthly spending limits.
            </p>
          </div>

          <button
            className="secondary"
            onClick={loadData}
            disabled={loading}
          >
            <span>↻</span> Refresh
          </button>
        </div>

        {loading ? (
          <div className="empty-state">
            <p>Loading budgets...</p>
          </div>
        ) : budgets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">₹</div>
            <h3>No budgets yet</h3>
            <p>Create your first budget to start tracking your spending.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Monthly limit</th>
                  <th>Period</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {budgets.map((budget) => (
                  <tr key={budget.id}>
                    <td>
                      <div className="table-primary">
                        <span className="category-avatar">₹</span>
                        <strong>{budget.categoryName}</strong>
                      </div>
                    </td>

                    <td className="amount-cell">
                      {currency(budget.amount)}
                    </td>

                    <td>
                      <span className="period-badge">
                        {MONTHS[budget.month - 1]} {budget.year}
                      </span>
                    </td>

                    <td>
                      <div className="row-actions">
                        <button
                          className="secondary small-button"
                          onClick={() => startEditing(budget)}
                        >
                          Edit
                        </button>

                        <button
                          className="danger small-button"
                          onClick={() => handleDelete(budget)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default Budgets;
