import { IterationEngine } from "../../src/application/use-cases/IterationEngine";
import { LLMClient, LLMRequest, LLMResponse } from "../../src/domain/interfaces/LLMClient";
import { StructuredAnalysis } from "../../src/domain/models/StructuredAnalysis";
import { CritiqueResult } from "../../src/domain/models/CritiqueResult";
import { CRITIQUE_SYSTEM_PROMPT } from "../../src/domain/engines/CritiquePrompt";

const validAnalysis: StructuredAnalysis = {
  intent: "Build a SaaS pricing model",
  constraints: ["Limited budget"],
  assumptions: ["Target market is SMBs"],
  risks: ["Price too low to sustain"],
  options: ["Flat-rate", "Tiered"],
  decisionLogic: "Tiered pricing balances simplicity with growth",
  output: "Recommend a 3-tier model.",
};

const validCritique: CritiqueResult = {
  weaknesses: ["No competitive analysis", "No churn mitigation strategy"],
  gaps: ["Missing unit economics breakdown"],
  blindSpots: ["Assumes SMBs will self-serve without sales support"],
  improvedOutput: "Recommend a 3-tier model with churn mitigation and competitive positioning.",
};

const refinedAnalysis: StructuredAnalysis = {
  intent: "Build a SaaS pricing model with competitive positioning",
  constraints: ["Limited budget", "Must address churn"],
  assumptions: ["Target market is SMBs", "Self-serve with onboarding support"],
  risks: ["Price too low to sustain", "Churn without mitigation"],
  options: ["Flat-rate", "Tiered", "Usage-based hybrid"],
  decisionLogic: "Tiered pricing with churn mitigation and competitive analysis",
  output: "Recommend a 3-tier model with churn mitigation and competitive positioning.",
};

function mockLLMClient(): LLMClient {
  const completeFn = jest.fn();

  // Round 1: StructuredAnalyzer → StructuredAnalysis
  completeFn.mockResolvedValueOnce({
    content: JSON.stringify(validAnalysis),
    model: "test-model",
    usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
  } satisfies LLMResponse);

  // Round 2: Critique → CritiqueResult
  completeFn.mockResolvedValueOnce({
    content: JSON.stringify(validCritique),
    model: "test-model",
    usage: { promptTokens: 15, completionTokens: 25, totalTokens: 40 },
  } satisfies LLMResponse);

  // Round 3: Refined → StructuredAnalysis
  completeFn.mockResolvedValueOnce({
    content: JSON.stringify(refinedAnalysis),
    model: "test-model",
    usage: { promptTokens: 20, completionTokens: 30, totalTokens: 50 },
  } satisfies LLMResponse);

  return { complete: completeFn };
}

describe("IterationEngine", () => {
  it("should execute all 3 rounds in sequence", async () => {
    const client = mockLLMClient();
    const engine = new IterationEngine(client);

    const result = await engine.execute({ content: "Design a SaaS pricing model" });

    expect(client.complete).toHaveBeenCalledTimes(3);
    expect(result.initial).toEqual(validAnalysis);
    expect(result.critique).toEqual(validCritique);
    expect(result.refined).toEqual(refinedAnalysis);
  });

  it("should pass round 1 output as input to the critique round", async () => {
    const client = mockLLMClient();
    const engine = new IterationEngine(client);

    await engine.execute({ content: "Design a SaaS pricing model" });

    const call2 = (client.complete as jest.Mock).mock.calls[1][0] as LLMRequest;
    const userMsg = call2.messages.find((m) => m.role === "user");
    expect(userMsg!.content).toContain(validAnalysis.output);
  });

  it("should pass critique into the refinement round", async () => {
    const client = mockLLMClient();
    const engine = new IterationEngine(client);

    await engine.execute({ content: "Design a SaaS pricing model" });

    const call3 = (client.complete as jest.Mock).mock.calls[2][0] as LLMRequest;
    const userMsg = call3.messages.find((m) => m.role === "user");
    expect(userMsg!.content).toContain(validCritique.improvedOutput);
    expect(userMsg!.content).toContain("No competitive analysis");
  });

  it("should use critique system prompt with anti-flattery instruction", async () => {
    const client = mockLLMClient();
    const engine = new IterationEngine(client);

    await engine.execute({ content: "test" });

    const call2 = (client.complete as jest.Mock).mock.calls[1][0] as LLMRequest;
    const systemMsg = call2.messages.find((m) => m.role === "system");
    expect(systemMsg!.content).toBe(CRITIQUE_SYSTEM_PROMPT);
    expect(systemMsg!.content).toContain("No flattery");
    expect(systemMsg!.content).toContain("No vague agreement");
  });

  it("should return a valid StructuredAnalysis as refined output", async () => {
    const client = mockLLMClient();
    const engine = new IterationEngine(client);

    const result = await engine.execute({ content: "test" });

    expect(result.refined).toHaveProperty("intent");
    expect(result.refined).toHaveProperty("constraints");
    expect(result.refined).toHaveProperty("assumptions");
    expect(result.refined).toHaveProperty("risks");
    expect(result.refined).toHaveProperty("options");
    expect(result.refined).toHaveProperty("decisionLogic");
    expect(result.refined).toHaveProperty("output");
    expect(Array.isArray(result.refined.constraints)).toBe(true);
  });

  it("should allow custom model override", async () => {
    const client = mockLLMClient();
    const engine = new IterationEngine(client);

    await engine.execute({ content: "test", model: "anthropic/claude-3-opus" });

    const calls = (client.complete as jest.Mock).mock.calls;
    for (const call of calls) {
      expect((call[0] as LLMRequest).model).toBe("anthropic/claude-3-opus");
    }
  });

  it("should throw if critique response is invalid JSON", async () => {
    const client: LLMClient = {
      complete: jest.fn()
        .mockResolvedValueOnce({
          content: JSON.stringify(validAnalysis),
          model: "test-model",
          usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
        })
        .mockResolvedValueOnce({
          content: "not valid json",
          model: "test-model",
          usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
        }),
    };
    const engine = new IterationEngine(client);

    await expect(engine.execute({ content: "test" })).rejects.toThrow(
      "Failed to parse LLM response as CritiqueResult"
    );
  });
});
