import { HarshFeedbackEngine } from "../../src/application/use-cases/HarshFeedbackEngine";
import { LLMClient, LLMRequest, LLMResponse } from "../../src/domain/interfaces/LLMClient";
import { HarshFeedback } from "../../src/domain/models/HarshFeedback";
import { CompressedContext } from "../../src/domain/models/CompressedContext";
import { HARSH_FEEDBACK_SYSTEM_PROMPT } from "../../src/domain/engines/HarshFeedbackPrompt";

function mockLLMClient(content: string): LLMClient {
  return {
    complete: jest.fn().mockResolvedValue({
      content,
      model: "test-model",
      usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
    } satisfies LLMResponse),
  };
}

const validFeedback: HarshFeedback = {
  counterArguments: [
    "The entire premise assumes LLM output is inherently undisciplined — but modern models with good prompting already produce structured output without a wrapper.",
    "No evidence that adding an iteration layer improves output quality vs. simply writing a better prompt.",
  ],
  logicalGaps: [
    "No benchmarks or metrics to prove RCCF produces better results than single-pass generation.",
    "Assumes users will tolerate 3x latency for marginal quality improvement.",
  ],
  riskExposure: [
    "OpenRouter as sole LLM gateway is a single point of failure.",
    "CLI-only interface limits adoption to developers — excludes the business users Donna AI targets.",
  ],
  egoBiases: [
    "Belief that 'structured reasoning' is a unique differentiator — every AI framework claims this.",
    "Assuming the open-source community will adopt a framework with no proven track record.",
  ],
  verdict: "This is an over-engineered prompt wrapper masquerading as a reasoning engine. Until there are benchmarks proving RCCF outperforms single-pass prompting, it is architecture theater — impressive on paper, unproven in practice.",
};

const validCompressed: CompressedContext = {
  summary: "Compressed summary of a large document.",
  architecture: ["Layer A"],
  coreModules: ["Module A"],
  risks: ["Risk A"],
  openQuestions: ["Question A"],
  tokenEstimate: 10,
};

describe("HarshFeedbackEngine", () => {
  it("should return a parsed HarshFeedback with all 5 fields", async () => {
    const client = mockLLMClient(JSON.stringify(validFeedback));
    const engine = new HarshFeedbackEngine(client);

    const result = await engine.execute({ content: "My amazing startup idea" });

    expect(result).toEqual(validFeedback);
    expect(result.counterArguments).toHaveLength(2);
    expect(result.logicalGaps).toHaveLength(2);
    expect(result.riskExposure).toHaveLength(2);
    expect(result.egoBiases).toHaveLength(2);
    expect(typeof result.verdict).toBe("string");
  });

  it("should use system prompt with anti-flattery rules", async () => {
    const client = mockLLMClient(JSON.stringify(validFeedback));
    const engine = new HarshFeedbackEngine(client);

    await engine.execute({ content: "test" });

    const call = (client.complete as jest.Mock).mock.calls[0][0] as LLMRequest;
    const systemMsg = call.messages.find((m) => m.role === "system");
    expect(systemMsg).toBeDefined();
    expect(systemMsg!.content).toBe(HARSH_FEEDBACK_SYSTEM_PROMPT);
    expect(systemMsg!.content).toContain("No flattery");
    expect(systemMsg!.content).toContain("specific and actionable");
  });

  it("should instruct strongest counter-argument first in system prompt", async () => {
    const client = mockLLMClient(JSON.stringify(validFeedback));
    const engine = new HarshFeedbackEngine(client);

    await engine.execute({ content: "test" });

    const call = (client.complete as jest.Mock).mock.calls[0][0] as LLMRequest;
    const systemMsg = call.messages.find((m) => m.role === "system");
    expect(systemMsg!.content).toContain("strongest counter-argument first");
  });

  it("should return a non-empty verdict string", async () => {
    const client = mockLLMClient(JSON.stringify(validFeedback));
    const engine = new HarshFeedbackEngine(client);

    const result = await engine.execute({ content: "test" });

    expect(result.verdict.length).toBeGreaterThan(0);
  });

  it("should throw if LLM response is not valid JSON", async () => {
    const client = mockLLMClient("This is not JSON");
    const engine = new HarshFeedbackEngine(client);

    await expect(engine.execute({ content: "test" })).rejects.toThrow(
      "Failed to parse LLM response as HarshFeedback"
    );
  });

  it("should throw if LLM response is missing required fields", async () => {
    const client = mockLLMClient(JSON.stringify({ verdict: "incomplete" }));
    const engine = new HarshFeedbackEngine(client);

    await expect(engine.execute({ content: "test" })).rejects.toThrow(
      "Failed to parse LLM response as HarshFeedback"
    );
  });

  it("should auto-compress when content exceeds 2000 words", async () => {
    const longContent = Array(2100).fill("word").join(" ");
    const client: LLMClient = {
      complete: jest.fn()
        // Call 1: compression
        .mockResolvedValueOnce({
          content: JSON.stringify(validCompressed),
          model: "test-model",
          usage: { promptTokens: 50, completionTokens: 30, totalTokens: 80 },
        } satisfies LLMResponse)
        // Call 2: harsh feedback on compressed content
        .mockResolvedValueOnce({
          content: JSON.stringify(validFeedback),
          model: "test-model",
          usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
        } satisfies LLMResponse),
    };
    const engine = new HarshFeedbackEngine(client);

    await engine.execute({ content: longContent });

    expect(client.complete).toHaveBeenCalledTimes(2);
    // Second call should use compressed summary
    const feedbackCall = (client.complete as jest.Mock).mock.calls[1][0] as LLMRequest;
    const userMsg = feedbackCall.messages.find((m) => m.role === "user");
    expect(userMsg!.content).toContain(validCompressed.summary);
  });

  it("should NOT compress when content is under 2000 words", async () => {
    const client = mockLLMClient(JSON.stringify(validFeedback));
    const engine = new HarshFeedbackEngine(client);

    await engine.execute({ content: "Short content under threshold" });

    expect(client.complete).toHaveBeenCalledTimes(1);
  });
});
