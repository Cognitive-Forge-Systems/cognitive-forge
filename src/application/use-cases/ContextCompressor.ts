import { LLMClient } from "../../domain/interfaces/LLMClient";
import { CompressedContext } from "../../domain/models/CompressedContext";
import { COMPRESSION_SYSTEM_PROMPT } from "../../domain/engines/CompressionPrompt";

const DEFAULT_MODEL = "openai/gpt-4o";
const DEFAULT_MAX_TOKENS = 1500;

const REQUIRED_FIELDS: (keyof CompressedContext)[] = [
  "summary",
  "architecture",
  "coreModules",
  "risks",
  "openQuestions",
];

export interface CompressInput {
  content: string;
  model?: string;
}

export class ContextCompressor {
  private readonly llm: LLMClient;

  constructor(llm: LLMClient) {
    this.llm = llm;
  }

  async execute(input: CompressInput): Promise<CompressedContext> {
    const response = await this.llm.complete({
      model: input.model ?? DEFAULT_MODEL,
      messages: [
        { role: "system", content: COMPRESSION_SYSTEM_PROMPT },
        { role: "user", content: input.content },
      ],
      temperature: 0.2,
      maxTokens: DEFAULT_MAX_TOKENS,
    });

    return this.parse(response.content);
  }

  private parse(raw: string): CompressedContext {
    const stripped = raw.replace(/^```(?:json)?\s*\n?/m, "").replace(/\n?```\s*$/m, "");

    let parsed: unknown;
    try {
      parsed = JSON.parse(stripped);
    } catch {
      throw new Error("Failed to parse LLM response as CompressedContext: invalid JSON");
    }

    if (!this.isCompressedContext(parsed)) {
      throw new Error("Failed to parse LLM response as CompressedContext: missing required fields");
    }

    const ctx = parsed as CompressedContext;

    // Recalculate tokenEstimate from actual word count of all text fields
    const allText = [
      ctx.summary,
      ...ctx.architecture,
      ...ctx.coreModules,
      ...ctx.risks,
      ...ctx.openQuestions,
    ].join(" ");
    ctx.tokenEstimate = allText.split(/\s+/).filter(Boolean).length;

    return ctx;
  }

  private isCompressedContext(value: unknown): value is CompressedContext {
    if (typeof value !== "object" || value === null) return false;
    const obj = value as Record<string, unknown>;

    for (const field of REQUIRED_FIELDS) {
      if (!(field in obj)) return false;
    }

    if (typeof obj.summary !== "string") return false;

    const arrayFields: (keyof CompressedContext)[] = ["architecture", "coreModules", "risks", "openQuestions"];
    for (const field of arrayFields) {
      if (!Array.isArray(obj[field])) return false;
    }

    return true;
  }
}
