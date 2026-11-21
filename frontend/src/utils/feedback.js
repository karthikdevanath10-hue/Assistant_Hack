/**
 * Audio cues (Web Audio API synthetic chimes) and mobile haptic feedback.
 * Provides instant tactile and acoustic reassurance without external assets.
 */

let audioCtx = null;

function getAudioContext() {
  if (typeof window === "undefined") return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioCtx) {
    try {
      audioCtx = new AudioContextClass();
    } catch {
      return null;
    }
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Triggers mobile vibration via navigator.vibrate if supported.
 * @param {number|number[]} pattern - Milliseconds of vibration / pauses
 */
export function triggerHaptic(pattern = 40) {
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignored if user policy or device blocks vibration
    }
  }
}

/**
 * Soft pleasant "ding" on listening start (e.g. mic activation).
 * High-pitch warm tone with quick exponential decay.
 */
export function playListeningStart() {
  triggerHaptic(40);
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    // Warm harmonic blip: D5 (587 Hz) subtly rising to A5 (880 Hz)
    osc.frequency.setValueAtTime(587.33, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
  } catch {
    // Graceful fallback
  }
}

/**
 * Crisp ascending chime when a transaction is saved/committed.
 * Rewarding 3-tone harmonic arpeggio (C5 -> G5 -> C6).
 */
export function playTransactionSuccess() {
  // Mobile double-tap vibration confirmation
  triggerHaptic([50, 40, 75]);
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const notes = [
      { freq: 523.25, time: 0.0, dur: 0.22, vol: 0.08 }, // C5
      { freq: 783.99, time: 0.08, dur: 0.28, vol: 0.09 }, // G5
      { freq: 1046.5, time: 0.16, dur: 0.38, vol: 0.10 }, // C6
    ];

    notes.forEach(({ freq, time, dur, vol }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + time);

      gain.gain.setValueAtTime(0.001, now + time);
      gain.gain.linearRampToValueAtTime(vol, now + time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + dur + 0.02);
    });
  } catch {
    // Graceful fallback
  }
}
