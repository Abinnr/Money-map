import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../services/apiClient";
import { getValidToken, parseJwtPayload } from "../services/authStorage";
import ConfirmModal from "./ConfirmModal";

function Account({ onLogout, onNavigate }) {
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [profile, setProfile] = useState(null);

  const sessionInfo = useMemo(() => {
    const token = getValidToken();
    const payload = parseJwtPayload(token);

    if (!payload) {
      return {
        name: "Signed-in User",
        email: "",
        expiresAt: null,
      };
    }

    const expiresAt =
      typeof payload.exp === "number"
        ? new Date(payload.exp * 1000).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : null;

    return {
      name: payload.name || "Signed-in User",
      email: payload.email || "",
      expiresAt,
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    apiFetch("/api/users/me")
      .then((data) => {
        if (!cancelled && data) {
          setProfile(data);
        }
      })
      .catch(() => {
        // Fallback to decoded JWT claims if offline
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const displayName = profile?.name || sessionInfo.name;
  const displayEmail = profile?.email || sessionInfo.email;
  const displayInitial = displayName.charAt(0).toUpperCase();

  return (
      <main className="page">
        <div className="page-header">
          <div>
            <span className="eyebrow">USER PROFILE & SESSION</span>
            <h1>Account</h1>
            <p className="muted">
              Manage your profile details, workspace shortcuts, and active session.
            </p>
          </div>

          <span className="status-badge status-active">
            <span className="status-dot" />
            Active session
          </span>
        </div>

        <section className="card">
          <div className="account-profile-row">
            <div className="account-avatar-lg">{displayInitial}</div>

            <div className="account-profile-details">
              <h2>{displayName}</h2>
              {displayEmail && <p className="muted">{displayEmail}</p>}
              <p className="muted">
                Personal Finance Workspace · Currency: Indian Rupee (₹ INR)
              </p>
              {sessionInfo.expiresAt && (
                <span className="count-badge tabular-nums">
                  Session valid until {sessionInfo.expiresAt}
                </span>
              )}
            </div>
          </div>
        </section>

      <section className="card">
        <div className="section-heading">
          <div>
            <h2>Workspace shortcuts</h2>
            <p className="muted">
              Jump directly to any area of your MoneyMap app.
            </p>
          </div>
        </div>

        <div className="account-shortcuts-grid">
          <button
            type="button"
            className="secondary account-shortcut-btn"
            onClick={() => onNavigate("dashboard")}
          >
            <strong>Dashboard</strong>
            <span className="muted">Monthly overview & net balance</span>
          </button>

          <button
            type="button"
            className="secondary account-shortcut-btn"
            onClick={() => onNavigate("transactions")}
          >
            <strong>Transactions</strong>
            <span className="muted">Record & filter income or expenses</span>
          </button>

          <button
            type="button"
            className="secondary account-shortcut-btn"
            onClick={() => onNavigate("budgets")}
          >
            <strong>Budgets</strong>
            <span className="muted">Track monthly category limits</span>
          </button>

          <button
            type="button"
            className="secondary account-shortcut-btn"
            onClick={() => onNavigate("categories")}
          >
            <strong>Categories</strong>
            <span className="muted">Organize spending & income groups</span>
          </button>

          <button
            type="button"
            className="secondary account-shortcut-btn"
            onClick={() => onNavigate("reports")}
          >
            <strong>Reports</strong>
            <span className="muted">Visual trends & category analytics</span>
          </button>
        </div>
      </section>

      <section className="card">
        <div className="section-heading">
          <div>
            <h2>Sign out</h2>
            <p className="muted">
              End your current session on this browser. Any open MoneyMap tabs
              will also be signed out automatically.
            </p>
          </div>

          <button
            type="button"
            className="danger"
            onClick={() => setConfirmLogout(true)}
          >
            Logout
          </button>
        </div>
      </section>

      <ConfirmModal
        open={confirmLogout}
        title="Sign out of MoneyMap?"
        message="You will be returned to the login screen and will need to sign in again to access your financial records."
        confirmLabel="Logout"
        onConfirm={() => {
          setConfirmLogout(false);
          onLogout();
        }}
        onCancel={() => setConfirmLogout(false)}
      />
    </main>
  );
}

export default Account;