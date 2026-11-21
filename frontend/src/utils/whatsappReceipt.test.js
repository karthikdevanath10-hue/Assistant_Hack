import { describe, expect, it } from "vitest";
import {
  buildReceiptMessage,
  getSmsShareUrl,
  getWhatsAppShareUrl,
  normalizePhoneForWhatsApp,
} from "./whatsappReceipt";

describe("whatsappReceipt utilities", () => {
  it("normalizes phone numbers to Indian E.164 without plus", () => {
    expect(normalizePhoneForWhatsApp("9845012345")).toBe("919845012345");
    expect(normalizePhoneForWhatsApp("+91 98450-12345")).toBe("919845012345");
    expect(normalizePhoneForWhatsApp("09845012345")).toBe("919845012345");
    expect(normalizePhoneForWhatsApp("")).toBe("");
    expect(normalizePhoneForWhatsApp(null)).toBe("");
  });

  it("builds a formatted receipt for a single credit transaction", () => {
    const customer = { name: "Ramesh Gowda", phone: "9845012345", outstanding_balance: 540 };
    const tx = { amount: 340, tx_type: "credit", transaction_date: "2026-11-21", note: "Atta bag" };

    const msg = buildReceiptMessage({ customer, tx, shopName: "Karthik Kirana" });
    expect(msg).toContain("Karthik Kirana");
    expect(msg).toContain("Ramesh Gowda");
    expect(msg).toContain("₹340");
    expect(msg).toContain("Udhaar (Credit)");
    expect(msg).toContain("Atta bag");
    expect(msg).toContain("₹540");
  });

  it("builds a statement message when no tx is provided", () => {
    const customer = {
      name: "Suresh Patel",
      phone: "9800000003",
      total_credit: 1200,
      total_payment: 400,
      outstanding_balance: 800,
    };

    const msg = buildReceiptMessage({ customer });
    expect(msg).toContain("Digital Khata Statement");
    expect(msg).toContain("Suresh Patel");
    expect(msg).toContain("*Total Udhaar (Credit)*: ₹1,200");
    expect(msg).toContain("*Total Jama (Paid)*: ₹400");
    expect(msg).toContain("*Kul Baaki (Amount Due)*: ₹800");
  });

  it("generates correct WhatsApp and SMS URLs with phone and encoded text", () => {
    const customer = { name: "Ramesh Gowda", phone: "9845012345", outstanding_balance: 300 };
    const tx = { amount: 300, tx_type: "credit", transaction_date: "2026-11-21" };

    const waUrl = getWhatsAppShareUrl({ customer, tx });
    expect(waUrl).toContain("https://api.whatsapp.com/send?phone=919845012345&text=");
    expect(waUrl).toContain(encodeURIComponent("Ramesh Gowda"));

    const smsUrl = getSmsShareUrl({ customer, tx });
    expect(smsUrl).toContain("sms:919845012345?body=");
  });

  it("omits phone in WhatsApp URL when customer has no phone number", () => {
    const customer = { name: "Walk-in Customer", phone: "", outstanding_balance: 150 };
    const waUrl = getWhatsAppShareUrl({ customer });
    expect(waUrl).toContain("https://api.whatsapp.com/send?text=");
    expect(waUrl).not.toContain("phone=");
  });
});
