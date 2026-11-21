import React, { useState } from "react";
import { Bell, BellOff, LayoutGrid, MessageCircle, Pencil, Search, Trash2, UserPlus } from "lucide-react";
import { formatINR } from "../utils/numberNormalizer";
import { shareViaWhatsApp, validateIndianMobile } from "../utils/whatsappReceipt";
import { CustomerEditForm } from "./CustomerEditForm";

export function CustomersScreen({
  customers,
  language,
  currentUser = null,
  highlightCustomerId = null,
  onSearch,
  onCreateCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
  onToggleOptIn,
  onSendReminder,
  onOpenLedger,
  onOpenLedgersPage,
}) {
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [optIn, setOptIn] = useState(false);
  const [reminderPreview, setReminderPreview] = useState(null);
  const [editingCustomerId, setEditingCustomerId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  async function handleAdd(e) {
    e.preventDefault();
    if (!name.trim()) return;
    const phoneVal = phone.trim() ? validateIndianMobile(phone) : null;
    const cleanPhone = phoneVal?.hasExtraDigit ? phoneVal.suggested : phone.trim() || null;
    await onCreateCustomer({
      name: name.trim(),
      phone: cleanPhone,
      reminder_opt_in: optIn,
      preferred_language: language,
    });
    setName("");
    setPhone("");
    setOptIn(false);
    setShowAdd(false);
  }

  async function triggerReminder(c) {
    try {
      const res = await onSendReminder(c.id);
      setReminderPreview(res);
    } catch (err) {
      setReminderPreview({ error: err.message, customer_name: c.name });
    }
  }

  const totalCreditAll = customers.reduce((acc, c) => acc + Number(c.total_credit || 0), 0);
  const totalPaidAll = customers.reduce((acc, c) => acc + Number(c.total_payment || 0), 0);
  const totalOutstandingAll = customers.reduce((acc, c) => acc + Number(c.outstanding_balance || 0), 0);

  return (
    <div>
      <div className="stats-grid" style={{ marginBottom: 14 }}>
        <div className="card stat-card-cust">
          <div className="stat-label">👥 कुल ग्राहक · Customers</div>
          <div className="stat-val">{customers.length}</div>
        </div>
        <div className="card stat-card-credit">
          <div className="stat-label">🔴 कुल उधार दिया · Total Credit</div>
          <div className="stat-val credit">{formatINR(totalCreditAll)}</div>
        </div>
        <div className="card stat-card-payment">
          <div className="stat-label">🟢 कुल जमा मिला · Total Paid</div>
          <div className="stat-val payment">{formatINR(totalPaidAll)}</div>
        </div>
        <div className="card stat-card-due">
          <div className="stat-label">📊 कुल बाज़ार बाकी · Net Due</div>
          <div className="stat-val accent">{formatINR(totalOutstandingAll)}</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
            <Search size={16} style={{ position: "absolute", left: 12, top: 13, color: "var(--muted)" }} />
            <input
              className="text-input"
              style={{ paddingLeft: 36 }}
              placeholder="Search customer..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                onSearch(e.target.value);
              }}
            />
          </div>
          {onOpenLedgersPage && (
            <button
              className="btn btn-secondary"
              type="button"
              onClick={onOpenLedgersPage}
              title="View individual blocks for every customer with all transactions"
            >
              <LayoutGrid size={16} /> All Ledgers
            </button>
          )}
          <button className="btn btn-primary" onClick={() => setShowAdd((v) => !v)}>
            <UserPlus size={16} /> Add
          </button>
        </div>

        {showAdd && (
          <form onSubmit={handleAdd} style={{ marginTop: 12, display: "grid", gap: 8 }}>
            <input
              className="text-input"
              placeholder="Customer full name (e.g. Anand Sharma)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              className="text-input"
              placeholder="10-digit mobile (e.g. 7411490271)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={16}
            />
            {phone.trim() && (() => {
              const pv = validateIndianMobile(phone);
              if (pv.valid) {
                return (
                  <span style={{ fontSize: "0.72rem", color: "#16a34a", fontWeight: 600 }}>
                    ✓ {pv.formatted} (Valid WhatsApp)
                  </span>
                );
              }
              if (pv.hasExtraDigit) {
                return (
                  <div style={{ fontSize: "0.72rem", color: "#ea580c", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4 }}>
                    <span>⚠️ 11 digits! Extra digit detected.</span>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ padding: "1px 7px", fontSize: "0.68rem" }}
                      onClick={() => setPhone(pv.suggested)}
                    >
                      Fix to {pv.suggested}
                    </button>
                  </div>
                );
              }
              return null;
            })()}
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.85rem" }}>
              <input type="checkbox" checked={optIn} onChange={(e) => setOptIn(e.target.checked)} />
              Customer explicitly opted in to polite payment reminders
            </label>
            <button className="btn btn-primary" type="submit">
              Create Customer
            </button>
          </form>
        )}
      </div>

      {reminderPreview && (
        <div className="reply-banner">
          <div style={{ fontWeight: 700, fontSize: "0.85rem" }}>
            {reminderPreview.error
              ? `Reminder Blocked (${reminderPreview.customer_name})`
              : `Polite Reminder Sent to ${reminderPreview.customer_name}`}
          </div>
          <div style={{ fontSize: "0.88rem", marginTop: 4 }}>
            {reminderPreview.error || reminderPreview.message}
          </div>
        </div>
      )}

      <div className="tx-list customer-list-grid">
        {customers.length === 0 && (
          <div style={{ color: "var(--muted)", fontSize: "0.86rem", padding: "8px 0" }}>
            No customers in this account yet. Click Add or use the voice assistant to create your first customer.
          </div>
        )}
        {customers.map((c) => {
          const isHighlighted = highlightCustomerId != null && c.id === highlightCustomerId;
          const isEditing = editingCustomerId === c.id;
          const isConfirmDelete = confirmDeleteId === c.id;
          return (
            <div key={c.id} className={`tx-row customer-card-item ${isHighlighted ? "live-flash" : ""}`}>
              {/* Header: Customer Info (Left) & Outstanding Balance (Right) */}
              <div className="customer-card-header" onClick={() => onOpenLedger(c)}>
                <div className="customer-card-info">
                  <div className="customer-card-name">
                    {c.name}{" "}
                    {c.is_synthetic && (
                      <span className="pill" style={{ fontSize: "0.68rem", padding: "2px 6px" }}>
                        Demo
                      </span>
                    )}
                    {isHighlighted && <span className="live-tag">UPDATED</span>}
                  </div>
                  <div className="customer-card-meta">
                    {c.phone ? <span className="customer-phone">{c.phone} · </span> : ""}
                    <span>Credit: {formatINR(c.total_credit)} · Paid: {formatINR(c.total_payment)}</span>
                  </div>
                </div>

                <div
                  className={`tx-amt customer-card-balance ${c.outstanding_balance > 0 ? "credit" : "payment"}`}
                  title="Click to view customer ledger transactions"
                >
                  {formatINR(c.outstanding_balance)}
                </div>
              </div>

              {/* Action Bar: WhatsApp, Remind, Edit, Delete */}
              <div className="customer-card-actions">
                <button
                  className="btn btn-whatsapp customer-action-btn"
                  type="button"
                  onClick={() => shareViaWhatsApp({ customer: c, currentUser })}
                  title="Send WhatsApp Khata Statement"
                >
                  <MessageCircle size={14} /> <span>WhatsApp</span>
                </button>
                <button
                  className={`btn btn-secondary customer-action-btn ${c.reminder_opt_in ? "opt-active" : ""}`}
                  type="button"
                  onClick={() => onToggleOptIn(c)}
                  title={c.reminder_opt_in ? "Opted in for reminders (click to opt out)" : "Not opted in (click to opt in)"}
                >
                  {c.reminder_opt_in ? <Bell size={14} color="#0d9488" /> : <BellOff size={14} color="#9ca3af" />}
                </button>
                <button
                  className="btn btn-secondary customer-action-btn"
                  type="button"
                  disabled={!c.reminder_opt_in || c.outstanding_balance <= 0}
                  onClick={() => triggerReminder(c)}
                  title="Send polite opt-in reminder"
                >
                  <span>Remind</span>
                </button>
                {onUpdateCustomer && (
                  <button
                    className="btn btn-secondary customer-action-btn customer-icon-btn"
                    type="button"
                    onClick={() => {
                      setConfirmDeleteId(null);
                      setEditingCustomerId((cur) => (cur === c.id ? null : c.id));
                    }}
                    title="Edit customer details"
                  >
                    <Pencil size={14} />
                  </button>
                )}
                {onDeleteCustomer && !isConfirmDelete && (
                  <button
                    className="btn btn-danger customer-action-btn customer-icon-btn"
                    type="button"
                    onClick={() => {
                      setEditingCustomerId(null);
                      setConfirmDeleteId(c.id);
                    }}
                    title="Delete customer manually"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                {onDeleteCustomer && isConfirmDelete && (
                  <div className="customer-delete-confirm-group">
                    <button
                      className="btn btn-danger customer-action-btn"
                      type="button"
                      onClick={async () => {
                        await onDeleteCustomer(c.id);
                        setConfirmDeleteId(null);
                      }}
                    >
                      Confirm
                    </button>
                    <button
                      className="btn btn-secondary customer-action-btn"
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {isEditing && onUpdateCustomer && (
                <CustomerEditForm
                  customer={c}
                  onSave={async (payload) => {
                    await onUpdateCustomer(c.id, payload);
                    setEditingCustomerId(null);
                  }}
                  onCancel={() => setEditingCustomerId(null)}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
