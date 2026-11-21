import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an interface error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
          <div
            className="card"
            style={{
              maxWidth: 480,
              width: "100%",
              textAlign: "center",
              padding: 28,
              border: "1.5px solid rgba(244, 63, 94, 0.4)",
              background: "rgba(28, 12, 60, 0.95)",
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: 10 }}>🛡️</div>
            <h3 style={{ margin: "0 0 8px", color: "#fda4af", fontSize: "1.15rem", fontWeight: 800 }}>
              Display Recovered
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: "0 0 16px", lineHeight: 1.5 }}>
              Voice Khata captured an interface rendering event. Your ledger balances and transactions remain completely safe and encrypted.
            </p>
            {this.state.error?.message && (
              <pre
                style={{
                  fontSize: "0.75rem",
                  background: "rgba(0, 0, 0, 0.4)",
                  padding: "8px 12px",
                  borderRadius: 8,
                  textAlign: "left",
                  overflowX: "auto",
                  color: "#fca5a5",
                  marginBottom: 16,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {this.state.error.message}
              </pre>
            )}
            <button className="btn btn-primary" onClick={this.handleReset} style={{ width: "100%" }}>
              {this.props.buttonText || "Return to Dashboard"}
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
