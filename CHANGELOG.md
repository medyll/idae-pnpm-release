# Changelog

## [Unreleased] - 2026-02-08
- **2026-02-08** - feat: update version to 1.0.28-alpha.0, enhance changelog, and add pnpm workspace configuration
- **2026-02-08** - feat: add package2 module with initial configuration and entry point
- **2026-02-08** - feat: add initial package1 module and configuration files
- **2026-02-08** - feat: optimize analyzeChanges to use single git calls for file changes and update tests
- **2026-02-08** - feat: add verbose logging for git log and show commands in analyzeChanges
- **2026-02-08** - feat: enhance error handling in analyzeChanges for git command execution
- **2026-02-08** - feat: enhance git command execution in analyzeChanges to disable pager on Windows
- **2026-02-08** - feat: update changelog for version 1.0.27-alpha.0; enhance publish behavior for monorepos
- **2026-02-08** - feat: ignore file-only changes via .idae-pnpm-release; add tests and docs
- **2026-02-07** - Add unit tests for analyzeChanges and isMonorepo functions
- **2026-02-06** - fix(docs): correct configuration file name in README and source code
- **2026-02-06** - fix(package): correct typo in configuration file option description
- **2026-02-06** - fix(package): remove unnecessary publishDirectory from lockfile
- **2026-02-06** - feat: add interactive configuration setup for .idae.pnpm-release

## [1.0.23] - 2026-02-06
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
