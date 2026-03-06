import { StructuredAnalyzer } from "../../src/application/use-cases/StructuredAnalyzer";
import { LLMClient, LLMRequest, LLMResponse } from "../../src/domain/interfaces/LLMClient";
import { StructuredAnalysis } from "../../src/domain/models/StructuredAnalysis";

function mockLLMClient(content: string): LLMClient {
  return {
    complete: jest.fn().mockResolvedValue({
      content,
      model: "test-model",
      usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
    } satisfies LLMResponse),
  };
}

const validAnalysis: StructuredAnalysis = {
  intent: "Build a SaaS pricing model",
  constraints: ["Limited budget", "Must launch in Q2"],
  assumptions: ["Target market is SMBs", "Freemium drives adoption"],
  risks: ["Price too low to sustain", "Churn in first 90 days"],
  options: ["Flat-rate", "Usage-based", "Tiered"],
  decisionLogic: "Tiered pricing balances simplicity with growth capture",
  output: "Recommend a 3-tier model: Free, Pro ($29/mo), Enterprise (custom).",
};

describe("StructuredAnalyzer", () => {
  it("should return a parsed StructuredAnalysis from LLM JSON response", async () => {
    const client = mockLLMClient(JSON.stringify(validAnalysis));
    const analyzer = new StructuredAnalyzer(client);

    const result = await analyzer.execute({ content: "Design a SaaS pricing model" });

    expect(result).toEqual(validAnalysis);
  });

  it("should inject content into the user message", async () => {
    const client = mockLLMClient(JSON.stringify(validAnalysis));
    const analyzer = new StructuredAnalyzer(client);

    await analyzer.execute({ content: "Analyze this idea" });

    const call = (client.complete as jest.Mock).mock.calls[0][0] as LLMRequest;
    expect(call.messages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ role: "user", content: expect.stringContaining("Analyze this idea") }),
      ])
    );
  });

  it("should use the provided model or fall back to default", async () => {
    const client = mockLLMClient(JSON.stringify(validAnalysis));
    const analyzer = new StructuredAnalyzer(client);

    await analyzer.execute({ content: "test", model: "anthropic/claude-3-opus" });
    const call1 = (client.complete as jest.Mock).mock.calls[0][0] as LLMRequest;
    expect(call1.model).toBe("anthropic/claude-3-opus");

    (client.complete as jest.Mock).mockClear();

    await analyzer.execute({ content: "test" });
    const call2 = (client.complete as jest.Mock).mock.calls[0][0] as LLMRequest;
    expect(call2.model).toBe("openai/gpt-4o");
  });

  it("should use default maxTokens of 1500 or allow override", async () => {
    const client = mockLLMClient(JSON.stringify(validAnalysis));
    const analyzer = new StructuredAnalyzer(client);

    await analyzer.execute({ content: "test" });
    const call1 = (client.complete as jest.Mock).mock.calls[0][0] as LLMRequest;
    expect(call1.maxTokens).toBe(1500);

    (client.complete as jest.Mock).mockClear();

    await analyzer.execute({ content: "test", maxTokens: 3000 });
    const call2 = (client.complete as jest.Mock).mock.calls[0][0] as LLMRequest;
    expect(call2.maxTokens).toBe(3000);
  });

  it("should throw if LLM response is not valid JSON", async () => {
    const client = mockLLMClient("This is not JSON at all");
    const analyzer = new StructuredAnalyzer(client);

    await expect(analyzer.execute({ content: "test" })).rejects.toThrow(
      "Failed to parse LLM response as StructuredAnalysis"
    );
  });

  it("should throw if LLM response JSON is missing required fields", async () => {
    const client = mockLLMClient(JSON.stringify({ intent: "partial" }));
    const analyzer = new StructuredAnalyzer(client);

    await expect(analyzer.execute({ content: "test" })).rejects.toThrow(
      "Failed to parse LLM response as StructuredAnalysis"
    );
  });

  it("should handle JSON wrapped in markdown code fences", async () => {
    const wrapped = "```json\n" + JSON.stringify(validAnalysis) + "\n```";
    const client = mockLLMClient(wrapped);
    const analyzer = new StructuredAnalyzer(client);

    const result = await analyzer.execute({ content: "test" });

    expect(result).toEqual(validAnalysis);
  });

  it("should include a system prompt enforcing JSON-only output", async () => {
    const client = mockLLMClient(JSON.stringify(validAnalysis));
    const analyzer = new StructuredAnalyzer(client);

    await analyzer.execute({ content: "test" });

    const call = (client.complete as jest.Mock).mock.calls[0][0] as LLMRequest;
    const systemMsg = call.messages.find((m) => m.role === "system");
    expect(systemMsg).toBeDefined();
    expect(systemMsg!.content).toContain("JSON");
  });
});
