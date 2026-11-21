import React, { useState } from "react";
import {
  BarChart3,
  Box,
  ChevronRight,
  Home,
  Info,
  PanelRightOpen,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import { formatINR } from "../utils/numberNormalizer";

/**
 * WorkspaceCurvedHero provides the 75% workspace hero banner
 * featuring the "Innovate Today, Grow Tomorrow" typography,
 * sweeping frosted radial dome, and circular arc navigation pills.
 *
 * Touching the top right "Open" option expands the curve to reveal
 * the dashboard options and live ledger metrics while preserving
 * the iconic circular curve aesthetic.
 */
export function WorkspaceCurvedHero({
  activeTab = "home",
  onSelectTab,
  onToggleDrawer,
  onScrollToExplore,
  dashboard = null,
  currentUser = null,
  customers = [],
}) {
  const [isCurveOpen, setIsCurveOpen] = useState(false);

  function toggleCurve() {
    setIsCurveOpen((prev) => !prev);
  }

  const navItems = [
    {
      id: "home",
      label: "Home",
      icon: Home,
      action: () => {
        onSelectTab("home");
        if (onScrollToExplore) onScrollToExplore();
      },
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
      action: () => {
        onSelectTab("home");
        if (onScrollToExplore) onScrollToExplore();
      },
    },
    {
      id: "tools",
      label: "Tools",
      icon: Box,
      action: () => {
        onSelectTab("ledgers");
      },
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      action: () => {
        onSelectTab("settings");
      },
    },
    {
      id: "about",
      label: "About",
      icon: Info,
      action: () => {
        onSelectTab("profile");
      },
    },
  ];

  return (
    <section className="curved-hero-section" aria-label="Workspace Welcome & Navigation">
      {/* Background Soft Floating Aurora Orbs */}
      <div className="curved-hero-bg-orb orb-left" />
      <div className="curved-hero-bg-orb orb-center" />

      {/* Main Content Layout */}
      <div className="curved-hero-inner">
        {/* Left Column: Greeting, Big Typography, Subtitle & Scroll */}
        <div className="curved-hero-left">
          <div className="curved-hero-badge">
            <span>Hello!</span>
            <Sparkles size={14} className="curved-badge-sparkle" />
          </div>

          <h1 className="curved-hero-title">
            <span className="curved-title-line1">Innovate Today,</span>
            <span className="curved-title-line2">Grow Tomorrow</span>
          </h1>

          <p className="curved-hero-sub">
            A modern platform to build, explore and achieve more.
          </p>

          <div className="curved-hero-divider" />

          <button
            type="button"
            className="curved-hero-scroll-btn"
            onClick={onScrollToExplore}
            title="Scroll down to inspect live khata metrics & ledgers"
          >
            <div className="curved-mouse-pill">
              <div className="curved-mouse-wheel" />
            </div>
            <span className="curved-mouse-line" />
            <span className="curved-mouse-label">Scroll to explore</span>
          </button>
        </div>

        {/* Right Column: Sweeping Radial Curved Dome with Arc Navigation & Dashboard Options */}
        <div className="curved-hero-right">
          <div className={`curved-dome-dish ${isCurveOpen ? "is-open" : "is-closed"}`}>
            {/* Top Right Sparkle Icon Trigger */}
            <button
              type="button"
              className="curved-sparkle-circle"
              onClick={toggleCurve}
              title={isCurveOpen ? "Close curved dashboard" : "Touch to open curved dashboard"}
              aria-label={isCurveOpen ? "Close curved dashboard" : "Open curved dashboard"}
            >
              {isCurveOpen ? <X size={20} /> : <Sparkles size={20} />}
            </button>

            {/* The Curve & Dashboard Options Content */}
            <div className="curved-content-wrap">
              {/* Circular Navigation Buttons Placed Along the Radial Curve */}
              <nav className="curved-arc-nav" aria-label="Curved Workspace Navigation">
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive =
                    item.id === activeTab ||
                    (item.id === "tools" && (activeTab === "ledgers" || activeTab === "customers")) ||
                    (item.id === "about" && activeTab === "profile");

                  return (
                    <div
                      key={item.id}
                      className={`curved-arc-item curved-pos-${index + 1} ${isActive ? "active" : ""}`}
                      onClick={item.action}
                    >
                      <button
                        type="button"
                        className={`curved-arc-btn ${isActive ? "active" : ""}`}
                        aria-label={item.label}
                        title={`Go to ${item.label}`}
                      >
                        <Icon size={19} />
                      </button>
                      <span className="curved-arc-label">{item.label}</span>
                    </div>
                  );
                })}
              </nav>

              {/* Opened Dashboard Option Panel embedded within the curve */}
              <div className="curved-dashboard-panel">
                <div className="curved-dash-head">
                  <div className="curved-dash-title-wrap">
                    <span className="curved-dash-badge">Dashboard Option</span>
                    <h4>{currentUser?.shop_name || "Voice Khata"}</h4>
                  </div>
                  <button
                    type="button"
                    className="curved-dash-drawer-btn"
                    onClick={() => {
                      if (onToggleDrawer) onToggleDrawer();
                    }}
                    title="Open full slide-in panel"
                  >
                    <PanelRightOpen size={14} />
                    <span>Sliding Drawer</span>
                  </button>
                </div>

                {/* Dashboard Metrics Snapshot */}
                <div className="curved-dash-metrics">
                  <div
                    className="curved-dash-metric credit"
                    onClick={() => {
                      onSelectTab("home");
                      if (onScrollToExplore) onScrollToExplore();
                    }}
                  >
                    <small>Today's Credit</small>
                    <strong>{formatINR(dashboard?.today_credit || 0)}</strong>
                  </div>
                  <div
                    className="curved-dash-metric payment"
                    onClick={() => {
                      onSelectTab("home");
                      if (onScrollToExplore) onScrollToExplore();
                    }}
                  >
                    <small>Today's Payments</small>
                    <strong>{formatINR(dashboard?.today_payment || 0)}</strong>
                  </div>
                  <div
                    className="curved-dash-metric due"
                    onClick={() => {
                      onSelectTab("home");
                      if (onScrollToExplore) onScrollToExplore();
                    }}
                  >
                    <small>Total Due</small>
                    <strong>{formatINR(dashboard?.total_due || 0)}</strong>
                  </div>
                  <div
                    className="curved-dash-metric cust"
                    onClick={() => onSelectTab("customers")}
                  >
                    <small>Customers</small>
                    <strong>{customers?.length || dashboard?.customer_count || 0}</strong>
                  </div>
                </div>

                {/* Dashboard Quick Navigation Options */}
                <div className="curved-dash-actions">
                  <button
                    type="button"
                    className="curved-action-btn primary"
                    onClick={() => {
                      onSelectTab("home");
                      if (onScrollToExplore) onScrollToExplore();
                    }}
                  >
                    <span>View All Ledger Cards</span>
                    <ChevronRight size={14} />
                  </button>
                  <button
                    type="button"
                    className="curved-action-btn"
                    onClick={() => onSelectTab("ledgers")}
                  >
                    <Box size={14} />
                    <span>Customer Ledgers</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
