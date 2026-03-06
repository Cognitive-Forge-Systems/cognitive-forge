#!/usr/bin/env node

import { runAnalyze } from "./commands/analyze";

const USAGE = "Usage: cforge analyze <file>";

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
    default:
      console.error(`Unknown command: ${command}\n${USAGE}`);
      process.exit(1);
  }
}

main();
