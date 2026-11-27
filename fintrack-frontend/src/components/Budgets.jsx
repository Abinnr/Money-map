import { useEffect, useMemo, useState } from "react";
import {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
} from "../services/budgetService";
import { getCategories } from "../services/categoryService";
import { getBudgetReport } from "../services/reportService";
import ConfirmModal from "./ConfirmModal";
import StatusAlert from "./StatusAlert";

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
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [performanceMap, setPerformanceMap] = useState({});

  const [viewMonth, setViewMonth] = useState(currentMonth);
  const [viewYear, setViewYear] = useState(currentYear);

  const [amount, setAmount] = useState("");
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);
  const [categoryId, setCategoryId] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function loadData(targetMonth = viewMonth, targetYear = viewYear) {
    setLoading(true);
    setError("");

    try {
      const [budgetData, categoryData, reportData] = await Promise.all([
        getBudgets(),
        getCategories(),
        getBudgetReport(targetMonth, targetYear),
      ]);

      setBudgets(budgetData || []);

      setCategories(
        (categoryData || []).filter(
          (category) =>
            category.type === "EXPENSE" &&
            (category.isActive ?? category.active ?? true)
        )
      );

      const perfByBudgetId = {};
      (reportData || []).forEach((item) => {
        perfByBudgetId[item.budgetId] = item;
      });
      setPerformanceMap(perfByBudgetId);
    } catch (err) {
      setError(err.message || "Failed to load budgets. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function fetchInitial() {
      setLoading(true);
      setError("");

      try {
        const [budgetData, categoryData, reportData] = await Promise.all([
          getBudgets(),
          getCategories(),
          getBudgetReport(viewMonth, viewYear),
        ]);

        if (cancelled) return;

        setBudgets(budgetData || []);

        setCategories(
          (categoryData || []).filter(
            (category) =>
              category.type === "EXPENSE" &&
              (category.isActive ?? category.active ?? true)
          )
        );

        const perfByBudgetId = {};
        (reportData || []).forEach((item) => {
          perfByBudgetId[item.budgetId] = item;
        });
        setPerformanceMap(perfByBudgetId);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load budgets. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchInitial();

    return () => {
      cancelled = true;
    };
  }, [viewMonth, viewYear]);

  function resetForm() {
    setAmount("");
    setMonth(viewMonth);
    setYear(viewYear);
    setCategoryId("");
    setEditingId(null);
  }

  function startEditing(budget) {
    setEditingId(budget.id);
    setAmount(String(budget.amount));
    setMonth(budget.month);
    setYear(budget.year);
    setCategoryId(String(budget.categoryId));
    setError("");
    setSuccessMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!amount || Number(amount) <= 0) {
      setError("Budget amount must be greater than zero.");
      return;
    }

    if (!Number.isInteger(Number(year)) || Number(year) < 2000) {
      setError("Please enter a valid year (2000 or later).");
      return;
    }

    if (!categoryId) {
      setError("Please select an expense category.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccessMessage("");

    const targetMonth = Number(month);
    const targetYear = Number(year);

    try {
      if (editingId === null) {
        await createBudget(
          Number(amount),
          targetMonth,
          targetYear,
          Number(categoryId)
        );
        setSuccessMessage("Monthly budget created successfully.");
      } else {
        await updateBudget(
          editingId,
          Number(amount),
          targetMonth,
          targetYear,
          Number(categoryId)
        );
        setSuccessMessage("Monthly budget updated successfully.");
      }

      resetForm();
      setViewMonth(targetMonth);
      setViewYear(targetYear);
      await loadData(targetMonth, targetYear);
    } catch (err) {
      setError(
        err.message ||
          (editingId === null
            ? "Failed to create budget."
            : "Failed to update budget.")
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;

    setDeleting(true);
    setError("");
    setSuccessMessage("");

    try {
      await deleteBudget(deleteTarget.id);

      if (editingId === deleteTarget.id) {
        resetForm();
      }

      const categoryName = deleteTarget.categoryName;
      setDeleteTarget(null);
      setSuccessMessage(`Budget for "${categoryName}" deleted.`);
      await loadData(viewMonth, viewYear);
    } catch (err) {
      setError(err.message || "Failed to delete budget.");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  const periodBudgets = useMemo(() => {
    return budgets.filter(
      (budget) =>
        Number(budget.month) === Number(viewMonth) &&
        Number(budget.year) === Number(viewYear)
    );
  }, [budgets, viewMonth, viewYear]);

  const totalBudgetLimit = periodBudgets.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  const totalActualSpent = periodBudgets.reduce((sum, item) => {
    const perf = performanceMap[item.id];
    return sum + Number(perf?.actualAmount || 0);
  }, 0);

  const totalRemaining = totalBudgetLimit - totalActualSpent;

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">FINANCIAL PLANNING</span>
          <h1>Budgets</h1>
          <p className="muted">
            Set category spending caps and monitor utilization in real time.
          </p>
        </div>

        <span className="count-badge tabular-nums">
          {periodBudgets.length} {periodBudgets.length === 1 ? "budget" : "budgets"} in{" "}
          {MONTHS[viewMonth - 1]} {viewYear}
        </span>
      </div>

      <StatusAlert
        type="success"
        message={successMessage}
        onDismiss={() => setSuccessMessage("")}
        autoDismissMs={4000}
      />

      <StatusAlert
        type="error"
        message={error}
        onDismiss={() => setError("")}
      />

      <div className="stats-grid stats-grid-three">
        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">Total planned budget</span>
            <span className="stat-icon balance-icon">₹</span>
          </div>
          <strong className="stat-value">{currency(totalBudgetLimit)}</strong>
          <span className="stat-description">
            For {MONTHS[viewMonth - 1]} {viewYear}
          </span>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">Actual spending</span>
            <span className="stat-icon expense-icon">↙</span>
          </div>
          <strong className="stat-value negative-text">
            {currency(totalActualSpent)}
          </strong>
          <span className="stat-description">
            Across budgeted categories
          </span>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">Remaining allowance</span>
            <span className="stat-icon income-icon">✓</span>
          </div>
          <strong
            className={`stat-value ${
              totalRemaining < 0 ? "negative-text" : "positive-text"
            }`}
          >
            {currency(totalRemaining)}
          </strong>
          <span className="stat-description">
            {totalRemaining < 0 ? "Over total budget" : "Available to spend"}
          </span>
        </div>
      </div>

      <section className="card">
        <div className="section-title">
          <div className="section-icon">
            <span>{editingId === null ? "₹" : "✎"}</span>
          </div>
          <div>
            <h2>{editingId === null ? "Create a budget" : "Edit budget"}</h2>
            <p className="muted">
              Set a monthly spending limit for an expense category.
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
            <span>Expense category</span>
            <select
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              disabled={saving}
              required
            >
              <option value="">
                {categories.length === 0
                  ? "No expense categories available"
                  : "Select expense category"}
              </option>
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
                onClick={() => {
                  resetForm();
                  setError("");
                }}
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
            <h2>
              Budgets for {MONTHS[viewMonth - 1]} {viewYear}
            </h2>
            <p className="muted">
              Track progress and overspending warnings by category.
            </p>
          </div>

          <div className="page-header-actions">
            <select
              aria-label="Filter budgets by month"
              value={viewMonth}
              onChange={(event) => setViewMonth(Number(event.target.value))}
            >
              {MONTHS.map((name, index) => (
                <option key={name} value={index + 1}>
                  {name}
                </option>
              ))}
            </select>

            <input
              type="number"
              aria-label="Filter budgets by year"
              min="2000"
              value={viewYear}
              onChange={(event) => setViewYear(Number(event.target.value))}
              style={{ width: "100px" }}
            />

            <button
              type="button"
              className="secondary"
              onClick={() => loadData(viewMonth, viewYear)}
              disabled={loading}
            >
              ↻ Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            <div className="loading-spinner" />
            <p>Loading budgets...</p>
          </div>
        ) : periodBudgets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">₹</div>
            <h3>No budgets for {MONTHS[viewMonth - 1]} {viewYear}</h3>
            <p>
              Create a budget above for this period or switch the month/year selector.
            </p>
          </div>
        ) : (
          <div className="budget-cards-grid">
            {periodBudgets.map((budget) => {
              const perf = performanceMap[budget.id];
              const actual = Number(perf?.actualAmount || 0);
              const limit = Number(budget.amount || 0);
              const remaining =
                perf?.remainingAmount !== undefined
                  ? Number(perf.remainingAmount)
                  : limit - actual;
              const utilization =
                perf?.utilizationPercentage !== undefined
                  ? Number(perf.utilizationPercentage)
                  : limit > 0
                    ? (actual / limit) * 100
                    : 0;

              const isOverspent = utilization > 100;
              const isNearLimit = !isOverspent && utilization >= 80;

              return (
                <article className="budget-card-item" key={budget.id}>
                  <div className="budget-card-header">
                    <div className="table-primary">
                      <span className="category-avatar">
                        {budget.categoryName?.charAt(0).toUpperCase() || "₹"}
                      </span>
                      <div>
                        <strong>{budget.categoryName}</strong>
                        <div className="muted" style={{ fontSize: "12px" }}>
                          {MONTHS[budget.month - 1]} {budget.year}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`type-badge ${
                        isOverspent
                          ? "expense-badge"
                          : isNearLimit
                            ? "warning-badge"
                            : "income-badge"
                      }`}
                    >
                      {isOverspent
                        ? "Overspent"
                        : isNearLimit
                          ? "Near Limit"
                          : "On Track"}
                    </span>
                  </div>

                  <div>
                    <div className="breakdown-heading">
                      <span className="muted">
                        Spent:{" "}
                        <strong style={{ color: "var(--text-h)" }}>
                          {currency(actual)}
                        </strong>{" "}
                        of {currency(limit)}
                      </span>
                      <strong
                        className={`tabular-nums ${
                          isOverspent ? "negative-text" : "positive-text"
                        }`}
                      >
                        {utilization.toFixed(1)}%
                      </strong>
                    </div>

                    <div className="progress-track">
                      <div
                        className={`progress-fill ${
                          isOverspent
                            ? "progress-danger"
                            : isNearLimit
                              ? "progress-warning"
                              : "progress-budget"
                        }`}
                        style={{ width: `${Math.min(utilization, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="budget-card-footer">
                    <span
                      className={`tabular-nums ${
                        remaining < 0 ? "negative-text" : "muted"
                      }`}
                      style={{ fontSize: "12.5px", fontWeight: 600 }}
                    >
                      {remaining < 0
                        ? `Overspent by ${currency(Math.abs(remaining))}`
                        : `Remaining: ${currency(remaining)}`}
                    </span>

                    <div className="row-actions">
                      <button
                        type="button"
                        className="secondary small-button"
                        onClick={() => startEditing(budget)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="danger small-button"
                        onClick={() => setDeleteTarget(budget)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete budget?"
        message={
          deleteTarget
            ? `Are you sure you want to delete the ${MONTHS[deleteTarget.month - 1]} ${
                deleteTarget.year
              } budget of ${currency(deleteTarget.amount)} for "${
                deleteTarget.categoryName
              }"?`
            : ""
        }
        confirmLabel="Delete budget"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </main>
  );
}

export default Budgets;