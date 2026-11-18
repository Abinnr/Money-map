
import { useState } from "react";
import { login } from "../services/authService";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const token = await login(email, password);

      localStorage.setItem("fintrack_token", token);
      onLogin();
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="login-brand">
          <div className="brand-mark">₹</div>
          <span>FinTrack</span>
        </div>

        <div className="login-content">
          <span className="eyebrow">WELCOME BACK</span>
          <h1>Take control of your finances.</h1>
          <p className="muted">
            Sign in to manage your income, expenses and monthly budgets.
          </p>

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="field">
              <span>Email address</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="username"
                required
                disabled={loading}
              />
            </label>

            <label className="field">
              <span>Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                disabled={loading}
              />
            </label>

            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in to FinTrack"}
            </button>
          </form>

          <p className="login-footer">
            Your finances, organized in one place.
          </p>
        </div>
      </section>

      <aside className="login-decoration">
        <div className="decoration-content">
          <span className="decoration-label">FINANCIAL CLARITY</span>
          <h2>
            Make every
            <br />
            rupee count.
          </h2>
          <p>
            Understand your spending, plan your future and build better
            financial habits.
          </p>

          <div className="decoration-stat">
            <span className="decoration-stat-icon">↗</span>
            <div>
              <strong>Spend with purpose.</strong>
              <span>Plan. Track. Improve.</span>
            </div>
          </div>
        </div>
      </aside>
    </main>
  );
}

export default Login;
