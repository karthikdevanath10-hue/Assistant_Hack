import React, { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, CheckCircle2, ChevronDown, Clock, MessageCircle, Plus, Sparkles, Volume2 } from "lucide-react";
import { api } from "../api/client";
import { formatINR } from "../utils/numberNormalizer";
import { playReplyAudio } from "../audio/recorder";
import { shareViaWhatsApp } from "../utils/whatsappReceipt";
import { getDemoPhrases, t } from "../utils/i18n";

function BreakdownChips({ items = [], tone = "credit", emptyText = "", onSelectCustomerById }) {
  if (!items || items.length === 0) {
    return emptyText ? <div className="stat-breakdown-empty">{emptyText}</div> : null;
  }
  return (
    <div className="stat-breakdown" style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
      {items.map((item) => (
        <button
          key={item.customer_id || item.customer_name}
          type="button"
          className={`mini-cust-pill ${tone}`}
          onClick={() => item.customer_id && onSelectCustomerById?.(item.customer_id)}
          title={`Open ${item.customer_name}'s khata`}
        >
          <span className="pill-name">{item.customer_name}</span>
          <strong className="pill-amt">{formatINR(item.amount)}</strong>
        </button>
      ))}
    </div>
  );
}

function StatCardWithNotch({
  title,
  value,
  tone,
  items = [],
  emptyText = "",
  isOpen = false,
  onToggle,
  onSelectCustomerById,
  onOpenCustomersPage,
  language,
}) {
  const count = items.length;
  const isCustCard = tone === "cust";

  return (
    <div className={`card stat-card stat-card-${tone} ${isOpen ? "is-open" : ""}`}>
      {/* Top Notch Badge */}
      <div className="stat-card-top">
        <div className="stat-card-notch">
          <span className={`stat-notch-dot ${tone}`} />
          <span className="stat-notch-title">{title}</span>
        </div>
      </div>

      {/* Main Metric Value */}
      <div className={`stat-card-val ${tone}`}>
        {value}
      </div>

      {/* Interactive Drop Notch */}
      {!isCustCard ? (
        <div className={`stat-drop-notch ${isOpen ? "is-open" : ""}`}>
          {/* Transparent Backdrop to dismiss floating popover on tap-outside */}
          {isOpen && (
            <div
              className="dropnotch-backdrop"
              onClick={onToggle}
              aria-hidden="true"
            />
          )}

          <button
            type="button"
            className={`stat-drop-notch-btn ${isOpen ? "open" : ""}`}
            onClick={count > 0 ? onToggle : undefined}
            disabled={count === 0}
            title={count > 0 ? (isOpen ? "Click to fold / notch up" : "Click drop notch to view breakdown") : emptyText}
          >
            <span className="notch-btn-label">
              {count > 0 ? (
                <>
                  <span className="notch-count-pill">{count}</span>
                  <span>{t("customers", language)}</span>
                </>
              ) : (
                <span style={{ opacity: 0.65, fontWeight: 500 }}>{emptyText}</span>
              )}
            </span>
            {count > 0 && <ChevronDown size={14} className="notch-chevron" />}
          </button>

          {/* Floating Dropdown Content */}
          <div className={`stat-notch-drawer ${isOpen ? "open" : ""}`}>
            <div className="stat-notch-floating-header">
              <span className="header-title">{title}</span>
              <span className="header-badge">{count} {t("customers", language)}</span>
            </div>
            <div className="stat-breakdown">
              {items.map((item) => (
                <button
                  key={item.customer_id}
                  type="button"
                  className={`mini-cust-pill ${tone}`}
                  onClick={() => {
                    onToggle();
                    onSelectCustomerById?.(item.customer_id);
                  }}
                  title={`Open ${item.customer_name}'s khata`}
                >
                  <span className="pill-name">{item.customer_name}</span>
                  <strong className="pill-amt">{formatINR(item.amount)}</strong>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="stat-drop-notch">
          <button
            type="button"
            className="stat-drop-notch-btn cust-link"
            onClick={onOpenCustomersPage}
            title="View customer roster"
          >
            <span className="notch-btn-label">
              <span className="notch-count-pill">{value}</span>
              <span>{t("customers", language)}</span>
            </span>
            <span style={{ fontSize: "0.78rem" }}>→</span>
          </button>
        </div>
      )}
    </div>
  );
}

export function DashboardScreen({
  dashboard,
  lastTurn,
  customers,
  language,
  currentUser = null,
  liveHighlightTxIds = [],
  onRunPhrase,
  onManualTx,
  onSelectCustomerById,
  onOpenCustomersPage,
}) {
  const [openNotches, setOpenNotches] = useState({ credit: false, payment: false, due: false });
  const [showManual, setShowManual] = useState(false);
  const [custId, setCustId] = useState("");
  const [amount, setAmount] = useState("");
  const [txType, setTxType] = useState("credit");
  const [note, setNote] = useState("");

  const toggleNotch = (key) => {
    setOpenNotches((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  async function submitManual(e) {
    e.preventDefault();
    if (!custId || !amount) return;
    await onManualTx({
      customer_id: Number(custId),
      amount: Number(amount),
      tx_type: txType,
      note: note.trim() || null,
    });
    setAmount("");
    setNote("");
    setShowManual(false);
  }

  return (
    <div>
      {lastTurn && (
        <div className="reply-banner">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
            <div>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent)", textTransform: "uppercase" }}>
                Voice Khata AI · {String(lastTurn?.status || "AI Reply").replace(/_/g, " ")}
              </div>
              <div style={{ fontSize: "0.84rem", color: "var(--muted)", marginTop: 2 }}>
                You: &ldquo;{lastTurn.transcript}&rdquo;
              </div>
              <div style={{ fontSize: "1.02rem", fontWeight: 700, marginTop: 6 }}>
                {lastTurn.spoken_reply}
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, flexShrink: 0, alignItems: "center" }}>
              {lastTurn.transactions?.length > 0 && (() => {
                const tx = lastTurn.transactions[0];
                const cust = customers?.find((c) => c.id === tx.customer_id) || {
                  id: tx.customer_id,
                  name: lastTurn.customer_breakdown?.[0]?.customer_name || "Customer",
                  phone: "",
                  outstanding_balance: lastTurn.balance,
                };
                return (
                  <button
                    className="btn btn-whatsapp"
                    type="button"
                    onClick={() => shareViaWhatsApp({ customer: cust, tx, currentUser })}
                    title="Send WhatsApp receipt for this entry"
                  >
                    <MessageCircle size={15} /> WhatsApp
                  </button>
                );
              })()}
              <button
                className="btn btn-secondary"
                onClick={() =>
                  playReplyAudio({
                    audioBase64: lastTurn.audio_base64,
                    audioMimeType: lastTurn.audio_mime_type,
                    text: lastTurn.spoken_reply,
                    language,
                  })
                }
                title="Replay spoken answer"
              >
                <Volume2 size={16} />
              </button>
            </div>
          </div>

          {lastTurn.customer_breakdown?.length > 0 && (
            <BreakdownChips
              items={lastTurn.customer_breakdown}
              tone={lastTurn.transactions?.[0]?.tx_type === "payment" ? "payment" : "credit"}
              onSelectCustomerById={onSelectCustomerById}
            />
          )}

          {lastTurn.candidate_customers?.length > 0 && (
            <div className="demo-chips">
              {lastTurn.candidate_customers.map((name) => (
                <button key={name} className="chip-btn" onClick={() => onRunPhrase(name)}>
                  Select {name}
                </button>
              ))}
            </div>
          )}

          {lastTurn.latency && (
            <div className="latency-bar">
              <span>
                <Sparkles size={12} style={{ verticalAlign: "-1px" }} /> {lastTurn.model_used}
              </span>
              <span>FastPath: {lastTurn.latency.fast_path_ms}ms</span>
              <span>AI: {lastTurn.latency.ai_ms}ms</span>
              <span>DB: {lastTurn.latency.ledger_ms}ms</span>
              <span>TTS: {lastTurn.latency.tts_ms}ms</span>
              <span
                style={{
                  fontWeight: 700,
                  color: lastTurn.latency.total_ms < 2000 ? "#065f46" : "#b91c1c",
                }}
              >
                <Clock size={12} style={{ verticalAlign: "-1px" }} /> Total: {lastTurn.latency.total_ms}ms{" "}
                {lastTurn.latency.total_ms < 2000 ? "(<2s SLA)" : ""}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="stats-grid" id="dashboard-metrics-section">
        <StatCardWithNotch
          title={t("statCreditToday", language)}
          value={formatINR(dashboard?.today_credit)}
          tone="credit"
          items={dashboard?.today_credit_customers || []}
          emptyText={t("emptyCreditToday", language)}
          isOpen={openNotches.credit}
          onToggle={() => toggleNotch("credit")}
          onSelectCustomerById={onSelectCustomerById}
          language={language}
        />

        <StatCardWithNotch
          title={t("statPaymentsToday", language)}
          value={formatINR(dashboard?.today_payment)}
          tone="payment"
          items={dashboard?.today_payment_customers || []}
          emptyText={t("emptyPaymentsToday", language)}
          isOpen={openNotches.payment}
          onToggle={() => toggleNotch("payment")}
          onSelectCustomerById={onSelectCustomerById}
          language={language}
        />

        <StatCardWithNotch
          title={t("statTotalDue", language)}
          value={formatINR(dashboard?.total_outstanding)}
          tone="due"
          items={dashboard?.outstanding_customers || []}
          emptyText="All settled"
          isOpen={openNotches.due}
          onToggle={() => toggleNotch("due")}
          onSelectCustomerById={onSelectCustomerById}
          language={language}
        />

        <StatCardWithNotch
          title={t("statCustomers", language)}
          value={dashboard?.total_customers ?? 0}
          tone="cust"
          onOpenCustomersPage={onOpenCustomersPage}
          language={language}
        />
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontWeight: 700 }}>{t("quickVoiceTitle", language)}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
              {t("quickVoiceSub", language)}
            </div>
          </div>
          <button className="btn btn-secondary" onClick={() => setShowManual((v) => !v)}>
            <Plus size={15} /> {t("manualEntry", language)}
          </button>
        </div>

        <div className="demo-chips">
          {getDemoPhrases(language).map((phrase) => (
            <button key={phrase} className="chip-btn" onClick={() => onRunPhrase(phrase)}>
              {phrase}
            </button>
          ))}
        </div>

        {showManual && (
          <form onSubmit={submitManual} style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8 }}>
            <select className="text-input" value={custId} onChange={(e) => setCustId(e.target.value)} required>
              <option value="">{t("selectCustomer", language)}</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              className="text-input"
              type="number"
              min="1"
              step="0.01"
              placeholder={t("amountPlaceholder", language)}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <select className="text-input" value={txType} onChange={(e) => setTxType(e.target.value)}>
              <option value="credit">{t("creditOption", language)}</option>
              <option value="payment">{t("paymentOption", language)}</option>
            </select>
            <input
              className="text-input"
              placeholder={t("noteOptional", language)}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <button className="btn btn-primary" type="submit">
              <CheckCircle2 size={15} /> {t("saveBtn", language)}
            </button>
          </form>
        )}
      </div>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontWeight: 700 }}>{t("recentActivity", language)}</span>
          <button className="btn btn-secondary" type="button" onClick={() => api.exportCsv()}>
            Export CSV
          </button>
        </div>
        <div className="tx-list">
          {(dashboard?.recent_transactions || []).length === 0 && (
            <div style={{ color: "var(--muted)", fontSize: "0.86rem", padding: "6px 0" }}>
              {t("noTransactionsYet", language)}
            </div>
          )}
          {(dashboard?.recent_transactions || []).map((tx) => {
            const isFresh = liveHighlightTxIds.includes(tx.id);
            return (
            <div
              key={tx.id}
              className={`tx-row ${isFresh ? "live-flash" : ""}`}
              style={{ cursor: "pointer" }}
              onClick={() => onSelectCustomerById(tx.customer_id)}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {tx.tx_type === "credit" ? (
                  <ArrowUpRight size={18} color="var(--credit)" />
                ) : (
                  <ArrowDownLeft size={18} color="var(--payment)" />
                )}
                <div>
                  <div style={{ fontWeight: 700 }}>
                    {tx.customer_name}
                    {isFresh && <span className="live-tag">LIVE</span>}
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                    {tx.transaction_date} · <span className={`badge ${tx.tx_type}`}>{tx.tx_type}</span>
                    {tx.note ? ` · ${tx.note}` : ""}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div className={`tx-amt ${tx.tx_type}`}>
                  {tx.tx_type === "credit" ? "+" : "-"}
                  {formatINR(tx.amount)}
                </div>
                <button
                  className="btn-icon-whatsapp"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const cust = customers?.find((c) => c.id === tx.customer_id) || {
                      id: tx.customer_id,
                      name: tx.customer_name,
                      phone: "",
                      outstanding_balance: 0,
                    };
                    shareViaWhatsApp({ customer: cust, tx, currentUser });
                  }}
                  title={`Send WhatsApp receipt for ₹${tx.amount}`}
                >
                  <MessageCircle size={14} />
                </button>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

