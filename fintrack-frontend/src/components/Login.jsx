import { useState } from "react";
import { login } from "../services/authService";
import { register } from "../services/registrationService";
import StatusAlert from "./StatusAlert";

function AuthPage({ onLogin, initialMode = "login", notice, onClearNotice }) {
  const [mode, setMode] = useState(initialMode);
  const [authNotice, setAuthNotice] = useState(notice || "");

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Register state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState("");
  const [regLoading, setRegLoading] = useState(false);

  const isRegister = mode === "register";
  const passwordsMismatch =
    regConfirmPassword.length > 0 && regPassword !== regConfirmPassword;

  function switchToRegister() {
    setLoginError("");
    setAuthNotice("");
    if (onClearNotice) {
      onClearNotice();
    }
    setMode("register");
  }

  function switchToLogin() {
    setRegError("");
    setMode("login");
  }

  async function handleLoginSubmit(event) {
    event.preventDefault();

    setLoginError("");
    setAuthNotice("");
    if (onClearNotice) {
      onClearNotice();
    }
    setLoginLoading(true);

    try {
      await login(loginEmail.trim(), loginPassword);
      onLogin();
    } catch (err) {
      setLoginError(err.message || "Invalid email or password.");
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleRegisterSubmit(event) {
    event.preventDefault();

    setRegError("");

    const trimmedName = regName.trim();
    const trimmedEmail = regEmail.trim();

    if (!trimmedName) {
      setRegError("Full name is required.");
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError("Passwords do not match.");
      return;
    }

    if (regPassword.length < 8) {
      setRegError("Password must contain at least 8 characters.");
      return;
    }

    setRegLoading(true);

    try {
      const message = await register(trimmedName, trimmedEmail, regPassword);

      setLoginEmail(trimmedEmail);
      setLoginPassword("");
      setRegName("");
      setRegEmail("");
      setRegPassword("");
      setRegConfirmPassword("");

      setAuthNotice(message || "Registration successful. Please log in.");
      setMode("login");
    } catch (err) {
      setRegError(err.message || "Registration failed. Please try again.");
    } finally {
      setRegLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-card-top">
          <div className="login-brand">
            <span className="brand-mark">₹</span>
            <span>MoneyMap</span>
          </div>

          <div className="auth-mode-tabs" role="tablist" aria-label="Authentication mode">
            <button
              type="button"
              role="tab"
              aria-selected={!isRegister}
              className={`auth-mode-tab ${!isRegister ? "active" : ""}`}
              onClick={switchToLogin}
              disabled={loginLoading || regLoading}
            >
              Sign in
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={isRegister}
              className={`auth-mode-tab ${isRegister ? "active" : ""}`}
              onClick={switchToRegister}
              disabled={loginLoading || regLoading}
            >
              Register
            </button>
          </div>
        </div>

        <div className="auth-slider-viewport">
          <div
            className={`auth-slider-track ${
              isRegister ? "show-register" : "show-login"
            }`}
          >
            {/* SLIDE 1: LOGIN FORM */}
            <section
              className="auth-slide"
              aria-hidden={isRegister}
            >
              <span className="eyebrow">WELCOME BACK</span>
              <h1>Sign in</h1>
              <p className="muted">
                Access your personal finance dashboard.
              </p>

              <StatusAlert
                type="success"
                message={authNotice || notice}
                onDismiss={() => {
                  setAuthNotice("");
                  if (onClearNotice) {
                    onClearNotice();
                  }
                }}
              />

              <form className="login-form" onSubmit={handleLoginSubmit}>
                <label className="field">
                  <span>Email address</span>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(event) => setLoginEmail(event.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    disabled={loginLoading}
                    tabIndex={isRegister ? -1 : 0}
                  />
                </label>

                <label className="field">
                  <span>Password</span>
                  <div className="password-input-wrap">
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      value={loginPassword}
                      onChange={(event) => setLoginPassword(event.target.value)}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                      disabled={loginLoading}
                      tabIndex={isRegister ? -1 : 0}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowLoginPassword((prev) => !prev)}
                      aria-label={
                        showLoginPassword ? "Hide password" : "Show password"
                      }
                      disabled={loginLoading}
                      tabIndex={isRegister ? -1 : 0}
                    >
                      {showLoginPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </label>

                <StatusAlert
                  type="error"
                  message={loginError}
                  onDismiss={() => setLoginError("")}
                />

                <button
                  type="submit"
                  className="login-submit"
                  disabled={loginLoading}
                  tabIndex={isRegister ? -1 : 0}
                >
                  {loginLoading ? "Signing in..." : "Sign in"}
                </button>
              </form>

              <p className="login-footer">
                Don't have an account?{" "}
                <button
                  type="button"
                  className="auth-link"
                  onClick={switchToRegister}
                  disabled={loginLoading}
                  tabIndex={isRegister ? -1 : 0}
                >
                  Create account
                </button>
              </p>
            </section>

            {/* SLIDE 2: REGISTER FORM */}
            <section
              className="auth-slide"
              aria-hidden={!isRegister}
            >
              <span className="eyebrow">GET STARTED</span>
              <h1>Create account</h1>
              <p className="muted">
                Track your income, expenses, and budgets in one app.
              </p>

              <form className="login-form" onSubmit={handleRegisterSubmit}>
                <label className="field">
                  <span>Full name</span>
                  <input
                    type="text"
                    value={regName}
                    onChange={(event) => setRegName(event.target.value)}
                    placeholder="Enter your name"
                    autoComplete="name"
                    required
                    maxLength={100}
                    disabled={regLoading}
                    tabIndex={!isRegister ? -1 : 0}
                  />
                </label>

                <label className="field">
                  <span>Email address</span>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(event) => setRegEmail(event.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    disabled={regLoading}
                    tabIndex={!isRegister ? -1 : 0}
                  />
                </label>

                <label className="field">
                  <span>Password</span>
                  <div className="password-input-wrap">
                    <input
                      type={showRegPassword ? "text" : "password"}
                      value={regPassword}
                      onChange={(event) => setRegPassword(event.target.value)}
                      placeholder="At least 8 characters"
                      autoComplete="new-password"
                      minLength={8}
                      required
                      disabled={regLoading}
                      tabIndex={!isRegister ? -1 : 0}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowRegPassword((prev) => !prev)}
                      aria-label={
                        showRegPassword ? "Hide password" : "Show password"
                      }
                      disabled={regLoading}
                      tabIndex={!isRegister ? -1 : 0}
                    >
                      {showRegPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </label>

                <label className="field">
                  <span>Confirm password</span>
                  <input
                    type={showRegPassword ? "text" : "password"}
                    value={regConfirmPassword}
                    onChange={(event) =>
                      setRegConfirmPassword(event.target.value)
                    }
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                    disabled={regLoading}
                    tabIndex={!isRegister ? -1 : 0}
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
                  message={regError}
                  onDismiss={() => setRegError("")}
                />

                <button
                  type="submit"
                  className="login-submit"
                  disabled={regLoading}
                  tabIndex={!isRegister ? -1 : 0}
                >
                  {regLoading ? "Creating account..." : "Create Account"}
                </button>
              </form>

              <p className="login-footer">
                Already registered?{" "}
                <button
                  type="button"
                  className="auth-link"
                  onClick={switchToLogin}
                  disabled={regLoading}
                  tabIndex={!isRegister ? -1 : 0}
                >
                  Sign in
                </button>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;