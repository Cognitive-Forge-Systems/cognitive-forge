import { LLMClient } from "../../domain/interfaces/LLMClient";
import { StructuredAnalysis } from "../../domain/models/StructuredAnalysis";
import { CritiqueResult } from "../../domain/models/CritiqueResult";
import { StructuredAnalyzer } from "./StructuredAnalyzer";
import { CRITIQUE_SYSTEM_PROMPT } from "../../domain/engines/CritiquePrompt";

const DEFAULT_MODEL = "openai/gpt-4o";
const DEFAULT_MAX_TOKENS = 1500;

const CRITIQUE_REQUIRED_FIELDS: (keyof CritiqueResult)[] = [
  "weaknesses",
  "gaps",
  "blindSpots",
  "improvedOutput",
];

export interface IterateInput {
  content: string;
  model?: string;
  rounds?: number;
}

export interface IterationResult {
  initial: StructuredAnalysis;
  critique: CritiqueResult;
  refined: StructuredAnalysis;
}

export class IterationEngine {
  private readonly llm: LLMClient;
  private readonly analyzer: StructuredAnalyzer;

  public set onCompress(callback: (() => void) | undefined) {
    this.analyzer.onCompress = callback;
  }

  constructor(llm: LLMClient) {
    this.llm = llm;
    this.analyzer = new StructuredAnalyzer(llm);
  }

  async execute(input: IterateInput): Promise<IterationResult> {
    const model = input.model ?? DEFAULT_MODEL;

    // Round 1: Structured Analysis
    const initial = await this.analyzer.execute({ content: input.content, model });

    // Round 2: Critique
    const critique = await this.critique(initial, model);

    // Round 3: Refined Analysis
    const refined = await this.analyzer.execute({
      content: this.buildRefinementPrompt(initial, critique),
      model,
    });

    return { initial, critique, refined };
  }

  private async critique(analysis: StructuredAnalysis, model: string): Promise<CritiqueResult> {
    const response = await this.llm.complete({
      model,
      messages: [
        { role: "system", content: CRITIQUE_SYSTEM_PROMPT },
        { role: "user", content: analysis.output },
      ],
      temperature: 0.3,
      maxTokens: DEFAULT_MAX_TOKENS,
    });

    return this.parseCritique(response.content);
  }

  private buildRefinementPrompt(initial: StructuredAnalysis, critique: CritiqueResult): string {
    return [
      "Original analysis output:",
      initial.output,
      "",
      "Critique weaknesses:",
      critique.weaknesses.map((w) => `- ${w}`).join("\n"),
      "",
      "Gaps identified:",
      critique.gaps.map((g) => `- ${g}`).join("\n"),
      "",
      "Blind spots:",
      critique.blindSpots.map((b) => `- ${b}`).join("\n"),
      "",
      "Suggested improvement:",
      critique.improvedOutput,
      "",
      "Produce a refined structured analysis that addresses all of the above critique.",
    ].join("\n");
  }

  private parseCritique(raw: string): CritiqueResult {
    const stripped = raw.replace(/^```(?:json)?\s*\n?/m, "").replace(/\n?```\s*$/m, "");

    let parsed: unknown;
    try {
      parsed = JSON.parse(stripped);
    } catch {
      throw new Error("Failed to parse LLM response as CritiqueResult: invalid JSON");
    }

    if (!this.isCritiqueResult(parsed)) {
      throw new Error("Failed to parse LLM response as CritiqueResult: missing required fields");
    }

    return parsed;
  }

  private isCritiqueResult(value: unknown): value is CritiqueResult {
    if (typeof value !== "object" || value === null) return false;
    const obj = value as Record<string, unknown>;

    for (const field of CRITIQUE_REQUIRED_FIELDS) {
      if (!(field in obj)) return false;
    }

    if (!Array.isArray(obj.weaknesses)) return false;
    if (!Array.isArray(obj.gaps)) return false;
    if (!Array.isArray(obj.blindSpots)) return false;
    if (typeof obj.improvedOutput !== "string") return false;

    return true;
  }
}
