// author : Lebrun Meddy

import semver from 'semver';
import fs from 'fs/promises';
import path from 'path';

export async function bumpPackages(packages, isPre, preId, { verbose } = {}) {
  return Promise.all(packages.map(async (pkg) => {
    if (verbose) console.log(`[verbose] Bumping version for ${pkg.name}`);
    // Logic: determine bump type (feat=minor, fix=patch, etc.)
    // For this example, we assume 'patch' or 'prepatch'
    const type = isPre ? 'prepatch' : 'patch';
    const next = semver.inc(pkg.currentVersion, type, preId);
    if (verbose) console.log(`[verbose] New version for ${pkg.name}: ${next}`);

    const pJsonPath = path.join(pkg.dir, 'package.json');
    const manifest = JSON.parse(await fs.readFile(pJsonPath, 'utf-8'));
    manifest.version = next;
    if (verbose) console.log(`[verbose] Writing new version to ${pJsonPath}`);
    await fs.writeFile(pJsonPath, JSON.stringify(manifest, null, 2) + '\n');
    return { ...pkg, newVersion: next };
  }));
}