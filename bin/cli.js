#!/usr/bin/env node

import { Command } from 'commander';
import { executeRelease } from '../src/index.js';
import { loadConfig, createConfig } from '../src/config.js';

const program = new Command();

program
  .name('@medyll/idae-pnpm-release')
  .description('Automated release tool for pnpm workspaces and single packages')
  .version('1.0.0')
  .option('-d, --dry-run', 'Analyze and simulate the release without any side effects', false)
  .option('-p, --pre-id <id>', 'Identifier for pre-release (e.g. alpha, beta, next)', 'alpha')
  .option('-v, --verbose', 'Print detailed logs', false)
  .option('-b, --build', 'Execute "pnpm run build" in each changed package before release', false)
  .option('-k, --package', 'Execute "pnpm run package" in each changed package before release', false)
  .option('-r, --regenerate-changelog', 'Regenerate CHANGELOG.md from all commits (no versioning, no publishing)', false)
  .option('--generate-readme-root', 'Generate root README based on workspace packages', false)
  .option('--install', 'Create a default .idae-pnpm-release configuration file', false)
  .option('-y, --yes', 'Skip prompts and use defaults (for --install)', false)
  .action(async (options, command) => {
    if (options.install) {
      await createConfig(options);
      process.exit(0);
    }

    // Load config from file
    const config = loadConfig();

    // Merge config with options, giving priority to CLI args (if explicitly set)
    const finalOptions = { ...options };

    // Helper: convert kebab-case to camelCase (e.g. 'dry-run' -> 'dryRun')
    const toCamel = (str) => str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());

    Object.keys(config).forEach(rawKey => {
      const key = toCamel(rawKey);
      const source = command.getOptionValueSource(key);
      
      // If the user didn't explicitly set this flag in the terminal,
      // let the config file override the default.
      if (source !== 'cli') {
        finalOptions[key] = config[rawKey];
      }
    });

    try { 
      await executeRelease(finalOptions);
    } catch (error) {
      console.error(`\n❌ Execution failed: ${error.message}`);
      process.exit(1);
    }
  });

program.parse(process.argv);