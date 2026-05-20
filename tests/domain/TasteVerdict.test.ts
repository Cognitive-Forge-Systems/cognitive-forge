import {
  TasteVerdict,
  VerdictCategory,
  VERDICT_CATEGORIES,
  isValidTasteVerdict,
} from "../../src/domain/models/TasteVerdict";

describe("TasteVerdict", () => {
  const validScores = {
    clarity: 0.8,
    density: 0.6,
    nonGeneric: 0.9,
    insight: 0.7,
  };

  const validVerdict: TasteVerdict = {
    verdict: "high",
    scores: validScores,
    explanation: "This piece demonstrates exceptional clarity and non-generic insight.",
  };

  describe("VERDICT_CATEGORIES", () => {
    it("should contain all four categories", () => {
      expect(VERDICT_CATEGORIES).toEqual(["high", "medium", "low", "reject"]);
    });
  });

  describe("isValidTasteVerdict", () => {
    it("should return true for a valid verdict with all fields", () => {
      expect(isValidTasteVerdict(validVerdict)).toBe(true);
    });

    it("should accept all valid verdict categories", () => {
      const categories: VerdictCategory[] = ["high", "medium", "low", "reject"];
      for (const verdict of categories) {
        expect(isValidTasteVerdict({ ...validVerdict, verdict })).toBe(true);
      }
    });

    it("should return false for an invalid verdict category", () => {
      expect(
        isValidTasteVerdict({ ...validVerdict, verdict: "excellent" as VerdictCategory })
      ).toBe(false);
    });

    it("should return false if explanation is empty string", () => {
      expect(isValidTasteVerdict({ ...validVerdict, explanation: "" })).toBe(false);
    });

    it("should return false if explanation is not a string", () => {
      expect(
        isValidTasteVerdict({ ...validVerdict, explanation: 42 as unknown as string })
      ).toBe(false);
    });

    it("should return false if scores contain out-of-range values", () => {
      expect(
        isValidTasteVerdict({ ...validVerdict, scores: { ...validScores, clarity: 1.5 } })
      ).toBe(false);
    });

    it("should return false if scores field is missing", () => {
      const { scores: _, ...partial } = validVerdict;
      expect(isValidTasteVerdict(partial as TasteVerdict)).toBe(false);
    });

    it("should return false if verdict field is missing", () => {
      const { verdict: _, ...partial } = validVerdict;
      expect(isValidTasteVerdict(partial as TasteVerdict)).toBe(false);
    });

    it("should return false for null or non-object input", () => {
      expect(isValidTasteVerdict(null as unknown as TasteVerdict)).toBe(false);
      expect(isValidTasteVerdict(undefined as unknown as TasteVerdict)).toBe(false);
    });
  });
});
