
---

# pnpm-release-bot 🤖

A minimalist, opinionated monorepo release tool designed for **pnpm** and **GitHub Actions**. It automates independent versioning, changelog management, and publishing based on Conventional Commits.

## ✨ Features

* **Independent Versioning**: Each package is versioned individually based on its own git history.
* **pnpm Native**: Deep integration with `pnpm-workspace.yaml` and `--filter` flags.
* **Changelog Preservation**: Injects new entries into existing `CHANGELOG.md` files without overwriting history.
* **Multiple Tagging**: Creates git tags in the format `package-name@version`.
* **Pre-release Support**: Automatic detection of pre-release branches (alpha, beta, etc.).
* **Dry Run Mode**: Preview changes locally before committing or publishing.

## 🚀 Usage

### GitHub Actions (Recommended)

Create a file `.github/workflows/release.yml`:

```yaml
name: Release
on:
  push:
    branches: [main, develop]

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      id-token: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          registry-url: 'https://registry.npmjs.org'
      
      - run: pnpm install --frozen-lockfile
      - run: npx pnpm-release-bot
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

```

### Local Development

```bash
# Preview changes without impact
npx pnpm-release-bot --dry-run

# Force a specific pre-release identifier
npx pnpm-release-bot --pre-id next

```

## 🛠 Commit Convention

The tool uses **Conventional Commits** to determine the bump level:

| Commit Pattern | Release Type |
| --- | --- |
| `fix: ...` | **Patch** |
| `feat: ...` | **Minor** |
| `BREAKING CHANGE:` or `feat!:` | **Major** |

> **Note**: Commits are scoped by directory. A commit only triggers a release for the package(s) located in the modified path.

## 📦 Project Structure

* `bin/cli.js`: Command-line interface.
* `src/detector.js`: Git history analysis and change detection.
* `src/versioner.js`: SemVer calculation and `package.json` updates.
* `src/changelog.js`: Markdown injection logic.
* `src/git.js`: Git commit and multi-tag orchestration.
* `src/publisher.js`: Wrapper for `pnpm publish`.

## 📄 License

MIT

---
