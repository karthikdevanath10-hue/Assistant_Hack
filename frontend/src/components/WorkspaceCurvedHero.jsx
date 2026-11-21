import React, { useEffect, useState } from "react";
import {
  BarChart3,
  ChevronDown,
  Info,
  LayoutDashboard,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";

/**
 * WorkspaceCurvedHero provides the floating tapper navigation:
 * - Sleek glowing purple sparkle tapper button in the topbar.
 * - When tapped, fans out the grand curved neo-morphic dome dish overlay
 *   with the 5 arc navigation buttons:
 *   1. Dashboard (opens home / dashboard metrics)
 *   2. Customers (opens customers tab)
 *   3. Customer Analytics (opens ledgers / customer analytics tab)
 *   4. Settings (opens settings tab)
 *   5. About (opens profile tab)
 * - When any option is clicked, the floating dish smoothly collapses ("goes off back to")
 *   and opens the selected page right there at the top!
 */
export function WorkspaceCurvedHero({
  activeTab = "home",
  onSelectTab,
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const navItems = [
    {
      id: "home",
      label: "Dashboard",
      icon: LayoutDashboard,
      action: () => {
        onSelectTab("home");
      },
    },
    {
      id: "customers",
      label: "Customers",
      icon: Users,
      action: () => {
        onSelectTab("customers");
      },
    },
    {
      id: "ledgers",
      label: "Customer Analytics",
      icon: BarChart3,
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
    <div className={`floating-tapper-wrapper ${isOpen ? "is-open" : "is-closed"}`}>
      {/* Tap-outside Backdrop */}
      {isOpen && (
        <div
          className="floating-tapper-backdrop"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Floating Workspace Explorer Button in Topbar */}
      <button
        type="button"
        className={`floating-tapper-btn ${isOpen ? "is-open" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        title={isOpen ? "Close Workspace Explorer" : "Open Workspace Explorer (Dashboard, Customers, Analytics, Settings)"}
        aria-label="Workspace Explorer"
        aria-expanded={isOpen}
      >
        <span className="tapper-sparkle-icon">
          <Sparkles size={15} />
        </span>
        <span className="tapper-label">Workspace Explorer</span>
        <ChevronDown
          size={14}
          className={`tapper-chevron ${isOpen ? "is-open" : ""}`}
        />
      </button>

      {/* Floating Curved Arc Navigation Overlay (no white background dish) */}
      <div
        className={`floating-dome-dish ${isOpen ? "is-open" : "is-hidden"}`}
        aria-hidden={!isOpen}
      >
        <div className="workspace-explorer-header">
          <Sparkles size={13} />
          <span>Workspace Explorer</span>
        </div>

        {/* Circular Navigation Buttons Placed Generously Along the Sweeping Curve */}
        <nav
          className={`curved-arc-nav ${isOpen ? "is-open" : "is-hidden"}`}
          aria-label="Curved Workspace Navigation"
        >
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive =
              item.id === activeTab ||
              (item.id === "about" && activeTab === "profile");

            return (
              <button
                key={item.id}
                type="button"
                className={`curved-arc-item curved-pos-${index + 1} ${isActive ? "active" : ""}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsOpen(false);
                  item.action();
                }}
                onPointerUp={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsOpen(false);
                  item.action();
                }}
                aria-label={`Open ${item.label}`}
                title={`Open ${item.label}`}
              >
                <span className={`curved-arc-btn ${isActive ? "active" : ""}`}>
                  <Icon size={20} />
                </span>
                <span className="curved-arc-label">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
