import { TasteScore, isValidTasteScore } from "./TasteScore";

/** Categorical quality verdict for a piece of content. */
export type VerdictCategory = "high" | "medium" | "low" | "reject";

/** Ordered list of all valid verdict categories. */
export const VERDICT_CATEGORIES: VerdictCategory[] = ["high", "medium", "low", "reject"];

/** Full taste verdict combining a categorical label, per-dimension scores, and an explanation. */
export interface TasteVerdict {
  /** Overall categorical quality label. */
  verdict: VerdictCategory;
  /** Per-dimension numeric sub-scores (each in [0, 1]). */
  scores: TasteScore;
  /** Human-readable explanation of the verdict. Must be non-empty. */
  explanation: string;
}

/** Returns true if the value is a valid TasteVerdict with consistent fields. */
export function isValidTasteVerdict(value: TasteVerdict): boolean {
  if (!value || typeof value !== "object") return false;
  if (!(VERDICT_CATEGORIES as string[]).includes(value.verdict)) return false;
  if (!value.scores || !isValidTasteScore(value.scores)) return false;
  if (typeof value.explanation !== "string" || value.explanation.length === 0) return false;
  return true;
}
