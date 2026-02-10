# Copilot Instructions for @medyll/monorepo-pnpm-release

## Project Overview
- **Purpose:** Automated release manager for pnpm workspaces and monorepos. Handles versioning, changelog updates, and publishing, optimized for CI/CD (especially GitHub Actions).
```text
# Copilot Instructions for @medyll/monorepo-pnpm-release

This file gives focused, actionable guidance for AI coding agents working on this repo. Keep changes small, run tests after edits, and preserve the monorepo's independent-versioning and changelog-injection behavior.

## Big Picture
- Purpose: a minimal release manager for pnpm workspaces that discovers changed packages, bumps only affected packages, injects changelog entries, commits/tags, and optionally publishes.
- Key flow: detect changes → compute semver per-package → update package manifests & changelogs → git commit & tag → publish (optional).

## Core modules (read these first)
- [bin/cli.js](bin/cli.js): CLI entrypoint and argument parsing.
- [src/detector.js](src/detector.js): Determine which workspace packages changed (uses git + @pnpm/find-workspace-packages).
- [src/versioner.js](src/versioner.js): SemVer computation and package.json updates.
- [src/changelog.js](src/changelog.js): Safe injection of changelog entries into package CHANGELOG.md files.
- [src/git.js](src/git.js): Commit, tag, and push logic used by releases.
- [src/publisher.js](src/publisher.js): Publishing via pnpm (uses NODE_AUTH_TOKEN in CI).

## Project-specific conventions
- Uses Conventional Commits to map commit types to version bumps (see `conventional-commits-parser` usage in `src/`).
- Independent versioning: each package under `packages/*` is bumped individually — do not implement monolithic version bumps.
- Changelog injection appends new entries and preserves history; avoid wholesale rewrite of `CHANGELOG.md` (see [src/changelog.js](src/changelog.js)).
- Workspace dependency handling: `workspace:*` references are managed; updating versions should keep workspace references consistent (see [src/versioner.js](src/versioner.js)).
- Code is ESM (`"type": "module"` in `package.json`) — imports use `import`/`export` semantics.

## Developer workflows & commands
- Install dependencies: `pnpm install --frozen-lockfile`
- Run the CLI locally: `pnpm run release -- --dry-run` or `node bin/cli.js --dry-run` to preview changes without commits/publish.
- Run tests: `pnpm test` (runs Mocha with `--experimental-vm-modules`).
- Type-check: `pnpm run check-types` (runs `tsc --noEmit`).

Example: quick dry run
```
pnpm install --frozen-lockfile
pnpm run release -- --dry-run
```

Example: run a specific module during development
```
node -r esm src/detector.js    # or run the module directly via `node` to inspect behavior
```

## Testing & debugging notes
- Tests live in the `test/` directory and cover detection and versioning logic — run them after edits to `src/detector.js`, `src/versioner.js`, or `src/changelog.js`.
- Mocha is configured in `package.json` (`test` script). Use reporters or single-file runs for focused debugging:
```
pnpm test -- test/detector.test.js
```

## Integration points to be aware of
- pnpm workspace resolution (`pnpm-workspace.yaml` + `@pnpm/find-workspace-packages`) — changes to package discovery must preserve workspace semantics.
- Git operations: tagging and multi-package commits are centralized in [src/git.js](src/git.js); keep git side-effects predictable for CI.
- Publishing: [src/publisher.js](src/publisher.js) expects auth via `NODE_AUTH_TOKEN` in CI.

## When to modify tests
- If you change detection, version calculation, or changelog injection, update or add unit tests under `test/` demonstrating the behavior (see `test/analyzeChanges.test.js` and `test/versioner.dryrun.test.js`).

## Quick pointers for PRs
- Keep changes small and focused to one subsystem (detector | versioner | changelog | publisher).
- Add or update unit tests for behavioral changes.
- Use `--dry-run` when verifying release behavior locally.

---
If anything in this document is unclear or you'd like more examples (CLI flags, test snippets, or a short debug checklist), tell me which section to expand.
```