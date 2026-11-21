import { useEffect, useMemo, useState } from "react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../services/categoryService";
import ConfirmModal from "./ConfirmModal";
import StatusAlert from "./StatusAlert";

function Categories() {
  const [categories, setCategories] = useState([]);

  const [name, setName] = useState("");
  const [type, setType] = useState("EXPENSE");
  const [editingId, setEditingId] = useState(null);

  const [typeFilter, setTypeFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function loadCategories() {
    setLoading(true);
    setError("");

    try {
      const data = await getCategories();
      setCategories(data || []);
    } catch (err) {
      setError(err.message || "Failed to load categories. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  function resetForm() {
    setName("");
    setType("EXPENSE");
    setEditingId(null);
  }

  function startEditing(category) {
    setEditingId(category.id);
    setName(category.name);
    setType(category.type);
    setError("");
    setSuccessMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Category name is required.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      if (editingId === null) {
        await createCategory(trimmedName, type);
        setSuccessMessage(`Category "${trimmedName}" created.`);
      } else {
        await updateCategory(editingId, trimmedName, type);
        setSuccessMessage(`Category "${trimmedName}" updated.`);
      }

      resetForm();
      await loadCategories();
    } catch (err) {
      setError(
        err.message ||
          (editingId === null
            ? "Failed to create category."
            : "Failed to update category.")
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
      await deleteCategory(deleteTarget.id);

      if (editingId === deleteTarget.id) {
        resetForm();
      }

      const deletedName = deleteTarget.name;
      setDeleteTarget(null);
      setSuccessMessage(`Category "${deletedName}" deleted.`);
      await loadCategories();
    } catch (err) {
      setError(err.message || "Failed to delete category.");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  const isActive = (category) =>
    category.isActive ?? category.active ?? true;

  const incomeCount = categories.filter(
    (category) => category.type === "INCOME"
  ).length;

  const expenseCount = categories.filter(
    (category) => category.type === "EXPENSE"
  ).length;

  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return categories.filter((category) => {
      const matchesType =
        typeFilter === "ALL" || category.type === typeFilter;
      const matchesSearch =
        !query || category.name.toLowerCase().includes(query);

      return matchesType && matchesSearch;
    });
  }, [categories, typeFilter, searchQuery]);

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">FINANCIAL ORGANIZATION</span>
          <h1>Categories</h1>
          <p className="muted">
            Organize your income and expenses into meaningful groups.
          </p>
        </div>

        <span className="count-badge tabular-nums">
          {categories.length} {categories.length === 1 ? "category" : "categories"}
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
            <span className="stat-label">Total categories</span>
            <span className="stat-icon balance-icon">▦</span>
          </div>
          <strong className="stat-value">{categories.length}</strong>
          <span className="stat-description">All configured categories</span>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">Income categories</span>
            <span className="stat-icon income-icon">↗</span>
          </div>
          <strong className="stat-value positive-text">{incomeCount}</strong>
          <span className="stat-description">For tracking earnings</span>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">Expense categories</span>
            <span className="stat-icon expense-icon">↙</span>
          </div>
          <strong className="stat-value negative-text">{expenseCount}</strong>
          <span className="stat-description">For tracking spending</span>
        </div>
      </div>

      <section className="card">
        <div className="section-title">
          <div className="section-icon">
            <span>{editingId === null ? "＋" : "✎"}</span>
          </div>
          <div>
            <h2>{editingId === null ? "Create category" : "Edit category"}</h2>
            <p className="muted">
              Give your financial activities a clear structure.
            </p>
          </div>
        </div>

        <form className="modern-form category-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Category name</span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Groceries, Rent, Salary"
              disabled={saving}
              maxLength={100}
              required
            />
          </label>

          <label className="field">
            <span>Category type</span>
            <select
              value={type}
              onChange={(event) => setType(event.target.value)}
              disabled={saving}
            >
              <option value="EXPENSE">Expense</option>
              <option value="INCOME">Income</option>
            </select>
          </label>

          <div className="form-actions full-width">
            <button type="submit" disabled={saving}>
              {saving
                ? "Saving..."
                : editingId === null
                  ? "Create category"
                  : "Update category"}
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
            <h2>All categories</h2>
            <p className="muted">
              Manage your available income and expense categories.
            </p>
          </div>

          <button
            type="button"
            className="secondary"
            onClick={loadCategories}
            disabled={loading}
          >
            ↻ Refresh
          </button>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "18px",
          }}
        >
          <div className="filter-pills" role="group" aria-label="Filter by category type">
            <button
              type="button"
              className={`filter-pill ${typeFilter === "ALL" ? "active" : ""}`}
              onClick={() => setTypeFilter("ALL")}
            >
              All ({categories.length})
            </button>
            <button
              type="button"
              className={`filter-pill ${typeFilter === "EXPENSE" ? "active" : ""}`}
              onClick={() => setTypeFilter("EXPENSE")}
            >
              Expense ({expenseCount})
            </button>
            <button
              type="button"
              className={`filter-pill ${typeFilter === "INCOME" ? "active" : ""}`}
              onClick={() => setTypeFilter("INCOME")}
            >
              Income ({incomeCount})
            </button>
          </div>

          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search categories..."
            aria-label="Search categories"
            style={{ minWidth: "220px" }}
          />
        </div>

        {loading ? (
          <div className="empty-state">
            <div className="loading-spinner" />
            <p>Loading categories...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">▦</div>
            <h3>
              {categories.length === 0
                ? "No categories yet"
                : "No matching categories"}
            </h3>
            <p>
              {categories.length === 0
                ? "Create a category above to organize your transactions."
                : "Try clearing your search or switching the category filter."}
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredCategories.map((category) => {
                  const active = isActive(category);

                  return (
                    <tr key={category.id}>
                      <td>
                        <div className="table-primary">
                          <span className="category-avatar">
                            {category.name?.charAt(0).toUpperCase()}
                          </span>
                          <strong>{category.name}</strong>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`type-badge ${
                            category.type === "INCOME"
                              ? "income-badge"
                              : "expense-badge"
                          }`}
                        >
                          {category.type === "INCOME" ? "Income" : "Expense"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`status-badge ${
                            active ? "status-active" : "status-inactive"
                          }`}
                        >
                          <span className="status-dot" />
                          {active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td>
                        <div className="row-actions">
                          <button
                            type="button"
                            className="secondary small-button"
                            onClick={() => startEditing(category)}
                            disabled={!active}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="danger small-button"
                            onClick={() => setDeleteTarget(category)}
                            disabled={!active}
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
      </section>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete category?"
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.name}"? Existing transactions in this category will remain intact.`
            : ""
        }
        confirmLabel="Delete category"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </main>
  );
}

export default Categories;