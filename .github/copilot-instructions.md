# Copilot Instructions for @medyll/monorepo-pnpm-release

## Project Overview
- **Purpose:** Automated release manager for pnpm workspaces and monorepos. Handles versioning, changelog updates, and publishing, optimized for CI/CD (especially GitHub Actions).
- **Key Features:**
  - Only bumps packages with actual changes (directory-based detection)
  - Independent versioning per package
  - Smart changelog injection (preserves history)
  - Follows Conventional Commits for versioning
  - Handles `pnpm-workspace.yaml` and `workspace:*` dependencies

## Architecture & Key Files
- `bin/cli.js`: CLI entry point
- `src/detector.js`: Detects changed packages using git and pnpm workspace analysis
- `src/versioner.js`: Handles SemVer logic and updates manifests
- `src/changelog.js`: Injects changelog entries into Markdown
- `src/git.js`: Git commit and multi-tagging logic
- `src/publisher.js`: Publishes packages using pnpm

## Developer Workflows
- **Release:** Run `npx @medyll/monorepo-pnpm-release` (see example GitHub Actions workflow in README)
- **Install:** `pnpm install --frozen-lockfile`
- **CI/CD:** Uses GitHub Actions; see `.github/workflows/release.yml` for reference
- **Changelog:** Updates are injected, not overwritten
- **Versioning:**
  - `fix:` → patch
  - `feat:` → minor
  - `feat!:` or `BREAKING CHANGE:` → major
- **CLI Options:**
  - `--dry-run` for previewing changes
  - `--pre-id <id>` for pre-releases

## Conventions & Patterns
- **Conventional Commits** are required for version calculation
- **Independent versioning**: Each package is versioned separately
- **Changelog**: Only changed packages get new entries
- **No monolithic version bump**: Only affected packages are updated
- **Safe Markdown injection**: Changelog entries are appended, not replaced

## Integration Points
- **pnpm**: Assumes workspace is managed by pnpm
- **GitHub Actions**: Designed for CI/CD automation
- **NPM Registry**: Publishes using `NODE_AUTH_TOKEN`

## Examples
- See `README.md` for workflow and usage examples
- See `.github/workflows/release.yml` for CI setup

---
For more details, review the referenced files and the README. When in doubt, follow the patterns established in the CLI and `src/` modules.