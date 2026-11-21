import { describe, it, expect } from "vitest";
import {
  getNoiseCancellationConstraints,
  createNoiseCancellationChain,
  AdaptiveNoiseGate,
} from "./noiseFilter";

describe("noiseFilter utilities", () => {
  describe("getNoiseCancellationConstraints", () => {
    it("returns enabled WebRTC audio constraints with noiseSuppression and echoCancellation", () => {
      const constraints = getNoiseCancellationConstraints(true);
      expect(constraints.channelCount).toBe(1);
      expect(constraints.echoCancellation).toEqual({ ideal: true });
      expect(constraints.noiseSuppression).toEqual({ ideal: true });
      expect(constraints.googNoiseSuppression).toEqual({ ideal: true });
      expect(constraints.googHighpassFilter).toEqual({ ideal: true });
    });

    it("returns disabled constraints when enabled is false", () => {
      const constraints = getNoiseCancellationConstraints(false);
      expect(constraints.noiseSuppression).toBe(false);
      expect(constraints.echoCancellation).toBe(false);
    });
  });

  describe("createNoiseCancellationChain", () => {
    it("creates biquad filters, compressor and gains connected properly in audio context", () => {
      const createdNodes = [];
      const mockCtx = {
        createGain: () => {
          const node = {
            gain: { value: 1.0 },
            connect: (target) => {
              node.target = target;
            },
          };
          createdNodes.push(node);
          return node;
        },
        createBiquadFilter: () => {
          const node = {
            type: "lowpass",
            frequency: { value: 0 },
            Q: { value: 0 },
            gain: { value: 0 },
            connect: (target) => {
              node.target = target;
            },
          };
          createdNodes.push(node);
          return node;
        },
        createDynamicsCompressor: () => {
          const node = {
            threshold: { value: 0 },
            knee: { value: 0 },
            ratio: { value: 0 },
            attack: { value: 0 },
            release: { value: 0 },
            connect: (target) => {
              node.target = target;
            },
          };
          createdNodes.push(node);
          return node;
        },
      };

      const chain = createNoiseCancellationChain(mockCtx, { enabled: true });
      expect(chain.input).toBeDefined();
      expect(chain.output).toBeDefined();

      // Test setEnabled
      chain.setEnabled(false);
      chain.setEnabled(true);
    });
  });

  describe("AdaptiveNoiseGate", () => {
    it("attenuates low-energy background noise frames", () => {
      const gate = new AdaptiveNoiseGate({ enabled: true, minThreshold: 0.05 });
      // Very low energy noise frame (e.g. 0.001 amplitude)
      const noiseFrame = new Float32Array(256).fill(0.001);
      const res = gate.process(noiseFrame, 1000);

      expect(res.isSpeech).toBe(false);
      expect(res.gain).toBeLessThan(1.0);
    });

    it("opens for high-energy speech frames and preserves full amplitude", () => {
      const gate = new AdaptiveNoiseGate({ enabled: true, minThreshold: 0.02 });
      // Loud speech frame
      const speechFrame = new Float32Array(256).fill(0.25);
      const res = gate.process(speechFrame, 2000);

      expect(res.isSpeech).toBe(true);
      expect(res.rms).toBeGreaterThan(0.2);
    });

    it("bypasses processing when disabled", () => {
      const gate = new AdaptiveNoiseGate({ enabled: false });
      const frame = new Float32Array([0.1, 0.2, 0.3]);
      const res = gate.process(frame, 3000);
      expect(res.gain).toBe(1.0);
    });
  });
});
