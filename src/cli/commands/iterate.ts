import * as fs from "node:fs";
import * as path from "node:path";
import { OpenRouterClient } from "../../infrastructure/llm/OpenRouterClient";
import { IterationEngine } from "../../application/use-cases/IterationEngine";
import { StructuredAnalysis } from "../../domain/models/StructuredAnalysis";
import { CritiqueResult } from "../../domain/models/CritiqueResult";

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
  return [
    formatSection("INTENT", analysis.intent),
    formatSection("CONSTRAINTS", analysis.constraints),
    formatSection("ASSUMPTIONS", analysis.assumptions),
    formatSection("RISKS", analysis.risks),
    formatSection("OPTIONS", analysis.options),
    formatSection("DECISION LOGIC", analysis.decisionLogic),
    formatSection("OUTPUT", analysis.output),
  ].join("\n\n");
}

function formatCritique(critique: CritiqueResult): string {
  return [
    formatSection("WEAKNESSES", critique.weaknesses),
    formatSection("GAPS", critique.gaps),
    formatSection("BLIND SPOTS", critique.blindSpots),
    formatSection("IMPROVED OUTPUT", critique.improvedOutput),
  ].join("\n\n");
}

function printRoundHeader(round: number, label: string): void {
  console.log(`\n${"═".repeat(50)}`);
  console.log(`  ROUND ${round} — ${label}`);
  console.log(`${"═".repeat(50)}\n`);
}

export async function runIterate(filePath: string): Promise<void> {
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
  const engine = new IterationEngine(client);
  engine.onCompress = () => {
    console.log("\nInput large — compressing context before analysis...");
  };

  try {
    console.log("\nRunning round 1...");
    const result = await engine.execute({ content });

    printRoundHeader(1, "ANALYSIS");
    console.log(formatAnalysis(result.initial));

    console.log("\nRunning round 2...");
    printRoundHeader(2, "CRITIQUE");
    console.log(formatCritique(result.critique));

    console.log("\nRunning round 3...");
    printRoundHeader(3, "REFINED");
    console.log(formatAnalysis(result.refined));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`\nError: ${message}`);
    process.exit(1);
  }
}
