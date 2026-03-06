import { LLMClient } from "../../domain/interfaces/LLMClient";
import { HarshFeedback } from "../../domain/models/HarshFeedback";
import { ContextCompressor } from "./ContextCompressor";
import { HARSH_FEEDBACK_SYSTEM_PROMPT } from "../../domain/engines/HarshFeedbackPrompt";

const DEFAULT_MODEL = "openai/gpt-4o";
const DEFAULT_MAX_TOKENS = 1500;
const AUTO_COMPRESS_THRESHOLD = 2000;

const REQUIRED_FIELDS: (keyof HarshFeedback)[] = [
  "counterArguments",
  "logicalGaps",
  "riskExposure",
  "egoBiases",
  "verdict",
];

export interface HarshFeedbackInput {
  content: string;
  model?: string;
}

export class HarshFeedbackEngine {
  private readonly llm: LLMClient;
  private readonly compressor: ContextCompressor;
  public onCompress?: () => void;

  constructor(llm: LLMClient) {
    this.llm = llm;
    this.compressor = new ContextCompressor(llm);
  }

  async execute(input: HarshFeedbackInput): Promise<HarshFeedback> {
    let content = input.content;

    const wordCount = content.split(/\s+/).filter(Boolean).length;
    if (wordCount > AUTO_COMPRESS_THRESHOLD) {
      this.onCompress?.();
      const compressed = await this.compressor.execute({
        content,
        model: input.model,
      });
      content = compressed.summary;
    }

    const response = await this.llm.complete({
      model: input.model ?? DEFAULT_MODEL,
      messages: [
        { role: "system", content: HARSH_FEEDBACK_SYSTEM_PROMPT },
        { role: "user", content },
      ],
      temperature: 0.3,
      maxTokens: DEFAULT_MAX_TOKENS,
    });

    return this.parse(response.content);
  }

  private parse(raw: string): HarshFeedback {
    const stripped = raw.replace(/^```(?:json)?\s*\n?/m, "").replace(/\n?```\s*$/m, "");

    let parsed: unknown;
    try {
      parsed = JSON.parse(stripped);
    } catch {
      throw new Error("Failed to parse LLM response as HarshFeedback: invalid JSON");
    }

    if (!this.isHarshFeedback(parsed)) {
      throw new Error("Failed to parse LLM response as HarshFeedback: missing required fields");
    }

    return parsed;
  }

  private isHarshFeedback(value: unknown): value is HarshFeedback {
    if (typeof value !== "object" || value === null) return false;
    const obj = value as Record<string, unknown>;

    for (const field of REQUIRED_FIELDS) {
      if (!(field in obj)) return false;
    }

    const arrayFields: (keyof HarshFeedback)[] = ["counterArguments", "logicalGaps", "riskExposure", "egoBiases"];
    for (const field of arrayFields) {
      if (!Array.isArray(obj[field])) return false;
    }

    if (typeof obj.verdict !== "string") return false;

    return true;
  }
}
