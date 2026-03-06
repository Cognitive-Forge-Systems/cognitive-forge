# Cognitive Forge

A portable CLI reasoning engine that enforces structured thinking on top of LLMs.

## What it does

Cognitive Forge transforms raw LLM output into disciplined, structured analysis using the RCCF framework (Reflect → Critique → Construct → Finalize). Instead of prompt → response, it enforces intent → structured analysis → critique → iteration → refined output. No chatbot wrapper — a reasoning engine.

## Commands

### `cforge analyze <file>`

Structured analysis producing a 7-field output: intent, constraints, assumptions, risks, options, decision logic, and final recommendation.

```
cforge analyze spec.md
```

### `cforge iterate <file>`

3-round RCCF loop: Analyze → Critique → Refine. Produces initial analysis, harsh critique (weaknesses, gaps, blind spots), and a refined analysis that addresses the critique.

```
cforge iterate pitch.md
```

### `cforge compress <file>`

Compresses large content into a structured abstraction: summary, architecture, core modules, risks, and open questions. Prints compression ratio.

```
cforge compress docs/architecture.md
```

### `cforge critique <file>`

Harsh feedback engine — no flattery, no mercy. Produces counter-arguments, logical gaps, risk exposure, ego biases, and a blunt verdict.

```
cforge critique pitch.md
```

### `cforge chat`

Interactive reasoning session with persistent context. Supports session commands: `/harsh`, `/iterate`, `/compress`, `/inject <file>`, `/model <name>`, `/status`, `/clear`, `/exit`. Harsh mode formats responses with structured critique output.

```
cforge chat
```

## Architecture

Clean/Onion Architecture — 4 layers:

- **Domain** — Pure logic, models, interfaces. Zero external dependencies.
- **Application** — Use cases (StructuredAnalyzer, IterationEngine, ContextCompressor, HarshFeedbackEngine, ChatSession).
- **Infrastructure** — OpenRouterClient (implements LLMClient interface via native fetch).
- **CLI** — Argument parsing and output formatting. No business logic.

## Setup

```bash
git clone https://github.com/Cognitive-Forge-Systems/cognitive-forge.git
cd cognitive-forge
npm install
npm run build
export OPENROUTER_API_KEY=your_key
node dist/cli/index.js analyze <file>
```

## Auto-compression

`analyze`, `iterate`, and `critique` automatically compress inputs exceeding 2000 words before processing. A notice is printed when compression is triggered.

## Roadmap

- v0.1 ✅ — Scaffold + StructuredAnalyzer + CLI
- v0.2 ✅ — Iteration Engine (RCCF loop)
- v0.3 ✅ — Context Compression
- v0.4 ✅ — Harsh Feedback Engine + `cforge critique`
- v0.5 ✅ — Interactive Chat Mode + `cforge chat`
- v0.6 — Knowledge Gardening
- v1.0 — Plugin system + API + SDK

## License

GPL-3.0-only
