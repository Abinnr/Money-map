
import { useEffect, useState } from "react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../services/categoryService";

function Categories() {
  const [categories, setCategories] = useState([]);

  const [name, setName] = useState("");
  const [type, setType] = useState("EXPENSE");
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadCategories() {
    setLoading(true);
    setError("");

    try {
      const data = await getCategories();
      setCategories(data || []);
    } catch {
      setError("Failed to load categories. Please try again.");
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
    setError("");
  }

  function startEditing(category) {
    setEditingId(category.id);
    setName(category.name);
    setType(category.type);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      if (editingId === null) {
        await createCategory(name.trim(), type);
      } else {
        await updateCategory(editingId, name.trim(), type);
      }

      resetForm();
      await loadCategories();
    } catch {
      setError(
        editingId === null
          ? "Failed to create category."
          : "Failed to update category."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(category) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?`
    );

    if (!confirmed) return;

    setError("");

    try {
      await deleteCategory(category.id);

      if (editingId === category.id) {
        resetForm();
      }

      await loadCategories();
    } catch {
      setError("Failed to delete category.");
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

        <span className="count-badge">
          {categories.length} categories
        </span>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <div className="stats-grid stats-grid-three">
        <div className="stat-card">
          <span className="stat-label">Total categories</span>
          <strong className="stat-value">{categories.length}</strong>
          <span className="stat-description">All configured categories</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Income categories</span>
          <strong className="stat-value positive-text">{incomeCount}</strong>
          <span className="stat-description">For tracking earnings</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Expense categories</span>
          <strong className="stat-value negative-text">{expenseCount}</strong>
          <span className="stat-description">For tracking spending</span>
        </div>
      </div>

      <section className="card">
        <div className="section-title">
          <div className="section-icon">
            <span>＋</span>
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
              placeholder="e.g. Groceries"
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
            <h2>All categories</h2>
            <p className="muted">
              Manage your available income and expense categories.
            </p>
          </div>

          <button
            className="secondary"
            onClick={loadCategories}
            disabled={loading}
          >
            ↻ Refresh
          </button>
        </div>

        {loading ? (
          <div className="empty-state">
            <p>Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">▦</div>
            <h3>No categories yet</h3>
            <p>Create a category to organize your transactions.</p>
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
                {categories.map((category) => {
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
                            className="secondary small-button"
                            onClick={() => startEditing(category)}
                            disabled={!active}
                          >
                            Edit
                          </button>

                          <button
                            className="danger small-button"
                            onClick={() => handleDelete(category)}
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
    </main>
  );
}

export default Categories;
