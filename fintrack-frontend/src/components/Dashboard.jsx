
import { useEffect, useState } from "react";
import { getDashboard } from "../services/dashboardService";

const currency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const MONTHS = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
];

function Dashboard() {
  const today = new Date();

  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setError("");

      try {
        const data = await getDashboard(month, year);

        if (!cancelled) {
          setDashboard(data);
        }
      } catch {
        if (!cancelled) {
          setError("Failed to load dashboard. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [month, year]);

  function goToPreviousMonth() {
    if (month === 1) {
      setMonth(12);
      setYear((current) => current - 1);
    } else {
      setMonth((current) => current - 1);
    }
  }

  function goToNextMonth() {
    if (month === 12) {
      setMonth(1);
      setYear((current) => current + 1);
    } else {
      setMonth((current) => current + 1);
    }
  }

  if (loading && !dashboard) {
    return (
      <main className="page">
        <div className="empty-state">
          <p>Preparing your financial overview...</p>
        </div>
      </main>
    );
  }

  if (error && !dashboard) {
    return (
      <main className="page">
        <div className="alert alert-error">{error}</div>
        <button onClick={() => {
          setDashboard(null);
          setMonth((current) => current);
        }}>
          Try again
        </button>
      </main>
    );
  }

  if (!dashboard) {
    return (
      <main className="page">
        <div className="empty-state">
          <h3>No dashboard data available</h3>
        </div>
      </main>
    );
  }

  const isPositiveBalance = Number(dashboard.balance) >= 0;

  return (
    <main className="page">
      <div className="page-header dashboard-header">
        <div>
          <span className="eyebrow">YOUR FINANCIAL OVERVIEW</span>
          <h1>Dashboard</h1>
          <p className="muted">
            Here's how your money is moving.
          </p>
        </div>

        <div className="month-selector">
          <button
            className="secondary icon-button"
            onClick={goToPreviousMonth}
            aria-label="Previous month"
          >
            ‹
          </button>

          <strong>
            {MONTHS[month - 1]} {year}
          </strong>

          <button
            className="secondary icon-button"
            onClick={goToNextMonth}
            aria-label="Next month"
          >
            ›
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">{error}</div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">Total income</span>
            <span className="stat-icon income-icon">↗</span>
          </div>
          <strong className="stat-value positive-text">
            {currency(dashboard.totalIncome)}
          </strong>
          <span className="stat-description">
            Money received this month
          </span>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">Total expenses</span>
            <span className="stat-icon expense-icon">↙</span>
          </div>
          <strong className="stat-value negative-text">
            {currency(dashboard.totalExpenses)}
          </strong>
          <span className="stat-description">
            Money spent this month
          </span>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">Net balance</span>
            <span className="stat-icon balance-icon">₹</span>
          </div>
          <strong
            className={`stat-value ${
              isPositiveBalance ? "positive-text" : "negative-text"
            }`}
          >
            {currency(dashboard.balance)}
          </strong>
          <span className="stat-description">
            Income minus expenses
          </span>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">Transactions</span>
            <span className="stat-icon transaction-icon">▤</span>
          </div>
          <strong className="stat-value">
            {dashboard.transactionCount}
          </strong>
          <span className="stat-description">
            Recorded this month
          </span>
        </div>
      </div>

      <div className="dashboard-grid">
        <section className="card">
          <div className="section-heading">
            <div>
              <h2>Category breakdown</h2>
              <p className="muted">
                Where your money is going.
              </p>
            </div>
          </div>

          {dashboard.categoryBreakdown.length === 0 ? (
            <div className="empty-state compact-empty">
              <p>No expenses recorded for this month.</p>
            </div>
          ) : (
            <div className="breakdown-list">
              {dashboard.categoryBreakdown.map((category, index) => (
                <div className="breakdown-item" key={category.categoryId}>
                  <div className="breakdown-heading">
                    <div className="table-primary">
                      <span className="category-avatar">
                        {category.categoryName?.charAt(0).toUpperCase()}
                      </span>
                      <strong>{category.categoryName}</strong>
                    </div>
                    <strong>{currency(category.amount)}</strong>
                  </div>

                  <div className="progress-track">
                    <div
                      className="progress-fill category-progress"
                      style={{
                        width: `${
                          dashboard.categoryBreakdown.reduce(
                            (total, item) => total + Number(item.amount || 0),
                            0
                          ) > 0
                            ? (Number(category.amount) /
                                dashboard.categoryBreakdown.reduce(
                                  (total, item) =>
                                    total + Number(item.amount || 0),
                                  0
                                )) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card">
          <div className="section-heading">
            <div>
              <h2>Budget performance</h2>
              <p className="muted">
                Track your spending against your limits.
              </p>
            </div>
          </div>

          {dashboard.budgetVsActual.length === 0 ? (
            <div className="empty-state compact-empty">
              <p>No budgets configured for this month.</p>
            </div>
          ) : (
            <div className="budget-performance-list">
              {dashboard.budgetVsActual.map((budget) => {
                const used = Number(budget.percentageUsed || 0);
                const exceeded = used > 100;

                return (
                  <div className="budget-performance-item" key={budget.categoryId}>
                    <div className="breakdown-heading">
                      <strong>{budget.categoryName}</strong>
                      <span className={exceeded ? "negative-text" : "muted"}>
                        {used.toFixed(2)}% used
                      </span>
                    </div>

                    <div className="progress-track">
                      <div
                        className={`progress-fill ${
                          exceeded ? "progress-danger" : "progress-budget"
                        }`}
                        style={{ width: `${Math.min(used, 100)}%` }}
                      />
                    </div>

                    <div className="budget-details">
                      <span>
                        Spent: {currency(budget.actualAmount)}
                      </span>
                      <span>
                        Limit: {currency(budget.budgetAmount)}
                      </span>
                    </div>

                    <div className="budget-remaining">
                      <span className="muted">Remaining</span>
                      <strong
                        className={
                          Number(budget.remainingAmount) < 0
                            ? "negative-text"
                            : "positive-text"
                        }
                      >
                        {currency(budget.remainingAmount)}
                      </strong>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default Dashboard;
