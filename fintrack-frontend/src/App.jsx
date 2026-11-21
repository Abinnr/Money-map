import { useEffect, useState } from "react";

import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import Transactions from "./components/Transactions";
import Categories from "./components/Categories";
import Budgets from "./components/Budgets";
import Reports from "./components/Reports";

import {
  clearToken,
  getValidToken,
  parseJwtPayload,
  UNAUTHORIZED_EVENT,
} from "./services/authStorage";

import "./App.css";

function App() {
  const [authenticated, setAuthenticated] = useState(() =>
    Boolean(getValidToken())
  );

  const [authPage, setAuthPage] = useState("login");
  const [authNotice, setAuthNotice] = useState("");
  const [page, setPage] = useState("dashboard");

  useEffect(() => {
    function handleUnauthorized(event) {
      clearToken();
      setAuthenticated(false);
      setAuthPage("login");
      setPage("dashboard");
      setAuthNotice(
        event.detail?.message ||
          "Your session has expired. Please log in again."
      );
    }

    function handleStorageChange(event) {
      if (event.key === "fintrack_token" && !event.newValue) {
        setAuthenticated(false);
        setAuthPage("login");
        setPage("dashboard");
      }
    }

    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (!authenticated) {
      return;
    }

    const token = getValidToken();
    if (!token) {
      setAuthenticated(false);
      setAuthPage("login");
      return;
    }

    const payload = parseJwtPayload(token);
    if (!payload || typeof payload.exp !== "number") {
      return;
    }

    const remainingMs = payload.exp * 1000 - Date.now();
    if (remainingMs <= 0) {
      clearToken();
      setAuthenticated(false);
      setAuthPage("login");
      setAuthNotice("Your session has expired. Please log in again.");
      return;
    }

    const expiryTimer = window.setTimeout(() => {
      clearToken();
      setAuthenticated(false);
      setAuthPage("login");
      setPage("dashboard");
      setAuthNotice("Your session has expired. Please log in again.");
    }, remainingMs);

    return () => {
      window.clearTimeout(expiryTimer);
    };
  }, [authenticated]);

  function handleLogin() {
    setAuthenticated(true);
    setAuthNotice("");
    setPage("dashboard");
  }

  function handleRegistrationSuccess(message) {
    setAuthNotice(message || "Registration successful. Please log in.");
    setAuthPage("login");
  }

  function handleLogout() {
    clearToken();
    setAuthenticated(false);
    setAuthPage("login");
    setAuthNotice("");
    setPage("dashboard");
  }

  if (!authenticated) {
    return authPage === "register" ? (
      <Register
        onRegistrationSuccess={handleRegistrationSuccess}
        onLoginClick={() => {
          setAuthNotice("");
          setAuthPage("login");
        }}
      />
    ) : (
      <Login
        onLogin={handleLogin}
        notice={authNotice}
        onClearNotice={() => setAuthNotice("")}
        onRegisterClick={() => {
          setAuthNotice("");
          setAuthPage("register");
        }}
      />
    );
  }

  return (
    <>
      <header className="app-header">
        <div className="app-brand">
          <span className="app-brand-mark">₹</span>
          <span>MoneyMap</span>
        </div>

        <nav aria-label="Primary navigation">
          <button
            type="button"
            className={page === "dashboard" ? "nav-active" : ""}
            onClick={() => setPage("dashboard")}
          >
            Dashboard
          </button>

          <button
            type="button"
            className={page === "transactions" ? "nav-active" : ""}
            onClick={() => setPage("transactions")}
          >
            Transactions
          </button>

          <button
            type="button"
            className={page === "budgets" ? "nav-active" : ""}
            onClick={() => setPage("budgets")}
          >
            Budgets
          </button>

          <button
            type="button"
            className={page === "categories" ? "nav-active" : ""}
            onClick={() => setPage("categories")}
          >
            Categories
          </button>

          <button
            type="button"
            className={page === "reports" ? "nav-active" : ""}
            onClick={() => setPage("reports")}
          >
            Reports
          </button>

          <button
            type="button"
            className="nav-logout"
            onClick={handleLogout}
          >
            Logout
          </button>
        </nav>
      </header>

      {page === "dashboard" ? (
        <Dashboard onNavigate={setPage} />
      ) : page === "transactions" ? (
        <Transactions />
      ) : page === "categories" ? (
        <Categories />
      ) : page === "budgets" ? (
        <Budgets />
      ) : (
        <Reports />
      )}
    </>
  );
}

export default App;