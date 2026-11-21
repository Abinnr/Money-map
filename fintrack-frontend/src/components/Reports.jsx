import { useEffect, useState } from "react";

import {
  getMonthlyReport,
  getCategoryReport,
  getBudgetReport,
} from "../services/reportService";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import StatusAlert from "./StatusAlert";

const COLORS = [
  "#245b45",
  "#23845a",
  "#d97706",
  "#0284c7",
  "#c44d4d",
  "#4f772d",
  "#6b7280",
  "#0f766e",
];

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function getPreviousMonth(month, offset) {
  const date = new Date(`${month}-01T00:00:00`);
  date.setMonth(date.getMonth() - offset);

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function formatMonth(value) {
  const [year, month] = value.split("-");

  return new Date(
    Number(year),
    Number(month) - 1
  ).toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });
}

function formatMonthLabel(item) {
  return new Date(
    item.year,
    item.month - 1
  ).toLocaleDateString("en-IN", {
    month: "short",
    year: "2-digit",
  });
}

function Reports() {
  const currentMonth = getCurrentMonth();

  const [from, setFrom] = useState(getPreviousMonth(currentMonth, 5));
  const [to, setTo] = useState(currentMonth);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [budgetData, setBudgetData] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isValidRange = Boolean(from && to && from <= to);

  const selectedYear = Number(selectedMonth.split("-")[0]);
  const selectedMonthNumber = Number(selectedMonth.split("-")[1]);

  useEffect(() => {
    if (!isValidRange || !selectedMonth) {
      return;
    }

    let cancelled = false;

    async function loadReports() {
      setLoading(true);
      setError("");

      try {
        const [monthly, categories, budgets] = await Promise.all([
          getMonthlyReport(from, to),
          getCategoryReport(selectedMonthNumber, selectedYear),
          getBudgetReport(selectedMonthNumber, selectedYear),
        ]);

        if (cancelled) return;

        setMonthlyData(monthly || []);
        setCategoryData(categories || []);
        setBudgetData(budgets || []);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load reports.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadReports();

    return () => {
      cancelled = true;
    };
  }, [from, to, selectedMonthNumber, selectedYear, selectedMonth, isValidRange]);

  const totalIncome = monthlyData.reduce(
    (sum, item) => sum + Number(item.income || 0),
    0
  );

  const totalExpenses = monthlyData.reduce(
    (sum, item) => sum + Number(item.expenses || 0),
    0
  );

  const totalBalance = monthlyData.reduce(
    (sum, item) => sum + Number(item.balance || 0),
    0
  );

  const totalBudget = budgetData.reduce(
    (sum, item) => sum + Number(item.budgetAmount || 0),
    0
  );

  const totalActual = budgetData.reduce(
    (sum, item) => sum + Number(item.actualAmount || 0),
    0
  );

  function applyPreset(monthsBack) {
    const latest = getCurrentMonth();
    setFrom(getPreviousMonth(latest, monthsBack));
    setTo(latest);
  }

  function applyYearToDate() {
    const latest = getCurrentMonth();
    const year = latest.split("-")[0];
    setFrom(`${year}-01`);
    setTo(latest);
  }

  const monthlyChartData = monthlyData.map((item) => ({
    ...item,
    label: formatMonthLabel(item),
  }));

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">ANALYTICS & INSIGHTS</span>
          <h1>Financial Reports</h1>
          <p className="muted">
            Analyze income trends, category distribution, and budget adherence.
          </p>
        </div>

        <div className="filter-pills" role="group" aria-label="Quick date presets">
          <button
            type="button"
            className={`filter-pill ${
              from === getPreviousMonth(currentMonth, 2) && to === currentMonth
                ? "active"
                : ""
            }`}
            onClick={() => applyPreset(2)}
          >
            Last 3M
          </button>
          <button
            type="button"
            className={`filter-pill ${
              from === getPreviousMonth(currentMonth, 5) && to === currentMonth
                ? "active"
                : ""
            }`}
            onClick={() => applyPreset(5)}
          >
            Last 6M
          </button>
          <button
            type="button"
            className={`filter-pill ${
              from === `${currentMonth.split("-")[0]}-01` && to === currentMonth
                ? "active"
                : ""
            }`}
            onClick={applyYearToDate}
          >
            This Year
          </button>
        </div>
      </div>

      <div className="card">
        <div className="section-heading">
          <div>
            <h2>Reporting period</h2>
            <p className="muted">
              Select a multi-month trend window and target month for breakdowns.
            </p>
          </div>
        </div>

        <div className="report-filters">
          <label className="field">
            <span>Trend from</span>
            <input
              type="month"
              value={from}
              max={to || currentMonth}
              onChange={(e) => setFrom(e.target.value)}
            />
          </label>

          <label className="field">
            <span>Trend to</span>
            <input
              type="month"
              value={to}
              min={from}
              max={currentMonth}
              onChange={(e) => setTo(e.target.value)}
            />
          </label>

          <label className="field">
            <span>Category & budget month</span>
            <input
              type="month"
              value={selectedMonth}
              max={currentMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </label>
        </div>

        {!isValidRange && (
          <StatusAlert
            type="error"
            message="Please select a valid reporting period where 'From' is earlier than or equal to 'To'."
          />
        )}
      </div>

      {loading && (
        <div className="card">
          <div className="empty-state compact-empty">
            <div className="loading-spinner" />
            <p>Generating financial reports...</p>
          </div>
        </div>
      )}

      {error && (
        <StatusAlert
          type="error"
          message={error}
          onDismiss={() => setError("")}
        />
      )}

      {!loading && !error && isValidRange && (
        <>
          <div className="report-summary-grid">
            <div className="report-summary-card income-card">
              <p>Total Income ({formatMonth(from)} – {formatMonth(to)})</p>
              <h2>{formatCurrency(totalIncome)}</h2>
            </div>

            <div className="report-summary-card expense-card">
              <p>Total Expenses ({formatMonth(from)} – {formatMonth(to)})</p>
              <h2>{formatCurrency(totalExpenses)}</h2>
            </div>

            <div className="report-summary-card balance-card">
              <p>Net Balance ({formatMonth(from)} – {formatMonth(to)})</p>
              <h2>{formatCurrency(totalBalance)}</h2>
            </div>
          </div>

          <div className="card">
            <div className="section-heading">
              <div>
                <h2>Monthly financial trend</h2>
                <p className="muted">
                  Income, expenses, and net balance from {formatMonth(from)} to{" "}
                  {formatMonth(to)}.
                </p>
              </div>
            </div>

            {monthlyData.length === 0 ? (
              <div className="empty-state compact-empty">
                <p>No monthly transaction data available for this range.</p>
              </div>
            ) : (
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8e1" />
                    <XAxis dataKey="label" />
                    <YAxis
                      tickFormatter={(value) =>
                        `₹${value.toLocaleString("en-IN")}`
                      }
                    />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="income"
                      name="Income"
                      stroke="#23845a"
                      strokeWidth={3}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="expenses"
                      name="Expenses"
                      stroke="#c44d4d"
                      strokeWidth={3}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="balance"
                      name="Net Balance"
                      stroke="#245b45"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="card">
            <div className="section-heading">
              <div>
                <h2>Category spending</h2>
                <p className="muted">
                  Expense distribution for {formatMonth(selectedMonth)}.
                </p>
              </div>
            </div>

            {categoryData.length === 0 ? (
              <div className="empty-state compact-empty">
                <p>No expense data available for {formatMonth(selectedMonth)}.</p>
              </div>
            ) : (
              <>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        dataKey="amount"
                        nameKey="categoryName"
                        cx="50%"
                        cy="50%"
                        innerRadius={75}
                        outerRadius={115}
                        paddingAngle={3}
                        label={({ name, percentage }) =>
                          `${name}: ${Number(percentage).toFixed(1)}%`
                        }
                      >
                        {categoryData.map((item, index) => (
                          <Cell
                            key={item.categoryId}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="report-data-list">
                  {categoryData.map((item, index) => (
                    <div className="report-data-row" key={item.categoryId}>
                      <span className="report-category-name">
                        <span
                          className="category-dot"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                        {item.categoryName}
                      </span>

                      <strong className="tabular-nums">
                        {formatCurrency(item.amount)}
                      </strong>

                      <span className="muted tabular-nums">
                        {Number(item.percentage).toFixed(2)}%
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="card">
            <div className="section-heading">
              <div>
                <h2>Budget vs actual</h2>
                <p className="muted">
                  Budget performance for {formatMonth(selectedMonth)}.
                </p>
              </div>
            </div>

            {budgetData.length === 0 ? (
              <div className="empty-state compact-empty">
                <p>No budgets configured for {formatMonth(selectedMonth)}.</p>
              </div>
            ) : (
              <>
                <div className="budget-summary">
                  <div>
                    <p className="muted">Total Budget</p>
                    <strong>{formatCurrency(totalBudget)}</strong>
                  </div>

                  <div>
                    <p className="muted">Actual Spending</p>
                    <strong>{formatCurrency(totalActual)}</strong>
                  </div>

                  <div>
                    <p className="muted">Remaining</p>
                    <strong
                      className={
                        totalBudget - totalActual < 0
                          ? "negative-value"
                          : "positive-value"
                      }
                    >
                      {formatCurrency(totalBudget - totalActual)}
                    </strong>
                  </div>
                </div>

                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={budgetData}
                      layout="vertical"
                      margin={{
                        top: 10,
                        right: 30,
                        left: 20,
                        bottom: 10,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8e1" />
                      <XAxis
                        type="number"
                        tickFormatter={(value) =>
                          `₹${value.toLocaleString("en-IN")}`
                        }
                      />
                      <YAxis
                        type="category"
                        dataKey="categoryName"
                        width={110}
                      />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Legend />
                      <Bar
                        dataKey="budgetAmount"
                        name="Budget"
                        fill="#245b45"
                        radius={[0, 6, 6, 0]}
                      />
                      <Bar
                        dataKey="actualAmount"
                        name="Actual Spending"
                        fill="#d97706"
                        radius={[0, 6, 6, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="budget-details">
                  {budgetData.map((item) => {
                    const utilization = Number(
                      item.utilizationPercentage || 0
                    );
                    const isOverspent = utilization > 100;

                    return (
                      <div
                        className="budget-detail-item"
                        key={item.budgetId}
                      >
                        <div className="section-heading">
                          <strong>{item.categoryName}</strong>

                          <span
                            className={`tabular-nums ${
                              isOverspent
                                ? "negative-value"
                                : "positive-value"
                            }`}
                          >
                            {utilization.toFixed(2)}% used
                          </span>
                        </div>

                        <div className="budget-progress-track">
                          <div
                            className={`budget-progress-fill ${
                              isOverspent ? "overspent" : ""
                            }`}
                            style={{
                              width: `${Math.min(utilization, 100)}%`,
                            }}
                          />
                        </div>

                        <div className="budget-detail-values tabular-nums">
                          <span>
                            Spent: {formatCurrency(item.actualAmount)}
                          </span>

                          <span>
                            Budget: {formatCurrency(item.budgetAmount)}
                          </span>
                        </div>

                        <p
                          className={`tabular-nums ${
                            isOverspent ? "negative-value" : "muted"
                          }`}
                        >
                          {isOverspent
                            ? `Overspent by ${formatCurrency(
                                Math.abs(Number(item.remainingAmount))
                              )}`
                            : `Remaining: ${formatCurrency(
                                item.remainingAmount
                              )}`}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </main>
  );
}

export default Reports;