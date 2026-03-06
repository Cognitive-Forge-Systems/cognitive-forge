import * as fs from "node:fs";
import * as path from "node:path";
import * as readline from "node:readline";
import { OpenRouterClient } from "../../infrastructure/llm/OpenRouterClient";
import { ChatSession } from "../../application/use-cases/ChatSession";
import { CRITIQUE_SYSTEM_PROMPT } from "../../domain/engines/CritiquePrompt";
import { HarshFeedback } from "../../domain/models/HarshFeedback";

const DEFAULT_MAX_TOKENS = 1500;

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

function tryParseHarshFeedback(raw: string): HarshFeedback | null {
  const stripped = raw.replace(/^```(?:json)?\s*\n?/m, "").replace(/\n?```\s*$/m, "");
  try {
    const parsed = JSON.parse(stripped);
    if (
      parsed &&
      Array.isArray(parsed.counterArguments) &&
      Array.isArray(parsed.logicalGaps) &&
      Array.isArray(parsed.riskExposure) &&
      Array.isArray(parsed.egoBiases) &&
      typeof parsed.verdict === "string"
    ) {
      return parsed as HarshFeedback;
    }
  } catch {
    // not JSON — fall through
  }
  return null;
}

function formatHarshFeedback(feedback: HarshFeedback): string {
  const sections = [
    formatSection("COUNTER-ARGUMENTS", feedback.counterArguments),
    formatSection("LOGICAL GAPS", feedback.logicalGaps),
    formatSection("RISK EXPOSURE", feedback.riskExposure),
    formatSection("EGO BIASES", feedback.egoBiases),
  ].join("\n\n");

  const verdictBar = "═".repeat(12);
  const verdict = `\n  ${verdictBar} VERDICT ${verdictBar}\n\n  ${feedback.verdict}`;

  return sections + "\n" + verdict;
}

function printBanner(model: string): void {
  console.log("\nCognitive Forge — Interactive Session");
  console.log(`Model: ${model}`);
  console.log("Type /status for options, /exit to quit.");
  console.log("──────────────────────────────────────\n");
}

function printStatus(session: ChatSession): void {
  console.log("\n  SESSION STATUS");
  console.log("  ──────────────");
  console.log(`  Model:    ${session.model}`);
  console.log(`  Harsh:    ${session.flags.harsh ? "ON" : "OFF"}`);
  console.log(`  Iterate:  ${session.flags.iterate ? "ON" : "OFF"}`);
  console.log(`  Compress: ${session.flags.compress ? "ON" : "OFF"}`);
  console.log(`  Messages: ${session.history.length}`);
  if (session.injectedFiles.length > 0) {
    console.log(`  Files:    ${session.injectedFiles.map((f) => f.name).join(", ")}`);
  } else {
    console.log("  Files:    (none)");
  }
  console.log("");
}

export async function runChat(): Promise<void> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error("Error: OPENROUTER_API_KEY not set");
    process.exit(1);
  }

  const client = new OpenRouterClient(apiKey);
  const session = new ChatSession();

  printBanner(session.model);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const prompt = (): Promise<string> =>
    new Promise((resolve) => rl.question("you → ", resolve));

  let running = true;

  while (running) {
    const input = await prompt();
    const trimmed = input.trim();

    if (!trimmed) continue;

    // Session commands
    if (trimmed.startsWith("/")) {
      const [cmd, ...rest] = trimmed.split(" ");
      const arg = rest.join(" ").trim();

      switch (cmd) {
        case "/exit":
          console.log("\nSession ended.\n");
          running = false;
          continue;

        case "/harsh": {
          const state = session.toggleFlag("harsh");
          console.log(`\nHarsh mode: ${state ? "ON" : "OFF"}\n`);
          continue;
        }

        case "/iterate": {
          const state = session.toggleFlag("iterate");
          console.log(`\nIterate mode: ${state ? "ON" : "OFF"}\n`);
          continue;
        }

        case "/compress": {
          const state = session.toggleFlag("compress");
          console.log(`\nCompress mode: ${state ? "ON" : "OFF"}\n`);
          continue;
        }

        case "/inject": {
          if (!arg) {
            console.log("\nUsage: /inject <file>\n");
            continue;
          }
          const resolved = path.resolve(arg);
          if (!fs.existsSync(resolved)) {
            console.log(`\nFile not found: ${resolved}\n`);
            continue;
          }
          const content = fs.readFileSync(resolved, "utf-8");
          session.injectFile(path.basename(resolved), content);
          console.log(`\nInjected: ${path.basename(resolved)}\n`);
          continue;
        }

        case "/model": {
          if (!arg) {
            console.log(`\nCurrent model: ${session.model}\nUsage: /model <name>\n`);
            continue;
          }
          session.setModel(arg);
          console.log(`\nModel switched to: ${arg}\n`);
          continue;
        }

        case "/status":
          printStatus(session);
          continue;

        case "/clear":
          session.clear();
          console.log("\nHistory cleared. Flags and files preserved.\n");
          continue;

        default:
          console.log(`\nUnknown command: ${cmd}\n`);
          continue;
      }
    }

    // Regular message
    session.addMessage("user", trimmed);

    try {
      const messages = session.buildContext();
      const response = await client.complete({
        model: session.model,
        messages,
        temperature: 0.4,
        maxTokens: DEFAULT_MAX_TOKENS,
      });

      session.addMessage("assistant", response.content);

      if (session.flags.harsh) {
        const parsed = tryParseHarshFeedback(response.content);
        if (parsed) {
          console.log("\n" + formatHarshFeedback(parsed) + "\n");
        } else {
          console.log(`\ncforge → ${response.content}\n`);
        }
      } else {
        console.log(`\ncforge → ${response.content}\n`);
      }

      // If iterate mode is on, run a critique pass
      if (session.flags.iterate) {
        console.log("  [running critique pass...]\n");
        const critiqueResponse = await client.complete({
          model: session.model,
          messages: [
            { role: "system", content: CRITIQUE_SYSTEM_PROMPT },
            { role: "user", content: response.content },
          ],
          temperature: 0.3,
          maxTokens: DEFAULT_MAX_TOKENS,
        });

        session.addMessage("assistant", `[CRITIQUE] ${critiqueResponse.content}`);
        console.log(`  [critique] → ${critiqueResponse.content}\n`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`\nError: ${message}\n`);
    }
  }

  rl.close();
}
