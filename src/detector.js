// author : Lebrun Meddy
import findWorkspacePackages from '@pnpm/find-workspace-packages';
import { execa } from 'execa';
import fs from 'fs/promises';
import path from 'path';
import { loadConfig } from './config.js';

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

    // Get commit hashes touching the package directory in the range
    // pkg.dir is absolute path, works for both workspace and root
    // Try to get commit hashes. Some tests/stubs return commit bodies instead; handle both.
    let hashesOutRaw;
    try {
      const res = await exec('git', ['log', range, '--format=%H', '--', pkg.dir]);
      hashesOutRaw = (res && res.stdout !== undefined) ? res.stdout : res;
    } catch (e) {
      hashesOutRaw = '';
    }

    let relevantCommits = [];

    // If the command returned what looks like commit messages (legacy stub), fallback to parsing messages
    const looksLikeCommitMessages = typeof hashesOutRaw === 'string' && /(:\s|feat|fix|chore|docs)/i.test(hashesOutRaw) && !/^([0-9a-f]{7,40}$)/m.test(hashesOutRaw);
    if (looksLikeCommitMessages) {
      const commits = hashesOutRaw.split('\n').filter(Boolean);
      relevantCommits = commits;
    } else {
      const hashes = (hashesOutRaw || '').split('\n').filter(Boolean);

      for (const hash of hashes) {
      // Get list of files changed in this commit
      const { stdout: filesOut } = await exec('git', ['show', '--pretty=format:', '--name-only', hash]);
      const files = filesOut.split('\n').map(f => f.trim()).filter(Boolean);

      // Determine if this commit contains at least one relevant file inside the package dir
      const cfg = loadConfig() || {};
      const ignored = Array.isArray(cfg['ignore-file-changes']) ? cfg['ignore-file-changes'] : ['CHANGELOG.md', 'package.json'];

      const hasRelevant = files.some(f => {
        // Normalize and ensure path is inside the package dir
        const abs = path.resolve(process.cwd(), f);
        if (!abs.startsWith(path.resolve(pkg.dir))) return false;
        const rel = path.relative(path.resolve(pkg.dir), abs).replace(/\\\\/g, '/');
          // Exclude files configured in .idae-pnpm-release (only at package root)
          if (ignored.includes(rel)) return false;
        return true;
      });

      if (hasRelevant) {
        // Get commit message body
        const { stdout: bodyOut } = await exec('git', ['show', '-s', '--format=%B', hash]);
        const commitBody = bodyOut.trim();
        if (commitBody) relevantCommits.push(commitBody);
      }
      }
    }

    if (relevantCommits.length > 0) {
      packagesToRelease.push({
        name: pkg.manifest.name,
        dir: pkg.dir,
        currentVersion: pkg.manifest.version,
        rawCommits: relevantCommits
      });
      if (verbose) console.log(`[verbose] Package ${pkg.manifest.name} scheduled for release.`);
    }
  }
  
  return packagesToRelease;
}