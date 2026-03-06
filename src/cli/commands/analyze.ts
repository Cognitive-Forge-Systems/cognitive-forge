import * as fs from "node:fs";
import * as path from "node:path";
import { OpenRouterClient } from "../../infrastructure/llm/OpenRouterClient";
import { StructuredAnalyzer } from "../../application/use-cases/StructuredAnalyzer";
import { StructuredAnalysis } from "../../domain/models/StructuredAnalysis";

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

function formatAnalysis(analysis: StructuredAnalysis): string {
  const sections = [
    formatSection("INTENT", analysis.intent),
    formatSection("CONSTRAINTS", analysis.constraints),
    formatSection("ASSUMPTIONS", analysis.assumptions),
    formatSection("RISKS", analysis.risks),
    formatSection("OPTIONS", analysis.options),
    formatSection("DECISION LOGIC", analysis.decisionLogic),
    formatSection("OUTPUT", analysis.output),
  ];

  return "\n" + sections.join("\n\n") + "\n";
}

export async function runAnalyze(filePath: string): Promise<void> {
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
  const analyzer = new StructuredAnalyzer(client);

  try {
    const result = await analyzer.execute({ content });
    console.log(formatAnalysis(result));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Error: ${message}`);
    process.exit(1);
  }
}
