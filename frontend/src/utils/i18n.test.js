import { describe, expect, it } from "vitest";
import { getDemoPhrases, SUPPORTED_LANGUAGES, t, TRANSLATIONS } from "./i18n";

describe("i18n localization utility", () => {
  it("defines all 5 major Indic and English language codes", () => {
    const codes = SUPPORTED_LANGUAGES.map((l) => l.code);
    expect(codes).toContain("en-IN");
    expect(codes).toContain("hi-IN");
    expect(codes).toContain("kn-IN");
    expect(codes).toContain("ta-IN");
    expect(codes).toContain("te-IN");
  });

  it("translates HUD ready state immediately across languages", () => {
    expect(t("hudReady", "en-IN")).toContain("Ready");
    expect(t("hudReady", "hi-IN")).toContain("तैयार");
    expect(t("hudReady", "kn-IN")).toContain("ಸಿದ್ಧವಾಗಿದೆ");
    expect(t("hudReady", "ta-IN")).toContain("தயார்");
    expect(t("hudReady", "te-IN")).toContain("సిద్ధంగా ఉంది");
  });

  it("translates stat card headers across languages", () => {
    expect(t("statCreditToday", "en-IN")).toBe("🔴 Today's Credit");
    expect(t("statCreditToday", "hi-IN")).toContain("आज का उधार");
    expect(t("statCreditToday", "kn-IN")).toContain("ಇಂದಿನ ಉದ್ಧಾರ");
    expect(t("statPaymentsToday", "en-IN")).toBe("🟢 Today's Payments");
  });

  it("returns language-specific demo test phrases", () => {
    const enPhrases = getDemoPhrases("en-IN");
    const hiPhrases = getDemoPhrases("hi-IN");
    const knPhrases = getDemoPhrases("kn-IN");

    expect(enPhrases[0]).toContain("Ramesh credit 340");
    expect(hiPhrases[0]).toContain("Ramesh ka 340 udhaar");
    expect(knPhrases[0]).toContain("ರಮೇಶ್ 340 ಸಾಲ");
  });

  it("gracefully falls back to English when key is missing in a dialect", () => {
    expect(t("navDashboard", "unknown-lang")).toBe("Dashboard (Khata)");
  });
});
