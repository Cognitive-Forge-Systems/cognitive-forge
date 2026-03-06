#!/usr/bin/env node

import { runAnalyze } from "./commands/analyze";
import { runIterate } from "./commands/iterate";
import { runCompress } from "./commands/compress";

const USAGE = "Usage: cforge <command> <file>\n\nCommands:\n  analyze    Structured analysis of a file\n  iterate    Analyze → Critique → Refine\n  compress   Compress large content into structured abstraction";

async function main(): Promise<void> {
  const [command, ...args] = process.argv.slice(2);

  if (!command) {
    console.log(USAGE);
    process.exit(0);
  }

  switch (command) {
    case "analyze": {
      const file = args[0];
      if (!file) {
        console.error("Error: No file provided.\n" + USAGE);
        process.exit(1);
      }
      await runAnalyze(file);
      break;
    }
    case "iterate": {
      const file = args[0];
      if (!file) {
        console.error("Error: No file provided.\n" + USAGE);
        process.exit(1);
      }
      await runIterate(file);
      break;
    }
    case "compress": {
      const file = args[0];
      if (!file) {
        console.error("Error: No file provided.\n" + USAGE);
        process.exit(1);
      }
      await runCompress(file);
      break;
    }
    default:
      console.error(`Unknown command: ${command}\n${USAGE}`);
      process.exit(1);
  }
}

main();
