/** Per-dimension taste score. Each field is a float in [0, 1]. */
export interface TasteScore {
  /** How clearly the idea or content is communicated. */
  clarity: number;
  /** Information density — how much substance per unit of text. */
  density: number;
  /** Degree to which the content avoids generic, clichéd thinking. */
  nonGeneric: number;
  /** Depth of insight or novel perspective offered. */
  insight: number;
}

/** Ordered list of all score dimensions for iteration. */
export const TASTE_SCORE_DIMENSIONS: (keyof TasteScore)[] = [
  "clarity",
  "density",
  "nonGeneric",
  "insight",
];

/** Returns true if the value is a TasteScore with all dimensions in [0, 1]. */
export function isValidTasteScore(value: TasteScore): boolean {
  if (!value || typeof value !== "object") return false;
  for (const dim of TASTE_SCORE_DIMENSIONS) {
    const v = value[dim];
    if (typeof v !== "number" || isNaN(v) || v < 0 || v > 1) return false;
  }
  return true;
}
