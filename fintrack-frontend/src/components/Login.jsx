import { useState } from "react";
import { login } from "../services/authService";

function Login({ onLogin, onRegisterClick, notice, onClearNotice }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    if (onClearNotice) {
      onClearNotice();
    }
    setLoading(true);

    try {
      await login(email.trim(), password);
      onLogin();
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <section className="login-panel">
        <div className="login-brand">
          <span className="brand-mark">₹</span>
          FinTrack
        </div>

        <div className="login-content">
          <span className="eyebrow">WELCOME BACK</span>

          <h1>Welcome back.</h1>

          <p className="muted">
            Sign in to access your personal finance dashboard.
          </p>

          {notice && (
            <p className="alert">{notice}</p>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="field">
              Email address

              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
                disabled={loading}
              />
            </label>

            <label className="field">
              Password

              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
                disabled={loading}
              />
            </label>

            {error && (
              <p className="alert alert-error">{error}</p>
            )}

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="login-footer">
            Don't have an account?{" "}
            <button
              type="button"
              className="auth-link"
              onClick={onRegisterClick}
              disabled={loading}
            >
              Create account
            </button>
          </p>
        </div>
      </section>

      <aside className="login-decoration">
        <div className="decoration-content">
          <span className="decoration-label">
            PERSONAL FINANCE MANAGEMENT
          </span>

          <h2>
            Understand
            <br />
            your money.
          </h2>

          <p>
            Keep track of your income, expenses and budgets.
            Make informed financial decisions with FinTrack.
          </p>

          <div className="decoration-stat">
            <span className="decoration-stat-icon">✓</span>

            <div>
              <strong>Your finances, organized</strong>
              <span>Everything in one place.</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default Login;