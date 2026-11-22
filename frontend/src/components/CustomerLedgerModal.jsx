import React, { useEffect } from "react";
import { CustomerLedgerCard } from "./CustomerLedgerCard";

export function CustomerLedgerModal({
  customer,
  transactions,
  highlightTxIds = [],
  inline = false,
  currentUser = null,
  onAddTransaction,
  onToggleOptIn,
  onSendReminder,
  onUpdateCustomer,
  onDeleteCustomer,
  onOpenInLedgers,
  onClose,
}) {
  useEffect(() => {
    if (!customer || inline) return undefined;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [customer, inline, onClose]);

  if (!customer) return null;

  const content = (
    <CustomerLedgerCard
      customer={customer}
      transactions={transactions}
      highlightTxIds={highlightTxIds}
      inline={inline}
      isModal={!inline}
      initialTxOpen={true}
      currentUser={currentUser}
      onUpdateCustomer={onUpdateCustomer}
      onDeleteCustomer={onDeleteCustomer}
      onAddTransaction={onAddTransaction}
      onToggleOptIn={onToggleOptIn}
      onSendReminder={onSendReminder}
      onOpenInLedgers={onOpenInLedgers}
      onClose={onClose}
    />
  );

  if (inline) {
    return <div className="card inline-ledger-panel">{content}</div>;
  }

  return (
    <div className="modal-backdrop customer-ledger-backdrop" onClick={onClose}>
      <div
        className="modal-card customer-ledger-modal-card"
        role="dialog"
        aria-modal="true"
        aria-label={`${customer.name} digital khata ledger`}
        onClick={(e) => e.stopPropagation()}
      >
        {content}
      </div>
    </div>
  );
}
