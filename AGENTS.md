BMAD AGENTS Guidelines

This document serves as a formal guide for agentic coding agents operating within this repository. It codifies build, test, lint commands, and code-style conventions, plus workflow expectations for maintenance and collaboration. It also pulls guidance from the project Copilot Instructions when relevant.

1) Build, lint, test commands
- Install dependencies
  - pnpm install --frozen-lockfile
- Build (if applicable)
  - There is no separate build step for this JS/TS monorepo by default; rely on TypeScript checks and runtime execution. If a build step is introduced, document here.
- Run tests
  - pnpm test
- Run a single test file
  - pnpm test -- test/detector.test.js  # example: run only detector tests
- Type check
  - pnpm run check-types
- Lint (if a linter is configured)
  - Implement lint script in package.json if needed; otherwise rely on type checks and tests.

2) Quick run commands for the agent
- Dry-run release or local checks:
  - pnpm run release -- --dry-run
- Show verbose changes:
  - pnpm run release -- --verbose
- Regenerate changelogs for all packages:
  - (handled by the release flow; see code in src/changelog.js)

3) Code style guidelines
- Language: JavaScript/TypeScript with ESModule syntax ("type": "module").
- Imports: external libraries first, then local modules.
- Formatting: prefer consistent indentation (2 spaces) and semicolons where used in JS.
- Types: use TypeScript types where available; in JS, rely on JSDoc-like comments if needed.
- Naming: descriptive camelCase for variables/functions; PascalCase for classes; kebab-case for file names when appropriate.
- Error handling: use try/catch for async ops; provide meaningful messages; fail gracefully with informative logs.
- Logging: implement a simple vLog(verbose, ...args) style for verbose output. Use ANSI colors for readability when appropriate.
- Config: centralize config loading via a dedicated module; tolerate missing config with safe defaults.
- Tests: unit tests for complex logic; mocks for IO and external commands; tests should be deterministic.
- Security: avoid leaking secrets in logs; use environment vars for tokens; validate user input.
- Mutations: batch changes with explicit commits; avoid large sweeping rewrites.

4) Roles and orchestration
- This project uses a BMAD orchestrator model; agents are expected to:
  - Respect the global instruction set and the /update-dashboard workflow.
  - Update status.yaml and artifacts as required by workflow steps.
  - Commit changes only when explicitly requested by the user and when safe.

5) Cursor and Copilot rules
- Cursor rules: Not present in this repository (.cursor/rules/ not found). If they appear later, integrate them here.
- Copilot rules: See the repository file at .github/copilot-instructions.md for current Copilot guidance. This AGENTS.md should reflect those constraints and encourage alignment with Copilot behavior where appropriate.

6) Reference notes
- The project uses Mocha for tests and a TypeScript strict config. Tests reside in test/ and are run via npm/pnpm scripts in package.json.
- The main entry points live in src/ and bin/ for CLI usage.
- This document intentionally stays concise while providing concrete commands and conventions for agents.

7) Maintaining this file
- When updating, keep changes small and well-scoped to minimize drift.
- Run tests after edits to ensure no regressions.

End of AGENTS.md
