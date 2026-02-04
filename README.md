
---

# @medyll/monorepo-pnpm-release 🤖

A lightweight, automated release manager for **pnpm workspaces**. It handles versioning, changelog generation, and publishing directly from GitHub Actions, for monorepos or standalone projects.

## ✨ Features

* **Directory-based Detection**: Only bumps packages that have actual changes in their folder.
* **Independent Versioning**: Each package follows its own lifecycle.
* **Smart Changelogs**: Injects updates into existing `CHANGELOG.md` while preserving history.
* **Conventional Commits**: Automatically calculates `patch`, `minor`, or `major` bumps.
* **Zero-Config CI**: Automatically handles Git identity (bot) if not configured.
* **Hybrid Support**: Works perfectly for both large monorepos and single-package projects.

---

## 🚀 Installation & Usage

## CLI Options

### `--build`
Execute the `build` script in each changed package before releasing. If a package does not define a `build` script, it is skipped with a neutral info message.

```bash
# Build changed packages only
npx @medyll/monorepo-pnpm-release --build
```

### `--package`
Execute the `package` script in each changed package before releasing. If a package does not define a `package` script, it is skipped with a neutral info message.

```bash
# Package changed packages only
npx @medyll/monorepo-pnpm-release --package

# Combine both flags
npx @medyll/monorepo-pnpm-release --build --package
```

### `--regenerate-changelog`
Regenerate the entire `CHANGELOG.md` file from Git history. This rewrites the file with standardized formatting (Date + Conventional Commit), grouping commits by Release/Tag.
*   **Monorepo**: Only includes commits touching the package directory.
*   **Single Package**: Includes all commits in the repository.

```bash
# Regenerate changelog without publishing or versioning
npx @medyll/monorepo-pnpm-release --regenerate-changelog
```

### `--verbose`
Enable verbose logging with detailed output during the release process. Useful for debugging or understanding command execution.

```bash
npx @medyll/monorepo-pnpm-release --build all --verbose
```

### `--dry-run`
Analyze and simulate the release without making any changes.

```bash
npx @medyll/monorepo-pnpm-release --dry-run
```

### Option A: One-time execution (npx)

Useful to avoid polluting your dependencies.

```bash
npx @medyll/monorepo-pnpm-release

```

### Option B: Integrated dependency

Recommended to lock the tool version for the whole team.

```bash
pnpm add -D @medyll/monorepo-pnpm-release

```

Then add the following script to `package.json` :

```json
"scripts": {
  "release": "monorepo-pnpm-release"
}

```

*Usage: `pnpm release*`

---

## 🛠 Workflow Integration

Create the file `.github/workflows/release.yml` :

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
      
      - uses: pnpm/action-setup@v4
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

---

## 📖 CLI Options

| Option | Alias | Description | Default |
| --- | --- | --- | --- |
| `--dry-run` | `-d` | Simulates the release without modifying Git or NPM | `false` |
| `--pre-id` | `-p` | Pre-release identifier (alpha, beta, next) | `alpha` |
| `--verbose` | `-v` | Shows detailed logs of internal steps | `false` |
| `--package` | `-k` | Runs `package` script in each changed package | `false` |
| `--build` | `-b` | Runs `build` script in each changed package | `false` |

---

## 📝 Commit Convention

The tool analyzes your commit messages to decide the next bump:

* `fix: ...` → **patch**
* `feat: ...` → **minor**
* `feat!: ...` or `BREAKING CHANGE:` → **major**

---

## 🛠 Troubleshooting

### NPM Authentication Issues

If the CI fails at the `publish` step:

1. **Token Type**: Use an **Automation** token (not Fine-grained without write permissions).
2. **GitHub Secret**: Make sure the secret is named `NPM_TOKEN`.
3. **Access**: For `@scope/` packages, ensure they are public:
```json
"publishConfig": { "access": "public" }

```


### Git Identity Error

If you see `Author identity unknown`:
The tool automatically configures `github-actions[bot]`. If you use your own identity, make sure it is set before running the tool.

---

## 📄 License

MIT

---