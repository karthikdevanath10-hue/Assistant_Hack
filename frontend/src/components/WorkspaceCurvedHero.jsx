import React from "react";
import {
  BarChart3,
  Box,
  Home,
  Info,
  Settings,
  Sparkles,
} from "lucide-react";

/**
 * WorkspaceCurvedHero provides the 75% workspace hero banner
 * featuring the "Innovate Today, Grow Tomorrow" typography,
 * sweeping frosted radial dome, and circular arc navigation pills.
 */
export function WorkspaceCurvedHero({
  activeTab = "home",
  onSelectTab,
  onToggleDrawer,
  onScrollToExplore,
}) {
  const navItems = [
    {
      id: "home",
      label: "Home",
      icon: Home,
      action: () => {
        onSelectTab("home");
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

        {/* Right Column: Sweeping Radial Curved Dome with Arc Navigation */}
        <div className="curved-hero-right">
          <div className="curved-dome-dish">
            {/* Top Right Sparkle Badge with "Open" Drawer Callout */}
            <div
              className="curved-open-callout-wrap"
              onClick={onToggleDrawer}
              title="Open sliding dashboard"
              role="button"
              tabIndex={0}
            >
              <div className="curved-sparkle-circle">
                <Sparkles size={20} />
              </div>
              <svg className="curved-callout-arrow-svg" viewBox="0 0 40 24" fill="none">
                <path
                  d="M4 18 C14 22, 26 12, 36 6"
                  stroke="#8b5cf6"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeDasharray="2 2"
                />
              </svg>
              <button
                type="button"
                className="curved-open-pill-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleDrawer();
                }}
              >
                Open
              </button>
            </div>

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
          </div>
        </div>
      </div>
    </section>
  );
}
