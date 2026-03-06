import { ChatSession } from "../../src/application/use-cases/ChatSession";
import { CHAT_SYSTEM_PROMPT } from "../../src/domain/engines/ChatPrompt";
import { HARSH_FEEDBACK_SYSTEM_PROMPT } from "../../src/domain/engines/HarshFeedbackPrompt";

describe("ChatSession", () => {
  it("should initialize with default flags all false, empty history, empty injectedFiles", () => {
    const session = new ChatSession();

    expect(session.flags).toEqual({ harsh: false, iterate: false, compress: false });
    expect(session.history).toEqual([]);
    expect(session.injectedFiles).toEqual([]);
    expect(session.model).toBe("openai/gpt-4o");
  });

  it("should toggle a flag and return new state", () => {
    const session = new ChatSession();

    const result1 = session.toggleFlag("harsh");
    expect(result1).toBe(true);
    expect(session.flags.harsh).toBe(true);

    const result2 = session.toggleFlag("harsh");
    expect(result2).toBe(false);
    expect(session.flags.harsh).toBe(false);
  });

  it("should inject a file into injectedFiles array", () => {
    const session = new ChatSession();

    session.injectFile("spec.md", "# Specification\nSome content");

    expect(session.injectedFiles).toHaveLength(1);
    expect(session.injectedFiles[0]).toEqual({
      name: "spec.md",
      content: "# Specification\nSome content",
    });
  });

  it("should add messages to history", () => {
    const session = new ChatSession();

    session.addMessage("user", "Hello");
    session.addMessage("assistant", "Hi there");

    expect(session.history).toHaveLength(2);
    expect(session.history[0]).toEqual({ role: "user", content: "Hello" });
    expect(session.history[1]).toEqual({ role: "assistant", content: "Hi there" });
  });

  it("should build context with system prompt, injected files, and history in order", () => {
    const session = new ChatSession();
    session.injectFile("doc.md", "Document content");
    session.addMessage("user", "Analyze this");
    session.addMessage("assistant", "Here is my analysis");

    const messages = session.buildContext();

    expect(messages[0].role).toBe("system");
    expect(messages[0].content).toContain(CHAT_SYSTEM_PROMPT);
    expect(messages[0].content).toContain("=== INJECTED: doc.md ===");
    expect(messages[0].content).toContain("Document content");
    expect(messages[1]).toEqual({ role: "user", content: "Analyze this" });
    expect(messages[2]).toEqual({ role: "assistant", content: "Here is my analysis" });
  });

  it("should include harsh feedback rules in system prompt when harsh mode is on", () => {
    const session = new ChatSession();
    session.toggleFlag("harsh");

    const messages = session.buildContext();

    expect(messages[0].content).toContain(CHAT_SYSTEM_PROMPT);
    expect(messages[0].content).toContain(HARSH_FEEDBACK_SYSTEM_PROMPT);
  });

  it("should clear history but preserve flags and injectedFiles", () => {
    const session = new ChatSession();
    session.toggleFlag("harsh");
    session.injectFile("doc.md", "content");
    session.addMessage("user", "test");
    session.addMessage("assistant", "response");

    session.clear();

    expect(session.history).toEqual([]);
    expect(session.flags.harsh).toBe(true);
    expect(session.injectedFiles).toHaveLength(1);
  });

  it("should update model on switch", () => {
    const session = new ChatSession();

    session.setModel("anthropic/claude-3-opus");

    expect(session.model).toBe("anthropic/claude-3-opus");
  });
});
