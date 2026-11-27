import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message || "An unexpected interface error occurred.",
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error("MoneyMap UI ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: "" });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="auth-shell">
          <div className="auth-card" style={{ textAlign: "center" }}>
            <div className="login-brand" style={{ justifyContent: "center" }}>
              <span className="brand-mark">₹</span>
              <span>MoneyMap</span>
            </div>

            <span className="eyebrow">SOMETHING WENT WRONG</span>
            <h1>Unexpected Display Error</h1>
            <p className="muted" style={{ marginBottom: "1rem" }}>
              {this.state.errorMessage}
            </p>

            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                className="secondary"
                onClick={this.handleReset}
              >
                Try again
              </button>
              <button type="button" onClick={this.handleReload}>
                Reload app
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;