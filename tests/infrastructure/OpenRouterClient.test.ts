import { OpenRouterClient } from "../../src/infrastructure/llm/OpenRouterClient";
import { LLMRequest } from "../../src/domain/interfaces/LLMClient";

const mockFetch = jest.fn() as jest.MockedFunction<typeof global.fetch>;
global.fetch = mockFetch;

describe("OpenRouterClient", () => {
  const client = new OpenRouterClient("test-api-key");

  const request: LLMRequest = {
    model: "openai/gpt-4",
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: "Hello" },
    ],
    temperature: 0.7,
    maxTokens: 500,
  };

  afterEach(() => {
    mockFetch.mockReset();
  });

  it("should send correctly shaped request to OpenRouter API", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "Hi there!" } }],
        model: "openai/gpt-4",
        usage: {
          prompt_tokens: 20,
          completion_tokens: 5,
          total_tokens: 25,
        },
      }),
    } as Response);

    await client.complete(request);

    expect(mockFetch).toHaveBeenCalledWith(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-api-key",
        },
        body: JSON.stringify({
          model: "openai/gpt-4",
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: "Hello" },
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      }
    );
  });

  it("should map OpenRouter response to LLMResponse", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "Mapped response" } }],
        model: "openai/gpt-4",
        usage: {
          prompt_tokens: 10,
          completion_tokens: 3,
          total_tokens: 13,
        },
      }),
    } as Response);

    const result = await client.complete(request);

    expect(result).toEqual({
      content: "Mapped response",
      model: "openai/gpt-4",
      usage: {
        promptTokens: 10,
        completionTokens: 3,
        totalTokens: 13,
      },
    });
  });

  it("should omit optional fields when not provided", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "OK" } }],
        model: "openai/gpt-4",
        usage: { prompt_tokens: 5, completion_tokens: 1, total_tokens: 6 },
      }),
    } as Response);

    const minimal: LLMRequest = {
      model: "openai/gpt-4",
      messages: [{ role: "user", content: "Hi" }],
    };

    await client.complete(minimal);

    const body = JSON.parse(mockFetch.mock.calls[0][1]!.body as string);
    expect(body.temperature).toBeUndefined();
    expect(body.max_tokens).toBeUndefined();
  });

  it("should throw on non-ok HTTP response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      json: async () => ({ error: { message: "Invalid API key" } }),
    } as Response);

    await expect(client.complete(request)).rejects.toThrow(
      "OpenRouter API error (401): Invalid API key"
    );
  });

  it("should throw on empty choices array", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [],
        model: "openai/gpt-4",
        usage: { prompt_tokens: 5, completion_tokens: 0, total_tokens: 5 },
      }),
    } as Response);

    await expect(client.complete(request)).rejects.toThrow(
      "OpenRouter returned no choices"
    );
  });
});
