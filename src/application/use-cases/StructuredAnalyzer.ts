import { LLMClient } from "../../domain/interfaces/LLMClient";
import { StructuredAnalysis } from "../../domain/models/StructuredAnalysis";

const DEFAULT_MODEL = "openai/gpt-4o";
const DEFAULT_MAX_TOKENS = 1500;

const SYSTEM_PROMPT = `You are a structured analysis engine. You MUST respond with ONLY a valid JSON object matching this exact shape — no prose, no markdown, no explanation:

{
  "intent": "string — what the input is trying to achieve",
  "constraints": ["known limitations or requirements"],
  "assumptions": ["things taken as given"],
  "risks": ["potential failure points"],
  "options": ["possible approaches"],
  "decisionLogic": "reasoning for the recommended path",
  "output": "the final structured recommendation"
}

Respond with ONLY the JSON object. No other text.`;

const REQUIRED_FIELDS: (keyof StructuredAnalysis)[] = [
  "intent",
  "constraints",
  "assumptions",
  "risks",
  "options",
  "decisionLogic",
  "output",
];

export interface AnalyzeInput {
  content: string;
  model?: string;
  maxTokens?: number;
}

export class StructuredAnalyzer {
  private readonly llm: LLMClient;

  constructor(llm: LLMClient) {
    this.llm = llm;
  }

  async execute(input: AnalyzeInput): Promise<StructuredAnalysis> {
    const response = await this.llm.complete({
      model: input.model ?? DEFAULT_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: input.content },
      ],
      temperature: 0.3,
      maxTokens: input.maxTokens ?? DEFAULT_MAX_TOKENS,
    });

    return this.parse(response.content);
  }

  private parse(raw: string): StructuredAnalysis {
    const stripped = raw.replace(/^```(?:json)?\s*\n?/m, "").replace(/\n?```\s*$/m, "");

    let parsed: unknown;
    try {
      parsed = JSON.parse(stripped);
    } catch {
      throw new Error("Failed to parse LLM response as StructuredAnalysis: invalid JSON");
    }

    if (!this.isStructuredAnalysis(parsed)) {
      throw new Error("Failed to parse LLM response as StructuredAnalysis: missing required fields");
    }

    return parsed;
  }

  private isStructuredAnalysis(value: unknown): value is StructuredAnalysis {
    if (typeof value !== "object" || value === null) return false;
    const obj = value as Record<string, unknown>;

    for (const field of REQUIRED_FIELDS) {
      if (!(field in obj)) return false;
    }

    if (typeof obj.intent !== "string") return false;
    if (typeof obj.decisionLogic !== "string") return false;
    if (typeof obj.output !== "string") return false;

    const arrayFields: (keyof StructuredAnalysis)[] = ["constraints", "assumptions", "risks", "options"];
    for (const field of arrayFields) {
      if (!Array.isArray(obj[field])) return false;
    }

    return true;
  }
}
