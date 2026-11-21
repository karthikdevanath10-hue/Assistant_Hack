import React from "react";
import { Check, Mic, MicOff, Radio, ShieldCheck, Sparkles, Volume2, X } from "lucide-react";
import { playReplyAudio } from "../audio/recorder";
import { previewSpokenAmount } from "../utils/numberNormalizer";

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

  let statusLabel = "तैयार · बोलकर एंट्री करें (Tap to Speak)";
  let modeClass = "idle";
  if (liveConnecting || isProcessing) {
    statusLabel = "हिसाब जोड़ रहा हूँ... · Processing";
    modeClass = "thinking";
  } else if (aiSpeaking) {
    statusLabel = "सहायक बोल रहा है · Assistant Speaking";
    modeClass = "speaking";
  } else if (awaitingCustName) {
    statusLabel = "ग्राहक का नाम बोलें · Awaiting Name";
    modeClass = "confirm";
  } else if (awaitingConfirm) {
    statusLabel = "पुष्टि करें: 'हाँ' या 'ना' बोलें · Confirm";
    modeClass = "confirm";
  } else if (isListening) {
    statusLabel = liveConnected ? "लाइव सुन रहा हूँ... · Listening Live" : "बोलिए, सुन रहा हूँ... · Listening";
    modeClass = "listening";
  }

  const orbScale = isListening ? 1 + Math.min(0.28, micLevel * 0.35) : aiSpeaking ? 1.12 : 1;
  const detectedNum = previewSpokenAmount(liveUserText);

  return (
    <section className={`jarvis-hud ${modeClass}`} aria-label="Assistant Live Voice HUD">
      <div className="jarvis-top">
        <div className="jarvis-orb-wrap">
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
          <div>
            <div className="jarvis-badge-row">
              <span className={`jarvis-status-dot ${modeClass}`} />
              <span className="jarvis-status-text">{statusLabel}</span>
              {liveMetrics?.ttfb_ms > 0 && (
                <span className="jarvis-latency-pill">⚡ {liveMetrics.ttfb_ms}ms</span>
              )}
            </div>
            <div className="jarvis-subtitle">
              {useLiveStream && canLiveStream
                ? "रीयल-टाइम आवाज़ बातचीत (Gemini 3.8 Live)"
                : "आराम से बोलें, रुकने पर अपने आप दर्ज होगा (Hands-Free Voice)"}
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
            <Radio size={13} /> {useLiveStream ? "Live AI: चालू" : "Push-to-Talk"}
          </button>
          <button
            type="button"
            className={`jarvis-pill-btn ${interactiveConfirm ? "active" : ""}`}
            onClick={() => onToggleInteractiveConfirm(!interactiveConfirm)}
            title="Ask 'Sure, sir. Shall I confirm?' before saving credits or payments"
          >
            <ShieldCheck size={13} /> पुष्टि नियम: {interactiveConfirm ? "चालू (ON)" : "बंद (OFF)"}
          </button>
        </div>
      </div>

      {/* Real-time scrolling caption & assistant dialogue */}
      <div className="jarvis-transcript-grid">
        <div className="jarvis-caption-box">
          <div className="jarvis-caption-label">
            <span>आपकी आवाज़ · YOU</span>
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
                सहायक बोल रहा है — रुकने पर बोलें...
              </span>
            ) : isListening && micInfo?.signalOk === false ? (
              <span className="jarvis-mic-warn">
                माइक से आवाज़ नहीं आ रही — डिवाइस चेक करें।
              </span>
            ) : isListening && micInfo?.speechActive ? (
              <span style={{ color: "#38bdf8" }}>
                आपकी आवाज़ साफ सुनाई दे रही है...
              </span>
            ) : (
              <span style={{ opacity: 0.75 }}>
                {isListening
                  ? `सुन रहा हूँ — बोलें जैसे "सुरेश का 340 उधार" या "रमेश ने 200 दिया"...`
                  : "माइक बटन दबाएं और बोलें — यहाँ आपकी बात तुरंत दिखेगी।"}
              </span>
            )}
          </div>
        </div>

        <div className="jarvis-caption-box jarvis-ai-box">
          <div className="jarvis-caption-label">
            <span>
              <Sparkles size={12} style={{ verticalAlign: "-1px" }} /> किराना सहायक · AI
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
                <Volume2 size={13} /> सुनें
              </button>
            )}
          </div>
          <div className="jarvis-caption-text">
            {liveAiText || lastTurn?.spoken_reply || (
              <span style={{ opacity: 0.7 }}>
                माइक दबाकर बोलें — सहायक हिसाब जोड़कर तुरंत जवाब देगा।
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 1-tap Interactive Confirmation / Customer Name / Disambiguation bar */}
      {awaitingCustName && (
        <div className="jarvis-action-bar">
          <span className="jarvis-action-prompt">नया ग्राहक: नाम बोलें या नीचे लिखें:</span>
          <button
            type="button"
            className="jarvis-confirm-no"
            disabled={isProcessing}
            onClick={() => onQuickReply("No, cancel")}
          >
            <X size={14} /> रद्द करें (Cancel)
          </button>
        </div>
      )}

      {awaitingConfirm && (
        <div className="jarvis-action-bar">
          <span className="jarvis-action-prompt">पुष्टि: &ldquo;हाँ, सेव करो&rdquo; बोलें या बटन दबाएं:</span>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              className="jarvis-confirm-yes"
              disabled={isProcessing}
              onClick={() => onQuickReply("Yes, confirm")}
            >
              <Check size={14} /> हाँ, सेव करें (Save)
            </button>
            <button
              type="button"
              className="jarvis-confirm-no"
              disabled={isProcessing}
              onClick={() => onQuickReply("No, cancel")}
            >
              <X size={14} /> रद्द करें (Cancel)
            </button>
          </div>
        </div>
      )}

      {awaitingDisambig && lastTurn?.candidate_customers?.length > 0 && (
        <div className="jarvis-action-bar">
          <span className="jarvis-action-prompt">कौन से ग्राहक का हिसाब?</span>
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

