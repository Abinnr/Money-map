import { useEffect, useState } from "react";
import {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
} from "../services/budgetService";
import { getCategories } from "../services/categoryService";

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

      setBudgets(budgetData);

      const expenseCategories = categoryData.filter(
        (category) =>
          category.type === "EXPENSE" && category.active
      );

      setCategories(expenseCategories);
    } catch (error) {
      setError("Failed to load budgets.");
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
    setAmount(budget.amount);
    setMonth(budget.month);
    setYear(budget.year);
    setCategoryId(String(budget.categoryId));
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!amount || Number(amount) <= 0) {
      setError("Budget amount must be greater than zero.");
      return;
    }

    if (!categoryId) {
      setError("Category is required.");
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
    } catch (error) {
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

    if (!confirmed) {
      return;
    }

    setError("");

    try {
      await deleteBudget(budget.id);

      if (editingId === budget.id) {
        resetForm();
      }

      await loadData();
    } catch (error) {
      setError("Failed to delete budget.");
    }
  }

  if (loading) {
    return <p>Loading budgets...</p>;
  }

  return (
    <main>
      <h1>Budgets</h1>
      <p>Manage your monthly spending budgets.</p>

      {error && <p>{error}</p>}

      <section>
        <h2>
          {editingId === null
            ? "Add Budget"
            : "Edit Budget"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="budget-amount">
              Amount
            </label>

            <input
              id="budget-amount"
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(event) =>
                setAmount(event.target.value)
              }
              placeholder="e.g. 5000"
              disabled={saving}
            />
          </div>

          <div>
            <label htmlFor="budget-month">
              Month
            </label>

            <select
              id="budget-month"
              value={month}
              onChange={(event) =>
                setMonth(Number(event.target.value))
              }
              disabled={saving}
            >
              <option value={1}>January</option>
              <option value={2}>February</option>
              <option value={3}>March</option>
              <option value={4}>April</option>
              <option value={5}>May</option>
              <option value={6}>June</option>
              <option value={7}>July</option>
              <option value={8}>August</option>
              <option value={9}>September</option>
              <option value={10}>October</option>
              <option value={11}>November</option>
              <option value={12}>December</option>
            </select>
          </div>

          <div>
            <label htmlFor="budget-year">
              Year
            </label>

            <input
              id="budget-year"
              type="number"
              min="2000"
              value={year}
              onChange={(event) =>
                setYear(Number(event.target.value))
              }
              disabled={saving}
            />
          </div>

          <div>
            <label htmlFor="budget-category">
              Category
            </label>

            <select
              id="budget-category"
              value={categoryId}
              onChange={(event) =>
                setCategoryId(event.target.value)
              }
              disabled={saving}
            >
              <option value="">
                Select category
              </option>

              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" disabled={saving}>
            {saving
              ? "Saving..."
              : editingId === null
                ? "Add Budget"
                : "Update Budget"}
          </button>

          {editingId !== null && (
            <button
              type="button"
              onClick={resetForm}
              disabled={saving}
            >
              Cancel
            </button>
          )}
        </form>
      </section>

      <hr />

      <section>
        <h2>Budget List</h2>

        <button onClick={loadData} disabled={loading}>
          Refresh
        </button>

        {budgets.length === 0 ? (
          <p>No budgets found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Amount</th>
                <th>Month</th>
                <th>Year</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {budgets.map((budget) => (
                <tr key={budget.id}>
                  <td>{budget.categoryName}</td>

                  <td>
                    ₹{budget.amount}
                  </td>

                  <td>{budget.month}</td>

                  <td>{budget.year}</td>

                  <td>
                    <button
                      onClick={() =>
                        startEditing(budget)
                      }
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(budget)
                      }
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

export default Budgets;