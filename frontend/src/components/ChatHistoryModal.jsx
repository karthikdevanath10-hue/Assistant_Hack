import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  Clock,
  History,
  MessageSquareText,
  Mic,
  Play,
  RotateCw,
  Search,
  Sparkles,
  Trash2,
  User,
  Volume2,
  X,
} from "lucide-react";
import { api } from "../api/client";
import { formatINR } from "../utils/numberNormalizer";
import { playReplyAudio } from "../audio/recorder";
import { t } from "../utils/i18n";

export function ChatHistoryModal({
  isOpen,
  onClose,
  conversationFeed = [],
  onRunPhrase,
  onSelectCustomerById,
  language = "en-IN",
}) {
  const [dbHistory, setDbHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all"); // 'all' | 'voice' | 'text' | 'tx'
  const [confirmWipe, setConfirmWipe] = useState(false);
  const [wiping, setWiping] = useState(false);
  const [wipeNotice, setWipeNotice] = useState("");

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Load history from DB on open
  useEffect(() => {
    if (!isOpen) return;
    loadHistory();
  }, [isOpen]);

  async function loadHistory() {
    setLoading(true);
    try {
      const items = await api.voiceHistory();
      setDbHistory(Array.isArray(items) ? items : []);
    } catch (err) {
      console.warn("Unable to load persistent voice history:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleWipeHistory() {
    setWiping(true);
    try {
      await api.wipeTranscripts();
      setDbHistory([]);
      setConfirmWipe(false);
      setWipeNotice("Chat and voice history scrubbed (DPDP Act compliant).");
      setTimeout(() => setWipeNotice(""), 4000);
    } catch (err) {
      setWipeNotice("Failed to clear history. Please try again.");
    } finally {
      setWiping(false);
    }
  }

  // Merge db history and session feed
  const mergedHistory = useMemo(() => {
    const list = [];
    const seenUtterances = new Set();

    // Add persistent DB records first
    (dbHistory || []).forEach((row) => {
      if (!row) return;
      const utterance = row.utterance || "";
      const reply = row.ai_reply || "";
      if (utterance || reply) {
        list.push({
          id: `db-${row.id}`,
          channel: row.channel || "voice",
          utterance,
          reply,
          parsed: row.parsed || null,
          modelUsed: row.model_used || "SmartKhata AI",
          latencyMs: row.latency_ms || 0,
          createdAt: row.created_at || "",
        });
        if (utterance) seenUtterances.add(utterance.trim().toLowerCase());
      }
    });

    // Pair up session conversationFeed (user -> ai) for any entries not yet written to DB
    for (let i = 0; i < conversationFeed.length; i++) {
      const item = conversationFeed[i];
      if (item.role === "user") {
        const uText = (item.text || "").trim();
        const nextItem = conversationFeed[i + 1];
        const aText = nextItem && nextItem.role === "ai" ? (nextItem.text || "").trim() : "";
        if (uText && !seenUtterances.has(uText.toLowerCase())) {
          list.unshift({
            id: `feed-${item.id}`,
            channel: "live",
            utterance: uText,
            reply: aText || "Processing your ledger request...",
            parsed: null,
            modelUsed: "Real-Time AI Stream",
            latencyMs: 0,
            createdAt: "Just now",
          });
        }
      }
    }

    return list;
  }, [dbHistory, conversationFeed]);

  // Filter based on search query and filterType
  const filteredHistory = useMemo(() => {
    let result = mergedHistory;

    if (filterType === "voice") {
      result = result.filter((item) => item.channel === "voice" || item.channel === "mic" || item.channel === "live");
    } else if (filterType === "text") {
      result = result.filter((item) => item.channel === "text");
    } else if (filterType === "tx") {
      result = result.filter((item) => {
        const txs = item.parsed?.transactions || [];
        return txs.length > 0 || (item.utterance && /\b(credit|paid|jama|udhaar|rupees|₹|\d+)\b/i.test(item.utterance));
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (item) =>
          item.utterance.toLowerCase().includes(q) ||
          item.reply.toLowerCase().includes(q) ||
          item.modelUsed.toLowerCase().includes(q)
      );
    }

    return result;
  }, [mergedHistory, filterType, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop chat-history-backdrop" onClick={onClose}>
      <div
        className="modal-card chat-history-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-history-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="chat-history-header">
          <div className="chat-history-title-wrap">
            <div className="chat-history-icon-badge">
              <History size={20} />
            </div>
            <div>
              <h2 id="chat-history-title" style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800 }}>
                AI Chat &amp; Voice History
              </h2>
              <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "var(--muted)" }}>
                Complete transcript log of your spoken &amp; typed ledger commands
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn-icon"
            onClick={onClose}
            aria-label="Close chat history"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Notices */}
        {wipeNotice && (
          <div className="chat-history-notice" role="alert">
            <CheckCircle2 size={16} />
            <span>{wipeNotice}</span>
          </div>
        )}

        {/* Search & Filter Toolbar */}
        <div className="chat-history-toolbar">
          <div className="chat-history-search-box">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              className="chat-history-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chat history (e.g. Ramesh, credit, balance)..."
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div className="chat-history-filter-row">
            <div className="filter-chips">
              <button
                type="button"
                className={`filter-chip ${filterType === "all" ? "active" : ""}`}
                onClick={() => setFilterType("all")}
              >
                All ({mergedHistory.length})
              </button>
              <button
                type="button"
                className={`filter-chip ${filterType === "voice" ? "active" : ""}`}
                onClick={() => setFilterType("voice")}
              >
                🎙️ Voice
              </button>
              <button
                type="button"
                className={`filter-chip ${filterType === "text" ? "active" : ""}`}
                onClick={() => setFilterType("text")}
              >
                ⌨️ Text
              </button>
              <button
                type="button"
                className={`filter-chip ${filterType === "tx" ? "active" : ""}`}
                onClick={() => setFilterType("tx")}
              >
                💰 Ledger Actions
              </button>
            </div>

            <div className="action-btns">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={loadHistory}
                disabled={loading}
                title="Refresh history"
              >
                <RotateCw size={13} className={loading ? "spin-icon" : ""} />
                <span>Refresh</span>
              </button>
              {!confirmWipe ? (
                <button
                  type="button"
                  className="btn btn-outline btn-sm text-danger"
                  onClick={() => setConfirmWipe(true)}
                  disabled={mergedHistory.length === 0}
                  title="Wipe transcripts (DPDP Act compliance)"
                >
                  <Trash2 size={13} />
                  <span>Clear</span>
                </button>
              ) : (
                <div className="wipe-confirm-box">
                  <span style={{ fontSize: "0.78rem", color: "#fda4af" }}>Delete all?</span>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={handleWipeHistory}
                    disabled={wiping}
                  >
                    {wiping ? "..." : "Yes, Wipe"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setConfirmWipe(false)}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Stream */}
        <div className="chat-history-feed">
          {loading && mergedHistory.length === 0 ? (
            <div className="chat-history-empty">
              <RotateCw className="spin-icon" size={28} />
              <p>Loading your AI conversation history...</p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="chat-history-empty">
              <MessageSquareText size={36} style={{ opacity: 0.4, marginBottom: 8 }} />
              <h4>{searchQuery ? "No matching conversations found" : "No Chat History Yet"}</h4>
              <p>
                {searchQuery
                  ? "Try searching for a different customer name or transaction amount."
                  : "Start chatting with SmartKhata AI by tapping the mic button or typing commands in the assistant dock."}
              </p>
              {!searchQuery && (
                <div className="sample-prompts-wrap">
                  <span className="sample-prompts-title">Try one of these quick commands:</span>
                  <div className="sample-prompts-grid">
                    {["Ramesh credit 300", "How much credit given today?", "Who owes the highest balance?", "Suresh paid 200"].map((p) => (
                      <button
                        key={p}
                        type="button"
                        className="sample-prompt-chip"
                        onClick={() => {
                          onRunPhrase?.(p);
                          onClose?.();
                        }}
                      >
                        <Sparkles size={12} /> {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            filteredHistory.map((item) => {
              const txs = item.parsed?.transactions || [];
              const channelBadge =
                item.channel === "voice" || item.channel === "mic"
                  ? { icon: "🎙️", label: "Voice" }
                  : item.channel === "live"
                  ? { icon: "⚡", label: "Live Stream" }
                  : { icon: "⌨️", label: "Text" };

              return (
                <div key={item.id} className="chat-history-turn-card">
                  {/* Turn Top Meta */}
                  <div className="turn-meta-bar">
                    <span className="turn-channel-pill">
                      <span>{channelBadge.icon}</span>
                      <span>{channelBadge.label}</span>
                    </span>
                    {item.createdAt && (
                      <span className="turn-time-pill">
                        <Clock size={11} />
                        <span>{item.createdAt}</span>
                      </span>
                    )}
                    {item.latencyMs > 0 && (
                      <span className="turn-latency-pill">
                        ⚡ {item.latencyMs}ms
                      </span>
                    )}
                  </div>

                  {/* User Bubble */}
                  <div className="turn-bubble user-bubble">
                    <div className="bubble-avatar user-avatar">
                      <User size={13} />
                    </div>
                    <div className="bubble-content">
                      <div className="bubble-author">You</div>
                      <div className="bubble-text">&ldquo;{item.utterance}&rdquo;</div>
                    </div>
                    {onRunPhrase && (
                      <button
                        type="button"
                        className="rerun-btn"
                        onClick={() => {
                          onRunPhrase(item.utterance);
                          onClose?.();
                        }}
                        title={`Run "${item.utterance}" again`}
                      >
                        <Play size={12} />
                        <span>Ask Again</span>
                      </button>
                    )}
                  </div>

                  {/* AI Bubble */}
                  <div className="turn-bubble ai-bubble">
                    <div className="bubble-avatar ai-avatar">
                      <Bot size={13} />
                    </div>
                    <div className="bubble-content">
                      <div className="bubble-author-row">
                        <span className="bubble-author">SmartKhata AI</span>
                        {item.modelUsed && (
                          <span className="model-chip">
                            <Sparkles size={10} /> {item.modelUsed}
                          </span>
                        )}
                      </div>
                      <div className="bubble-text">{item.reply}</div>

                      {/* Display extracted transaction receipts if available */}
                      {txs.length > 0 && (
                        <div className="turn-tx-list">
                          {txs.map((tx, idx) => (
                            <button
                              key={idx}
                              type="button"
                              className={`turn-tx-chip ${tx.tx_type || "credit"}`}
                              onClick={() => {
                                if (tx.customer_id && onSelectCustomerById) {
                                  onSelectCustomerById(tx.customer_id);
                                  onClose?.();
                                }
                              }}
                              title={tx.customer_id ? `Open ${tx.customer_name}'s ledger` : undefined}
                            >
                              {tx.tx_type === "payment" ? (
                                <ArrowDownLeft size={13} color="var(--payment)" />
                              ) : (
                                <ArrowUpRight size={13} color="var(--credit)" />
                              )}
                              <span style={{ fontWeight: 700 }}>{tx.customer_name || "Customer"}</span>
                              <span className="tx-chip-amt">
                                {tx.tx_type === "payment" ? "-" : "+"}
                                {formatINR(tx.amount)}
                              </span>
                              {tx.customer_id && <span style={{ opacity: 0.6, fontSize: "0.72rem" }}>→</span>}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      className="replay-speech-btn"
                      onClick={() =>
                        playReplyAudio({
                          text: item.reply,
                          language,
                        })
                      }
                      title="Listen to AI voice reply"
                    >
                      <Volume2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="chat-history-footer">
          <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
            Showing {filteredHistory.length} of {mergedHistory.length} conversation turns
          </span>
          <button type="button" className="btn btn-primary btn-sm" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
