/**
 * Studio-Grade Noise Cancellation & Speech Enhancement Engine for Voice Khata.
 *
 * Designed specifically for noisy Indian Kirana stores, street-side counters,
 * market background noise, ceiling fans, refrigerator compressors, and 50Hz AC mains hum.
 *
 * Pipeline Stages:
 * 1. WebRTC Hardware Constraints (hardware noiseSuppression, echoCancellation, googNoiseSuppression)
 * 2. Stage 1: Steep 90Hz High-Pass Filter (cuts traffic rumble, table vibration, fan motor drone)
 * 3. Stage 2: 50Hz Notch Filter (cuts Indian 50Hz AC power line electrical buzz)
 * 4. Stage 3: 100Hz Notch Filter (cuts 100Hz harmonic rectifier hum from fluorescent tubes)
 * 5. Stage 4: 7.5kHz Low-Pass Filter (cuts high-frequency air hiss, fan rush, and coil whine)
 * 6. Stage 5: 2.8kHz Peaking Speech Clarity Filter (+2.5dB vocal presence boost)
 * 7. Stage 6: Dynamics Compressor / Normalizer (smooths volume dynamics without clipping)
 * 8. Real-time Adaptive Noise Gate (attenuates ambient background noise below noise floor between words)
 */

/**
 * Returns optimized WebRTC audio constraints for getUserMedia.
 */
export function getNoiseCancellationConstraints(enabled = true) {
  if (!enabled) {
    return {
      channelCount: 1,
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
    };
  }

  return {
    channelCount: 1,
    echoCancellation: { ideal: true },
    noiseSuppression: { ideal: true },
    autoGainControl: { ideal: true },
    // Chromium / Chrome / Edge extended WebRTC acoustic flags
    googEchoCancellation: { ideal: true },
    googAutoGainControl: { ideal: true },
    googNoiseSuppression: { ideal: true },
    googHighpassFilter: { ideal: true },
    googTypingNoiseDetection: { ideal: true },
    googNoiseReduction: { ideal: true },
  };
}

/**
 * Creates the multi-stage Web Audio API DSP filter chain.
 * Connects: source -> highPass -> notch50 -> notch100 -> lowPass -> presenceBoost -> compressor
 *
 * @param {AudioContext} ctx
 * @param {Object} options
 * @param {boolean} options.enabled
 * @returns {{ input: AudioNode, output: AudioNode, setEnabled: (val: boolean) => void }}
 */
export function createNoiseCancellationChain(ctx, { enabled = true } = {}) {
  // Input routing gain
  const inputNode = ctx.createGain();
  inputNode.gain.value = 1.0;

  // Stage 1: 90Hz High-Pass (cuts low-frequency traffic & motor rumble)
  const highPass = ctx.createBiquadFilter();
  highPass.type = "highpass";
  highPass.frequency.value = 90;
  highPass.Q.value = 0.707;

  // Stage 2: 50Hz Notch (cuts Indian 50Hz AC electricity power line hum)
  const notch50 = ctx.createBiquadFilter();
  notch50.type = "notch";
  notch50.frequency.value = 50;
  notch50.Q.value = 4.0;

  // Stage 3: 100Hz Notch (cuts 100Hz harmonic hum from fluorescent lights & transformers)
  const notch100 = ctx.createBiquadFilter();
  notch100.type = "notch";
  notch100.frequency.value = 100;
  notch100.Q.value = 4.0;

  // Stage 4: 7.5kHz Low-Pass (cuts air rush, fan blade hiss, coil whine)
  const lowPass = ctx.createBiquadFilter();
  lowPass.type = "lowpass";
  lowPass.frequency.value = 7500;
  lowPass.Q.value = 0.707;

  // Stage 5: 2.8kHz Vocal Presence Peaking EQ (boosts speech clarity and vowel definition)
  const presence = ctx.createBiquadFilter();
  presence.type = "peaking";
  presence.frequency.value = 2800;
  presence.Q.value = 1.2;
  presence.gain.value = enabled ? 2.5 : 0;

  // Stage 6: Pre-Gain + Dynamics Compressor (normalizes quiet speech, prevents market shout clipping)
  const preGain = ctx.createGain();
  preGain.gain.value = enabled ? 1.8 : 1.0;

  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = -28;
  compressor.knee.value = 20;
  compressor.ratio.value = 5;
  compressor.attack.value = 0.003;
  compressor.release.value = 0.12;

  // Chain connection
  inputNode.connect(highPass);
  highPass.connect(notch50);
  notch50.connect(notch100);
  notch100.connect(lowPass);
  lowPass.connect(presence);
  presence.connect(preGain);
  preGain.connect(compressor);

  function setEnabled(val) {
    if (val) {
      highPass.frequency.value = 90;
      notch50.Q.value = 4.0;
      notch100.Q.value = 4.0;
      lowPass.frequency.value = 7500;
      presence.gain.value = 2.5;
      preGain.gain.value = 1.8;
      compressor.threshold.value = -28;
      compressor.ratio.value = 5;
    } else {
      highPass.frequency.value = 20; // Passthrough sub-bass
      notch50.Q.value = 0.01;
      notch100.Q.value = 0.01;
      lowPass.frequency.value = 22000; // Full spectrum passthrough
      presence.gain.value = 0;
      preGain.gain.value = 1.0;
      compressor.threshold.value = 0;
      compressor.ratio.value = 1;
    }
  }

  if (!enabled) {
    setEnabled(false);
  }

  return {
    input: inputNode,
    output: compressor,
    setEnabled,
  };
}

