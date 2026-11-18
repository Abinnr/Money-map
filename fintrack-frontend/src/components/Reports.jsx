
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

const COLORS = [
  "#6366f1",
  "#06b6d4",
  "#f59e0b",
  "#10b981",
  "#ec4899",
  "#8b5cf6",
  "#f97316",
  "#64748b",
];

function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
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
  });
}

function Reports() {
  const currentMonth = getCurrentMonth();

  const [from, setFrom] = useState(
    getPreviousMonth(currentMonth, 5)
  );

  const [to, setTo] = useState(currentMonth);

  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [budgetData, setBudgetData] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const selectedYear = Number(selectedMonth.split("-")[0]);
  const selectedMonthNumber = Number(selectedMonth.split("-")[1]);

  useEffect(() => {
    let cancelled = false;

    async function loadReports() {
      setLoading(true);
      setError("");

      try {
        const [
          monthly,
          categories,
          budgets,
        ] = await Promise.all([
          getMonthlyReport(from, to),
          getCategoryReport(
            selectedMonthNumber,
            selectedYear
          ),
          getBudgetReport(
            selectedMonthNumber,
            selectedYear
          ),
        ]);

        if (cancelled) return;

        setMonthlyData(monthly);
        setCategoryData(categories);
        setBudgetData(budgets);
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
  }, [from, to, selectedMonthNumber, selectedYear]);

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

  const handleFromChange = (value) => {
    setFrom(value);
  };

  const handleToChange = (value) => {
    setTo(value);
  };

  const handleMonthChange = (value) => {
    setSelectedMonth(value);
  };

  const isValidRange = from && to && from <= to;

  const monthlyChartData = monthlyData.map((item) => ({
    ...item,
    label: formatMonthLabel(item),
  }));

  return (
    <div className="page reports-page">

      {/* Page heading */}

      <div className="page-header">
        <div>
          <h1>Financial Reports</h1>
          <p className="muted">
            Understand your financial performance over time.
          </p>
        </div>
      </div>

      {/* Date filters */}

      <div className="card">
        <div className="section-heading">
          <h2>Reporting Period</h2>
        </div>

        <div className="report-filters">

          <label>
            From
            <input
              type="month"
              value={from}
              max={to || currentMonth}
              onChange={(e) => handleFromChange(e.target.value)}
            />
          </label>

          <label>
            To
            <input
              type="month"
              value={to}
              min={from}
              max={currentMonth}
              onChange={(e) => handleToChange(e.target.value)}
            />
          </label>

          <label>
            Category and budget month
            <input
              type="month"
              value={selectedMonth}
              max={currentMonth}
              onChange={(e) => handleMonthChange(e.target.value)}
            />
          </label>

        </div>

        {!isValidRange && (
          <p className="error">
            Please select a valid reporting period.
          </p>
        )}

      </div>

      {loading && (
        <div className="card">
          <p className="muted">Loading reports...</p>
        </div>
      )}

      {error && (
        <div className="card">
          <p className="error">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>

          {/* Financial summary */}

          <div className="report-summary-grid">

            <div className="report-summary-card income-card">
              <p>Total Income</p>
              <h2>{formatCurrency(totalIncome)}</h2>
            </div>

            <div className="report-summary-card expense-card">
              <p>Total Expenses</p>
              <h2>{formatCurrency(totalExpenses)}</h2>
            </div>

            <div className="report-summary-card balance-card">
              <p>Net Balance</p>
              <h2>{formatCurrency(totalBalance)}</h2>
            </div>

          </div>

          {/* Monthly trend */}

          <div className="card report-chart-card">

            <div className="section-heading">
              <div>
                <h2>Monthly Financial Trend</h2>
                <p className="muted">
                  Income and expenses over the selected period.
                </p>
              </div>
            </div>

            {monthlyData.length === 0 ? (
              <p className="empty-state">
                No monthly transaction data available.
              </p>
            ) : (
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyChartData}>

                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="label" />

                    <YAxis
                      tickFormatter={(value) =>
                        `₹${value.toLocaleString("en-IN")}`
                      }
                    />

                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                    />

                    <Legend />

                    <Line
                      type="monotone"
                      dataKey="income"
                      name="Income"
                      stroke="#16a34a"
                      strokeWidth={3}
                      activeDot={{ r: 7 }}
                    />

                    <Line
                      type="monotone"
                      dataKey="expenses"
                      name="Expenses"
                      stroke="#dc2626"
                      strokeWidth={3}
                      activeDot={{ r: 7 }}
                    />

                    <Line
                      type="monotone"
                      dataKey="balance"
                      name="Balance"
                      stroke="#6366f1"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />

                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

          </div>

          {/* Category spending */}

          <div className="card report-chart-card">

            <div className="section-heading">
              <div>
                <h2>Category Spending</h2>
                <p className="muted">
                  Expense distribution for {formatMonth(selectedMonth)}.
                </p>
              </div>
            </div>

            {categoryData.length === 0 ? (
              <p className="empty-state">
                No expense data available for this month.
              </p>
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
                        outerRadius={120}
                        paddingAngle={3}
                        label={({ name, percentage }) =>
                          `${name}: ${percentage}%`
                        }
                      >
                        {categoryData.map((item, index) => (
                          <Cell
                            key={item.categoryId}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>

                      <Tooltip
                        formatter={(value) => formatCurrency(value)}
                      />

                      <Legend />

                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="report-data-list">
                  {categoryData.map((item, index) => (
                    <div
                      className="report-data-row"
                      key={item.categoryId}
                    >
                      <span className="report-category-name">
                        <span
                          className="category-dot"
                          style={{
                            backgroundColor:
                              COLORS[index % COLORS.length],
                          }}
                        />
                        {item.categoryName}
                      </span>

                      <strong>
                        {formatCurrency(item.amount)}
                      </strong>

                      <span className="muted">
                        {Number(item.percentage).toFixed(2)}%
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}

          </div>

          {/* Budget performance */}

          <div className="card report-chart-card">

            <div className="section-heading">
              <div>
                <h2>Budget vs Actual</h2>
                <p className="muted">
                  Budget performance for {formatMonth(selectedMonth)}.
                </p>
              </div>
            </div>

            {budgetData.length === 0 ? (
              <p className="empty-state">
                No budgets configured for this month.
              </p>
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

                      <CartesianGrid strokeDasharray="3 3" />

                      <XAxis
                        type="number"
                        tickFormatter={(value) =>
                          `₹${value.toLocaleString("en-IN")}`
                        }
                      />

                      <YAxis
                        type="category"
                        dataKey="categoryName"
                        width={100}
                      />

                      <Tooltip
                        formatter={(value) => formatCurrency(value)}
                      />

                      <Legend />

                      <Bar
                        dataKey="budgetAmount"
                        name="Budget"
                        fill="#6366f1"
                      />

                      <Bar
                        dataKey="actualAmount"
                        name="Actual Spending"
                        fill="#f59e0b"
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
                            className={
                              isOverspent
                                ? "negative-value"
                                : "positive-value"
                            }
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

                        <div className="budget-detail-values">
                          <span>
                            Spent: {formatCurrency(item.actualAmount)}
                          </span>

                          <span>
                            Budget: {formatCurrency(item.budgetAmount)}
                          </span>
                        </div>

                        <p className={
                          isOverspent
                            ? "negative-value"
                            : "muted"
                        }>
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

    </div>
  );
}

export default Reports;
