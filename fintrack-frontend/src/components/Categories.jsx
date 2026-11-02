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
      setCategories(data);
    } catch (error) {
      setError("Failed to load categories.");
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
    } catch (error) {
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

    if (!confirmed) {
      return;
    }

    setError("");

    try {
      await deleteCategory(category.id);

      if (editingId === category.id) {
        resetForm();
      }

      await loadCategories();
    } catch (error) {
      setError("Failed to delete category.");
    }
  }

  if (loading) {
    return <p>Loading categories...</p>;
  }

  return (
    <main>
      <h1>Categories</h1>

      <p>Manage your income and expense categories.</p>

      {error && <p>{error}</p>}

      <section>
        <h2>{editingId === null ? "Add Category" : "Edit Category"}</h2>

        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="category-name">Name</label>

            <input
              id="category-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Food"
              disabled={saving}
            />
          </div>

          <div>
            <label htmlFor="category-type">Type</label>

            <select
              id="category-type"
              value={type}
              onChange={(event) => setType(event.target.value)}
              disabled={saving}
            >
              <option value="EXPENSE">Expense</option>
              <option value="INCOME">Income</option>
            </select>
          </div>

          <button type="submit" disabled={saving}>
            {saving
              ? "Saving..."
              : editingId === null
                ? "Add Category"
                : "Update Category"}
          </button>

          {editingId !== null && (
            <button type="button" onClick={resetForm} disabled={saving}>
              Cancel
            </button>
          )}
        </form>
      </section>

      <hr />

      <section>
        <h2>Category List</h2>

        <button onClick={loadCategories} disabled={loading}>
          Refresh
        </button>

        {categories.length === 0 ? (
          <p>No categories found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td>{category.name}</td>

                  <td>{category.type}</td>

                  <td>
                    {category.active ? "Active" : "Inactive"}
                  </td>

                  <td>
                    <button
                      onClick={() => startEditing(category)}
                      disabled={!category.active}
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(category)}
                      disabled={!category.active}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}

export default Categories;