# CFORGE_DEV.md — Project Context

## Identity
- **Repo:** Cognitive-Forge-Systems/cognitive-forge
- **Binary:** cforge
- **Purpose:** Portable CLI reasoning engine — enforces structured
  thinking on top of LLMs

## Stack
- TypeScript, Node.js
- Clean/Onion Architecture — Domain → Application → Infrastructure → CLI
- LLM routing via OpenRouter (OpenRouterClient)
- Default model: openai/gpt-4o

## Architecture Rules
- Domain never imports from Infrastructure
- All use cases injected with LLMClient interface
- TDD-first on all domain and application logic
- No direct pushes to main — feature branches + PRs only
- One GitHub issue per Claude Code session
- Conventional commits
- Auto-compress inputs >2000 words before LLM calls

## Existing Modules
- LLMClient — domain interface for all LLM calls
- OpenRouterClient — infrastructure implementation (fetch, no extra libs)
- StructuredAnalyzer — 7-field structured analysis (intent, constraints,
  assumptions, risks, options, decisionLogic, output)
- IterationEngine — 3-round RCCF loop (Analyze → Critique → Refine)
- ContextCompressor — compresses large inputs, auto-triggers >2000 words,
  outputs summary/architecture/coreModules/risks/openQuestions
- HarshFeedbackEngine — Anti-Yes-Man Protocol (counterArguments,
  logicalGaps, riskExposure, egoBiases, verdict)
- ChatSession — interactive REPL with session state, file injection,
  mode toggles, architecture context permanently embedded

## Planned Modules (not yet built)
- TasteCurationEngine — LLM output filter: clarity metric, density
  metric, non-generic filter, insight detection. Goal: high
  signal-to-noise ratio. NOT a content recommendation system.
- ScoringEngine — multi-dimension prompt/output scoring
- KnowledgeGarden — project-scoped decision and assumption storage
- API/SDK layer — expose cforge use cases for programmatic consumption
  by Donna AI and other tools

## CLI Commands
- cforge analyze <file>    — structured 7-field analysis
- cforge iterate <file>    — 3-round RCCF loop
- cforge compress <file>   — context compression with ratio
- cforge critique <file>   — harsh feedback (Anti-Yes-Man)
- cforge chat              — interactive session with context + flags

## Test Coverage
- 46 tests passing across 5 test suites
- Domain and Application layers: full TDD coverage
- Infrastructure: contract tests with mocked HTTP

## Decision Log
- v0.1.0: Clean/Onion Architecture — domain never imports infrastructure
- v0.1.0: OpenRouter for LLM routing — single API, multi-provider
- v0.1.0: maxTokens default 1500 — avoids 402 on free tier
- v0.2.0: RCCF as dual framework — prompt structure + reasoning cycle
- v0.3.0: Auto-compression at >2000 words — prevents context overflow
- v0.4.0: Anti-flattery enforced in prompt — no vague agreement
- v0.5.0: Architecture context permanently in chat system prompt —
  prevents Python problem (LLM recommending wrong stack)

## Open Questions
- TasteCurationEngine: should scoring be numeric (1-10) or categorical?
- ScoringEngine: which dimensions matter most for cforge use cases?
- API layer: REST or SDK-first? What does Donna AI need to consume?

## Relationship to Other Projects
- cforge-dev uses cforge as its reasoning engine
- Donna AI will consume cforge via API/SDK layer (planned v1.0)
