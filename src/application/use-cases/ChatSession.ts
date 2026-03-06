import { LLMMessage } from "../../domain/interfaces/LLMClient";
import { CHAT_SYSTEM_PROMPT } from "../../domain/engines/ChatPrompt";
import { HARSH_FEEDBACK_SYSTEM_PROMPT } from "../../domain/engines/HarshFeedbackPrompt";

const DEFAULT_MODEL = "openai/gpt-4o";

export interface ChatFlags {
  harsh: boolean;
  iterate: boolean;
  compress: boolean;
}

export interface InjectedFile {
  name: string;
  content: string;
}

export class ChatSession {
  public flags: ChatFlags;
  public history: LLMMessage[];
  public injectedFiles: InjectedFile[];
  public model: string;

  constructor() {
    this.flags = { harsh: false, iterate: false, compress: false };
    this.history = [];
    this.injectedFiles = [];
    this.model = DEFAULT_MODEL;
  }

  toggleFlag(flag: keyof ChatFlags): boolean {
    this.flags[flag] = !this.flags[flag];
    return this.flags[flag];
  }

  injectFile(name: string, content: string): void {
    this.injectedFiles.push({ name, content });
  }

  addMessage(role: "user" | "assistant", content: string): void {
    this.history.push({ role, content });
  }

  setModel(model: string): void {
    this.model = model;
  }

  clear(): void {
    this.history = [];
  }

  buildContext(): LLMMessage[] {
    let systemContent = CHAT_SYSTEM_PROMPT;

    if (this.flags.harsh) {
      systemContent += "\n\n" + HARSH_FEEDBACK_SYSTEM_PROMPT;
    }

    if (this.injectedFiles.length > 0) {
      const fileBlocks = this.injectedFiles
        .map((f) => `=== INJECTED: ${f.name} ===\n${f.content}`)
        .join("\n\n");
      systemContent += "\n\n" + fileBlocks;
    }

    return [
      { role: "system", content: systemContent },
      ...this.history,
    ];
  }
}
