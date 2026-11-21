import React, { useState } from "react";
import { Camera, CheckCircle2, Eye, EyeOff, Globe, LogIn, Mic, Phone, ScanFace, ShieldCheck, Store, UserPlus, Users } from "lucide-react";
import { validateLoginForm, validateSignUpForm } from "../utils/authHelpers";
import { SUPPORTED_LANGUAGES } from "../utils/i18n";
import { FaceScannerModal } from "./FaceScannerModal";

function PasswordInput({ id, label, value, onChange, placeholder, autoComplete }) {
  const [visible, setVisible] = useState(false);
  return (
    <label className="auth-field">
      <span>{label}</span>
      <div className="auth-password-wrap">
        <input
          id={id}
          className="text-input"
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
        />
        <button
          type="button"
          className="auth-eye-btn"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? `Hide ${label}` : `Show ${label}`}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </label>
  );
}

/**
 * Login page rendered before entering the Voice Khata workspace.
 * Face ID verification is strictly mandatory to sign in.
 */
export function LoginPage({
  onSubmit,
  onFaceLogin,
  onSwitchToSignUp,
  loading = false,
  error = "",
}) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [verifiedFace, setVerifiedFace] = useState(null);
  const [localError, setLocalError] = useState("");
  const [faceModalOpen, setFaceModalOpen] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const loginId = identifier.trim();
    if (!loginId) {
      setLocalError("Please enter your mobile number or email.");
      return;
    }
    if (!password) {
      setLocalError("Please enter your password.");
      return;
    }
    if (!verifiedFace) {
      setLocalError("Face ID verification is mandatory to sign in. Please look into the camera.");
      setFaceModalOpen(true);
      return;
    }
    setLocalError("");
    await onSubmit({
      identifier: loginId,
      phone: loginId,
      email: loginId,
      password,
      face_data: typeof verifiedFace === "string" ? verifiedFace : JSON.stringify(verifiedFace),
    });
  }

  const displayError = localError || error;

  return (
    <>
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="auth-card-head">
          <h2>Welcome back</h2>
          <p>Sign in to open your Voice Khata dashboard and customer ledgers.</p>
        </div>

        {displayError && (
          <div className="auth-error-banner" role="alert">
            {displayError}
          </div>
        )}

        <label className="auth-field">
          <span>Mobile Number (or Email) *</span>
          <input
            id="login-identifier"
            className="text-input"
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="Enter 10-digit mobile number or email"
            autoComplete="username tel"
            required
          />
        </label>

        <PasswordInput
          id="login-password"
          label="Password *"
          value={password}
          onChange={setPassword}
          placeholder="Enter your password"
          autoComplete="current-password"
        />

        {/* Mandatory Face ID Status Box */}
        <div className="auth-field">
          <span>Face ID Verification * (Mandatory)</span>
          {verifiedFace ? (
            <div className="face-id-enrolled-row">
              {verifiedFace.photo && (
                <img
                  src={verifiedFace.photo}
                  alt="Verified face thumbnail"
                  className="face-id-thumbnail"
                />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="face-id-enrolled-badge">
                  <CheckCircle2 size={14} /> Face ID Ready for Sign In
                </div>
                <small style={{ color: "var(--muted)", fontSize: "0.74rem" }}>
                  Face biometric captured. Ready to unlock.
                </small>
              </div>
              <button
                type="button"
                className="btn btn-outline"
                style={{ padding: "4px 8px", fontSize: "0.78rem" }}
                onClick={() => setFaceModalOpen(true)}
              >
                Re-scan
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-outline face-enroll-trigger-btn"
              style={{ width: "100%", justifyContent: "center", padding: "10px 14px" }}
              onClick={() => setFaceModalOpen(true)}
              disabled={loading}
            >
              <Camera size={16} /> Scan &amp; Verify Face ID (Mandatory)
            </button>
          )}
        </div>

        <button className="btn btn-primary auth-submit-btn" type="submit" disabled={loading}>
          <ScanFace size={16} /> {loading ? "Signing in..." : "Sign In with Face ID"}
        </button>

        <div className="auth-switch-row">
          <span>New to Voice Khata?</span>
          <button type="button" className="auth-link-btn" onClick={onSwitchToSignUp}>
            Create an account
          </button>
        </div>
      </form>

      {onFaceLogin && (
        <FaceScannerModal
          isOpen={faceModalOpen}
          mode="verify"
          defaultIdentifier={identifier}
          onVerify={async ({ identifier: idVal, faceData }) => {
            await onFaceLogin({ identifier: idVal, faceData });
            setFaceModalOpen(false);
          }}
          onCapture={(data) => {
            setVerifiedFace(data);
          }}
          onClose={() => setFaceModalOpen(false)}
          loading={loading}
          error={error}
        />
      )}
    </>
  );
}

/**
 * Sign Up page creating a shopkeeper account before entering the dashboard.
 * Face ID registration is strictly mandatory.
 */
export function SignUpPage({ onSubmit, onSwitchToLogin, loading = false, error = "" }) {
  const [name, setName] = useState("");
  const [shopName, setShopName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState(() => {
    try {
      return localStorage.getItem("preferred_language") || "hi-IN";
    } catch {
      return "hi-IN";
    }
  });
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const [enrolledFace, setEnrolledFace] = useState(null);
  const [faceModalOpen, setFaceModalOpen] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErr = validateSignUpForm({ name, phone, email, password, confirmPassword });
    if (validationErr) {
      setLocalError(validationErr);
      return;
    }
    if (!enrolledFace) {
      setLocalError("Face ID registration is mandatory. Please click 'Register Face ID with Camera' to register your face.");
      setFaceModalOpen(true);
      return;
    }
    setLocalError("");
    await onSubmit({
      name: name.trim(),
      shop_name: shopName.trim() || null,
      phone: phone.trim(),
      email: email.trim() || null,
      preferred_language: preferredLanguage,
      password,
      face_data: JSON.stringify({
        descriptor: enrolledFace.descriptor,
        photo: enrolledFace.photo,
        timestamp: enrolledFace.timestamp,
      }),
    });
  }

  const displayError = localError || error;

  return (
    <>
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="auth-card-head">
          <h2>Create your Khata account</h2>
          <p>Sign up to access your kirana voice ledger and per-customer accounts.</p>
        </div>

        {displayError && (
          <div className="auth-error-banner" role="alert">
            {displayError}
          </div>
        )}

        <div className="auth-two-col">
          <label className="auth-field">
            <span>Full Name *</span>
            <input
              id="signup-name"
              className="text-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Karthik Achar"
              autoComplete="name"
              required
            />
          </label>

          <label className="auth-field">
            <span>Shop / Store Name (Optional)</span>
            <input
              id="signup-shop"
              className="text-input"
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="e.g. Sri Lakshmi Kirana"
              autoComplete="organization"
            />
          </label>
        </div>

        <div className="auth-two-col">
          <label className="auth-field">
            <span>Mobile Number * (Mandatory)</span>
            <input
              id="signup-phone"
              className="text-input"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-digit mobile number (e.g. 9876543210)"
              autoComplete="tel"
              required
            />
          </label>

          <label className="auth-field">
            <span>Email Address (Optional)</span>
            <input
              id="signup-email"
              className="text-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@gmail.com (optional)"
              autoComplete="email"
            />
          </label>
        </div>

        <label className="auth-field" style={{ gridColumn: "1 / -1" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 700 }}>
            <Globe size={15} style={{ color: "var(--accent)" }} /> Default Account Language * (डिफ़ॉल्ट भाषा)
          </span>
          <select
            id="signup-language"
            className="text-input"
            value={preferredLanguage}
            onChange={(e) => setPreferredLanguage(e.target.value)}
            style={{ fontWeight: 600 }}
          >
            {SUPPORTED_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.flag} {l.native} · {l.en} ({l.code})
              </option>
            ))}
          </select>
          <small style={{ color: "var(--muted)", fontSize: "0.76rem", marginTop: 4 }}>
            This will be your default voice assistant, ledger, and workspace language whenever you log in.
          </small>
        </label>

        {/* Biometric Face ID Registration Section (Mandatory) */}
        <div className="face-id-signup-card">
          <div className="face-id-signup-info">
            <div className="face-id-signup-title">
              <ScanFace size={18} style={{ color: "var(--accent)" }} />
              <strong>Biometric Face ID Registration *</strong>
              <span className="face-mandatory-badge">* Mandatory</span>
            </div>
            <p>
              Face ID registration is strictly mandatory. You will be required to verify your face every time you sign in.
            </p>
          </div>

          {enrolledFace ? (
            <div className="face-id-enrolled-row">
              {enrolledFace.photo && (
                <img
                  src={enrolledFace.photo}
                  alt="Enrolled face preview"
                  className="face-id-thumbnail"
                />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="face-id-enrolled-badge">
                  <CheckCircle2 size={14} /> Face ID Registered (Verified)
                </div>
                <small style={{ color: "var(--muted)", fontSize: "0.74rem" }}>
                  Face biometric template ready to protect your account.
                </small>
              </div>
              <button
                type="button"
                className="btn btn-outline"
                style={{ padding: "4px 8px", fontSize: "0.78rem" }}
                onClick={() => setFaceModalOpen(true)}
              >
                Re-scan
              </button>
            </div>
          ) : (
            <div className="face-id-prompt-row">
              <button
                type="button"
                className="btn btn-primary face-enroll-trigger-btn"
                onClick={() => setFaceModalOpen(true)}
              >
                <Camera size={16} /> Register Face ID with Camera (Required)
              </button>
              <span className="face-id-required-tag">* Face registration required to sign up</span>
            </div>
          )}
        </div>

        <div className="auth-two-col">
          <PasswordInput
            id="signup-password"
            label="Password (min 6 chars) *"
            value={password}
            onChange={setPassword}
            placeholder="Create password"
            autoComplete="new-password"
          />

          <PasswordInput
            id="signup-confirm-password"
            label="Confirm Password *"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Re-enter password"
            autoComplete="new-password"
          />
        </div>

        <button className="btn btn-primary auth-submit-btn" type="submit" disabled={loading}>
          <UserPlus size={16} /> {loading ? "Creating account..." : "Create Account & Enter Dashboard"}
        </button>

        <div className="auth-switch-row">
          <span>Already have an account?</span>
          <button type="button" className="auth-link-btn" onClick={onSwitchToLogin}>
            Sign in here
          </button>
        </div>
      </form>

      <FaceScannerModal
        isOpen={faceModalOpen}
        mode="register"
        onCapture={(data) => {
          setEnrolledFace(data);
          setFaceModalOpen(false);
        }}
        onClose={() => setFaceModalOpen(false)}
        loading={loading}
      />
    </>
  );
}

