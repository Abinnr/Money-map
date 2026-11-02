import { useEffect, useMemo, useState } from "react";
import {
  createTransaction,
  deleteTransaction,
  getTransactions,
  updateTransaction,
} from "../services/transactionService";
import { getCategories } from "../services/categoryService";

const PAGE_SIZE = 5;

const initialForm = {
  amount: "",
  type: "EXPENSE",
  description: "",
  transactionDate: "",
  categoryId: "",
};

function toInputDateTime(value) {
  if (!value) return "";
  return value.slice(0, 16);
}

function toApiDateTime(value) {
  return value ? `${value}:00` : value;
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

  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [categoryError, setCategoryError] = useState("");

  const availableCategories = useMemo(() => {
    const selectedType = form.type;

    return categories.filter((category) => category.type === selectedType);
  }, [categories, form.type]);

  const filterCategories = useMemo(() => {
    return categories.filter((category) => !type || category.type === type);
  }, [categories, type]);

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
    } catch {
      setError("Failed to load transactions.");
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
        setError("Failed to load transactions.");
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
    setForm(initialForm);
    setEditingId(null);
    setFormError("");
  }

  function startEditing(transaction) {
    setEditingId(transaction.id);
    setForm({
      amount: transaction.amount,
      type: transaction.type,
      description: transaction.description || "",
      transactionDate: toInputDateTime(transaction.transactionDate),
      categoryId: transaction.categoryId,
    });
    setFormError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");
    setSaving(true);

    const payload = {
      amount: Number(form.amount),
      type: form.type,
      description: form.description || null,
      transactionDate: toApiDateTime(form.transactionDate),
      categoryId: Number(form.categoryId),
    };

    try {
      if (editingId) {
        await updateTransaction(editingId, payload);
      } else {
        await createTransaction(payload);
      }

      resetForm();
      await loadTransactions(editingId ? page : 0);

      if (!editingId) {
        setPage(0);
      }
    } catch {
      setFormError("Failed to save transaction. Check the values and try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Delete this transaction? This action cannot be undone from the frontend."
    );

    if (!confirmed) return;

    setError("");

    try {
      await deleteTransaction(id);

      const nextPage =
        transactions.length === 1 && page > 0 ? page - 1 : page;

      await loadTransactions(nextPage);
    } catch {
      setError("Failed to delete transaction.");
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

    // The request must use cleared values immediately rather than waiting
    // for React state to update.
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
    } catch {
      setError("Failed to load transactions.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Transactions</h1>
          <p className="muted">Manage your income and expenses.</p>
        </div>
        <span className="count-badge">{totalElements} total</span>
      </div>

      <section className="card">
        <h2>{editingId ? "Edit Transaction" : "Add Transaction"}</h2>

        <form className="transaction-form" onSubmit={handleSubmit}>
          <label>
            Amount
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={(event) => updateForm("amount", event.target.value)}
              required
            />
          </label>

          <label>
            Type
            <select
              value={form.type}
              onChange={(event) => updateForm("type", event.target.value)}
              required
            >
              <option value="EXPENSE">Expense</option>
              <option value="INCOME">Income</option>
            </select>
          </label>

          <label>
            Category
            <select
              value={form.categoryId}
              onChange={(event) =>
                updateForm("categoryId", event.target.value)
              }
              required
            >
              <option value="">Select category</option>
              {availableCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Transaction date
            <input
              type="datetime-local"
              value={form.transactionDate}
              onChange={(event) =>
                updateForm("transactionDate", event.target.value)
              }
              required
            />
          </label>

          <label className="full-width">
            Description
            <input
              type="text"
              value={form.description}
              onChange={(event) =>
                updateForm("description", event.target.value)
              }
              placeholder="Optional"
            />
          </label>

          {categoryError && (
            <p className="error full-width">{categoryError}</p>
          )}
          {formError && <p className="error full-width">{formError}</p>}

          <div className="form-actions full-width">
            <button type="submit" disabled={saving}>
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Transaction"
                  : "Add Transaction"}
            </button>

            {editingId && (
              <button type="button" className="secondary" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="card">
        <h2>Filters</h2>

        <form className="filter-form" onSubmit={applyFilters}>
          <label>
            Type
            <select
              value={type}
              onChange={(event) => {
                const nextType = event.target.value;
                setType(nextType);

                if (categoryId) {
                  const selectedCategory = categories.find(
                    (category) => String(category.id) === String(categoryId)
                  );

                  if (selectedCategory && nextType && selectedCategory.type !== nextType) {
                    setCategoryId("");
                  }
                }
              }}
            >
              <option value="">All</option>
              <option value="EXPENSE">Expense</option>
              <option value="INCOME">Income</option>
            </select>
          </label>

          <label>
            Category
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

          <label>
            From
            <input
              type="datetime-local"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
            />
          </label>

          <label>
            To
            <input
              type="datetime-local"
              value={to}
              onChange={(event) => setTo(event.target.value)}
            />
          </label>

          <div className="form-actions">
            <button type="submit">Apply Filters</button>
            <button type="button" className="secondary" onClick={clearFilters}>
              Clear
            </button>
          </div>
        </form>
      </section>

      <section className="card">
        <div className="section-heading">
          <h2>Transaction List</h2>
          <button className="secondary" onClick={() => loadTransactions(page)}>
            Refresh
          </button>
        </div>

        {error && <p className="error">{error}</p>}

        {loading ? (
          <p>Loading transactions...</p>
        ) : transactions.length === 0 ? (
          <p className="muted">No transactions found.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{new Date(transaction.transactionDate).toLocaleString()}</td>
                    <td>{transaction.type}</td>
                    <td>{transaction.categoryName}</td>
                    <td>{transaction.description || "—"}</td>
                    <td>₹{Number(transaction.amount).toFixed(2)}</td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="secondary"
                          onClick={() => startEditing(transaction)}
                        >
                          Edit
                        </button>
                        <button
                          className="danger"
                          onClick={() => handleDelete(transaction.id)}
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

        {totalPages > 0 && (
          <div className="pagination">
            <button
              className="secondary"
              disabled={page === 0 || loading}
              onClick={() => loadTransactions(page - 1)}
            >
              Previous
            </button>

            <span>
              Page {page + 1} of {totalPages}
            </span>

            <button
              className="secondary"
              disabled={page >= totalPages - 1 || loading}
              onClick={() => loadTransactions(page + 1)}
            >
              Next
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default Transactions;
