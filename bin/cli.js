#!/usr/bin/env node

import { Command } from 'commander';
import { executeRelease } from '../src/index.js';

const program = new Command();

program
  .name('idae-release')
  .description('Automated release tool for pnpm workspaces and single packages')
  .version('1.0.0')
  .option('-d, --dry-run', 'Analyze and simulate the release without any side effects', false)
  .option('-p, --pre-id <id>', 'Identifier for pre-release (e.g. alpha, beta, next)', 'alpha')
  .option('-v, --verbose', 'Print detailed logs', false)
  .action(async (options) => {
    try {
      await executeRelease(options);
    } catch (error) {
      console.error(`\n❌ Execution failed: ${error.message}`);
      process.exit(1);
    }
  });

program.parse(process.argv);