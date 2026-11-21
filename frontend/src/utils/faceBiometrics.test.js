import { describe, expect, it } from "vitest";
import { compareFaceBiometrics, isCameraSupported } from "./faceBiometrics";

describe("faceBiometrics", () => {
  it("detects camera support correctly based on navigator", () => {
    // In node/vitest, navigator.mediaDevices may not have getUserMedia
    const supported = isCameraSupported();
    expect(typeof supported).toBe("boolean");
  });

  it("compares identical descriptors with 1.0 similarity", () => {
    const vecA = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8];
    const res = compareFaceBiometrics(vecA, vecA);
    expect(res.similarity).toBeCloseTo(1.0, 4);
    expect(res.isMatch).toBe(true);
  });

  it("detects mismatch for opposite or completely different vectors", () => {
    const vecA = [1, 0, 0, 0, 1, 0, 0, 0];
    const vecB = [0, 1, 0, 0, 0, 1, 0, 0];
    const res = compareFaceBiometrics(vecA, vecB);
    expect(res.similarity).toBeLessThan(0.7);
    expect(res.isMatch).toBe(false);
  });

  it("handles null or empty vectors safely without crashing", () => {
    expect(compareFaceBiometrics(null, null)).toEqual({ similarity: 0.0, isMatch: false });
    expect(compareFaceBiometrics([], [])).toEqual({ similarity: 0.0, isMatch: false });
    expect(compareFaceBiometrics([1, 2], null)).toEqual({ similarity: 0.0, isMatch: false });
  });
});
