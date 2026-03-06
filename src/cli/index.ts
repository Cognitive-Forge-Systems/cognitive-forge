#!/usr/bin/env node

import { runAnalyze } from "./commands/analyze";
import { runIterate } from "./commands/iterate";
import { runCompress } from "./commands/compress";
import { runCritique } from "./commands/critique";
import { runChat } from "./commands/chat";

const USAGE = "Usage: cforge <command> [file]\n\nCommands:\n  analyze <file>   Structured analysis of a file\n  iterate <file>   Analyze → Critique → Refine\n  compress <file>  Compress large content into structured abstraction\n  critique <file>  Harsh feedback — no flattery, no mercy\n  chat             Interactive reasoning session";

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
    case "critique": {
      const file = args[0];
      if (!file) {
        console.error("Error: No file provided.\n" + USAGE);
        process.exit(1);
      }
      await runCritique(file);
      break;
    }
    case "chat": {
      await runChat();
      break;
    }
    default:
      console.error(`Unknown command: ${command}\n${USAGE}`);
      process.exit(1);
  }
}

main();
