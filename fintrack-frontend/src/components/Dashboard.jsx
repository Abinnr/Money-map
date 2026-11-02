import { useEffect, useState } from "react";
import { getDashboard } from "../services/dashboardService";

function Dashboard() {
  const today = new Date();

  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError("");

      try {
        const data = await getDashboard(month, year);
        setDashboard(data);
      } catch (error) {
        setError("Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [month, year]);

  function goToPreviousMonth() {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  }

  function goToNextMonth() {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  }

  if (loading) {
    return <p>Loading dashboard...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!dashboard) {
    return <p>No dashboard data available.</p>;
  }

  return (
    <div>
      <h1>FinTrack Dashboard</h1>

      <div>
        <button onClick={goToPreviousMonth}>Previous</button>

        <strong>
          {month}/{year}
        </strong>

        <button onClick={goToNextMonth}>Next</button>
      </div>

      <hr />

      <section>
        <h2>Overview</h2>

        <p>
          <strong>Income:</strong> ₹{dashboard.totalIncome}
        </p>

        <p>
          <strong>Expenses:</strong> ₹{dashboard.totalExpenses}
        </p>

        <p>
          <strong>Balance:</strong> ₹{dashboard.balance}
        </p>

        <p>
          <strong>Transactions:</strong> {dashboard.transactionCount}
        </p>
      </section>

      <hr />

      <section>
        <h2>Category Breakdown</h2>

        {dashboard.categoryBreakdown.length === 0 ? (
          <p>No expenses for this month.</p>
        ) : (
          <ul>
            {dashboard.categoryBreakdown.map((category) => (
              <li key={category.categoryId}>
                {category.categoryName}: ₹{category.amount}
              </li>
            ))}
          </ul>
        )}
      </section>

      <hr />

      <section>
        <h2>Budget vs Actual</h2>

        {dashboard.budgetVsActual.length === 0 ? (
          <p>No budgets for this month.</p>
        ) : (
          <ul>
            {dashboard.budgetVsActual.map((budget) => (
              <li key={budget.categoryId}>
                <strong>{budget.categoryName}</strong>
                <br />
                Budget: ₹{budget.budgetAmount}
                <br />
                Actual: ₹{budget.actualAmount}
                <br />
                Remaining: ₹{budget.remainingAmount}
                <br />
                Used: {budget.percentageUsed}%
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default Dashboard;