"""Biometric Face ID verification and cosine similarity engine."""

from __future__ import annotations

import json
import math


def parse_face_descriptor(face_data: str | None) -> list[float] | None:
    """Parse a serialized biometric face descriptor vector from JSON or array string."""
    if not face_data or not str(face_data).strip():
        return None
    raw = str(face_data).strip()
    try:
        if raw.startswith("{"):
            obj = json.loads(raw)
            desc = obj.get("descriptor") or obj.get("embedding")
            if isinstance(desc, list) and len(desc) >= 8:
                return [float(x) for x in desc]
        elif raw.startswith("["):
            arr = json.loads(raw)
            if isinstance(arr, list) and len(arr) >= 8:
                return [float(x) for x in arr]
    except Exception:
        pass
    return None


def calculate_cosine_similarity(vec_a: list[float], vec_b: list[float]) -> float:
    """Compute normalized cosine similarity between two high-dimensional facial descriptors."""
    if not vec_a or not vec_b:
        return 0.0
    # Match length by truncating to min length if slightly mismatched
    length = min(len(vec_a), len(vec_b))
    if length == 0:
        return 0.0

    dot = sum(vec_a[i] * vec_b[i] for i in range(length))
    norm_a = math.sqrt(sum(vec_a[i] * vec_a[i] for i in range(length)))
    norm_b = math.sqrt(sum(vec_b[i] * vec_b[i] for i in range(length)))

    if norm_a <= 1e-9 or norm_b <= 1e-9:
        return 0.0

    return max(-1.0, min(1.0, dot / (norm_a * norm_b)))


def verify_face_match(
    stored_face_data: str | None,
    candidate_face_data: str | None,
    threshold: float = 0.70,
) -> tuple[bool, float]:
    """Verify candidate face against enrolled template. Returns (is_match, similarity_score)."""
    if not stored_face_data or not candidate_face_data:
        return False, 0.0

    # Fallback to exact token string match
    if stored_face_data.strip() == candidate_face_data.strip():
        return True, 1.0

    desc_stored = parse_face_descriptor(stored_face_data)
    desc_candidate = parse_face_descriptor(candidate_face_data)

    if not desc_stored or not desc_candidate:
        return False, 0.0

    score = calculate_cosine_similarity(desc_stored, desc_candidate)
    return score >= threshold, round(score, 4)
