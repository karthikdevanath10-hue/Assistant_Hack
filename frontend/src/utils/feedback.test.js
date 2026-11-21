import { describe, expect, it, vi } from "vitest";
import { playListeningStart, playTransactionSuccess, triggerHaptic } from "./feedback";

describe("feedback cues and haptics", () => {
  it("triggers navigator.vibrate when available", () => {
    const vibrateMock = vi.fn();
    vi.stubGlobal("navigator", { vibrate: vibrateMock });

    triggerHaptic(50);
    expect(vibrateMock).toHaveBeenCalledWith(50);

    triggerHaptic([30, 20, 30]);
    expect(vibrateMock).toHaveBeenCalledWith([30, 20, 30]);

    vi.unstubAllGlobals();
  });

  it("handles missing navigator.vibrate gracefully without throwing", () => {
    vi.stubGlobal("navigator", {});
    expect(() => triggerHaptic(50)).not.toThrow();
    vi.unstubAllGlobals();
  });

  it("safely attempts to play chimes without throwing even if AudioContext is absent", () => {
    vi.stubGlobal("window", {});
    expect(() => playListeningStart()).not.toThrow();
    expect(() => playTransactionSuccess()).not.toThrow();
    vi.unstubAllGlobals();
  });
});
