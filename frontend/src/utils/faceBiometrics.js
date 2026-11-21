/**
 * Client-side Face ID Biometric capture and feature extraction.
 * Analyzes video stream frames to compute a normalized facial descriptor vector
 * and generates a secure biometric template for Face ID registration and verification.
 */

export function isCameraSupported() {
  return typeof navigator !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia);
}

/**
 * Capture frame from video element and extract a normalized 128-element facial descriptor vector.
 */
export function captureFaceBiometrics(videoEl) {
  if (!videoEl || !videoEl.videoWidth || !videoEl.videoHeight) {
    throw new Error("Camera feed is not ready yet. Please ensure your camera is enabled.");
  }

  const width = videoEl.videoWidth;
  const height = videoEl.videoHeight;

  // Center crop region for facial focus (oval zone)
  const cropSize = Math.min(width, height) * 0.75;
  const startX = (width - cropSize) / 2;
  const startY = (height - cropSize) / 2;

  // 1. Offscreen analysis canvas (32x32 luminance grid)
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    throw new Error("2D canvas context not available for facial analysis.");
  }

  // Draw center face crop
  ctx.drawImage(videoEl, startX, startY, cropSize, cropSize, 0, 0, 32, 32);
  const imgData = ctx.getImageData(0, 0, 32, 32);
  const pixels = imgData.data;

  // Compute 32x32 luminance values
  const gray = new Float32Array(1024);
  let mean = 0.0;
  for (let i = 0; i < 1024; i++) {
    const r = pixels[i * 4];
    const g = pixels[i * 4 + 1];
    const b = pixels[i * 4 + 2];
    // Standard perceptual luminance formula
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    gray[i] = lum;
    mean += lum;
  }
  mean /= 1024;

  // Variance & standard deviation for illumination normalization
  let variance = 0.0;
  for (let i = 0; i < 1024; i++) {
    const diff = gray[i] - mean;
    variance += diff * diff;
  }
  const std = Math.sqrt(variance / 1024) + 1e-4;

  // Normalized 128-element biometric vector:
  // - 64 elements: 8x8 spatial block average normalized luminances
  // - 32 elements: horizontal edge contrast gradients
  // - 32 elements: vertical edge contrast gradients
  const descriptor = new Array(128).fill(0);

  // 1. 8x8 block averages (64 elements)
  for (let by = 0; by < 8; by++) {
    for (let bx = 0; bx < 8; bx++) {
      let blockSum = 0.0;
      for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
          const px = (by * 4 + y) * 32 + (bx * 4 + x);
          blockSum += (gray[px] - mean) / std;
        }
      }
      descriptor[by * 8 + bx] = blockSum / 16.0;
    }
  }

  // 2. Horizontal edge contrast (32 elements)
  for (let r = 0; r < 32; r++) {
    let edgeSum = 0.0;
    for (let c = 0; c < 31; c++) {
      const idx = r * 32 + c;
      edgeSum += Math.abs(gray[idx + 1] - gray[idx]);
    }
    descriptor[64 + r] = edgeSum / (31 * std);
  }

  // 3. Vertical edge contrast (32 elements)
  for (let c = 0; c < 32; c++) {
    let edgeSum = 0.0;
    for (let r = 0; r < 31; r++) {
      const idx = r * 32 + c;
      edgeSum += Math.abs(gray[idx + 32] - gray[idx]);
    }
    descriptor[96 + c] = edgeSum / (31 * std);
  }

  // L2-normalize descriptor vector to unit sphere
  let norm = 0.0;
  for (let i = 0; i < 128; i++) {
    norm += descriptor[i] * descriptor[i];
  }
  norm = Math.sqrt(norm) || 1.0;
  for (let i = 0; i < 128; i++) {
    descriptor[i] = Number((descriptor[i] / norm).toFixed(5));
  }

  // 2. Capture compressed JPEG thumbnail photo preview (96x96)
  const photoCanvas = document.createElement("canvas");
  photoCanvas.width = 96;
  photoCanvas.height = 96;
  const photoCtx = photoCanvas.getContext("2d");
  let photoDataUrl = "";
  if (photoCtx) {
    photoCtx.drawImage(videoEl, startX, startY, cropSize, cropSize, 0, 0, 96, 96);
    photoDataUrl = photoCanvas.toDataURL("image/jpeg", 0.65);
  }

  return {
    descriptor,
    photo: photoDataUrl,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Compare two 128-element facial descriptor vectors using Cosine Similarity.
 */
export function compareFaceBiometrics(descA, descB) {
  if (!descA || !descB || !Array.isArray(descA) || !Array.isArray(descB)) {
    return { similarity: 0.0, isMatch: false };
  }
  const len = Math.min(descA.length, descB.length);
  if (len === 0) return { similarity: 0.0, isMatch: false };

  let dot = 0.0;
  let normA = 0.0;
  let normB = 0.0;
  for (let i = 0; i < len; i++) {
    const a = descA[i];
    const b = descB[i];
    dot += a * b;
    normA += a * a;
    normB += b * b;
  }
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);
  if (normA <= 1e-6 || normB <= 1e-6) {
    return { similarity: 0.0, isMatch: false };
  }
  const similarity = Math.max(-1.0, Math.min(1.0, dot / (normA * normB)));
  return {
    similarity: Number(similarity.toFixed(4)),
    isMatch: similarity >= 0.70,
  };
}
