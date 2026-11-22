import React from "react";
import { Lock, LogOut, Trash2, User } from "lucide-react";

const LANGUAGES = [
  { code: "hi-IN", label: "Hindi / Hinglish (hi-IN)" },
  { code: "kn-IN", label: "Kannada (ಕನ್ನಡ · kn-IN)" },
  { code: "ta-IN", label: "Tamil / Tanglish (ta-IN)" },
  { code: "te-IN", label: "Telugu / Tenglish (te-IN)" },
  { code: "en-IN", label: "Indian English (en-IN)" },
];

export function SettingsScreen({
  currentUser,
  onLogout,
  statusInfo,
  language,
  aiMode,
  speechProvider,
  ephemeral,
  useDirectAudio,
  useLiveStream,
  liveWsSupported = true,
  liveEphemeralSupported = false,
  canLiveStream = liveWsSupported || liveEphemeralSupported,
  interactiveConfirm,
  onUpdateSetting,
  onToggleDirectAudio,
  onToggleLiveStream,
  onToggleInteractiveConfirm,
  onWipeTranscripts,
}) {
  return (
    <div className="settings-container">
      {currentUser && (
        <div className="card settings-account-card">
          <div className="settings-account-inner">
            <div className="settings-account-info">
              <h3 style={{ margin: "0 0 4px", display: "flex", alignItems: "center", gap: 6 }}>
                <User size={17} /> Signed-In Shopkeeper Account
              </h3>
              <div style={{ fontSize: "0.88rem", fontWeight: 700 }}>
                {currentUser.name} · {currentUser.shop_name}
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 2 }}>
                {currentUser.phone ? `Mobile: ${currentUser.phone}` : ""}
                {currentUser.email ? ` · Email: ${currentUser.email}` : ""}
              </div>
            </div>
            {onLogout && (
              <button className="btn btn-secondary settings-logout-btn" type="button" onClick={onLogout}>
                <LogOut size={15} /> Sign Out
              </button>
            )}
          </div>
        </div>
      )}

      <div className="card settings-engine-card">
        <h3 style={{ marginTop: 0 }}>Language &amp; Gemini AI Engine</h3>
        <div style={{ display: "grid", gap: 14 }}>
          <label className="settings-field-group">
            <span className="settings-field-label">Preferred Shopkeeper Language</span>
            <select
              className="text-input settings-select"
              value={language}
              onChange={(e) => onUpdateSetting({ preferred_language: e.target.value })}
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </label>

          <label className="settings-field-group">
            <span className="settings-field-label">Gemini Optimization Tier</span>
            <select
              className="text-input settings-select"
              value={aiMode}
              onChange={(e) => onUpdateSetting({ ai_mode: e.target.value })}
            >
              <option value="cascaded">
                Cascaded (Recommended: Fast-Path + Gemini 3.8 Flash + Gemini 4 Argon)
              </option>
              <option value="flash">Gemini 3.8 Flash Only (Lowest cloud latency)</option>
              <option value="argon">Gemini 4 Argon (Fast frontier reasoning)</option>
              <option value="carbon">Gemini 4 Carbon (Top-end maximum reasoning)</option>
              <option value="offline">Local Deterministic Fast-Path Only</option>
            </select>
          </label>

          <label className="settings-field-group">
            <span className="settings-field-label">Speech Recognition &amp; TTS Provider</span>
            <select
              className="text-input settings-select"
              value={speechProvider}
              onChange={(e) => onUpdateSetting({ speech_provider: e.target.value })}
            >
              <option value="auto">Auto (Instant &lt;2s Voice + Gemini Live 24kHz Audio)</option>
              <option value="gemini">Gemini 3.8 Native Cloud TTS (Rich Indic WAV Audio)</option>
              <option value="gnani">Gnani Prisma v3.0 STT &amp; Timbre v3.0 TTS</option>
              <option value="browser">Browser Web Speech (Zero-cost on-device)</option>
            </select>
          </label>

          <div className="settings-checkboxes-group">
            <label className="settings-check-row">
              <input
                type="checkbox"
                className="settings-checkbox"
                checked={useDirectAudio}
                onChange={(e) => onToggleDirectAudio(e.target.checked)}
              />
              <span className="settings-check-text">
                Upload 16kHz noise-filtered WAV directly to Gemini / Gnani (best under shop noise)
              </span>
            </label>

            <label className="settings-check-row">
              <input
                type="checkbox"
                className="settings-checkbox"
                checked={useLiveStream && canLiveStream}
                disabled={!canLiveStream}
                onChange={(e) => onToggleLiveStream(e.target.checked)}
              />
              <span className="settings-check-text">
                Enable Real-Time Assistant Gemini 3.8 Live Voice Mode
                {!canLiveStream
                  ? " (requires Gemini API Key; using Push-to-Talk)"
                  : !liveWsSupported && liveEphemeralSupported
                  ? " (Direct Cloud Live via Ephemeral Token)"
                  : " (/ws/live)"}
              </span>
            </label>

            <label className="settings-check-row">
              <input
                type="checkbox"
                className="settings-checkbox"
                checked={interactiveConfirm}
                onChange={(e) => onToggleInteractiveConfirm(e.target.checked)}
              />
              <span className="settings-check-text">
                Interactive confirmation before saving (&ldquo;Sure, sir. Shall I add this entry?&rdquo;)
              </span>
            </label>
          </div>
        </div>
      </div>

      <div className="card settings-dpdp-card">
        <h3 style={{ marginTop: 0, display: "flex", alignItems: "center", gap: 6 }}>
          <Lock size={17} /> Responsible AI &amp; DPDP Act Controls
        </h3>
        <div style={{ fontSize: "0.84rem", color: "var(--muted)", marginBottom: 12, lineHeight: 1.5 }}>
          Database:{" "}
          <strong>
            {statusInfo?.database_backend === "mongodb"
              ? `MongoDB (${statusInfo?.database_name || "smartkhata"})`
              : `SQLite (${statusInfo?.database_name || "smartkhata.db"})`}
          </strong>{" "}
          · Storage Encryption: <strong>{statusInfo?.encryption_at_rest || "AES-256-GCM"}</strong> · Gemini API:{" "}
          <strong>{statusInfo?.gemini_configured ? "Connected" : "Offline/Fallback"}</strong> · Gnani API:{" "}
          <strong>{statusInfo?.gnani_configured ? "Connected" : "Adapter Ready"}</strong>
        </div>
        {statusInfo?.storage_fallback_reason && (
          <div
            style={{
              fontSize: "0.8rem",
              color: "#fde68a",
              background: "rgba(245, 158, 11, 0.16)",
              border: "1px solid rgba(245, 158, 11, 0.4)",
              borderRadius: 8,
              padding: "8px 10px",
              marginBottom: 12,
            }}
          >
            {statusInfo.storage_fallback_reason}
          </div>
        )}

        <label className="settings-check-row" style={{ marginBottom: 14 }}>
          <input
            type="checkbox"
            className="settings-checkbox"
            checked={ephemeral}
            onChange={(e) => onUpdateSetting({ ephemeral_transcripts: e.target.checked })}
          />
          <span className="settings-check-text">
            Ephemeral transcript mode (do not persist raw spoken transcripts in database)
          </span>
        </label>

        <div style={{ marginTop: 8 }}>
          <button className="btn btn-danger settings-wipe-btn" onClick={onWipeTranscripts}>
            <Trash2 size={15} /> Wipe Demo Transcripts Now (DPDP)
          </button>
        </div>
      </div>
    </div>
  );
}

