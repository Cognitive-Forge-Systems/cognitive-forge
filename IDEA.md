# IDEA.md

# Cognitive Forge Core

*A Portable AI Reasoning Engine & Discipline Framework*

---

# 1. Vision

## What Cognitive Forge Is

Cognitive Forge is a **portable reasoning engine** that exposes a CLI interface for disciplined, structured thinking using LLMs.

It is not:

* a chatbot wrapper
* a prompt collection
* a workflow hack

It is:

> A Cognitive Operating Layer for developers, builders, and AI systems.

It enforces structured reasoning, iteration, and output discipline through a modular architecture built on Clean Architecture and Onion Architecture principles.

It is designed to:

* Run locally
* Integrate with OpenRouter
* Expose a CLI
* Be reusable by higher-order tools (e.g., cforge-dev)
* Become the foundation of future systems like Donna AI

---

# 2. Core Philosophy

## Working Theory

Raw LLM output is stochastic and undisciplined.
Cognitive Forge introduces:

* Structure
* Iteration
* Scoring
* Compression
* Critique
* Taste filtering
* Knowledge gardening

It transforms:

```
Prompt → Response
```

Into:

```
Intent → Structured Analysis → Output → Critique → Iteration → Scoring → Refined Output
```

---

## Meta-Level Goal

Cognitive Forge is a **Skill Engine**.

It develops:

* reasoning clarity
* taste refinement
* structured thought
* iterative quality improvement
* resistance to hallucination and flattery

---

# 3. Architectural Style

## Onion Architecture + Clean Architecture

```
Outer Layer (CLI / API)
Application Layer
Domain Layer
Infrastructure Layer
```

### Rules

* Domain must not depend on infrastructure.
* Infrastructure implements interfaces.
* Application orchestrates use cases.
* Outer layer handles IO only.
* All business logic is testable (TDD-first).

---

# 4. Layer Breakdown

## 4.1 Domain Layer (Pure Logic)

No OpenRouter. No filesystem. No side effects.

### Core Engines

* Reasoning Engine
* RCCF Framework (Reflect → Critique → Construct → Finalize)
* Structured Analyzer
* Harsh Feedback Engine (Anti-Yes-Man Protocol)
* Taste Curation Engine
* Master Prompt System
* Output Iteration Engine
* Context Compression System
* Skill Engine
* Learning Mode Engine
* Knowledge Gardening Model

### RCCF

Formalizes disciplined reasoning:

1. Reflect — understand intent and constraints
2. Critique — identify weaknesses and risks
3. Construct — build improved solution
4. Finalize — produce structured output

### Structured Analyzer

Forces responses into:

* Intent
* Constraints
* Assumptions
* Risks
* Options
* Decision Logic
* Final Output

---

## 4.2 Application Layer (Use Cases)

Orchestrates domain logic.

### Use Cases

* ExecutePrompt
* ExecuteStructuredAnalysis
* ExecuteIteration
* ExecuteHarshFeedback
* ScorePrompt
* RunInteractiveSession
* CompressContext
* ApplyTasteFilter
* RunLearningMode
* GardenProjectKnowledge

Each use case:

* Receives DTO
* Invokes domain engines
* Returns structured result

---

## 4.3 Infrastructure Layer

Implements external systems.

### Components

* LLMClient interface
* OpenRouterClient implementation
* Model adapters
* File system loader
* Local memory storage
* Prompt cache
* Scoring persistence

No business logic here.

Future:

* Multi-model arbitration
* Ensemble reasoning
* Automatic model selection

---

## 4.4 Outer Layer (CLI)

Responsibilities:

* Parse arguments
* Load files
* Call use cases
* Format output
* Manage interactive session loop

Binary: `cforge`

---

# 5. OpenRouter Integration

OpenRouter enables:

* Model abstraction
* Provider switching
* Multi-model routing
* Future orchestration

Architecture rule:

Domain depends only on `LLMClient` interface.
Infrastructure implements it via OpenRouter.

---

# 6. CLI Design

## Basic Prompt

```
cforge run "Design a SaaS pricing model"
```

---

## Structured Mode

