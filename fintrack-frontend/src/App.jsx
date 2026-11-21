import { useEffect, useMemo, useRef, useState } from "react";

import AuthPage from "./components/Login";
import Dashboard from "./components/Dashboard";
import Transactions from "./components/Transactions";
import Categories from "./components/Categories";
import Budgets from "./components/Budgets";
import Reports from "./components/Reports";
import Account from "./components/Account";

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

  const [authNotice, setAuthNotice] = useState("");
  const [page, setPage] = useState("dashboard");
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const accountMenuRef = useRef(null);

  const userSummary = useMemo(() => {
    if (!authenticated) {
      return { email: "", initial: "U" };
    }
    const token = getValidToken();
    const payload = parseJwtPayload(token);
    const email = payload?.sub || "Account";
    return {
      email,
      initial: email.charAt(0).toUpperCase(),
    };
  }, [authenticated]);

  useEffect(() => {
    function handleUnauthorized(event) {
      clearToken();
      setAuthenticated(false);
      setPage("dashboard");
      setAccountMenuOpen(false);
      setAuthNotice(
        event.detail?.message ||
          "Your session has expired. Please log in again."
      );
    }

    function handleStorageChange(event) {
      if (event.key === "fintrack_token" && !event.newValue) {
        setAuthenticated(false);
        setPage("dashboard");
        setAccountMenuOpen(false);
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
      setAuthNotice("Your session has expired. Please log in again.");
      return;
    }

    const expiryTimer = window.setTimeout(() => {
      clearToken();
      setAuthenticated(false);
      setPage("dashboard");
      setAccountMenuOpen(false);
      setAuthNotice("Your session has expired. Please log in again.");
    }, remainingMs);

    return () => {
      window.clearTimeout(expiryTimer);
    };
  }, [authenticated]);

  useEffect(() => {
    if (!accountMenuOpen) {
      return;
    }

    function handleClickOutside(event) {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target)
      ) {
        setAccountMenuOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setAccountMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [accountMenuOpen]);

  function navigateTo(nextPage) {
    setPage(nextPage);
    setAccountMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleLogin() {
    setAuthenticated(true);
    setAuthNotice("");
    setPage("dashboard");
    setAccountMenuOpen(false);
  }

  function handleLogout() {
    clearToken();
    setAuthenticated(false);
    setAuthNotice("");
    setPage("dashboard");
    setAccountMenuOpen(false);
  }

  if (!authenticated) {
    return (
      <AuthPage
        onLogin={handleLogin}
        notice={authNotice}
        onClearNotice={() => setAuthNotice("")}
      />
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <button
          type="button"
          className="app-brand-btn"
          onClick={() => navigateTo("dashboard")}
          aria-label="Go to Dashboard"
        >
          <span className="app-brand-mark">₹</span>
          <span>MoneyMap</span>
        </button>

        <div className="account-menu-wrapper" ref={accountMenuRef}>
          <button
            type="button"
            className={`account-trigger ${
              page === "account" || accountMenuOpen ? "active" : ""
            }`}
            onClick={() => setAccountMenuOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={accountMenuOpen}
          >
            <span className="account-trigger-avatar">
              {userSummary.initial}
            </span>
            <span className="account-trigger-label">Account</span>
            <span className="account-trigger-caret" aria-hidden="true">
              {accountMenuOpen ? "▴" : "▾"}
            </span>
          </button>

          {accountMenuOpen && (
            <div className="account-popup" role="menu">
              <div className="account-popup-header">
                <span className="account-popup-eyebrow">SIGNED IN AS</span>
                <strong title={userSummary.email}>{userSummary.email}</strong>
              </div>

              <div className="account-popup-divider" />

              <button
                type="button"
                role="menuitem"
                className={`account-popup-item ${
                  page === "account" ? "active" : ""
                }`}
                onClick={() => navigateTo("account")}
              >
                <span className="popup-item-icon">👤</span>
                <span>Account</span>
              </button>

              <button
                type="button"
                role="menuitem"
                className="account-popup-item danger-item"
                onClick={handleLogout}
              >
                <span className="popup-item-icon">⎋</span>
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="app-content">
        {page === "dashboard" ? (
          <Dashboard onNavigate={navigateTo} />
        ) : page === "transactions" ? (
          <Transactions />
        ) : page === "categories" ? (
          <Categories />
        ) : page === "budgets" ? (
          <Budgets />
        ) : page === "reports" ? (
          <Reports />
        ) : (
          <Account onLogout={handleLogout} onNavigate={navigateTo} />
        )}
      </div>

      <nav className="bottom-nav" aria-label="Primary app navigation">
        <div className="bottom-nav-inner">
          <div className="bottom-nav-group bottom-nav-left">
            

            <button
              type="button"
              className={`bottom-nav-item ${
                page === "categories" ? "active" : ""
              }`}
              onClick={() => navigateTo("categories")}
            >
              <span className="bottom-nav-icon" aria-hidden="true">
                ▦
              </span>
              <span className="bottom-nav-label">Category</span>
            </button>

            <button
              type="button"
              className={`bottom-nav-item ${
                page === "budgets" ? "active" : ""
              }`}
              onClick={() => navigateTo("budgets")}
            >
              <span className="bottom-nav-icon" aria-hidden="true">
                ◎
              </span>
              <span className="bottom-nav-label">Budget</span>
            </button>
          </div>

          <div className="bottom-nav-center">
            <button
              type="button"
              className={`bottom-nav-dashboard ${
                page === "dashboard" ? "active" : ""
              }`}
              onClick={() => navigateTo("dashboard")}
              aria-label="Dashboard"
            >
              <span className="bottom-nav-dashboard-pill" aria-hidden="true">
                ⌂
              </span>
              <span className="bottom-nav-label">Dashboard</span>
            </button>
          </div>

          <div className="bottom-nav-group bottom-nav-right">

            <button
              type="button"
              className={`bottom-nav-item ${
                page === "transactions" ? "active" : ""
              }`}
              onClick={() => navigateTo("transactions")}
            >
              <span className="bottom-nav-icon" aria-hidden="true">
                ⇄
              </span>
              <span className="bottom-nav-label">Transactions</span>
            </button>
            
            <button
              type="button"
              className={`bottom-nav-item ${
                page === "reports" ? "active" : ""
              }`}
              onClick={() => navigateTo("reports")}
            >
              <span className="bottom-nav-icon" aria-hidden="true">
                ◔
              </span>
              <span className="bottom-nav-label">Reports</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default App;