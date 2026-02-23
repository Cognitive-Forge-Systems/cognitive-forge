# IDEA.md

# Cognitive Forge Dev (cforge-dev)

*A Disciplined AI‑SDLC Orchestrator*

---

# 1. Vision

Cognitive Forge Dev (cforge-dev) is a CLI-based SDLC orchestrator that enforces architectural discipline when building software with AI.

It exists to solve a core problem:

> AI can generate code quickly — but without structure, it produces architectural debt faster than humans can detect it.

cforge-dev is the execution layer built on top of **Cognitive Forge (cforge)**.

* `cforge` = Reasoning Engine
* `cforge-dev` = AI SDLC Orchestrator

Together they form a disciplined AI engineering stack.

---

# 2. First Principles: The Core Problems in AI-Assisted Development

## Problem 1 — Context Collapse

AI sessions accumulate noisy context and drift from architectural intent.

## Problem 2 — Architecture Regret

Vibe coding leads to:

* unclear boundaries
* implicit coupling
* missing contracts
* no domain model

## Problem 3 — No Process Enforcement

AI does not naturally follow:

* structured SDLC
* issue boundaries
* test-first discipline
* clean branching strategy

## Problem 4 — Uncontrolled Iteration

Multiple edits in a single session blur responsibility and break traceability.

## Problem 5 — Missing Source of Truth

If planning lives in chat instead of GitHub, alignment collapses.

---

# 3. What cforge-dev Solves

cforge-dev enforces:

* GitHub as single source of truth
* Architecture-first development
* One issue = one isolated execution session
* Test-before-implementation
* Structured sprint cycles
* Release discipline

It transforms AI coding from improvisation into process-driven engineering.

---

# 4. SDLC Doctrine

Non-negotiable rules:

1. GitHub is the source of truth.
2. No coding without an Architecture Issue.
3. One issue per clean AI execution session.
4. Tests before implementation.
5. No direct edits to main branch.
6. Every sprint ends with a release tag.

This doctrine prevents entropy.

---

# 5. Strategic Architecture

Layered system:

```
cforge (reasoning core)
↑
cforge-dev (SDLC orchestration)
↑
GitHub (issues, PRs, releases)
↑
Project Repository
```

cforge-dev uses cforge internally for:

* structured analysis
* persona-driven planning
* critique & refinement
* architectural enforcement

---

# 6. GitHub-Centric Workflow Model

GitHub entities define structure:

* PRD (Product Requirements Document)
* Feature Issues
* Task Issues
* Architecture Issues
* Pull Requests
* Release Tags

All planning artifacts live in GitHub.
No planning exists only in chat.

---

# 7. Persona-Driven Planning

Planning uses structured personas executed via cforge.

## Architect Persona

* Defines domain model
* Sets boundaries
* Designs folder structure
* Defines interfaces

## PM Persona

* Translates PRD into Features
* Defines acceptance criteria
* Defines milestones

## Scrum Persona

* Breaks features into tasks
* Plans sprint
* Orders execution

Personas operate through RCCF reasoning discipline.

---

# 8. Execution Isolation Model

Core Principle:

> Every GitHub Issue is executed in a fresh, isolated AI context.

Isolation guarantees:

* No context drift
* Clear responsibility
* Clean reasoning boundary
* Traceable commit history

Execution session lifecycle:

1. Fetch issue
2. Load minimal required context
3. Inject system prompts
4. Run cforge reasoning
5. Generate tests
6. Generate implementation
7. Run tests
8. Commit changes
9. Push branch
10. Open PR

Then session terminates.

---

# 9. Orchestration Engine

cforge-dev acts as lightweight orchestrator.

Responsibilities:

* Pull issues via GitHub CLI
* Prepare execution environment
* Spawn AI execution process
* Inject strict system prompts
* Validate outputs
* Run test suite
* Commit + push
* Close issue when merged

No long-lived agent memory.
No uncontrolled iteration loops.

---

# 10. Clean Architecture for cforge-dev

```
Outer Layer (CLI)
Application Layer (Use Cases)
Domain Layer (SDLC rules & orchestration logic)
Infrastructure Layer (GitHub CLI, filesystem, shell, test runner)
```

Domain contains:

* SDLC doctrine enforcement
* Execution isolation rules
* Persona selection logic
* Issue validation rules
* Sprint cycle logic

Infrastructure implements:

* GitHub client adapter
* Test runner adapter
* Git adapter
* Shell command adapter

Domain never depends on GitHub implementation.

---

# 11. CLI Command Surface

Binary: `cforge-dev`

## Plan Sprint

```
cforge-dev plan sprint
```

* Reads PRD
* Generates feature issues
* Orders tasks
* Creates sprint milestone

---

## Implement

```
cforge-dev implement 123
```

Where 123 = GitHub Issue ID

Under the hood:

* Create feature branch
* Fetch issue details
* Load architecture context
* Spawn isolated AI session
* Generate tests first
* Generate implementation
* Run tests
* Commit changes
* Push branch
* Open PR

---

## Verify

```
cforge-dev verify 123
```

* Re-run tests
* Validate acceptance criteria
* Apply critique mode

---

## Release

```
cforge-dev release
```

* Ensure sprint issues closed
* Bump version
* Create tag
* Generate changelog

---

# 12. Context Discipline Engine

Context is constructed intentionally:

Included:

* Relevant architecture files
* Issue description
* Acceptance criteria
* Related interfaces

Excluded:

* Entire codebase dump
* Previous unrelated sessions

Context compression via cforge ensures minimal, focused injection.

---

# 13. AI Control Model

AI is not autonomous.
AI operates within strict guardrails:

* System prompts enforce SDLC doctrine
* Persona determines reasoning mode
* Tests must precede implementation
* PR required before merge

Human remains final reviewer.

---

# 14. Phased Development Roadmap

## Phase 1 — Foundation

* GitHub integration
* Issue execution flow
* Test-first enforcement
* Basic persona prompts
* Branch + PR automation

## Phase 2 — Context Discipline

* Context isolation logic
* Context compression
* Architecture validation
* Strict doctrine enforcement

## Phase 3 — Orchestrator CLI

* plan sprint
* implement
* verify
* release
* structured logging

## Phase 4 — Advanced Orchestration

* Parallel execution (isolated sessions)
* Dependency graph awareness
* Automated risk detection

---

# 15. Parallel Execution (Future)

Multiple issues executed concurrently:

* Separate branches
* Separate AI contexts
* Shared architecture constraints

Requires dependency awareness to prevent conflicts.

---

# 16. Preventing Architectural Regret

cforge-dev prevents:

* spontaneous file edits
* undocumented decisions
* hidden coupling
* skipping test coverage

It forces explicit architecture before velocity.

---

# 17. Identity Statement

Cognitive Forge Dev is:

> A disciplined AI-SDLC workflow CLI that prevents architectural regret while enabling high-velocity AI-assisted development.

It structures the AI.
It controls the process.
It protects the architecture.

Built on top of Cognitive Forge.
