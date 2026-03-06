import { ContextCompressor } from "../../src/application/use-cases/ContextCompressor";
import { LLMClient, LLMRequest, LLMResponse } from "../../src/domain/interfaces/LLMClient";
import { CompressedContext } from "../../src/domain/models/CompressedContext";

function mockLLMClient(content: string): LLMClient {
  return {
    complete: jest.fn().mockResolvedValue({
      content,
      model: "test-model",
      usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
    } satisfies LLMResponse),
  };
}

const validCompressed: CompressedContext = {
  summary: "A portable reasoning engine for disciplined LLM output. Enforces structure via RCCF. Designed as foundation for Donna AI.",
  architecture: ["Domain Layer", "Application Layer", "Infrastructure Layer", "CLI Layer"],
  coreModules: ["StructuredAnalyzer", "IterationEngine", "OpenRouterClient"],
  risks: ["OpenRouter dependency", "JSON parsing fragility"],
  openQuestions: ["Plugin system design", "Multi-model arbitration strategy"],
  tokenEstimate: 40,
};

describe("ContextCompressor", () => {
  it("should return a parsed CompressedContext from LLM JSON response", async () => {
    const client = mockLLMClient(JSON.stringify(validCompressed));
    const compressor = new ContextCompressor(client);

    const result = await compressor.execute({ content: "A long document about Cognitive Forge..." });

    expect(result).toEqual(validCompressed);
  });

  it("should include a system prompt instructing JSON output matching CompressedContext", async () => {
    const client = mockLLMClient(JSON.stringify(validCompressed));
    const compressor = new ContextCompressor(client);

    await compressor.execute({ content: "test" });

    const call = (client.complete as jest.Mock).mock.calls[0][0] as LLMRequest;
    const systemMsg = call.messages.find((m) => m.role === "system");
    expect(systemMsg).toBeDefined();
    expect(systemMsg!.content).toContain("JSON");
    expect(systemMsg!.content).toContain("summary");
    expect(systemMsg!.content).toContain("architecture");
    expect(systemMsg!.content).toContain("openQuestions");
  });

  it("should recalculate tokenEstimate from actual compressed word count", async () => {
    const withWrongEstimate: CompressedContext = {
      ...validCompressed,
      tokenEstimate: 999,
    };
    const client = mockLLMClient(JSON.stringify(withWrongEstimate));
    const compressor = new ContextCompressor(client);

    const result = await compressor.execute({ content: "test" });

    // tokenEstimate should be recalculated, not trust the LLM's number
    expect(result.tokenEstimate).not.toBe(999);
    expect(result.tokenEstimate).toBeGreaterThan(0);
  });

  it("should throw if LLM response is not valid JSON", async () => {
    const client = mockLLMClient("not json");
    const compressor = new ContextCompressor(client);

    await expect(compressor.execute({ content: "test" })).rejects.toThrow(
      "Failed to parse LLM response as CompressedContext"
    );
  });

  it("should throw if LLM response is missing required fields", async () => {
    const client = mockLLMClient(JSON.stringify({ summary: "partial" }));
    const compressor = new ContextCompressor(client);

    await expect(compressor.execute({ content: "test" })).rejects.toThrow(
      "Failed to parse LLM response as CompressedContext"
    );
  });

  it("should handle JSON wrapped in markdown code fences", async () => {
    const wrapped = "```json\n" + JSON.stringify(validCompressed) + "\n```";
    const client = mockLLMClient(wrapped);
    const compressor = new ContextCompressor(client);

    const result = await compressor.execute({ content: "test" });

    expect(result.summary).toBe(validCompressed.summary);
  });
});
