
import { useState } from "react";
import { register } from "../services/registrationService";

function Register({ onRegistrationSuccess, onLoginClick }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

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
        name.trim(),
        email.trim(),
        password
      );

      setSuccess(message || "Registration successful.");

      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      onRegistrationSuccess();
    } catch (error) {
      setError(
        error.message || "Registration failed. Please try again."
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
          FinTrack
        </div>

        <div className="login-content">
          <span className="eyebrow">GET STARTED</span>

          <h1>Create your account</h1>

          <p className="muted">
            Start managing your income, expenses and financial goals
            in one place.
          </p>

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="field">
              Full name
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter your name"
                required
                maxLength={100}
                disabled={loading}
              />
            </label>

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
                placeholder="At least 8 characters"
                minLength={8}
                required
                disabled={loading}
              />
            </label>

            <label className="field">
              Confirm password
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                placeholder="Re-enter your password"
                minLength={8}
                required
                disabled={loading}
              />
            </label>

            {error && (
              <p className="alert alert-error">{error}</p>
            )}

            {success && (
              <p className="alert">
                {success}
              </p>
            )}

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
              <span>Track, plan and manage your money.</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default Register;
