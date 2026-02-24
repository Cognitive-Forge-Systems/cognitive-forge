# Contributing to Cognitive Forge

Welcome to the Cognitive Forge project! To maintain a clean, readable, and automated repository history, this project strictly adheres to the **Conventional Commits** standard. 

Whether you are fixing a typo, building a new reasoning engine, or writing tests, please follow the guidelines below.

---

## 1. The Commit Formula

Every commit message must follow this structure:
\`\`\`text
type(scope): short description in present tense
\`\`\`

* **`type`**: The category of the change (see table below).
* **`scope`**: The specific part of the codebase affected (optional, but highly recommended).
* **`description`**: A concise summary of what the commit does, written in the imperative, present tense (e.g., "add feature", not "added feature").

---

## 2. Allowed Commit Types

| Type | Description | Example |
| :--- | :--- | :--- |
| **`feat`** | A new feature or capability. | `feat: add harsh feedback mode` |
| **`fix`** | A bug fix. | `fix: resolve crash on empty context` |
| **`docs`** | Documentation only changes. | `docs: update setup instructions` |
| **`style`** | Code formatting (spaces, formatting, missing semi-colons, etc). | `style: fix indentation in config` |
| **`refactor`**| A code change that neither fixes a bug nor adds a feature. | `refactor: extract scoring logic` |
| **`perf`** | A code change that improves performance. | `perf: reduce memory in compression` |
| **`test`** | Adding missing tests or correcting existing tests. | `test: add unit tests for taste engine` |
| **`chore`** | Changes to the build process or auxiliary tools/libraries. | `chore: update TypeScript version` |

---

## 3. Standard Project Scopes

When adding a scope in the brackets `()`, use one of the standard architectural domains of Cognitive Forge:

* `(cli)`: Changes to the terminal interface and argument parsing.
* `(engine)`: Changes to the core reasoning, RCCF, or taste engines.
* `(api)`: Changes to the OpenRouter/LLM client integrations.
* `(io)`: Changes to file loading, saving, or caching.
* `(docs)`: Used with the `docs` type for README or architecture files.

*Example:* `feat(engine): integrate anti-yes-man protocol`

---

## 4. Breaking Changes

If your commit introduces a breaking change (e.g., altering a CLI command flag that users rely on, or changing the output contract), append an exclamation mark `!` after the type/scope, and explain the breakage in the commit body.

*Example:* \`\`\`text
feat(cli)!: remove --legacy flag

The --legacy flag has been entirely replaced by the new --system flag. 
Scripts relying on --legacy will now fail.
\`\`\`

---

*By following these conventions, we can automatically generate semantic versioning and pristine changelogs!*
