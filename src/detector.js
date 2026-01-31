import findWorkspacePackages from '@pnpm/find-workspace-packages';
import { execa } from 'execa';
import fs from 'fs/promises';
import path from 'path';

/**
 * Get the most recent git tag for a specific package
 */
async function getLastTag(packageName) {
  try {
    const { stdout } = await execa('git', [
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
export async function analyzeChanges() {
  let allPackages = [];

  try {
    // Robust import handling for pnpm's internal tool
    const getPkgs = typeof findWorkspacePackages === 'function' 
      ? findWorkspacePackages 
      : findWorkspacePackages.default;

    allPackages = await getPkgs('.');
    
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
      console.error("❌ No pnpm workspace or package.json found in this directory.");
      return [];
    }
  }

  const packagesToRelease = [];

  for (const pkg of allPackages) {
    // Skip private packages unless they are the root fallback
    if (pkg.manifest.private && allPackages.length > 1) continue;

    const lastTag = await getLastTag(pkg.manifest.name);
    const range = lastTag ? `${lastTag}..HEAD` : 'HEAD';

    // Get logs for the package directory
    // pkg.dir is absolute path, works for both workspace and root
    const { stdout } = await execa('git', ['log', range, '--format=%B', '--', pkg.dir]);
    
    // Split commits by double newline to separate them properly
    const commits = stdout.split('\n').filter(Boolean);

    if (commits.length > 0) {
      packagesToRelease.push({
        name: pkg.manifest.name,
        dir: pkg.dir,
        currentVersion: pkg.manifest.version,
        rawCommits: commits
      });
    }
  }
  
  return packagesToRelease;
}