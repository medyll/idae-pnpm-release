# Changelog

## [1.0.27] - 2026-02-07
**Other:**
- Merge branch 'main' of https://github.com/medyll/idae-pnpm-release
- Add unit tests for analyzeChanges and isMonorepo functions
- - Created mocked tests for analyzeChanges to handle various scenarios including no commits, new commits, and skipping private packages.
- - Added tests for analyzeChanges to ensure it returns an array and supports verbose options.
- - Implemented tests for isMonorepo to check behavior with single packages and absence of package.json.
- - Ensured all tests clean up temporary directories after execution.



## [1.0.26] - 2026-02-06
**Bug Fixes:**
- correct configuration file name in README and source code



## [1.0.25] - 2026-02-06
**Bug Fixes:**
- correct typo in configuration file option description

**Other:**
- Merge branch 'main' of https://github.com/medyll/idae-pnpm-release



## [1.0.24] - 2026-02-06
**Features:**
- add interactive configuration setup for .idae.pnpm-release

**Bug Fixes:**
- remove unnecessary publishDirectory from lockfile
- correct path to CLI in bin configuration
- remove relative path prefix in bin config and cleanup publishConfig

**Chores:**
- bump version to 1.0.22



## [1.0.22] - 2026-02-06
**Features:**
- add configuration loading from .idae.pnpm-release file and update CLI options
- add root README generation functionality and update changelog entries
- enable verbose logging and changelog regeneration in release bot
- add --regenerate-changelog option to CLI and implement changelog regeneration functionality
- enhance changelog formatting to group commits by type
- enhance CLI options and implement pre-publish command execution
- add CLI options for pre-publish commands and enhance release process
- add build and package options to release process
- add verbose logging to release process and related functions
- enhance README and package.json with new features and installation options
- add access and name fields to packageConfig in package.json
- update CI git identity setup in release workflow and adjust package.json bin name
- enhance finalizeGit function to support CI identity setup and dynamic commit messages
- add copilot instructions and update pnpm version in package.json
- add continuous release workflow and update README for clarity
- add import statement for execa in publisher module
- enhance release process with CLI options, changelog updates, and improved package detection
- implement pnpm-release-bot with changelog management, versioning, and GitHub Actions integration

**Bug Fixes:**
- update package name references from @medyll/monorepo-pnpm-release to @medyll/idae-pnpm-release in README, CLI, and package.json
- remove --regenerate-changelog option from release bot command
- remove verbose flag from changelog regeneration command in release workflow
- set publishDirectory in pnpm-lock.yaml
- correct publishConfig field name in package.json
- add '--access public' flag to pnpm publish command
- update French to English in workflow integration section of README
- update CLI program name to match repository naming convention

**Documentation:**
- update project name in README from pnpm-release-bot to idae-pnpm-release

**Refactoring:**
- remove '--access public' flag from pnpm publish command
- Add TypeScript configuration file (tsconfig.json) with strict settings

**Chores:**
- publish packages
- publish packages
- publish packages
- publish packages
- publish packages
- publish packages
- publish packages
- remove packageManager field from package.json
- publish packages
- publish packages
- publish packages
- publish packages
- publish packages
- publish packages
- add author comments to multiple source files
- publish packages
- publish packages
- publish packages
- publish packages
- publish packages
- update version to 1.0.3-alpha.0 and add changelog entry

**Other:**
- Merge branch 'main' of https://github.com/medyll/idae-pnpm-release
- - @medyll/monorepo-pnpm-release@1.0.22
- - @medyll/monorepo-pnpm-release@1.0.21
- Merge branch 'main' of https://github.com/medyll/idae-pnpm-release
- - @medyll/monorepo-pnpm-release@1.0.20
- - @medyll/monorepo-pnpm-release@1.0.19
- Merge branch 'main' of https://github.com/medyll/idae-pnpm-release
- - @medyll/monorepo-pnpm-release@1.0.18
- Merge branch 'main' of https://github.com/medyll/idae-pnpm-release
- - @medyll/monorepo-pnpm-release@1.0.17
- Merge branch 'main' of https://github.com/medyll/idae-pnpm-release
- - @medyll/monorepo-pnpm-release@1.0.16
- Merge branch 'main' of https://github.com/medyll/idae-pnpm-release
- - @medyll/monorepo-pnpm-release@1.0.15
- Merge branch 'main' of https://github.com/medyll/idae-pnpm-release
- - @medyll/monorepo-pnpm-release@1.0.14
- Merge branch 'main' of https://github.com/medyll/idae-pnpm-release
- - @medyll/monorepo-pnpm-release@1.0.13
- Merge branch 'main' of https://github.com/medyll/idae-pnpm-release
- - @medyll/monorepo-pnpm-release@1.0.12
- Merge branch 'main' of https://github.com/medyll/idae-pnpm-release
- - @medyll/monorepo-pnpm-release@1.0.11
- Merge branch 'main' of https://github.com/medyll/idae-pnpm-release
- - @medyll/monorepo-pnpm-release@1.0.10
- - @medyll/monorepo-pnpm-release@1.0.9
- Merge branch 'main' of https://github.com/medyll/idae-pnpm-release
- - @medyll/monorepo-pnpm-release@1.0.8
- Merge branch 'main' of https://github.com/medyll/idae-pnpm-release
- - @medyll/monorepo-pnpm-release@1.0.7
- Initial commit



