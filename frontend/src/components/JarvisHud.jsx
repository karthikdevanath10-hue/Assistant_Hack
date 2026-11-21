import React from "react";
import { Check, Mic, MicOff, Radio, ShieldCheck, Sparkles, Volume2, X } from "lucide-react";
import { playReplyAudio } from "../audio/recorder";
import { previewSpokenAmount } from "../utils/numberNormalizer";
import { t } from "../utils/i18n";

const FREQ_LEFT_BARS = [5, 8, 12, 18, 26, 19, 32, 22, 38, 28, 44, 34];
const FREQ_RIGHT_BARS = [34, 44, 28, 38, 22, 32, 19, 26, 18, 12, 8, 5];

export function JarvisHud({
  liveConnected,
  liveConnecting,
  aiSpeaking,
  isRecording,
  isProcessing,
  useLiveStream,
  interactiveConfirm,
  geminiConfigured,
  liveWsSupported = true,
  canLiveStream = liveWsSupported,
  micLevel,
  micInfo,
  liveUserText,
  liveAiText,
  conversationFeed,
  lastTurn,
  liveMetrics,
  language,
  onToggleMic,
  onToggleLiveStream,
  onToggleInteractiveConfirm,
  onQuickReply,
  onReplayAudio,
}) {
  const isListening = liveConnected || isRecording;
  const awaitingCustName =
    lastTurn?.status === "needs_confirmation" && lastTurn?.pending_action?.kind === "create_customer";
  const awaitingConfirm =
    lastTurn?.status === "needs_confirmation" && !awaitingCustName && Boolean(lastTurn?.pending_action);
  const awaitingDisambig = lastTurn?.status === "needs_disambiguation";

  let statusLabel = t("hudReady", language);
  let modeClass = "idle";
  if (liveConnecting || isProcessing) {
    statusLabel = t("hudProcessing", language);
    modeClass = "thinking";
  } else if (aiSpeaking) {
    statusLabel = t("hudSpeaking", language);
    modeClass = "speaking";
  } else if (awaitingCustName) {
    statusLabel = t("hudAwaitingName", language);
    modeClass = "confirm";
  } else if (awaitingConfirm) {
    statusLabel = t("hudConfirm", language);
    modeClass = "confirm";
  } else if (isListening) {
    statusLabel = liveConnected ? t("hudListeningLive", language) : t("hudListening", language);
    modeClass = "listening";
  }

  const orbScale = isListening ? 1 + Math.min(0.28, micLevel * 0.35) : aiSpeaking ? 1.12 : 1;
  const detectedNum = previewSpokenAmount(liveUserText);
  const voiceScale = isListening ? Math.max(1, 1 + (micLevel || 0) * 3) : 1;

  return (
    <section className={`jarvis-hud ${modeClass}`} aria-label="Assistant Live Voice HUD">
      {/* Top Notch Capsule Badge */}
      <div className="jarvis-header-notch">
        <div className="jarvis-header-pill">
          <span className={`jarvis-notch-dot ${modeClass}`} />
          <span className="jarvis-notch-brand">Voice Khata AI</span>
        </div>
      </div>

      <div className="jarvis-top">
        {/* Animated Frequency Visualizer & Mic Stage */}
        <div className={`jarvis-visualizer-wrap ${isListening ? "active" : "idle"}`}>
          <div className="jarvis-freq-stage">
            {/* Left frequency wave bars & baseline */}
            <div className="jarvis-freq-wave left" aria-hidden="true">
              <span className="jarvis-freq-baseline" />
              <div
                className="jarvis-freq-bars"
                style={{ "--voice-scale": voiceScale }}
              >
                {FREQ_LEFT_BARS.map((h, i) => (
                  <span
                    key={`l-${i}`}
                    className="jarvis-freq-bar"
                    style={{
                      "--base-h": `${h}px`,
                      "--delay": `${(i * 0.07).toFixed(2)}s`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Center Orb with Acoustic Wave Rings */}
            <div className="jarvis-orb-container">
              {isListening && (
                <>
                  <span className="jarvis-freq-ripple r1" />
                  <span className="jarvis-freq-ripple r2" />
                  <svg className="jarvis-freq-wave-ring" viewBox="0 0 100 100" aria-hidden="true">
                    <path
                      d="M 50,7 C 58,13 68,11 74,19 C 82,25 88,33 91,43 C 94,51 90,61 87,69 C 81,79 73,83 65,89 C 57,95 47,95 39,89 C 31,85 23,79 17,69 C 11,61 9,51 12,41 C 15,31 21,23 29,17 C 37,11 43,7 50,7 Z"
                      className="jarvis-freq-wave-path"
                    />
                  </svg>
                </>
              )}
              <button
                type="button"
                className={`jarvis-orb ${modeClass}`}
                style={{ transform: `scale(${orbScale})` }}
                onClick={onToggleMic}
                disabled={isProcessing}
                title={isListening ? "सुनना बंद करें / Tap to stop" : "बोलकर एंट्री करें / Tap to speak"}
              >
                <span className="jarvis-ring jarvis-ring-outer" />
                <span className="jarvis-ring jarvis-ring-inner" />
                {isListening ? (
                  useLiveStream ? <Radio size={24} /> : <MicOff size={24} />
                ) : (
                  <Mic size={24} />
                )}
              </button>
            </div>

            {/* Right frequency wave bars & baseline */}
            <div className="jarvis-freq-wave right" aria-hidden="true">
              <span className="jarvis-freq-baseline" />
              <div
                className="jarvis-freq-bars"
                style={{ "--voice-scale": voiceScale }}
              >
                {FREQ_RIGHT_BARS.map((h, i) => (
                  <span
                    key={`r-${i}`}
                    className="jarvis-freq-bar"
                    style={{
                      "--base-h": `${h}px`,
                      "--delay": `${((11 - i) * 0.07).toFixed(2)}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Words moved down with mini equalizer animation */}
          <div className="jarvis-status-caption">
            <div className="jarvis-badge-row">
              {isListening && (
                <span className="jarvis-mini-equalizer" aria-hidden="true">
                  <span className="mini-bar mb1" />
                  <span className="mini-bar mb2" />
                  <span className="mini-bar mb3" />
                </span>
              )}
              <span className={`jarvis-status-dot ${modeClass}`} />
              <span className="jarvis-status-text">{statusLabel}</span>
              {liveMetrics?.ttfb_ms > 0 && (
                <span className="jarvis-latency-pill">⚡ {liveMetrics.ttfb_ms}ms</span>
              )}
              {isListening && (
                <span className="jarvis-mini-equalizer" aria-hidden="true">
                  <span className="mini-bar mb3" />
                  <span className="mini-bar mb2" />
                  <span className="mini-bar mb1" />
                </span>
              )}
            </div>
            <div className="jarvis-subtitle">
              {useLiveStream && canLiveStream
                ? t("hudSubtitleLive", language)
                : t("hudSubtitlePtt", language)}
            </div>
          </div>
        </div>

        <div className="jarvis-controls">
          <button
            type="button"
            className={`jarvis-pill-btn ${useLiveStream ? "active" : ""}`}
            onClick={() => onToggleLiveStream(!useLiveStream)}
            disabled={!geminiConfigured || !canLiveStream}
            title={
              !canLiveStream
                ? "Requires Gemini API Key for Real-Time Live Voice Mode"
                : "Switch between Gemini 3.8 Live Stream and Hands-Free Push-to-Talk"
            }
          >
            <Radio size={13} /> {useLiveStream ? t("liveAiOn", language) : t("liveAiOff", language)}
          </button>
          <button
            type="button"
            className={`jarvis-pill-btn ${interactiveConfirm ? "active" : ""}`}
            onClick={() => onToggleInteractiveConfirm(!interactiveConfirm)}
            title="Ask 'Sure, sir. Shall I confirm?' before saving credits or payments"
          >
            <ShieldCheck size={13} /> {interactiveConfirm ? t("confirmRuleOn", language) : t("confirmRuleOff", language)}
          </button>
        </div>
      </div>

      {/* Real-time scrolling caption & assistant dialogue */}
      <div className="jarvis-transcript-grid">
        <div className="jarvis-caption-box">
          <div className="jarvis-caption-label">
            <span>{t("yourVoiceLabel", language)}</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              {isListening && (
                <span className="jarvis-meter-track" title={`Mic level: ${Math.round(micLevel * 100)}%`}>
                  <span
                    className="jarvis-meter-fill"
                    style={{ width: `${Math.max(6, Math.round(micLevel * 100))}%` }}
                  />
                </span>
              )}
              {detectedNum !== null && <span className="jarvis-num-chip">₹{detectedNum}</span>}
            </span>
          </div>
          <div className="jarvis-caption-text">
            {liveUserText ? (
              liveUserText
            ) : isListening && aiSpeaking ? (
              <span style={{ color: "#6ee7b7" }}>
                {t("hudSpeaking", language)}
              </span>
            ) : isListening && micInfo?.signalOk === false ? (
              <span className="jarvis-mic-warn">
                माइक से आवाज़ नहीं आ रही — डिवाइस चेक करें।
              </span>
            ) : isListening && micInfo?.speechActive ? (
              <span style={{ color: "#38bdf8" }}>
                {t("hudListeningLive", language)}
              </span>
            ) : (
              <span style={{ opacity: 0.75 }}>
                {isListening
                  ? t("listenHint", language)
                  : t("idleHint", language)}
              </span>
            )}
          </div>
        </div>

        <div className="jarvis-caption-box jarvis-ai-box">
          <div className="jarvis-caption-label">
            <span>
              <Sparkles size={12} style={{ verticalAlign: "-1px" }} /> {t("aiAssistantLabel", language)}
            </span>
            {lastTurn?.spoken_reply && (
              <button
                type="button"
                className="jarvis-replay-btn"
                onClick={() =>
                  onReplayAudio
                    ? onReplayAudio(lastTurn)
                    : playReplyAudio({
                        audioBase64: lastTurn.audio_base64,
                        audioMimeType: lastTurn.audio_mime_type,
                        text: lastTurn.spoken_reply,
                        language,
                      })
                }
                title="फिर से सुनें / Replay"
              >
                <Volume2 size={13} /> {t("listenBtn", language)}
              </button>
            )}
          </div>
          <div className="jarvis-caption-text">
            {liveAiText || lastTurn?.spoken_reply || (
              <span style={{ opacity: 0.7 }}>
                {t("aiIdleHint", language)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 1-tap Interactive Confirmation / Customer Name / Disambiguation bar */}
      {awaitingCustName && (
        <div className="jarvis-action-bar">
          <span className="jarvis-action-prompt">{t("newCustomerPrompt", language)}</span>
          <button
            type="button"
            className="jarvis-confirm-no"
            disabled={isProcessing}
            onClick={() => onQuickReply("No, cancel")}
          >
            <X size={14} /> {t("cancel", language)}
          </button>
        </div>
      )}

      {awaitingConfirm && (
        <div className="jarvis-action-bar">
          <span className="jarvis-action-prompt">{t("confirmPrompt", language)}</span>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              className="jarvis-confirm-yes"
              disabled={isProcessing}
              onClick={() => onQuickReply("Yes, confirm")}
            >
              <Check size={14} /> {t("yesSave", language)}
            </button>
            <button
              type="button"
              className="jarvis-confirm-no"
              disabled={isProcessing}
              onClick={() => onQuickReply("No, cancel")}
            >
              <X size={14} /> {t("cancel", language)}
            </button>
          </div>
        </div>
      )}

      {awaitingDisambig && lastTurn?.candidate_customers?.length > 0 && (
        <div className="jarvis-action-bar">
          <span className="jarvis-action-prompt">{t("whichCustomer", language)}</span>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {lastTurn.candidate_customers.map((name) => (
              <button
                key={name}
                type="button"
                className="jarvis-confirm-yes"
                disabled={isProcessing}
                onClick={() => onQuickReply(name)}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

