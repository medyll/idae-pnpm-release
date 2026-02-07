// author : Lebrun Meddy
import findWorkspacePackages from '@pnpm/find-workspace-packages';
import { execa } from 'execa';
import fs from 'fs/promises';
import path from 'path';

/**
 * Detect if the current project is a monorepo
 */
export async function isMonorepo({ verbose } = {}) {
  try {
    // Support both ESM and CommonJS import styles
    let getPkgs;
    if (typeof findWorkspacePackages === 'function') {
      getPkgs = findWorkspacePackages;
    } else if (findWorkspacePackages && typeof findWorkspacePackages.default === 'function') {
      getPkgs = findWorkspacePackages.default;
    } else {
      throw new Error('findWorkspacePackages is not a function');
    }

    const allPackages = await getPkgs('.')
    const isMultiPackage = allPackages && allPackages.length > 1;
    if (verbose) console.log(`[verbose] isMonorepo: ${isMultiPackage} (found ${allPackages?.length} packages)`);
    return isMultiPackage;
  } catch (e) {
    if (verbose) console.log(`[verbose] Not a monorepo:`, e.message);
    return false;
  }
}

/**
 * Get the most recent git tag for a specific package
 * @param {string} packageName
 * @param {object} [deps] - Optional dependencies for testability
 * @param {Function} [deps.execa]
 */
async function getLastTag(packageName, deps = {}) {
  const exec = deps.execa || execa;
  try {
    const { stdout } = await exec('git', [
      'describe',
      '--tags',
      '--match', `${packageName}@*`,
      '--abbrev=0'
    ]);
    return stdout;
  } catch {
    // Fallback for single packages or missing tags
    return null;
  }
}

/**
 * Identify which packages need a release
 * Works for both pnpm workspaces and single packages
 */
export async function analyzeChanges({ verbose, deps = {} } = {}) {
  let allPackages = [];
  if (verbose) console.log('[verbose] Detecting workspace packages...');

  try {
    // Robust import handling for pnpm's internal tool
    const getPkgs = deps.findWorkspacePackages
      || (typeof findWorkspacePackages === 'function'
        ? findWorkspacePackages
        : findWorkspacePackages.default);

    allPackages = await getPkgs('.')
    if (verbose) console.log('[verbose] Found packages:', allPackages.map(p => p.manifest?.name || p.dir));
    // If workspace detection returns nothing, force fallback
    if (!allPackages || allPackages.length === 0) {
      throw new Error('No workspace found');
    }
  } catch (e) {
    // Fallback: Check if the current directory is a standard pnpm package
    const manifestPath = path.join(process.cwd(), 'package.json');
    try {
      const content = await fs.readFile(manifestPath, 'utf-8');
      const manifest = JSON.parse(content);
      // We wrap the single package in the same structure as a workspace result
      allPackages = [{
        dir: process.cwd(),
        manifest: manifest
      }];
    } catch (err) {
      if (verbose) console.log('[verbose] No pnpm workspace or package.json found in this directory.');
      console.error("❌ No pnpm workspace or package.json found in this directory.");
      return [];
    }
  }

  const exec = deps.execa || execa;
  const packagesToRelease = [];

  for (const pkg of allPackages) {
    if (verbose) console.log(`[verbose] Checking package: ${pkg.manifest.name}`);
    // Skip private packages unless they are the root fallback
    if (pkg.manifest.private && allPackages.length > 1) continue;

    const lastTag = await getLastTag(pkg.manifest.name, { execa: exec });
    const range = lastTag ? `${lastTag}..HEAD` : 'HEAD';
    if (verbose) console.log(`[verbose] Using git range: ${range}`);

    // Get logs for the package directory
    // pkg.dir is absolute path, works for both workspace and root
    const { stdout } = await exec('git', ['log', range, '--format=%B', '--', pkg.dir]);
    if (verbose) console.log(`[verbose] Git log for ${pkg.manifest.name}:`, stdout);

    // Split commits by double newline to separate them properly
    const commits = stdout.split('\n').filter(Boolean);

    if (commits.length > 0) {
      packagesToRelease.push({
        name: pkg.manifest.name,
        dir: pkg.dir,
        currentVersion: pkg.manifest.version,
        rawCommits: commits
      });
      if (verbose) console.log(`[verbose] Package ${pkg.manifest.name} scheduled for release.`);
    }
  }
  
  return packagesToRelease;
}