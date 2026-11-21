/**
 * WhatsApp & SMS digital receipt and balance statement sharing for Kirana stores.
 * Generates formatted polite receipts and opens WhatsApp Click-to-Chat intents.
 */

import { formatINR } from "./numberNormalizer";

/**
 * Normalizes phone numbers for WhatsApp api.whatsapp.com intent (E.164 without plus).
 * Defaults to +91 (India) country code for 10-digit mobile numbers.
 */
export function normalizePhoneForWhatsApp(phone) {
  if (!phone) return "";
  const cleaned = String(phone).replace(/\D/g, "");
  if (!cleaned) return "";

  // 10-digit Indian mobile number
  if (cleaned.length === 10) {
    return `91${cleaned}`;
  }
  // 11-digit starting with 0 (e.g. 09800000001)
  if (cleaned.length === 11 && cleaned.startsWith("0")) {
    return `91${cleaned.slice(1)}`;
  }
  // Already has country code (e.g. 919800000001)
  return cleaned;
}

/**
 * Builds polite WhatsApp formatted receipt text with bolding and dividers.
 */
export function buildReceiptMessage({
  customer,
  tx = null,
  shopName = "Kirana Store",
} = {}) {
  const custName = customer?.name || "Grahak";
  const balance = Number(customer?.outstanding_balance || 0);
  const formattedBalance = formatINR(balance);

  // Single transaction receipt
  if (tx) {
    const isCredit = tx.tx_type === "credit";
    const typeLabel = isCredit ? "Udhaar (Credit)" : "Jama (Payment Received)";
    const dateStr = tx.transaction_date || new Date().toISOString().slice(0, 10);
    const amountStr = formatINR(tx.amount);
    const noteStr = tx.note ? `📌 *Note*: ${tx.note}\n` : "";

    return (
      `🧾 *Digital Khata Receipt*\n` +
      `🏪 *${shopName}*\n` +
      `👤 *Customer*: ${custName}\n` +
      `--------------------------------\n` +
      `📅 *Date*: ${dateStr}\n` +
      `💰 *Entry*: ${amountStr} · ${typeLabel}\n` +
      noteStr +
      `📊 *Kul Baaki (Net Due)*: ${formattedBalance}\n` +
      `--------------------------------\n` +
      `_Aapke vishwas aur sahyog ke liye dhanyawad!_`
    );
  }

  // Full customer balance statement
  const totalCredit = formatINR(customer?.total_credit || 0);
  const totalPayment = formatINR(customer?.total_payment || 0);
  const statusLabel =
    balance > 0 ? "Kul Baaki (Amount Due)" : balance < 0 ? "Advance Jama" : "Hisab Settled (₹0)";

  return (
    `🧾 *Digital Khata Statement*\n` +
    `🏪 *${shopName}*\n` +
    `👤 *Customer*: ${custName}\n` +
    `--------------------------------\n` +
    `📈 *Total Udhaar (Credit)*: ${totalCredit}\n` +
    `📉 *Total Jama (Paid)*: ${totalPayment}\n` +
    `📊 *${statusLabel}*: ${formattedBalance}\n` +
    `--------------------------------\n` +
    `_Kripya hisab check karein. Kisi sawaal ke liye sampark karein. Dhanyawad!_`
  );
}

/**
 * Returns WhatsApp click-to-chat intent URL.
 * If phone is missing, omits phone parameter so user can select any WhatsApp contact.
 */
export function getWhatsAppShareUrl({
  customer,
  tx = null,
  shopName = "Kirana Store",
} = {}) {
  const phone = normalizePhoneForWhatsApp(customer?.phone);
  const text = buildReceiptMessage({ customer, tx, shopName });
  const encodedText = encodeURIComponent(text);

  if (phone) {
    return `https://api.whatsapp.com/send?phone=${phone}&text=${encodedText}`;
  }
  return `https://api.whatsapp.com/send?text=${encodedText}`;
}

/**
 * Opens WhatsApp share intent in a new browser tab or native app.
 */
export function shareViaWhatsApp(options) {
  const url = getWhatsAppShareUrl(options);
  if (typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
  }
  return url;
}

/**
 * Returns SMS intent URL fallback.
 */
export function getSmsShareUrl({
  customer,
  tx = null,
  shopName = "Kirana Store",
} = {}) {
  const phone = normalizePhoneForWhatsApp(customer?.phone) || "";
  const text = buildReceiptMessage({ customer, tx, shopName });
  return `sms:${phone}?body=${encodeURIComponent(text)}`;
}
