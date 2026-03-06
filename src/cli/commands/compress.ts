import * as fs from "node:fs";
import * as path from "node:path";
import { OpenRouterClient } from "../../infrastructure/llm/OpenRouterClient";
import { ContextCompressor } from "../../application/use-cases/ContextCompressor";
import { CompressedContext } from "../../domain/models/CompressedContext";

function formatSection(label: string, content: string | string[]): string {
  const line = "─".repeat(label.length);
  let body: string;

  if (Array.isArray(content)) {
    body = content.length > 0
      ? content.map((item) => `  • ${item}`).join("\n")
      : "  (none)";
  } else {
    body = `  ${content}`;
  }

  return `  ${label}\n  ${line}\n${body}`;
}

function formatCompressed(ctx: CompressedContext): string {
  return [
    formatSection("SUMMARY", ctx.summary),
    formatSection("ARCHITECTURE", ctx.architecture),
    formatSection("CORE MODULES", ctx.coreModules),
    formatSection("RISKS", ctx.risks),
    formatSection("OPEN QUESTIONS", ctx.openQuestions),
  ].join("\n\n");
}

export async function runCompress(filePath: string): Promise<void> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error("Error: OPENROUTER_API_KEY not set");
    process.exit(1);
  }

  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) {
    console.error(`Error: File not found: ${resolved}`);
    process.exit(1);
  }

  const content = fs.readFileSync(resolved, "utf-8");
  const inputWords = content.split(/\s+/).filter(Boolean).length;

  const client = new OpenRouterClient(apiKey);
  const compressor = new ContextCompressor(client);

  try {
    const result = await compressor.execute({ content });
    console.log("\n" + formatCompressed(result));
    console.log(`\n  Compressed ${inputWords} words → ${result.tokenEstimate} words (~${Math.round((1 - result.tokenEstimate / inputWords) * 100)}% reduction)\n`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Error: ${message}`);
    process.exit(1);
  }
}
