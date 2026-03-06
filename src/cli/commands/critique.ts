import * as fs from "node:fs";
import * as path from "node:path";
import { OpenRouterClient } from "../../infrastructure/llm/OpenRouterClient";
import { HarshFeedbackEngine } from "../../application/use-cases/HarshFeedbackEngine";
import { HarshFeedback } from "../../domain/models/HarshFeedback";

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

function formatFeedback(feedback: HarshFeedback): string {
  const sections = [
    formatSection("COUNTER-ARGUMENTS", feedback.counterArguments),
    formatSection("LOGICAL GAPS", feedback.logicalGaps),
    formatSection("RISK EXPOSURE", feedback.riskExposure),
    formatSection("EGO BIASES", feedback.egoBiases),
  ].join("\n\n");

  const verdictBar = "═".repeat(12);
  const verdict = `\n  ${verdictBar} VERDICT ${verdictBar}\n\n  ${feedback.verdict}`;

  return "\n" + sections + "\n" + verdict + "\n";
}

export async function runCritique(filePath: string): Promise<void> {
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

  const client = new OpenRouterClient(apiKey);
  const engine = new HarshFeedbackEngine(client);
  engine.onCompress = () => {
    console.log("\nInput large — compressing context before analysis...");
  };

  try {
    const result = await engine.execute({ content });
    console.log(formatFeedback(result));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Error: ${message}`);
    process.exit(1);
  }
}
