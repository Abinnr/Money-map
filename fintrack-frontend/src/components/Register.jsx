import { useState } from "react";
import { register } from "../services/registrationService";
import StatusAlert from "./StatusAlert";

function Register({ onRegistrationSuccess, onLoginClick }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordsMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setError("Full name is required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const message = await register(
        trimmedName,
        trimmedEmail,
        password
      );

      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      onRegistrationSuccess(
        message || "Registration successful. Please log in."
      );
    } catch (err) {
      setError(
        err.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <section className="login-panel">
        <div className="login-brand">
          <span className="brand-mark">₹</span>
          MoneyMap
        </div>

        <div className="login-content">
          <span className="eyebrow">GET STARTED</span>

          <h1>Create your account</h1>

          <p className="muted">
            Start managing your income, expenses, and financial goals
            in one place.
          </p>

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="field">
              <span>Full name</span>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter your name"
                autoComplete="name"
                required
                maxLength={100}
                disabled={loading}
              />
            </label>

            <label className="field">
              <span>Email address</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                disabled={loading}
              />
            </label>

            <label className="field">
              <span>Password</span>
              <div className="password-input-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  disabled={loading}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={loading}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <span className="muted" style={{ fontSize: "12px" }}>
                Minimum 8 characters.
              </span>
            </label>

            <label className="field">
              <span>Confirm password</span>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                placeholder="Re-enter your password"
                autoComplete="new-password"
                minLength={8}
                required
                disabled={loading}
              />
              {passwordsMismatch && (
                <span
                  className="negative-text"
                  style={{ fontSize: "12px", fontWeight: 600 }}
                >
                  Passwords do not match yet.
                </span>
              )}
            </label>

            <StatusAlert
              type="error"
              message={error}
              onDismiss={() => setError("")}
            />

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="login-footer">
            Already registered?{" "}
            <button
              type="button"
              className="auth-link"
              onClick={onLoginClick}
              disabled={loading}
            >
              Login
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
            Your money.
            <br />
            Your control.
          </h2>

          <p>
            Build better financial habits by understanding where
            your money comes from and where it goes.
          </p>

          <div className="decoration-stat">
            <span className="decoration-stat-icon">✓</span>

            <div>
              <strong>One place for your finances</strong>
              <span>Track, plan, and manage your money.</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default Register;