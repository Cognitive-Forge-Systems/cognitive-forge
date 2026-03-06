import { StructuredAnalyzer } from "../../src/application/use-cases/StructuredAnalyzer";
import { IterationEngine } from "../../src/application/use-cases/IterationEngine";
import { LLMClient, LLMRequest, LLMResponse } from "../../src/domain/interfaces/LLMClient";
import { StructuredAnalysis } from "../../src/domain/models/StructuredAnalysis";
import { CompressedContext } from "../../src/domain/models/CompressedContext";
import { CritiqueResult } from "../../src/domain/models/CritiqueResult";

const validAnalysis: StructuredAnalysis = {
  intent: "Test intent",
  constraints: ["c1"],
  assumptions: ["a1"],
  risks: ["r1"],
  options: ["o1"],
  decisionLogic: "logic",
  output: "output",
};

const validCompressed: CompressedContext = {
  summary: "Compressed summary of the large document.",
  architecture: ["Layer A"],
  coreModules: ["Module A"],
  risks: ["Risk A"],
  openQuestions: ["Question A"],
  tokenEstimate: 10,
};

const validCritique: CritiqueResult = {
  weaknesses: ["w1"],
  gaps: ["g1"],
  blindSpots: ["b1"],
  improvedOutput: "improved",
};

function makeShortContent(): string {
  return "This is a short document with fewer than 2000 words.";
}

function makeLongContent(): string {
  // Generate content exceeding 2000 words
  return Array(2100).fill("word").join(" ");
}

describe("Auto-compression in StructuredAnalyzer", () => {
  it("should NOT compress when content is under 2000 words", async () => {
    const client: LLMClient = {
      complete: jest.fn().mockResolvedValue({
        content: JSON.stringify(validAnalysis),
        model: "test-model",
        usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
      } satisfies LLMResponse),
    };
    const analyzer = new StructuredAnalyzer(client);

    await analyzer.execute({ content: makeShortContent() });

    // Only 1 call — analysis directly, no compression
    expect(client.complete).toHaveBeenCalledTimes(1);
  });

  it("should auto-compress when content exceeds 2000 words", async () => {
    const client: LLMClient = {
      complete: jest.fn()
        // Call 1: compression
        .mockResolvedValueOnce({
          content: JSON.stringify(validCompressed),
          model: "test-model",
          usage: { promptTokens: 50, completionTokens: 30, totalTokens: 80 },
        } satisfies LLMResponse)
        // Call 2: analysis on compressed content
        .mockResolvedValueOnce({
          content: JSON.stringify(validAnalysis),
          model: "test-model",
          usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
        } satisfies LLMResponse),
    };
    const analyzer = new StructuredAnalyzer(client);

    await analyzer.execute({ content: makeLongContent() });

    // 2 calls: compress then analyze
    expect(client.complete).toHaveBeenCalledTimes(2);

    // The analysis call should use compressed summary, not the raw 2100-word input
    const analysisCall = (client.complete as jest.Mock).mock.calls[1][0] as LLMRequest;
    const userMsg = analysisCall.messages.find((m) => m.role === "user");
    expect(userMsg!.content).toContain(validCompressed.summary);
  });
});

describe("Auto-compression in IterationEngine", () => {
  it("should NOT compress when content is under 2000 words", async () => {
    const client: LLMClient = {
      complete: jest.fn()
        .mockResolvedValueOnce({
          content: JSON.stringify(validAnalysis),
          model: "test-model",
          usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
        } satisfies LLMResponse)
        .mockResolvedValueOnce({
          content: JSON.stringify(validCritique),
          model: "test-model",
          usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
        } satisfies LLMResponse)
        .mockResolvedValueOnce({
          content: JSON.stringify(validAnalysis),
          model: "test-model",
          usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
        } satisfies LLMResponse),
    };
    const engine = new IterationEngine(client);

    await engine.execute({ content: makeShortContent() });

    // 3 calls: analyze, critique, refine — no compression
    expect(client.complete).toHaveBeenCalledTimes(3);
  });

  it("should auto-compress when content exceeds 2000 words", async () => {
    const client: LLMClient = {
      complete: jest.fn()
        // Call 1: compression
        .mockResolvedValueOnce({
          content: JSON.stringify(validCompressed),
          model: "test-model",
          usage: { promptTokens: 50, completionTokens: 30, totalTokens: 80 },
        } satisfies LLMResponse)
        // Call 2: analysis on compressed content
        .mockResolvedValueOnce({
          content: JSON.stringify(validAnalysis),
          model: "test-model",
          usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
        } satisfies LLMResponse)
        // Call 3: critique
        .mockResolvedValueOnce({
          content: JSON.stringify(validCritique),
          model: "test-model",
          usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
        } satisfies LLMResponse)
        // Call 4: refined analysis
        .mockResolvedValueOnce({
          content: JSON.stringify(validAnalysis),
          model: "test-model",
          usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
        } satisfies LLMResponse),
    };
    const engine = new IterationEngine(client);

    await engine.execute({ content: makeLongContent() });

    // 4 calls: compress, analyze, critique, refine
    expect(client.complete).toHaveBeenCalledTimes(4);
  });
});
