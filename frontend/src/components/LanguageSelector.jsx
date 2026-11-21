import React, { useState } from "react";
import { Check, Globe } from "lucide-react";
import { SUPPORTED_LANGUAGES } from "../utils/i18n";

export { SUPPORTED_LANGUAGES };

export function LanguageSelector({ currentLanguage, onChangeLanguage }) {
  const [open, setOpen] = useState(false);
  const active = SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="lang-selector-dropdown">
      <button
        type="button"
        className="lang-trigger-btn"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-label="Change voice and ledger language"
        title="Change language / भाषा बदलें"
      >
        <span className="lang-flag">{active.flag}</span>
        <span className="lang-native-label">{active.native}</span>
        <span className="lang-code-sub">({active.en})</span>
      </button>

      {open && (
        <>
          <div className="lang-menu-backdrop" onClick={() => setOpen(false)} />
          <div className="lang-menu-card">
            <div className="lang-menu-header">
              <Globe size={14} />
              <span>भाषा चुनें / Select Language</span>
            </div>
            {SUPPORTED_LANGUAGES.map((item) => {
              const isSelected = item.code === currentLanguage;
              return (
                <button
                  key={item.code}
                  type="button"
                  className={`lang-option-item ${isSelected ? "selected" : ""}`}
                  onClick={() => {
                    onChangeLanguage(item.code);
                    setOpen(false);
                  }}
                >
                  <span className="lang-option-main">
                    <span className="lang-flag">{item.flag}</span>
                    <strong className="lang-option-native">{item.native}</strong>
                    <span className="lang-option-en">· {item.en}</span>
                  </span>
                  {isSelected && <Check size={16} className="lang-check-icon" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
