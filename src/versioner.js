// author : Lebrun Meddy

import semver from 'semver';
import fs from 'fs/promises';
import path from 'path';

export async function bumpPackages(packages, isPre, preId, { verbose, dryRun } = {}) {
  return Promise.all(packages.map(async (pkg) => {
    if (verbose) console.log(`[verbose] Bumping version for ${pkg.name}`);
    const type = isPre ? 'prepatch' : 'patch';
    const next = semver.inc(pkg.currentVersion, type, preId);
    if (verbose) console.log(`[verbose] New version for ${pkg.name}: ${next}`);

    const pJsonPath = path.join(pkg.dir, 'package.json');
    // Load manifest to compute new version, but only persist when not a dry run
    const manifest = JSON.parse(await fs.readFile(pJsonPath, 'utf-8'));
    manifest.version = next;
    if (dryRun) {
      if (verbose) console.log(`[verbose] Dry run enabled — not writing ${pJsonPath}`);
    } else {
      if (verbose) console.log(`[verbose] Writing new version to ${pJsonPath}`);
      await fs.writeFile(pJsonPath, JSON.stringify(manifest, null, 2) + '\n');
    }
    return { ...pkg, newVersion: next };
  }));
}