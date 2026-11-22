import React, { useState } from "react";
import { ArrowLeft, Camera, Check, CheckCircle2, Globe, KeyRound, Lock, Mail, Phone, Save, ScanFace, Shield, ShoppingBag, Store, User } from "lucide-react";
import { api } from "../api/client";
import { t } from "../utils/i18n";
import { FaceScannerModal } from "./FaceScannerModal";

const LANGUAGES = [
  { code: "en-IN", label: "Indian English", flag: "🇮🇳" },
  { code: "hi-IN", label: "Hindi (हिंदी)", flag: "🇮🇳" },
  { code: "kn-IN", label: "Kannada (ಕನ್ನಡ)", flag: "🇮🇳" },
  { code: "ta-IN", label: "Tamil (தமிழ்)", flag: "🇮🇳" },
  { code: "te-IN", label: "Telugu (తెలుగు)", flag: "🇮🇳" },
];

export function ProfileScreen({
  currentUser,
  onUpdateCurrentUser,
  onLanguageChange,
  onBack,
  language = "hi-IN",
}) {
  const [name, setName] = useState(currentUser?.name || "");
  const [shopName, setShopName] = useState(currentUser?.shop_name || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [preferredLanguage, setPreferredLanguage] = useState(
    currentUser?.preferred_language || language || "hi-IN"
  );

  // Optional password change
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [hasFaceId, setHasFaceId] = useState(Boolean(currentUser?.has_face_id));
  const [faceModalOpen, setFaceModalOpen] = useState(false);
  const [faceEnrolling, setFaceEnrolling] = useState(false);

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const initials = (name || "Shopkeeper")
    .trim()
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  async function handleSave(e) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const cleanName = name.trim();
    const cleanPhone = phone.trim().replace(/\D/g, "");

    if (cleanName.length < 2) {
      setErrorMsg("Please enter a valid shopkeeper name (at least 2 letters).");
      return;
    }

    if (cleanPhone.length < 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (newPassword) {
      if (!currentPassword) {
        setErrorMsg("Please enter your current password to set a new password.");
        return;
      }
      if (newPassword.length < 6) {
        setErrorMsg("New password must be at least 6 characters.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMsg("New password and confirmation password do not match.");
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        name: cleanName,
        shop_name: shopName.trim(),
        phone: cleanPhone.slice(-10),
        email: email.trim() || null,
        preferred_language: preferredLanguage,
      };

      if (newPassword) {
        payload.current_password = currentPassword;
        payload.new_password = newPassword;
      }

      const updated = await api.authUpdateProfile(payload);
      onUpdateCurrentUser?.(updated);

      if (preferredLanguage !== language) {
        onLanguageChange?.(preferredLanguage);
      }

      setSuccessMsg("Shopkeeper profile updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordSection(false);
    } catch (err) {
      setErrorMsg(err.message || "Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="profile-container" style={{ display: "grid", gap: 16, maxWidth: 780, margin: "0 auto" }}>
      {/* Top Navigation Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={onBack}
          style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          <ArrowLeft size={15} /> Back to Dashboard
        </button>
        <span style={{ fontSize: "0.8rem", color: "var(--muted)", fontWeight: 600 }}>
          Account ID: #{currentUser?.id || "1"} · SmartKhata Store Owner
        </span>
      </div>

      {/* Hero Profile Card */}
      <div className="card profile-hero-card" style={{
        background: "linear-gradient(135deg, #1e0b4b 0%, #13072e 100%)",
        color: "#ffffff",
        borderRadius: 20,
        padding: "24px 28px",
        display: "flex",
        alignItems: "center",
        gap: 20,
        flexWrap: "wrap",
        boxShadow: "0 12px 32px rgba(15, 23, 42, 0.15)",
        border: "1px solid rgba(236, 72, 153, 0.35)"
      }}>
        <div style={{
          width: 68,
          height: 68,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #ec4899 0%, #a855f7 100%)",
          color: "#ffffff",
          fontSize: "1.65rem",
          fontWeight: 850,
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
          boxShadow: "0 4px 16px rgba(236, 72, 153, 0.45)",
          border: "2px solid rgba(255, 255, 255, 0.2)"
        }}>
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <h2 style={{ margin: 0, fontSize: "1.45rem", fontWeight: 800 }}>{name || "Shopkeeper"}</h2>
            <span style={{
              fontSize: "0.72rem",
              fontWeight: 800,
              padding: "3px 9px",
              borderRadius: 999,
              background: "rgba(16, 185, 129, 0.22)",
              color: "#6ee7b7",
              border: "1px solid rgba(16, 185, 129, 0.4)"
            }}>
              Owner / Admin
            </span>
          </div>
          <div style={{ fontSize: "0.92rem", color: "#94a3b8", marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
            <Store size={15} style={{ color: "#c084fc" }} />
            <strong style={{ color: "#f8fafc" }}>{shopName || "My Kirana Store"}</strong>
          </div>
          <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: 4 }}>
            {phone ? `+91 ${phone}` : "No phone added"}
            {email ? ` · ${email}` : ""}
          </div>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div style={{
          background: "rgba(16, 185, 129, 0.16)",
          border: "1px solid rgba(16, 185, 129, 0.4)",
          borderRadius: 14,
          padding: "12px 16px",
          color: "#6ee7b7",
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontWeight: 700,
          fontSize: "0.88rem"
        }}>
          <CheckCircle2 size={18} style={{ color: "#34d399", flexShrink: 0 }} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div style={{
          background: "rgba(244, 63, 94, 0.16)",
          border: "1px solid rgba(244, 63, 94, 0.4)",
          borderRadius: 14,
          padding: "12px 16px",
          color: "#fda4af",
          fontWeight: 700,
          fontSize: "0.88rem"
        }}>
          {errorMsg}
        </div>
      )}

      {/* Main Profile Edit Form */}
      <form onSubmit={handleSave} className="card" style={{ padding: "24px 28px", borderRadius: 20 }}>
        <h3 style={{ margin: "0 0 16px", fontSize: "1.12rem", fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
          <User size={18} style={{ color: "var(--accent)" }} /> Shopkeeper Profile Details
        </h3>

        <div style={{ display: "grid", gap: 16 }}>
          {/* Shopkeeper Name */}
          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 750, marginBottom: 6, color: "var(--ink)" }}>
              Shopkeeper Name <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                className="text-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Kumar / Karthik"
                required
                style={{ width: "100%", paddingLeft: 38 }}
              />
              <User size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
            </div>
            <small style={{ color: "var(--muted)", fontSize: "0.72rem" }}>
              This name appears in your top navigation bar and receipts.
            </small>
          </div>

          {/* Shop / Business Name */}
          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 750, marginBottom: 6, color: "var(--ink)" }}>
              Shop / Business Name
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                className="text-input"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="e.g. Kiran General Store"
                style={{ width: "100%", paddingLeft: 38 }}
              />
              <Store size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
            </div>
            <small style={{ color: "var(--muted)", fontSize: "0.72rem" }}>
              Appears on WhatsApp receipts sent to customers.
            </small>
          </div>

          {/* 2-Column Row: Contact Mobile & Email */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
            {/* Contact Mobile */}
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 750, marginBottom: 6, color: "var(--ink)" }}>
                Contact Mobile Number <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="tel"
                  className="text-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile (e.g. 9876543210)"
                  maxLength={14}
                  required
                  style={{ width: "100%", paddingLeft: 38 }}
                />
                <Phone size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
              </div>
              <small style={{ color: "var(--muted)", fontSize: "0.72rem" }}>
                Used for instant login &amp; account recovery.
              </small>
            </div>

            {/* Gmail / Email */}
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 750, marginBottom: 6, color: "var(--ink)" }}>
                Gmail / Email Address <span style={{ color: "var(--muted)", fontWeight: 500 }}>(Optional)</span>
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="email"
                  className="text-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. yourname@gmail.com"
                  style={{ width: "100%", paddingLeft: 38 }}
                />
                <Mail size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
              </div>
              <small style={{ color: "var(--muted)", fontSize: "0.72rem" }}>
                Alternative login and ledger statement backups.
              </small>
            </div>
          </div>

          {/* Default / Preferred Language */}
          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 750, marginBottom: 6, color: "var(--ink)" }}>
              Default App &amp; Voice Language
            </label>
            <div style={{ position: "relative" }}>
              <select
                className="text-input"
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                style={{ width: "100%", paddingLeft: 38, cursor: "pointer" }}
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.label}
                  </option>
                ))}
              </select>
              <Globe size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
            </div>
            <small style={{ color: "var(--muted)", fontSize: "0.72rem" }}>
              SmartKhata will speak and display in this language by default every time you log in.
            </small>
          </div>

          {/* Biometric Face ID Settings */}
          <div style={{
            borderTop: "1px dashed var(--border)",
            paddingTop: 14,
            marginTop: 4,
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 10,
              padding: "12px 14px",
              borderRadius: 12,
              background: "var(--surface-alt)",
              border: "1px solid var(--border)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: hasFaceId ? "rgba(16, 185, 129, 0.12)" : "rgba(249, 115, 22, 0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: hasFaceId ? "#10b981" : "var(--accent)",
                }}>
                  <ScanFace size={20} />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: "0.88rem" }}>
                    <span>Biometric Face ID</span>
                    {hasFaceId ? (
                      <span style={{
                        fontSize: "0.7rem",
                        padding: "2px 7px",
                        borderRadius: 10,
                        background: "rgba(16, 185, 129, 0.15)",
                        color: "#059669",
                        fontWeight: 700,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 3,
                      }}>
                        <CheckCircle2 size={12} /> Active
                      </span>
                    ) : (
                      <span style={{
                        fontSize: "0.7rem",
                        padding: "2px 7px",
                        borderRadius: 10,
                        background: "rgba(239, 68, 68, 0.1)",
                        color: "#dc2626",
                        fontWeight: 600,
                      }}>
                        Not Registered
                      </span>
                    )}
                  </div>
                  <div style={{ color: "var(--muted)", fontSize: "0.74rem", marginTop: 2 }}>
                    {hasFaceId
                      ? "Enrolled. You can sign in using camera facial recognition."
                      : "Register your face to enable instant 1-tap camera login."}
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setFaceModalOpen(true)}
                disabled={faceEnrolling}
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <Camera size={14} />
                <span>{hasFaceId ? "Re-scan Face ID" : "Register Face ID"}</span>
              </button>
            </div>
          </div>

          {/* Collapsible Password Change Section */}
          <div style={{
            borderTop: "1px dashed var(--border)",
            paddingTop: 14,
            marginTop: 4
          }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setShowPasswordSection(!showPasswordSection)}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: showPasswordSection ? 14 : 0 }}
            >
              <KeyRound size={15} />
              <span>{showPasswordSection ? "Hide Password Change" : "Change Login Password"}</span>
            </button>

            {showPasswordSection && (
              <div style={{
                background: "var(--surface-alt)",
                border: "1px solid var(--border)",
                borderRadius: 14,
                padding: "16px",
                display: "grid",
                gap: 12
              }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 750, marginBottom: 4 }}>
                    Current Password
                  </label>
                  <input
                    type="password"
                    className="text-input"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    style={{ width: "100%" }}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 750, marginBottom: 4 }}>
                      New Password
                    </label>
                    <input
                      type="password"
                      className="text-input"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      style={{ width: "100%" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 750, marginBottom: 4 }}>
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      className="text-input"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      style={{ width: "100%" }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form Action Buttons */}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onBack}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
              style={{ minWidth: 140, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}
            >
              <Save size={16} />
              <span>{saving ? "Saving..." : "Save Profile"}</span>
            </button>
          </div>
        </div>
      </form>

      <FaceScannerModal
        isOpen={faceModalOpen}
        mode="register"
        onCapture={async (data) => {
          setFaceEnrolling(true);
          setErrorMsg("");
          try {
            const payload = {
              face_data: JSON.stringify({
                descriptor: data.descriptor,
                photo: data.photo,
                timestamp: data.timestamp,
              }),
            };
            await api.authRegisterFace(payload);
            setHasFaceId(true);
            setSuccessMsg("Biometric Face ID enrolled and updated successfully!");
            onUpdateCurrentUser?.({
              ...(currentUser || {}),
              has_face_id: true,
            });
            setFaceModalOpen(false);
          } catch (err) {
            setErrorMsg(err.message || "Failed to register Face ID.");
          } finally {
            setFaceEnrolling(false);
          }
        }}
        onClose={() => setFaceModalOpen(false)}
        loading={faceEnrolling}
      />
    </div>
  );
}