## [1.0.22] - 2026-02-06
**Features:**
- add configuration loading from .idae.pnpm-release file and update CLI options



## [1.0.21] - 2026-02-06
**Features:**
- add root README generation functionality and update changelog entries

**Other:**
- Merge branch 'main' of https://github.com/medyll/idae-pnpm-release



## [1.0.22-alpha.0] - 2026-02-06
**Features:**
- enable verbose logging and changelog regeneration in release bot
- add --regenerate-changelog option to CLI and implement changelog regeneration functionality

**Bug Fixes:**
- remove --regenerate-changelog option from release bot command
- remove verbose flag from changelog regeneration command in release workflow



## [1.0.21-alpha.0] - 2026-02-06
**Features:**
- enable verbose logging and changelog regeneration in release bot
- add --regenerate-changelog option to CLI and implement changelog regeneration functionality

**Bug Fixes:**
- remove --regenerate-changelog option from release bot command
- remove verbose flag from changelog regeneration command in release workflow



## [1.0.20-alpha.0] - 2026-02-06
**Features:**
- enable verbose logging and changelog regeneration in release bot
- add --regenerate-changelog option to CLI and implement changelog regeneration functionality

**Bug Fixes:**
- remove --regenerate-changelog option from release bot command
- remove verbose flag from changelog regeneration command in release workflow



## [Unreleased] - 2026-02-04
- **2026-02-04** - chore(release): publish packages
- **2026-02-04** - Merge branch 'main' of https://github.com/medyll/idae-pnpm-release
- **2026-02-04** - feat: enhance changelog formatting to group commits by type
- **2026-02-04** - chore(release): publish packages
- **2026-02-04** - fix: set publishDirectory in pnpm-lock.yaml
- **2026-02-04** - Merge branch 'main' of https://github.com/medyll/idae-pnpm-release
- **2026-02-04** - fix: correct publishConfig field name in package.json refactor: remove '--access public' flag from pnpm publish command
- **2026-02-03** - chore(release): publish packages
- **2026-02-02** - Merge branch 'main' of https://github.com/medyll/idae-pnpm-release
- **2026-02-02** - fix: add '--access public' flag to pnpm publish command
- **2026-02-02** - chore(release): publish packages
- **2026-02-02** - Merge branch 'main' of https://github.com/medyll/idae-pnpm-release
- **2026-02-02** - chore: remove packageManager field from package.json
- **2026-02-02** - chore(release): publish packages
- **2026-02-02** - Merge branch 'main' of https://github.com/medyll/idae-pnpm-release
- **2026-02-02** - feat: enhance CLI options and implement pre-publish command execution
- **2026-02-02** - chore(release): publish packages
- **2026-02-02** - Merge branch 'main' of https://github.com/medyll/idae-pnpm-release
- **2026-02-02** - feat: add CLI options for pre-publish commands and enhance release process
- **2026-02-02** - feat: add build and package options to release process
- **2026-01-31** - chore(release): publish packages
- **2026-01-31** - Merge branch 'main' of https://github.com/medyll/idae-pnpm-release
- **2026-01-31** - fix: update French to English in workflow integration section of README
- **2026-01-31** - chore(release): publish packages
- **2026-01-31** - Merge branch 'main' of https://github.com/medyll/idae-pnpm-release
- **2026-01-31** - feat: add verbose logging to release process and related functions
- **2026-01-31** - chore(release): publish packages
- **2026-01-31** - Merge branch 'main' of https://github.com/medyll/idae-pnpm-release
- **2026-01-31** - feat: enhance README and package.json with new features and installation options
- **2026-01-31** - chore(release): publish packages
- **2026-01-31** - chore: add author comments to multiple source files
- **2026-01-31** - chore(release): publish packages
- **2026-01-31** - Merge branch 'main' of https://github.com/medyll/idae-pnpm-release
- **2026-01-31** - feat: add access and name fields to packageConfig in package.json
- **2026-01-31** - chore(release): publish packages
- **2026-01-31** - Merge branch 'main' of https://github.com/medyll/idae-pnpm-release
- **2026-01-31** - feat: update CI git identity setup in release workflow and adjust package.json bin name
- **2026-01-31** - chore(release): publish packages
- **2026-01-31** - feat: enhance finalizeGit function to support CI identity setup and dynamic commit messages
- **2026-01-31** - feat: add copilot instructions and update pnpm version in package.json
- **2026-01-31** - feat: add continuous release workflow and update README for clarity
- **2026-01-31** - chore(release): publish packages
- **2026-01-31** - feat: add import statement for execa in publisher module
- **2026-01-31** - chore(release): publish packages
- **2026-01-31** - chore: update version to 1.0.3-alpha.0 and add changelog entry
- **2026-01-31** - fix: update CLI program name to match repository naming convention
- **2026-01-31** - feat: enhance release process with CLI options, changelog updates, and improved package detection
- **2026-01-31** - docs: update project name in README from pnpm-release-bot to idae-pnpm-release
- **2026-01-31** - refactor: Add TypeScript configuration file (tsconfig.json) with strict settings
- **2026-01-31** - feat: implement pnpm-release-bot with changelog management, versioning, and GitHub Actions integration
- **2026-01-31** - Initial commit
