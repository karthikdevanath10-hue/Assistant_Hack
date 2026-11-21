import React, { useState } from "react";
import {
  BarChart3,
  Home,
  Info,
  LayoutDashboard,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";

/**
 * WorkspaceCurvedHero provides the grand 75% workspace hero canvas
 * matching the reference design:
 * - Sweeping circular radial dome with spacious neo-morphic arc navigation buttons:
 *   1. Dashboard (opens home / dashboard metrics)
 *   2. Customers (opens customers tab)
 *   3. Customer Analytics (opens ledgers / customer analytics tab)
 *   4. Settings (opens settings tab)
 *   5. About (opens profile tab)
 * - Top-right: Glowing purple circular sparkle option badge that animates the arc options in/out
 */
export function WorkspaceCurvedHero({
  activeTab = "home",
  onSelectTab,
  onToggleDrawer,
  onScrollToExplore,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const navItems = [
    {
      id: "home",
      label: "Dashboard",
      icon: LayoutDashboard,
      action: () => {
        onSelectTab("home");
        if (onScrollToExplore) onScrollToExplore();
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
    <section className="curved-hero-section" aria-label="Workspace Welcome & Navigation">
      {/* Background Soft Floating Aurora Orbs */}
      <div className="curved-hero-bg-orb orb-left" />
      <div className="curved-hero-bg-orb orb-center" />

      {/* Main Content Layout */}
      <div className="curved-hero-inner">
        {/* Sweeping Grand Radial Curved Dome with Arc Navigation */}
        <div className="curved-hero-right">
          {/* Grand Curved Dome Dish */}
          <div className={`curved-dome-dish ${isOpen ? "is-open" : "is-hidden"}`}>
            {/* Glowing Purple Sparkle Option Button in Top Right */}
            <button
              type="button"
              className={`curved-sparkle-circle ${isOpen ? "is-open" : ""}`}
              onClick={() => setIsOpen((prev) => !prev)}
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
                  (item.id === "about" && activeTab === "profile");

                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`curved-arc-item curved-pos-${index + 1} ${isActive ? "active" : ""}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      item.action();
                    }}
                    onPointerUp={(e) => {
                      e.preventDefault();
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
      </div>
    </section>
  );
}
