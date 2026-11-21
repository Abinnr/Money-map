import { useEffect } from "react";

function StatusAlert({
  type = "info",
  message,
  onDismiss,
  autoDismissMs = 0,
}) {
  useEffect(() => {
    if (!message || !autoDismissMs || !onDismiss) {
      return;
    }

    const timer = window.setTimeout(() => {
      onDismiss();
    }, autoDismissMs);

    return () => window.clearTimeout(timer);
  }, [message, autoDismissMs, onDismiss]);

  if (!message) {
    return null;
  }

  const variantClass =
    type === "error"
      ? "alert-error"
      : type === "success"
        ? "alert-success"
        : type === "warning"
          ? "alert-warning"
          : "";

  return (
    <div
      className={`alert ${variantClass}`.trim()}
      role={type === "error" ? "alert" : "status"}
    >
      <span>{message}</span>

      {onDismiss && (
        <button
          type="button"
          className="alert-dismiss"
          onClick={onDismiss}
          aria-label="Dismiss notification"
        >
          ×
        </button>
      )}
    </div>
  );
}

export default StatusAlert;