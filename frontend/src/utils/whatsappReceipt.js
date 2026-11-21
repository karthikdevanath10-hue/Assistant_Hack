/**
 * WhatsApp & SMS digital receipt and balance statement sharing for Kirana stores.
 * Generates formatted polite receipts and opens WhatsApp Click-to-Chat intents.
 */

import { formatINR } from "./numberNormalizer";

/**
 * Validates and checks Indian mobile numbers.
 * Indian mobile numbers must be 10 digits starting with 6, 7, 8, or 9.
 */
export function validateIndianMobile(phone) {
  if (!phone) return { valid: false, reason: "Phone number is empty" };
  const cleaned = String(phone).replace(/\D/g, "");
  if (!cleaned) return { valid: false, reason: "No digits found" };

  // 10-digit Indian mobile
  if (cleaned.length === 10 && /^[6-9]/.test(cleaned)) {
    return {
      valid: true,
      cleaned,
      formatted: `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`,
    };
  }

  // 11-digit starting with 0
  if (cleaned.length === 11 && cleaned.startsWith("0") && /^[6-9]/.test(cleaned.slice(1))) {
    const raw = cleaned.slice(1);
    return {
      valid: true,
      cleaned: raw,
      formatted: `+91 ${raw.slice(0, 5)} ${raw.slice(5)}`,
    };
  }

  // 12-digit starting with 91
  if (cleaned.length === 12 && cleaned.startsWith("91") && /^[6-9]/.test(cleaned.slice(2))) {
    const raw = cleaned.slice(2);
    return {
      valid: true,
      cleaned: raw,
      formatted: `+91 ${raw.slice(0, 5)} ${raw.slice(5)}`,
    };
  }

  // 11-digit with extra digit (e.g. 74114902711)
  if (cleaned.length === 11 && /^[6-9]/.test(cleaned)) {
    const suggested = cleaned.slice(0, 10);
    return {
      valid: false,
      hasExtraDigit: true,
      suggested,
      formatted: `+91 ${suggested.slice(0, 5)} ${suggested.slice(5)}`,
      reason: `11 digits entered. Indian numbers have 10 digits (suggested: ${suggested}).`,
    };
  }

  // 13-digit starting with 91 with extra digit (e.g. 9174114902711)
  if (cleaned.length === 13 && cleaned.startsWith("91") && /^[6-9]/.test(cleaned.slice(2))) {
    const suggested = cleaned.slice(2, 12);
    return {
      valid: false,
      hasExtraDigit: true,
      suggested,
      formatted: `+91 ${suggested.slice(0, 5)} ${suggested.slice(5)}`,
      reason: `11 digits entered after +91 (suggested: ${suggested}).`,
    };
  }

  return {
    valid: false,
    reason: "Please enter a valid 10-digit mobile number.",
  };
}

/**
 * Normalizes phone numbers for WhatsApp api.whatsapp.com intent (E.164 without plus).
 * Defaults to +91 (India) country code for 10-digit mobile numbers.
 * Auto-corrects 11-digit typos by taking the valid 10-digit prefix.
 */
export function normalizePhoneForWhatsApp(phone) {
  if (!phone) return "";
  const cleaned = String(phone).replace(/\D/g, "");
  if (!cleaned) return "";

  // 10-digit Indian mobile number
  if (cleaned.length === 10 && /^[6-9]/.test(cleaned)) {
    return `91${cleaned}`;
  }
  // 11-digit starting with 0 (e.g. 07411490271)
  if (cleaned.length === 11 && cleaned.startsWith("0") && /^[6-9]/.test(cleaned.slice(1))) {
    return `91${cleaned.slice(1)}`;
  }
  // 12-digit already with 91 country code (e.g. 917411490271)
  if (cleaned.length === 12 && cleaned.startsWith("91") && /^[6-9]/.test(cleaned.slice(2))) {
    return cleaned;
  }
  // 11-digit starting with 6-9: user typed 1 extra digit at end (e.g. 74114902711 -> 7411490271)
  if (cleaned.length === 11 && /^[6-9]/.test(cleaned)) {
    return `91${cleaned.slice(0, 10)}`;
  }
  // 13-digit starting with 91: user typed 1 extra digit at end (e.g. 9174114902711 -> 917411490271)
  if (cleaned.length === 13 && cleaned.startsWith("91") && /^[6-9]/.test(cleaned.slice(2))) {
    return cleaned.slice(0, 12);
  }
  // Fallback for valid international numbers (10 to 14 digits)
  if (cleaned.length >= 10 && cleaned.length <= 14) {
    return cleaned;
  }

  // If number is shorter than 10 digits or invalid, omit phone so WhatsApp opens
  // the contact picker rather than throwing "number isn't on WhatsApp"
  return "";
}

/**
 * Retrieves the currently logged-in shopkeeper profile from localStorage.
 */