/**
 * Real-Time Adaptive Noise Gate for Float32Array PCM Audio Frames.
 * Tracks background noise floor dynamically and attenuates inter-word pauses/noise by ~20dB.
 */
export class AdaptiveNoiseGate {
  constructor({
    enabled = true,
    initialFloor = 0.004,
    minThreshold = 0.007,
    attenuationDb = -22,
    holdMs = 140,
    releaseMs = 80,
  } = {}) {
    this.enabled = enabled;
    this.noiseFloor = initialFloor;
    this.minThreshold = minThreshold;
    this.attenuationLinear = Math.pow(10, attenuationDb / 20); // ~0.079 (-22dB)
    this.holdMs = holdMs;
    this.releaseMs = releaseMs;
    this.currentGain = 1.0;
    this.lastSpeechTime = 0;
    this.isSpeech = false;
  }

  /**
   * Process a single float32 frame in-place or return a cleaned copy.
   *
   * @param {Float32Array} frame
   * @param {number} [currentTimeMs]
   * @returns {{ rms: number, isSpeech: boolean, gain: number }}
   */
  process(frame, currentTimeMs = performance.now()) {
    if (!this.enabled || !frame || frame.length === 0) {
      let sum = 0;
      for (let i = 0; i < frame.length; i += 1) sum += frame[i] * frame[i];
      const rms = Math.sqrt(sum / frame.length);
      return { rms, isSpeech: rms > this.minThreshold, gain: 1.0 };
    }

    let sum = 0;
    for (let i = 0; i < frame.length; i += 1) {
      sum += frame[i] * frame[i];
    }
    const rms = Math.sqrt(sum / frame.length);

    // Adaptive threshold: at least minThreshold, or 2.2x the current noise floor
    const threshold = Math.max(this.minThreshold, this.noiseFloor * 2.2);
    const frameIsSpeech = rms >= threshold;

    if (frameIsSpeech) {
      this.lastSpeechTime = currentTimeMs;
      this.isSpeech = true;
    } else {
      // Leaky update of background noise floor during silence
      this.noiseFloor = this.noiseFloor * 0.95 + rms * 0.05;
      if (currentTimeMs - this.lastSpeechTime > this.holdMs) {
        this.isSpeech = false;
      }
    }

    // Target gain: 1.0 during speech or hold window, attenuated during background noise
    const targetGain = this.isSpeech ? 1.0 : this.attenuationLinear;

    // Smooth gain transition (avoid click/pop artifacts)
    const smoothing = this.isSpeech ? 0.35 : 0.08;
    this.currentGain = this.currentGain + (targetGain - this.currentGain) * smoothing;

    // Apply noise gate attenuation to frame
    if (this.currentGain < 0.98) {
      for (let i = 0; i < frame.length; i += 1) {
        frame[i] *= this.currentGain;
      }
    }

    return {
      rms,
      isSpeech: this.isSpeech,
      gain: this.currentGain,
    };
  }

  setEnabled(val) {
    this.enabled = Boolean(val);
    if (!this.enabled) {
      this.currentGain = 1.0;
    }
  }

  reset() {
    this.noiseFloor = 0.004;
    this.currentGain = 1.0;
    this.lastSpeechTime = 0;
    this.isSpeech = false;
  }
}
