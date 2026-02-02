import { exec } from 'child_process';
import { promisify } from 'util';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const execPromise = promisify(exec);

/**
 * Check if a script exists in package.json
 * @param {string} scriptName - Name of the script to check
 * @returns {boolean} - True if script exists, false otherwise
 */
function hasScript(scriptName) {
  const packageJsonPath = join(process.cwd(), 'package.json');
  
  if (!existsSync(packageJsonPath)) {
    return false;
  }

  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    return packageJson.scripts && packageJson.scripts[scriptName] !== undefined;
  } catch (error) {
    return false;
  }
}

/**
 * Execute pre-publish commands (build and/or package) before release
 * @param {Object} options - CLI options
 * @param {boolean} options.build - Whether to execute "pnpm run build"
 * @param {boolean} options.package - Whether to execute "pnpm run package"
 * @param {boolean} options.verbose - Whether to show detailed logs
 */
export async function executePrePublishCommands(options) {
  // Execute build if --build option is provided
  if (options.build) {
    if (!hasScript('build')) {
      console.log('⚠️  No "build" script found in package.json, skipping...\n');
      return;
    }

    console.log('🔨 Executing "pnpm run build"...');
    try {
      const { stdout, stderr } = await execPromise('pnpm run build');
      if (options.verbose && stdout) {
        console.log(stdout);
      }
      if (stderr) {
        console.error(stderr);
      }
      console.log('✅ Build completed successfully\n');
    } catch (error) {
      console.error(`❌ Build failed: ${error.message}`);
      process.exit(1);
    }
  }

  // Execute package if --package option is provided
  if (options.package) {
    if (!hasScript('package')) {
      console.log('⚠️  No "package" script found in package.json, skipping...\n');
      return;
    }

    console.log('📦 Executing "pnpm run package"...');
    try {
      const { stdout, stderr } = await execPromise('pnpm run package');
      if (options.verbose && stdout) {
        console.log(stdout);
      }
      if (stderr) {
        console.error(stderr);
      }
      console.log('✅ Package completed successfully\n');
    } catch (error) {
      console.error(`❌ Package failed: ${error.message}`);
      process.exit(1);
    }
  }
}
