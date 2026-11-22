import React, { useEffect, useState } from "react";
import {
  Bell,
  BellOff,
  CheckCircle2,
  ChevronDown,
  Download,
  FileText,
  History,
  LayoutGrid,
  MessageCircle,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { formatINR } from "../utils/numberNormalizer";
import { shareViaWhatsApp } from "../utils/whatsappReceipt";
import { api } from "../api/client";
import { CustomerEditForm } from "./CustomerEditForm";

/**
 * Shared customer khata block displaying full customer metadata, actions,
 * credit/payment summary, and every transaction for that customer.
 */
export function CustomerLedgerCard({
  customer,
  transactions = [],
  highlightTxIds = [],
  isHighlighted = false,
  inline = false,
  isModal = false,
  initialTxOpen = false,
  currentUser = null,
  onUpdateCustomer,
  onDeleteCustomer,
  onAddTransaction,
  onToggleOptIn,
  onSendReminder,
  onOpenInLedgers,
  onClose,
}) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [addingTx, setAddingTx] = useState(false);
  const [amount, setAmount] = useState("");
  const [txType, setTxType] = useState("credit");
  const [note, setNote] = useState("");
  const [savingTx, setSavingTx] = useState(false);
  const [txHistoryOpen, setTxHistoryOpen] = useState(isModal || initialTxOpen);

  useEffect(() => {
    setEditing(false);
    setConfirmDelete(false);
    setAddingTx(false);
    setAmount("");
    setNote("");
    setTxHistoryOpen(isModal || initialTxOpen);
  }, [customer?.id, isModal, initialTxOpen]);

  const safeTxs = Array.isArray(transactions) ? transactions : [];
  const hiSet = new Set(highlightTxIds || []);
  const hasFreshTx = safeTxs.some((tx) => hiSet.has(tx.id));

  useEffect(() => {
    if (hasFreshTx || isHighlighted) {
      setTxHistoryOpen(true);
    }
  }, [hasFreshTx, isHighlighted]);

  if (!customer) return null;
  const outstanding = Number(customer.outstanding_balance || 0);
  const statusTag =
    outstanding > 0 ? "Balance Due" : outstanding < 0 ? "Advance Paid" : "Settled";

  async function handleSaveTx(e) {
    e.preventDefault();
    const numericAmount = Number(amount);
    if (!onAddTransaction || !numericAmount || numericAmount <= 0 || savingTx) return;
    setSavingTx(true);
    try {
      await onAddTransaction({
        customer_id: customer.id,
        amount: numericAmount,
        tx_type: txType,
        note: note.trim() || null,
      });
      setAmount("");
      setNote("");
      setAddingTx(false);
    } finally {
      setSavingTx(false);
    }
  }

  return (
    <>
      <div className="customer-block-head">
        <div className="customer-block-title">
          <div className="customer-block-eyebrow">
            <span>Customer Digital Khata {inline ? "· Live View" : ""}</span>
            {customer.is_synthetic && (
              <span className="pill" style={{ fontSize: "0.66rem", padding: "1px 7px" }}>
                Demo
              </span>
            )}
            {(isHighlighted || hasFreshTx) && <span className="live-tag">LIVE</span>}
          </div>
          <h3>{customer.name}</h3>
          <div className="customer-block-meta">
            {customer.phone ? `Phone: ${customer.phone} · ` : ""}
            Lang: {customer.preferred_language || "hi-IN"} ·{" "}
            {customer.reminder_opt_in ? "Reminders ON" : "Reminders OFF"}
          </div>
        </div>

        <div className="customer-block-actions">
          <button
            className="btn btn-whatsapp btn-sm btn-cust-whatsapp"
            type="button"
            onClick={() => shareViaWhatsApp({ customer, transactions, currentUser })}
            title="Send WhatsApp Khata statement"
          >
            <MessageCircle size={14} /> WhatsApp
          </button>
          {onAddTransaction && (
            <button
              className="btn btn-secondary btn-sm btn-cust-entry"
              type="button"
              onClick={() => {
                setEditing(false);
                setConfirmDelete(false);
                setAddingTx((v) => !v);
              }}
              title="Add credit or payment entry for this customer"
            >
              <Plus size={14} /> Entry
            </button>
          )}
          {onToggleOptIn && (
            <button
              className={`btn btn-secondary btn-sm btn-cust-optin ${customer.reminder_opt_in ? "opt-active" : ""}`}
              type="button"
              onClick={() => onToggleOptIn(customer)}
              title={
                customer.reminder_opt_in
                  ? "Opted in for reminders (click to opt out)"
                  : "Not opted in (click to opt in)"
              }
            >
              {customer.reminder_opt_in ? (
                <Bell size={14} color="#0d9488" />
              ) : (
                <BellOff size={14} color="#9ca3af" />
              )}
            </button>
          )}
          {onSendReminder && (
            <button
              className="btn btn-secondary btn-sm btn-cust-remind"
              type="button"
              disabled={!customer.reminder_opt_in || outstanding <= 0}
              onClick={() => onSendReminder(customer)}
              title="Send polite opt-in reminder"
            >
              Remind
            </button>
          )}
          {onOpenInLedgers && (
            <button
              className="btn btn-secondary btn-sm btn-cust-ledgers"
              type="button"
              onClick={() => onOpenInLedgers(customer)}
              title="Open in All Customer Ledgers page"
            >
              <LayoutGrid size={14} /> All Ledgers
            </button>
          )}
          {onUpdateCustomer && (
            <button
              className="btn btn-secondary btn-sm btn-cust-edit"
              type="button"
              onClick={() => {
                setConfirmDelete(false);
                setAddingTx(false);
                setEditing((v) => !v);
              }}
              title="Edit customer details"
            >
              <Pencil size={14} /> Edit
            </button>
          )}
          {onDeleteCustomer && !confirmDelete && (
            <button
              className="btn btn-danger btn-sm btn-cust-delete"
              type="button"
              onClick={() => {
                setEditing(false);
                setAddingTx(false);
                setConfirmDelete(true);
              }}
              title="Delete customer manually"
            >
              <Trash2 size={14} /> Delete
            </button>
          )}
          {onDeleteCustomer && confirmDelete && (
            <>
              <button
                className="btn btn-danger btn-sm"
                type="button"
                onClick={async () => {
                  await onDeleteCustomer(customer.id);
                  setConfirmDelete(false);
                }}
              >
                Confirm Delete
              </button>
              <button
                className="btn btn-secondary btn-sm"
                type="button"
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </button>
            </>
          )}
          {onClose && (
            <button
              className="btn btn-secondary btn-sm btn-cust-close"
              type="button"
              onClick={onClose}
              title="Close customer details"
              aria-label="Close customer ledger"
            >
              <X size={15} /> Close
            </button>
          )}
        </div>
      </div>

      {editing && onUpdateCustomer && (
        <div style={{ marginBottom: 14 }}>
          <CustomerEditForm
            customer={customer}
            onSave={async (payload) => {
              await onUpdateCustomer(customer.id, payload);
              setEditing(false);
            }}
            onCancel={() => setEditing(false)}
          />
        </div>
      )}

      {addingTx && onAddTransaction && (
        <form onSubmit={handleSaveTx} className="customer-inline-tx-form">
          <input
            className="text-input"
            type="number"
            min="1"
            step="0.01"
            placeholder="Amount ₹"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <select
            className="text-input"
            value={txType}
            onChange={(e) => setTxType(e.target.value)}
          >
            <option value="credit">Credit (Udhaar)</option>
            <option value="payment">Payment</option>
          </select>
          <input
            className="text-input"
            placeholder="Note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div style={{ display: "flex", gap: 6 }}>
            <button className="btn btn-primary btn-sm" type="submit" disabled={savingTx}>
              <CheckCircle2 size={14} /> {savingTx ? "Saving..." : "Save"}
            </button>
            <button
              className="btn btn-secondary btn-sm"
              type="button"
              onClick={() => setAddingTx(false)}
              disabled={savingTx}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="customer-balance-box">
        <div>
          <div className="customer-balance-head">
            <span className="stat-label">Outstanding Balance (Credit − Payment)</span>
            <span className={`badge ${outstanding > 0 ? "credit" : "payment"}`}>{statusTag}</span>
          </div>
          <div className={`stat-val ${outstanding > 0 ? "credit" : "payment"}`}>
            {formatINR(outstanding)}
          </div>
          <div className="customer-balance-sub">
            Total Credit: {formatINR(customer.total_credit)} · Total Paid:{" "}
            {formatINR(customer.total_payment)} · {safeTxs.length}{" "}
            {safeTxs.length === 1 ? "transaction" : "transactions"}
          </div>
        </div>
        <button
          className="btn btn-secondary btn-sm"
          type="button"
          onClick={() =>
            api.exportPdf(customer.id, {
              customer,
              transactions: safeTxs,
              currentUser,
            })
          }
          title={`Download ${customer.name}'s PDF khata statement`}
        >
          <FileText size={14} /> PDF
        </button>
      </div>

      {/* Interactive Drop Notch for Transaction History */}
      <div className={`customer-tx-drop-notch ${txHistoryOpen ? "is-open" : ""}`}>
        {/* Transparent backdrop to dismiss floating drawer on tap outside (non-modal only) */}
        {txHistoryOpen && !isModal && (
          <div
            className="dropnotch-backdrop"
            onClick={() => setTxHistoryOpen(false)}
            aria-hidden="true"
          />
        )}

        <button
          type="button"
          className={`stat-drop-notch-btn customer-tx-notch-btn ${txHistoryOpen ? "open" : ""}`}
          onClick={() => setTxHistoryOpen((prev) => !prev)}
          title={
            safeTxs.length > 0
              ? txHistoryOpen
                ? "Click drop notch to fold history"
                : "Click drop notch to view transaction history"
              : "No transactions recorded yet"
          }
        >
          <span className="notch-btn-label">
            <span className="notch-count-pill tx-pill">
              {safeTxs.length}
            </span>
            <span style={{ fontWeight: 750, letterSpacing: "-0.01em" }}>
              Transaction History
            </span>
            {hasFreshTx && (
              <span className="live-tag" style={{ marginLeft: 4, fontSize: "0.65rem", padding: "1px 6px" }}>
                LIVE
              </span>
            )}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: "0.72rem", color: "var(--muted)", fontWeight: 600 }}>
              {txHistoryOpen ? "Fold Notch" : "Drop Notch"}
            </span>
            <ChevronDown size={14} className="notch-chevron" />
          </div>
        </button>

        {/* Floating Transaction Drawer */}
        <div className={`customer-tx-notch-drawer ${txHistoryOpen ? "open" : ""}`}>
          <div className="stat-notch-floating-header">
            <span className="header-title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <History size={13} style={{ color: "var(--accent)" }} />
              {customer.name} · History
            </span>
            <span className="header-badge">
              {safeTxs.length} {safeTxs.length === 1 ? "Record" : "Records"}
            </span>
          </div>

          <div className="tx-list customer-tx-list-scroll">
            {safeTxs.length === 0 ? (
              <div style={{ color: "var(--muted)", fontSize: "0.85rem", padding: "16px 8px", textAlign: "center" }}>
                No transactions recorded yet. Tap "+ Entry" above to add one.
              </div>
            ) : (
              safeTxs.map((tx) => {
                const isFresh = hiSet.has(tx.id);
                return (
                  <div key={tx.id} className={`tx-row ${isFresh ? "live-flash" : ""}`}>
                    <div>
                      <div style={{ fontWeight: 600 }}>
                        {tx.transaction_date} ·{" "}
                        <span className={`badge ${tx.tx_type}`}>{tx.tx_type}</span>
                        {isFresh && <span className="live-tag">LIVE</span>}
                      </div>
                      <div style={{ fontSize: "0.76rem", color: "var(--muted)" }}>
                        Receipt #{tx.id}
                        {tx.note ? ` · ${tx.note}` : ""}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div className={`tx-amt ${tx.tx_type}`}>
                        {tx.tx_type === "credit" ? "+" : "-"}
                        {formatINR(tx.amount)}
                      </div>
                      <button
                        className="btn-icon-whatsapp"
                        type="button"
                        onClick={() => shareViaWhatsApp({ customer, tx, currentUser })}
                        title={`Send WhatsApp receipt for ₹${tx.amount}`}
                      >
                        <MessageCircle size={13} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}

