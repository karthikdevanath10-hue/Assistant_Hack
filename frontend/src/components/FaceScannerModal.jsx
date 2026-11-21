import React, { useEffect, useRef, useState } from "react";
import { AlertCircle, Camera, CheckCircle2, RefreshCw, ScanFace, ShieldCheck, X } from "lucide-react";
import { captureFaceBiometrics, isCameraSupported } from "../utils/faceBiometrics";

/**
 * FaceScannerModal provides biometric webcam capture and verification
 * for shopkeeper signup Face ID registration and login face verification.
 */
export function FaceScannerModal({
  isOpen,
  mode = "verify", // "register" | "verify"
  defaultIdentifier = "",
  onCapture,
  onVerify,
  onClose,
  loading = false,
  error = "",
}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [capturedPreview, setCapturedPreview] = useState(null); // { descriptor, photo }
  const [identifier, setIdentifier] = useState(defaultIdentifier);
  const [scanningStatus, setScanningStatus] = useState("ready"); // "ready" | "capturing" | "verifying" | "success"
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    setIdentifier(defaultIdentifier);
  }, [defaultIdentifier]);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCapturedPreview(null);
      setScanningStatus("ready");
      setLocalError("");
      setCameraError("");
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  async function startCamera() {
    setCameraError("");
    setLocalError("");
    if (!isCameraSupported()) {
      setCameraError("Your browser or device does not support webcam access. You can continue with password login.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setCameraActive(true);
    } catch (err) {
      console.warn("Camera access failed:", err);
      setCameraError(
        err.name === "NotAllowedError" || err.name === "PermissionDeniedError"
          ? "Camera permission was denied. Please allow camera permissions in your browser or sign in with your password."
          : `Unable to access webcam (${err.message || "Device unavailable"}).`
      );
      setCameraActive(false);
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }

  function handleCapture() {
    setLocalError("");
    if (!videoRef.current) return;
    try {
      setScanningStatus("capturing");
      const result = captureFaceBiometrics(videoRef.current);
      setCapturedPreview(result);
      setScanningStatus("ready");

      if (mode === "verify") {
        doVerify(result);
      }
    } catch (err) {
      setScanningStatus("ready");
      setLocalError(err.message || "Failed to capture face. Please ensure proper lighting and look into the camera.");
    }
  }

  function handleConfirmRegister() {
    if (!capturedPreview) return;
    onCapture?.(capturedPreview);
    onClose?.();
  }

  function handleRetake() {
    setCapturedPreview(null);
    setLocalError("");
    setScanningStatus("ready");
  }

  async function doVerify(candidateFace = capturedPreview) {
    if (!candidateFace) {
      handleCapture();
      return;
    }
    const cleanId = (identifier || defaultIdentifier || "").trim();
    if (!cleanId) {
      setLocalError("Please enter your registered mobile number or email for Face ID verification.");
      return;
    }
    setScanningStatus("verifying");
    setLocalError("");
    try {
      await onVerify?.({
        identifier: cleanId,
        faceData: JSON.stringify({
          descriptor: candidateFace.descriptor,
          photo: candidateFace.photo,
          timestamp: candidateFace.timestamp,
        }),
      });
      setScanningStatus("success");
    } catch (err) {
      setScanningStatus("ready");
      setLocalError(err.message || "Face ID verification failed. Face did not match or identifier was not found.");
    }
  }

  if (!isOpen) return null;

  const displayError = localError || error || cameraError;

  return (
    <div className="face-scanner-overlay" role="dialog" aria-modal="true" aria-labelledby="face-scanner-title">
      <div className="face-scanner-dialog">
        <div className="face-scanner-header">
          <div className="face-scanner-title-wrap">
            <ScanFace className="face-scanner-icon" size={24} />
            <div>
              <h3 id="face-scanner-title">
                {mode === "register" ? "Face ID Registration (Mandatory)" : "Face ID Verification (Mandatory)"}
              </h3>
              <p>
                {mode === "register"
                  ? "Face ID registration is mandatory. Your biometric face template will be required every time you sign in."
                  : "Face ID verification is mandatory to unlock and sign in to your Voice Khata ledger."}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="face-scanner-close-btn"
            onClick={onClose}
            aria-label="Close biometric scanner"
          >
            <X size={20} />
          </button>
        </div>

        {displayError && (
          <div className="face-scanner-error-banner" role="alert">
            <AlertCircle size={16} />
            <span>{displayError}</span>
          </div>
        )}

        {/* Video feed & Oval frame */}
        <div className="face-scanner-body">
          {!capturedPreview ? (
            <div className="face-scanner-viewport">
              <video
                ref={videoRef}
                className="face-scanner-video"
                playsInline
                muted
                autoPlay
              />

              {/* Oval biometric alignment overlay */}
              <div className="face-oval-frame" aria-hidden="true">
                <div className="face-oval-line" />
                <div className="face-scanner-laser" />
              </div>

              {cameraActive && (
                <div className="face-scanner-status-chip">
                  <span className="face-pulse-dot" />
                  <span>Align face within oval frame</span>
                </div>
              )}
            </div>
          ) : (
            <div className="face-scanner-preview-pane">
              <img
                src={capturedPreview.photo}
                alt="Enrolled face preview"
                className="face-scanner-preview-img"
              />
              <div className="face-preview-details">
                <div className="face-preview-success-badge">
                  <CheckCircle2 size={16} /> Biometric Template Extracted
                </div>
                <small>128-element normalized facial descriptor computed.</small>
              </div>
            </div>
          )}

          {/* Identifier input for verify mode if needed */}
          {mode === "verify" && (
            <label className="auth-field" style={{ marginTop: 12, width: "100%" }}>
              <span>Mobile Number or Email *</span>
              <input
                id="face-login-identifier"
                className="text-input"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter 10-digit mobile or email"
                autoComplete="username"
                disabled={loading || scanningStatus === "verifying"}
              />
            </label>
          )}
        </div>

        {/* Action buttons */}
        <div className="face-scanner-actions">
          {mode === "register" ? (
            !capturedPreview ? (
              <>
                <button
                  type="button"
                  className="btn btn-primary face-action-btn"
                  onClick={handleCapture}
                  disabled={!cameraActive || loading}
                >
                  <Camera size={16} /> Capture Face ID
                </button>
                <button type="button" className="btn btn-outline" onClick={onClose}>
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="btn btn-primary face-action-btn"
                  onClick={handleConfirmRegister}
                >
                  <ShieldCheck size={16} /> Use This Face ID
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleRetake}
                  disabled={loading}
                >
                  <RefreshCw size={15} /> Retake
                </button>
              </>
            )
          ) : (
            <>
              <button
                type="button"
                className="btn btn-primary face-action-btn"
                onClick={() => handleCapture()}
                disabled={!cameraActive || loading || scanningStatus === "verifying"}
              >
                {scanningStatus === "verifying" || loading ? (
                  <>
                    <RefreshCw className="spin-icon" size={16} /> Verifying Face...
                  </>
                ) : (
                  <>
                    <ScanFace size={16} /> Verify &amp; Sign In with Face ID
                  </>
                )}
              </button>
              <button type="button" className="btn btn-outline" onClick={onClose}>
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
