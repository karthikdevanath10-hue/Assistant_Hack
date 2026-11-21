import React, { useRef, useState } from "react";
import {
  BarChart3,
  Box,
  Home,
  Info,
  Settings,
  Sparkles,
} from "lucide-react";

/**
 * WorkspaceCurvedHero provides the grand 75% workspace hero canvas
 * matching the reference design:
 * - Left: "Hello! ✨", "Innovate Today, Grow Tomorrow", subtitle, and scroll indicator
 * - Right: Sweeping circular radial dome with spacious neo-morphic arc navigation buttons
 * - Top-right: Glowing purple circular sparkle option badge that animates the arc options in/out
 */
export function WorkspaceCurvedHero({
  activeTab = "home",
  onSelectTab,
  onToggleDrawer,
  onScrollToExplore,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const lastTriggerRef = useRef(0);

  const handleSelectOption = (targetTab, itemId, e) => {
    if (e) {
      e.stopPropagation?.();
    }
    const now = Date.now();
    if (now - lastTriggerRef.current < 280) return;
    lastTriggerRef.current = now;

    if (typeof onSelectTab === "function") {
      onSelectTab(targetTab);
    }
    if ((targetTab === "home" || itemId === "analytics") && typeof onScrollToExplore === "function") {
      onScrollToExplore(itemId);
    }
  };

  const navItems = [
    {
      id: "home",
      label: "Home",
      targetTab: "home",
      icon: Home,
    },
    {
      id: "analytics",
      label: "Analytics",
      targetTab: "home",
      icon: BarChart3,
    },
    {
      id: "tools",
      label: "Tools",
      targetTab: "ledgers",
      icon: Box,
    },
    {
      id: "settings",
      label: "Settings",
      targetTab: "settings",
      icon: Settings,
    },
    {
      id: "about",
      label: "About",
      targetTab: "profile",
      icon: Info,
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
            onClick={() => handleSelectOption("home", "home")}
            title="Scroll down to inspect live khata metrics & ledgers"
          >
            <div className="curved-mouse-pill">
              <div className="curved-mouse-wheel" />
            </div>
            <span className="curved-mouse-line" />
            <span className="curved-mouse-label">Scroll to explore</span>
          </button>
        </div>

        {/* Right Column: Sweeping Grand Radial Curved Dome with Arc Navigation */}
        <div className="curved-hero-right">
          {/* Grand Curved Dome Dish */}
          <div className={`curved-dome-dish ${isOpen ? "is-open" : "is-hidden"}`}>
            {/* Glowing Purple Sparkle Option Button in Top Right */}
            <button
              type="button"
              className={`curved-sparkle-circle ${isOpen ? "is-open" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen((prev) => !prev);
              }}
              title={isOpen ? "Hide dashboard options" : "Show dashboard options"}
              aria-label={isOpen ? "Hide dashboard options" : "Show dashboard options"}
              aria-expanded={isOpen}
            >
              <Sparkles size={22} />
            </button>

            {/* Circular Navigation Buttons Placed Generously Along the Sweeping Curve */}
            <nav
              className={`curved-arc-nav ${isOpen ? "is-open" : "is-hidden"}`}
              aria-label="Curved Workspace Navigation"
            >
              {navItems.map((item, index) => {
                const Icon = item.icon;
                const isActive =
                  item.id === activeTab ||
                  (item.id === "tools" && (activeTab === "ledgers" || activeTab === "customers")) ||
                  (item.id === "about" && activeTab === "profile");

                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`curved-arc-item curved-pos-${index + 1} ${isActive ? "active" : ""}`}
                    onClick={(e) => handleSelectOption(item.targetTab, item.id, e)}
                    onPointerUp={(e) => handleSelectOption(item.targetTab, item.id, e)}
                    aria-label={item.label}
                    title={`Open ${item.label} panel`}
                  >
                    <span className={`curved-arc-btn ${isActive ? "active" : ""}`}>
                      <Icon size={20} />
                    </span>
                    <span className="curved-arc-label">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </section>
  );
}
