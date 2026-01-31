
---

# @medyll/monorepo-pnpm-release 🤖

A lightweight, automated release manager for **pnpm workspaces**. It handles versioning, changelog generation, and publishing directly from GitHub Actions, for monorepos or standalone projects.

## ✨ Features

* **Directory-based Detection**: Only bumps packages that have actual changes in their folder.
* **Independent Versioning**: Each package follows its own lifecycle.
* **Smart Changelogs**: Injects updates into existing `CHANGELOG.md` while preserving your history.
* **Conventional Commits**: Automatically calculates `patch`, `minor`, or `major` bumps.
* **pnpm Optimized**: Uses `pnpm-workspace.yaml` and handles `workspace:*` dependencies.

## 🚀 Installation

You can run it directly via `npx` in your CI:

```bash
npx @medyll/monorepo-pnpm-release

```

## 🛠 Workflow Integration

Create `.github/workflows/release.yml` in your monorepo:

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
          fetch-depth: 0 # Required to see previous tags
      
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          registry-url: 'https://registry.npmjs.org'

      - run: pnpm install --frozen-lockfile
      - run: npx @medyll/monorepo-pnpm-release
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

```

## 📖 CLI Options

| Option | Description | Default |
| --- | --- | --- |
| `--dry-run` | Preview version bumps and changelogs without pushing/publishing | `false` |
| `--pre-id <id>` | Identifier for pre-releases (alpha, beta, next) | `alpha` |

## 📝 Commit Convention

The tool analyzes your commit messages to decide the next version:

* `fix: ...` → **patch**
* `feat: ...` → **minor**
* `feat!: ...` or `BREAKING CHANGE:` → **major**

## 📂 Project Architecture

* `bin/cli.js`: Command entry point.
* `src/detector.js`: Git history and pnpm workspace analysis.
* `src/versioner.js`: SemVer logic and manifest updates.
* `src/changelog.js`: Safe Markdown injection.
* `src/git.js`: Git commit and multi-tagging.
* `src/publisher.js`: pnpm publishing wrapper.

## 📄 License

MIT

---