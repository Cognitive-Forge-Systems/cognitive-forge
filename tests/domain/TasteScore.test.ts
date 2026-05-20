import {
  TasteScore,
  isValidTasteScore,
  TASTE_SCORE_DIMENSIONS,
} from "../../src/domain/models/TasteScore";

describe("TasteScore", () => {
  const validScore: TasteScore = {
    clarity: 0.8,
    density: 0.6,
    nonGeneric: 0.9,
    insight: 0.7,
  };

  describe("TASTE_SCORE_DIMENSIONS", () => {
    it("should list all four dimensions", () => {
      expect(TASTE_SCORE_DIMENSIONS).toEqual(["clarity", "density", "nonGeneric", "insight"]);
    });
  });

  describe("isValidTasteScore", () => {
    it("should return true for a valid score with all fields in [0,1]", () => {
      expect(isValidTasteScore(validScore)).toBe(true);
    });

    it("should return true for boundary values 0 and 1", () => {
      const boundary: TasteScore = { clarity: 0, density: 1, nonGeneric: 0, insight: 1 };
      expect(isValidTasteScore(boundary)).toBe(true);
    });

    it("should return false if any field exceeds 1", () => {
      expect(isValidTasteScore({ ...validScore, clarity: 1.1 })).toBe(false);
    });

    it("should return false if any field is below 0", () => {
      expect(isValidTasteScore({ ...validScore, density: -0.1 })).toBe(false);
    });

    it("should return false if a field is NaN", () => {
      expect(isValidTasteScore({ ...validScore, insight: NaN })).toBe(false);
    });

    it("should return false if a required field is missing", () => {
      const { nonGeneric: _, ...partial } = validScore;
      expect(isValidTasteScore(partial as TasteScore)).toBe(false);
    });

    it("should return false for non-object input", () => {
      expect(isValidTasteScore(null as unknown as TasteScore)).toBe(false);
      expect(isValidTasteScore("string" as unknown as TasteScore)).toBe(false);
    });

    it("should return false for non-numeric field values", () => {
      expect(isValidTasteScore({ ...validScore, clarity: "high" as unknown as number })).toBe(false);
    });
  });
});
