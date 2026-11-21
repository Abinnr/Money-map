import { useEffect, useMemo, useState } from "react";
import {
  createTransaction,
  deleteTransaction,
  getTransactions,
  updateTransaction,
} from "../services/transactionService";
import { getCategories } from "../services/categoryService";
import ConfirmModal from "./ConfirmModal";
import StatusAlert from "./StatusAlert";

const PAGE_SIZE = 5;

const currency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

function getCurrentLocalDateTime() {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60 * 1000;
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 16);
}

function toInputDateTime(value) {
  if (!value) return "";
  return value.slice(0, 16);
}

function toApiDateTime(value) {
  return value && value.length === 16 ? `${value}:00` : value;
}

function formatDisplayDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function createInitialForm() {
  return {
    amount: "",
    type: "EXPENSE",
    description: "",
    transactionDate: getCurrentLocalDateTime(),
    categoryId: "",
  };
}

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [type, setType] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [form, setForm] = useState(createInitialForm);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const availableCategories = useMemo(() => {
    return categories.filter(
      (category) =>
        category.type === form.type &&
        (category.isActive ?? category.active ?? true)
    );
  }, [categories, form.type]);

  const filterCategories = useMemo(() => {
    return categories.filter((category) => !type || category.type === type);
  }, [categories, type]);

  const activeFilterCount = [type, categoryId, from, to].filter(Boolean).length;

  async function loadTransactions(targetPage = page) {
    setLoading(true);
    setError("");

    try {
      const data = await getTransactions({
        page: targetPage,
        size: PAGE_SIZE,
        type: type || undefined,
        categoryId: categoryId || undefined,
        from: from ? toApiDateTime(from) : undefined,
        to: to ? toApiDateTime(to) : undefined,
      });

      setTransactions(data.content || []);
      setPage(data.page);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err) {
      setError(err.message || "Failed to load transactions.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function loadInitialData() {
      setLoading(true);
      setError("");
      setCategoryError("");

      const [transactionResult, categoryResult] = await Promise.allSettled([
        getTransactions({
          page: 0,
          size: PAGE_SIZE,
        }),
        getCategories(),
      ]);

      if (cancelled) return;

      if (transactionResult.status === "fulfilled") {
        const data = transactionResult.value;
        setTransactions(data.content || []);
        setPage(data.page);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
      } else {
        setError(
          transactionResult.reason?.message || "Failed to load transactions."
        );
      }

      if (categoryResult.status === "fulfilled") {
        setCategories(categoryResult.value || []);
      } else {
        setCategoryError("Failed to load categories.");
      }

      setLoading(false);
    }

    loadInitialData();

    return () => {
      cancelled = true;
    };
  }, []);

  function updateForm(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field === "type" ? { categoryId: "" } : {}),
    }));
  }

  function resetForm() {
    setForm(createInitialForm());
    setEditingId(null);
    setFormError("");
  }

  function startEditing(transaction) {
    setEditingId(transaction.id);
    setForm({
      amount: String(transaction.amount),
      type: transaction.type,
      description: transaction.description || "",
      transactionDate: toInputDateTime(transaction.transactionDate),
      categoryId: String(transaction.categoryId),
    });
    setFormError("");
    setSuccessMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");
    setSuccessMessage("");

    if (!form.amount || Number(form.amount) <= 0) {
      setFormError("Amount must be greater than zero.");
      return;
    }

    if (!form.categoryId) {
      setFormError("Please select a category.");
      return;
    }

    if (!form.transactionDate) {
      setFormError("Transaction date and time are required.");
      return;
    }

    setSaving(true);

    const payload = {
      amount: Number(form.amount),
      type: form.type,
      description: form.description.trim() || null,
      transactionDate: toApiDateTime(form.transactionDate),
      categoryId: Number(form.categoryId),
    };

    try {
      if (editingId) {
        await updateTransaction(editingId, payload);
        setSuccessMessage("Transaction updated successfully.");
      } else {
        await createTransaction(payload);
        setSuccessMessage("Transaction added successfully.");
      }

      const targetPage = editingId ? page : 0;
      resetForm();
      await loadTransactions(targetPage);
    } catch (err) {
      setFormError(
        err.message ||
          "Failed to save transaction. Check the values and try again."
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
      await deleteTransaction(deleteTarget.id);

      if (editingId === deleteTarget.id) {
        resetForm();
      }

      const nextPage =
        transactions.length === 1 && page > 0 ? page - 1 : page;

      setDeleteTarget(null);
      setSuccessMessage("Transaction deleted.");
      await loadTransactions(nextPage);
    } catch (err) {
      setError(err.message || "Failed to delete transaction.");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  function applyFilters(event) {
    event.preventDefault();
    setPage(0);
    loadTransactions(0);
  }

  function clearFilters() {
    setType("");
    setCategoryId("");
    setFrom("");
    setTo("");
    setPage(0);

    loadTransactionsWithFilters({
      page: 0,
      type: undefined,
      categoryId: undefined,
      from: undefined,
      to: undefined,
    });
  }

  async function loadTransactionsWithFilters(filters) {
    setLoading(true);
    setError("");

    try {
      const data = await getTransactions({
        page: filters.page,
        size: PAGE_SIZE,
        type: filters.type,
        categoryId: filters.categoryId,
        from: filters.from,
        to: filters.to,
      });

      setTransactions(data.content || []);
      setPage(data.page);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err) {
      setError(err.message || "Failed to load transactions.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">CASH FLOW LEDGER</span>
          <h1>Transactions</h1>
          <p className="muted">
            Record and review your personal income and expenses.
          </p>
        </div>

        <span className="count-badge tabular-nums">
          {totalElements} {totalElements === 1 ? "transaction" : "transactions"}
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

      <section className="card">
        <div className="section-title">
          <div className="section-icon">
            <span>{editingId ? "✎" : "＋"}</span>
          </div>
          <div>
            <h2>{editingId ? "Edit transaction" : "Add transaction"}</h2>
            <p className="muted">
              {editingId
                ? "Update the selected transaction details."
                : "Log a new income entry or expense."}
            </p>
          </div>
        </div>

        <form className="modern-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Amount</span>
            <div className="input-with-prefix">
              <span>₹</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={(event) => updateForm("amount", event.target.value)}
                placeholder="0.00"
                disabled={saving}
                required
              />
            </div>
          </label>

          <label className="field">
            <span>Type</span>
            <select
              value={form.type}
              onChange={(event) => updateForm("type", event.target.value)}
              disabled={saving}
              required
            >
              <option value="EXPENSE">Expense</option>
              <option value="INCOME">Income</option>
            </select>
          </label>

          <label className="field">
            <span>Category</span>
            <select
              value={form.categoryId}
              onChange={(event) =>
                updateForm("categoryId", event.target.value)
              }
              disabled={saving}
              required
            >
              <option value="">
                {availableCategories.length === 0
                  ? `No ${form.type.toLowerCase()} categories available`
                  : "Select category"}
              </option>
              {availableCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Date & time</span>
            <input
              type="datetime-local"
              value={form.transactionDate}
              onChange={(event) =>
                updateForm("transactionDate", event.target.value)
              }
              disabled={saving}
              required
            />
          </label>

          <label className="field full-width">
            <span>Description (optional)</span>
            <input
              type="text"
              value={form.description}
              onChange={(event) =>
                updateForm("description", event.target.value)
              }
              placeholder="e.g. Grocery run, Monthly salary, Electricity bill"
              maxLength={255}
              disabled={saving}
            />
          </label>

          {categoryError && (
            <div className="full-width">
              <StatusAlert
                type="warning"
                message={categoryError}
                onDismiss={() => setCategoryError("")}
              />
            </div>
          )}

          {formError && (
            <div className="full-width">
              <StatusAlert
                type="error"
                message={formError}
                onDismiss={() => setFormError("")}
              />
            </div>
          )}

          <div className="form-actions full-width">
            <button type="submit" disabled={saving}>
              {saving
                ? "Saving..."
                : editingId
                  ? "Update transaction"
                  : "Add transaction"}
            </button>

            {editingId && (
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
            <h2>Filter transactions</h2>
            <p className="muted">
              Narrow down records by type, category, or date range.
            </p>
          </div>

          {activeFilterCount > 0 && (
            <span className="count-badge">
              {activeFilterCount} active {activeFilterCount === 1 ? "filter" : "filters"}
            </span>
          )}
        </div>

        <form className="modern-form" onSubmit={applyFilters}>
          <label className="field">
            <span>Type</span>
            <select
              value={type}
              onChange={(event) => {
                const nextType = event.target.value;
                setType(nextType);

                if (categoryId) {
                  const selectedCategory = categories.find(
                    (category) => String(category.id) === String(categoryId)
                  );

                  if (
                    selectedCategory &&
                    nextType &&
                    selectedCategory.type !== nextType
                  ) {
                    setCategoryId("");
                  }
                }
              }}
            >
              <option value="">All types</option>
              <option value="EXPENSE">Expense</option>
              <option value="INCOME">Income</option>
            </select>
          </label>

          <label className="field">
            <span>Category</span>
            <select
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
            >
              <option value="">All categories</option>
              {filterCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>From</span>
            <input
              type="datetime-local"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
            />
          </label>

          <label className="field">
            <span>To</span>
            <input
              type="datetime-local"
              value={to}
              onChange={(event) => setTo(event.target.value)}
            />
          </label>

          <div className="form-actions full-width">
            <button type="submit" disabled={loading}>
              Apply filters
            </button>
            <button
              type="button"
              className="secondary"
              onClick={clearFilters}
              disabled={loading || activeFilterCount === 0}
            >
              Clear filters
            </button>
          </div>
        </form>
      </section>

      <section className="card">
        <div className="section-heading">
          <div>
            <h2>Transaction history</h2>
            <p className="muted">
              Showing page {totalPages === 0 ? 0 : page + 1} of {totalPages}
            </p>
          </div>

          <button
            type="button"
            className="secondary"
            onClick={() => loadTransactions(page)}
            disabled={loading}
          >
            ↻ Refresh
          </button>
        </div>

        {loading ? (
          <div className="empty-state">
            <div className="loading-spinner" />
            <p>Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">▤</div>
            <h3>No transactions found</h3>
            <p>
              {activeFilterCount > 0
                ? "Try clearing or adjusting your active filters."
                : "Add your first income or expense transaction above to get started."}
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Date & time</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => {
                  const isIncome = transaction.type === "INCOME";

                  return (
                    <tr key={transaction.id}>
                      <td>
                        <div className="table-primary">
                          <span className="category-avatar">
                            {transaction.categoryName?.charAt(0).toUpperCase() || "₹"}
                          </span>
                          <strong>{transaction.categoryName}</strong>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`type-badge ${
                            isIncome ? "income-badge" : "expense-badge"
                          }`}
                        >
                          {isIncome ? "Income" : "Expense"}
                        </span>
                      </td>

                      <td>{transaction.description || "—"}</td>

                      <td className="tabular-nums">
                        {formatDisplayDate(transaction.transactionDate)}
                      </td>

                      <td
                        className={`amount-cell ${
                          isIncome ? "positive-text" : "negative-text"
                        }`}
                      >
                        {isIncome ? "+" : "-"}
                        {currency(transaction.amount)}
                      </td>

                      <td>
                        <div className="row-actions">
                          <button
                            type="button"
                            className="secondary small-button"
                            onClick={() => startEditing(transaction)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="danger small-button"
                            onClick={() => setDeleteTarget(transaction)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 0 && (
          <div className="pagination">
            <button
              type="button"
              className="secondary"
              disabled={page === 0 || loading}
              onClick={() => loadTransactions(page - 1)}
            >
              ‹ Previous
            </button>

            <span className="tabular-nums">
              Page {page + 1} of {totalPages}
            </span>

            <button
              type="button"
              className="secondary"
              disabled={page >= totalPages - 1 || loading}
              onClick={() => loadTransactions(page + 1)}
            >
              Next ›
            </button>
          </div>
        )}
      </section>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete transaction?"
        message={
          deleteTarget
            ? `Are you sure you want to delete this ${deleteTarget.type.toLowerCase()} of ${currency(
                deleteTarget.amount
              )} under "${deleteTarget.categoryName}"? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete transaction"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </main>
  );
}

export default Transactions;