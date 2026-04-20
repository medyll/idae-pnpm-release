# Changelog

## [1.0.39] - 2026-04-20
**Other:**
- 1.0.38



## [1.0.37] - 2026-04-20
**Chores:**
- remove outdated Copilot instructions file



## [1.0.36] - 2026-04-20
**Bug Fixes:**
- adjust argument order for pnpm publish command in multi-package scenario



## [1.0.35] - 2026-04-20
**Chores:**
- update README formatting and remove emoji from section titles



## [1.0.34] - 2026-04-20
**Features:**
- update context-mode hooks for vscode-copilot integration and improve log messages



## [1.0.33] - 2026-03-14
**Features:**
- add context-mode hooks for vscode-copilot integration



## [1.0.32] - 2026-03-11
**Documentation:**
- add baseline audit artifact at bmad/artifacts/audit-baseline-2026-03-06.md
- add AGENTS.md with build/test/lint guidelines and coding standards; include Copilot reference notes



## [1.0.31] - 2026-02-10
**Chores:**
- update dependencies for semver and @types/node



## [1.0.30] - 2026-02-10
**Documentation:**
- update Copilot instructions for clarity and detail



## [1.0.29] - 2026-02-08
**Features:**
- update changelog generation to include private packages and add changelogs for package1 and package2
- enhance package detection logic for monorepos and add fallback for workspace packages
- enhance bumpPackages function with dryRun option and add corresponding tests
- update changelog format and consolidate entries for clarity
- update version to 1.0.29-alpha.0 and enhance changelog
- update version to 1.0.28-alpha.0, enhance changelog, and add pnpm workspace configuration
- add package2 module with initial configuration and entry point
- add initial package1 module and configuration files
- optimize analyzeChanges to use single git calls for file changes and update tests
- add verbose logging for git log and show commands in analyzeChanges
- enhance error handling in analyzeChanges for git command execution
- enhance git command execution in analyzeChanges to disable pager on Windows
- update changelog for version 1.0.27-alpha.0; enhance publish behavior for monorepos

**Chores:**
- regenerate changelogs; fix monorepo detection; respect --dry-run



## [Unreleased] - 2026-02-08
- **2026-02-08** - feat: update changelog generation to include private packages and add changelogs for package1 and package2
- **2026-02-08** - feat: enhance package detection logic for monorepos and add fallback for workspace packages
- **2026-02-08** - feat: enhance bumpPackages function with dryRun option and add corresponding tests
- **2026-02-08** - feat: update version to 1.0.28-alpha.0, enhance changelog, and add pnpm workspace configuration
- **2026-02-08** - feat: optimize analyzeChanges to use single git calls for file changes and update tests
- **2026-02-08** - feat: add verbose logging for git log and show commands in analyzeChanges
- **2026-02-08** - feat: enhance error handling in analyzeChanges for git command execution
- **2026-02-08** - feat: enhance git command execution in analyzeChanges to disable pager on Windows
- **2026-02-08** - feat: update changelog for version 1.0.27-alpha.0; enhance publish behavior for monorepos

## [medyll/idae-pnpm-release@1.0.28] - 2026-02-08
- **2026-02-08** - feat: ignore file-only changes via .idae-pnpm-release; add tests and docs

## [medyll/idae-pnpm-release@1.0.27] - 2026-02-07
- **2026-02-07** - Add unit tests for analyzeChanges and isMonorepo functions

## [medyll/idae-pnpm-release@1.0.26] - 2026-02-06
- **2026-02-06** - fix(docs): correct configuration file name in README and source code

## [medyll/idae-pnpm-release@1.0.25] - 2026-02-06
- **2026-02-06** - fix(package): correct typo in configuration file option description

## [medyll/idae-pnpm-release@1.0.24] - 2026-02-06
- **2026-02-06** - fix(package): remove unnecessary publishDirectory from lockfile
- **2026-02-06** - feat: add interactive configuration setup for .idae.pnpm-release

## [medyll/idae-pnpm-release@1.0.22] - 2026-02-06
- **2026-02-06** - fix: update package name references from @medyll/monorepo-pnpm-release to @medyll/idae-pnpm-release in README, CLI, and package.json
- **2026-02-06** - feat: add configuration loading from .idae.pnpm-release file and update CLI options
- **2026-02-06** - feat: add root README generation functionality and update changelog entries
- **2026-02-04** - fix(release): remove --regenerate-changelog option from release bot command
- **2026-02-04** - feat(release): enable verbose logging and changelog regeneration in release bot
- **2026-02-04** - fix(release): remove verbose flag from changelog regeneration command in release workflow
- **2026-02-04** - feat: add --regenerate-changelog option to CLI and implement changelog regeneration functionality
- **2026-02-04** - feat: enhance changelog formatting to group commits by type
- **2026-02-04** - fix: set publishDirectory in pnpm-lock.yaml
- **2026-02-04** - fix: correct publishConfig field name in package.json refactor: remove '--access public' flag from pnpm publish command
- **2026-02-02** - fix: add '--access public' flag to pnpm publish command
- **2026-02-02** - feat: enhance CLI options and implement pre-publish command execution
- **2026-02-02** - feat: add CLI options for pre-publish commands and enhance release process
- **2026-02-02** - feat: add build and package options to release process
- **2026-01-31** - fix: update French to English in workflow integration section of README
- **2026-01-31** - feat: add verbose logging to release process and related functions
- **2026-01-31** - feat: enhance README and package.json with new features and installation options
- **2026-01-31** - chore: add author comments to multiple source files
- **2026-01-31** - feat: update CI git identity setup in release workflow and adjust package.json bin name
- **2026-01-31** - feat: enhance finalizeGit function to support CI identity setup and dynamic commit messages
- **2026-01-31** - feat: add copilot instructions and update pnpm version in package.json
- **2026-01-31** - feat: add continuous release workflow and update README for clarity
- **2026-01-31** - feat: add import statement for execa in publisher module
- **2026-01-31** - chore(release): publish packages
- **2026-01-31** - fix: update CLI program name to match repository naming convention
- **2026-01-31** - feat: enhance release process with CLI options, changelog updates, and improved package detection
- **2026-01-31** - docs: update project name in README from pnpm-release-bot to idae-pnpm-release
- **2026-01-31** - refactor: Add TypeScript configuration file (tsconfig.json) with strict settings
- **2026-01-31** - feat: implement pnpm-release-bot with changelog management, versioning, and GitHub Actions integration
- **2026-01-31** - Initial commit
