// author : Lebrun Meddy

import semver from 'semver';
import fs from 'fs/promises';
import path from 'path';

export async function bumpPackages(packages, isPre, preId) {
  return Promise.all(packages.map(async (pkg) => {
    // Logic: determine bump type (feat=minor, fix=patch, etc.)
    // For this example, we assume 'patch' or 'prepatch'
    const type = isPre ? 'prepatch' : 'patch';
    const next = semver.inc(pkg.currentVersion, type, preId);

    const pJsonPath = path.join(pkg.dir, 'package.json');
    const manifest = JSON.parse(await fs.readFile(pJsonPath, 'utf-8'));
    manifest.version = next;
    
    await fs.writeFile(pJsonPath, JSON.stringify(manifest, null, 2) + '\n');
    return { ...pkg, newVersion: next };
  }));
}