export function getLoggedInShopkeeper() {
  if (typeof window === "undefined" || !window.localStorage) return null;
  try {
    const raw = localStorage.getItem("voice_khata_user_v1");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Builds polite WhatsApp formatted receipt text with bolding and dividers.
 * Dynamically inserts shopkeeper's name, phone number (for online payment),
 * and shop name (if configured in profile) for each shopkeeper.
 */
export function buildReceiptMessage({
  customer,
  tx = null,
  shopName,
  shopkeeperName,
  shopkeeperPhone,
  currentUser = null,
} = {}) {
  const custName = customer?.name || "Grahak";
  const balance = Number(customer?.outstanding_balance || 0);
  const formattedBalance = formatINR(balance);

  // Dynamic logged-in shopkeeper profile (specific to each shopkeeper)
  const loggedIn = currentUser || getLoggedInShopkeeper();

  // 1. Shop Name: use explicitly provided if set, otherwise from shopkeeper profile
  let effectiveShopName = "";
  if (shopName && shopName.trim()) {
    effectiveShopName = shopName.trim();
  } else if (loggedIn?.shop_name && loggedIn.shop_name.trim() !== "Voice Khata") {
    effectiveShopName = loggedIn.shop_name.trim();
  }

  // 2. Shopkeeper Name: use explicitly provided or from profile
  const effectiveShopkeeperName = (
    shopkeeperName ||
    loggedIn?.name ||
    ""
  ).trim();

  // 3. Shopkeeper Phone: use explicitly provided or from profile
  const effectiveShopkeeperPhone = (
    shopkeeperPhone ||
    loggedIn?.phone ||
    ""
  ).trim();

  // Format header lines:
  // Only show shop line if shopkeeper added a shop name in profile
  const shopLine = effectiveShopName ? `🏪 *${effectiveShopName}*\n` : "";
  // Only show shopkeeper line if shopkeeper name is present
  const shopkeeperLine = effectiveShopkeeperName ? `👤 *Shopkeeper*: ${effectiveShopkeeperName}\n` : "";

  // Payment line: adds shopkeeper's phone number so customer knows number for online payment
  let paymentSection = "";
  if (effectiveShopkeeperPhone) {
    if (effectiveShopkeeperName) {
      paymentSection = `💳 *For online payment use this number*: ${effectiveShopkeeperPhone} (${effectiveShopkeeperName})\n--------------------------------\n`;
    } else {
      paymentSection = `💳 *For online payment use this number*: ${effectiveShopkeeperPhone}\n--------------------------------\n`;
    }
  }

  // Single transaction receipt
  if (tx) {
    const isCredit = tx.tx_type === "credit";
    const typeLabel = isCredit ? "Udhaar (Credit)" : "Jama (Payment Received)";
    const dateStr = tx.transaction_date || new Date().toISOString().slice(0, 10);
    const amountStr = formatINR(tx.amount);
    const noteStr = tx.note ? `📌 *Note*: ${tx.note}\n` : "";

    return (
      `🧾 *Digital Khata Receipt*\n` +
      shopLine +
      shopkeeperLine +
      `👤 *Customer*: ${custName}\n` +
      `--------------------------------\n` +
      `📅 *Date*: ${dateStr}\n` +
      `💰 *Entry*: ${amountStr} · ${typeLabel}\n` +
      noteStr +
      `📊 *Kul Baaki (Net Due)*: ${formattedBalance}\n` +
      `--------------------------------\n` +
      paymentSection +
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
    shopLine +
    shopkeeperLine +
    `👤 *Customer*: ${custName}\n` +
    `--------------------------------\n` +
    `📈 *Total Udhaar (Credit)*: ${totalCredit}\n` +
    `📉 *Total Jama (Paid)*: ${totalPayment}\n` +
    `📊 *${statusLabel}*: ${formattedBalance}\n` +
    `--------------------------------\n` +
    paymentSection +
    `_Kripya hisab check karein. Kisi sawaal ke liye sampark karein. Dhanyawad!_`
  );
}

/**
 * Returns WhatsApp click-to-chat intent URL.
 * If phone is missing or invalid, omits phone parameter so user can select any WhatsApp contact.
 */
export function getWhatsAppShareUrl(options = {}) {
  const { customer } = options;
  const phone = normalizePhoneForWhatsApp(customer?.phone);
  const text = buildReceiptMessage(options);
  const encodedText = encodeURIComponent(text);

  if (phone) {
    return `https://api.whatsapp.com/send?phone=${phone}&text=${encodedText}`;
  }
  return `https://api.whatsapp.com/send?text=${encodedText}`;
}

/**
 * Returns WhatsApp URL that always opens the contact picker (omits phone).
 */
export function getWhatsAppContactPickerUrl(options = {}) {
  const text = buildReceiptMessage(options);
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
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
 * Copies the receipt text to user's clipboard.
 */
export async function copyReceiptToClipboard(options) {
  const text = buildReceiptMessage(options);
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  return false;
}

/**
 * Returns SMS intent URL fallback.
 */
export function getSmsShareUrl(options = {}) {
  const { customer } = options;
  const phone = normalizePhoneForWhatsApp(customer?.phone) || "";
  const text = buildReceiptMessage(options);
  return `sms:${phone}?body=${encodeURIComponent(text)}`;
}