```
cforge analyze idea.md
```

Applies Structured Analyzer.

---

## Harsh Feedback Mode

```
cforge critique --harsh pitch.md
```

Activates Anti-Yes-Man Protocol:

* Blind spots
* Logical gaps
* Risk exposure
* Ego bias detection

---

## Iteration Mode

```
cforge iterate draft.md
```

Pipeline:

1. Generate
2. Critique
3. Improve
4. Score
5. Compare
6. Output best

---

## Prompt Scoring

```
cforge score prompt.txt
```

Scores:

* Clarity
* Constraint definition
* Outcome specificity
* Hallucination risk

---

## Interactive Chat Mode

```
cforge chat
```

Features:

* Structured reasoning enforcement
* Context compression
* Learning mode toggle
* Harsh mode toggle
* File injection

---

## Passing Files

```
cforge run --file spec.md --context README.md
```

Supports automatic compression when context is large.

---

# 7. Core Systems

## 7.1 Harsh Feedback Engine

Prevents:

* Flattery
* Vague agreement
* Shallow validation

Forces:

* Counter-arguments
* Weakness detection
* Stress testing

---

## 7.2 Taste Curation Engine

Filters output through:

* Clarity metric
* Density metric
* Non-generic filter
* Insight detection

Goal: High signal-to-noise ratio.

---

## 7.3 Master Prompt System

Centralized, versioned prompt templates for:

* Structured analysis
* Critique
* Iteration
* Compression
* Learning mode

All prompts version-controlled.

---

## 7.4 Output Iteration Engine

Multi-pass generation with scoring and comparison.

---

## 7.5 Context Compression System

Handles:

* Large documents
* Codebases
* Long sessions

Techniques:

* Layered summarization
* Intent extraction
* Structural mapping
* Memory abstraction

---

## 7.6 Project-Based Knowledge Gardening

Stores structured insights:

* Decisions
* Constraints
* Architecture
* Assumptions
* Lessons learned

Command example:

```
cforge garden sync
```

---

## 7.7 Learning Mode

When enabled:

* Explains reasoning
* Highlights assumptions
* Surfaces cognitive models
* Identifies transferable skills

---

# 8. Skill Engine

Cognitive Forge develops:

* Critical thinking
* Structured decomposition
* Clarity enforcement
* Iterative refinement
* Bias detection

It trains thinking, not just text generation.

---

# 9. TDD & Clean Code Principles

* Domain-first implementation
* Tests before infrastructure
* Mock LLMClient in tests
* High domain coverage
* Contract testing for OpenRouter adapter
* No hidden side effects

---

# 10. Roadmap

## v0.1 — Minimal Core

* CLI runner
* OpenRouter integration
* Structured Analyzer
* Basic RCCF
* Harsh mode
* TDD baseline

## v0.2 — Iteration Engine

* Multi-pass generation
* Scoring system
* Output comparison
* Interactive chat

## v0.3 — Compression & Files

* File loading
* Context compression
* Project memory

## v0.4 — Taste & Learning

* Taste engine
* Learning mode
* Knowledge gardening

## v1.0 — Stable Core

* Plugin system
* API exposure
* SDK extraction
* Stable prompt contracts

---

# 11. Phased Scope

Phase 1: Minimal Reasoning CLI
Phase 2: Iterative Intelligence
Phase 3: Memory & Compression
Phase 4: Skill Engine
Phase 5: API + SDK

Avoid premature complexity.

---

# 12. Long-Term Direction

Cognitive Forge becomes:

* Reusable SDK
* API layer
* Foundation for cforge-dev
* Infrastructure backbone for Donna AI

Donna AI = Application layer
Cognitive Forge = Cognitive infrastructure

---

# 13. Non-Goals (Initial Versions)

* Web UI
* Multi-agent orchestration
* Autonomous agents
* Dev automation (belongs to cforge-dev)
* Vector database integration

---

# 14. Identity Statement

Cognitive Forge is:

> A disciplined reasoning engine for serious builders.

It enforces structure where LLMs are stochastic.

It creates clarity where prompts are chaotic.

It builds thinking discipline — not just responses.
