import React from "react";
import { BookOpen, LayoutGrid, Mic, MicOff, Radio, Settings, Users } from "lucide-react";

const BOTTOM_TABS = [
  { id: "home", label: "खाता", enLabel: "Khata", Icon: BookOpen },
  { id: "customers", label: "ग्राहक", enLabel: "Customers", Icon: Users },
  { id: "ledgers", label: "खाता बही", enLabel: "Ledgers", Icon: LayoutGrid },
  { id: "settings", label: "सेटिंग्स", enLabel: "Settings", Icon: Settings },
];

export function BottomNavBar({
  activeTab,
  onSelectTab,
  isListening,
  isRecording,
  liveConnected,
  useLiveStream,
  isProcessing,
  onToggleMic,
}) {
  return (
    <nav className="bottom-nav-bar" aria-label="Mobile Navigation">
      <div className="bottom-nav-inner">
        {/* First two tabs */}
        {BOTTOM_TABS.slice(0, 2).map(({ id, label, enLabel, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              className={`bottom-nav-item ${isActive ? "active" : ""}`}
              onClick={() => onSelectTab(id)}
              aria-label={enLabel}
            >
              <Icon size={20} />
              <span className="bottom-nav-label">{label}</span>
              <span className="bottom-nav-sub">{enLabel}</span>
            </button>
          );
        })}

        {/* Center Big Mic Action Button */}
        <div className="bottom-nav-mic-wrap">
          <button
            type="button"
            className={`bottom-fab-mic ${isListening ? "listening" : ""} ${isProcessing ? "processing" : ""}`}
            onClick={onToggleMic}
            disabled={isProcessing}
            title={isListening ? "सुनना बंद करें / Tap to Stop" : "बोलकर एंट्री करें / Speak Entry"}
            aria-label="Speak voice entry"
          >
            {liveConnected ? (
              <Radio size={24} />
            ) : isRecording ? (
              <MicOff size={24} />
            ) : (
              <Mic size={24} />
            )}
            <span className="bottom-fab-ring" />
          </button>
          <span className="bottom-fab-caption">
            {isProcessing ? "हिसाब जोड़ रहे..." : isListening ? "सुन रहा हूँ..." : "बोलकर लिखें"}
          </span>
        </div>

        {/* Last two tabs */}
        {BOTTOM_TABS.slice(2).map(({ id, label, enLabel, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              className={`bottom-nav-item ${isActive ? "active" : ""}`}
              onClick={() => onSelectTab(id)}
              aria-label={enLabel}
            >
              <Icon size={20} />
              <span className="bottom-nav-label">{label}</span>
              <span className="bottom-nav-sub">{enLabel}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