/**
 * Full-screen authentication shell presenting Login and Sign Up pages
 * prior to entering the Voice Khata dashboard.
 */
export function AuthGateway({
  mode,
  onChangeMode,
  onLogin,
  onFaceLogin,
  onSignUp,
  loading = false,
  error = "",
  statusInfo = null,
}) {
  return (
    <div className="auth-shell">
      <aside className="auth-hero" aria-label="Voice Khata Overview">
        <div>
          <div className="brand" style={{ marginBottom: 22 }}>
            <div className="brand-mark">₹</div>
            <div>
              <h1 style={{ color: "#f8fafc", margin: 0, fontSize: "1.3rem" }}>Voice Khata</h1>
              <small style={{ color: "#94a3b8" }}>Kirana AI Digital Accountant · Gemini 3.8 / 4 Argon</small>
            </div>
          </div>

          <h2 className="auth-hero-title">
            Your voice-first kirana ledger, protected before you open the register.
          </h2>
          <p className="auth-hero-sub">
            Sign in or create your shopkeeper account to record daily udhaar, inspect every customer&apos;s
            individual block ledger, and manage your store securely.
          </p>

          <ul className="auth-feature-list">
            <li>
              <Mic size={16} />
              <span>Speak naturally in Hindi, Kannada, Tamil, Telugu, or Indian English</span>
            </li>
            <li>
              <Users size={16} />
              <span>Browse per-customer ledger blocks with complete transaction history</span>
            </li>
            <li>
              <Store size={16} />
              <span>Track today&apos;s credit, collections, and export CSV reports in one tap</span>
            </li>
            <li>
              <ShieldCheck size={16} />
              <span>Salted scrypt passwords, biometric Face ID verification &amp; AES-256-GCM encryption</span>
            </li>
          </ul>
        </div>
      </aside>

      <main className="auth-main">
        <div className="card auth-card">
          <div className="auth-mode-tabs" role="tablist" aria-label="Authentication Pages">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "login"}
              className={`auth-mode-tab ${mode === "login" ? "active" : ""}`}
              onClick={() => onChangeMode("login")}
            >
              <LogIn size={15} /> Login Page
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "signup"}
              className={`auth-mode-tab ${mode === "signup" ? "active" : ""}`}
              onClick={() => onChangeMode("signup")}
            >
              <UserPlus size={15} /> Sign Up Page
            </button>
          </div>

          {mode === "signup" ? (
            <SignUpPage
              onSubmit={onSignUp}
              onSwitchToLogin={() => onChangeMode("login")}
              loading={loading}
              error={error}
            />
          ) : (
            <LoginPage
              onSubmit={onLogin}
              onFaceLogin={onFaceLogin}
              onSwitchToSignUp={() => onChangeMode("signup")}
              loading={loading}
              error={error}
            />
          )}
        </div>
      </main>
    </div>
  );
}

