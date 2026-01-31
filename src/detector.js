import { execa } from 'execa';
import { getPackages } from '@pnpm/find-workspace-packages';

export async function analyzeChanges() {
  const allPackages = await getPackages('.');
  const packagesToRelease = [];

  for (const pkg of allPackages) {
    if (pkg.manifest.private) continue;

    // Get last tag for this specific package
    const lastTag = await getLastTag(pkg.manifest.name);
    const range = lastTag ? `${lastTag}..HEAD` : 'HEAD';

    // Check for changes in the package directory only
    const { stdout } = await execa('git', ['log', range, '--format=%B', '--', pkg.dir]);
    
    if (stdout.trim()) {
      packagesToRelease.push({
        name: pkg.manifest.name,
        dir: pkg.dir,
        currentVersion: pkg.manifest.version,
        rawCommits: stdout.split('\n').filter(Boolean)
      });
    }
  }
  return packagesToRelease;
}

async function getLastTag(name) {
  try {
    const { stdout } = await execa('git', ['describe', '--tags', '--match', `${name}@*`, '--abbrev=0']);
    return stdout;
  } catch { return null; }
}