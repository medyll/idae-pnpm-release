import { bumpPackages } from '../src/versioner.js';
import assert from 'assert';

import fs from 'fs/promises';
import path from 'path';

describe('bumpPackages dry-run', () => {
  const tmpDir = path.join(process.cwd(), 'test-tmp-dryrun');
  const pkgDir = path.join(tmpDir, 'pkg');
  const pkgJsonPath = path.join(pkgDir, 'package.json');

  beforeEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
    await fs.mkdir(pkgDir, { recursive: true });
    const manifest = { name: 'pkg', version: '1.0.0' };
    await fs.writeFile(pkgJsonPath, JSON.stringify(manifest, null, 2) + '\n');
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('should not write package.json when dryRun is true', async () => {
    const packages = [{ name: 'pkg', dir: pkgDir, currentVersion: '1.0.0' }];
    const result = await bumpPackages(packages, false, null, { dryRun: true });
    // version returned
    assert.strictEqual(result[0].newVersion !== undefined, true);

    const content = JSON.parse(await fs.readFile(pkgJsonPath, 'utf-8'));
    assert.strictEqual(content.version, '1.0.0');
  });

  it('should write package.json when dryRun is false', async () => {
    const packages = [{ name: 'pkg', dir: pkgDir, currentVersion: '1.0.0' }];
    const result = await bumpPackages(packages, false, null, { dryRun: false });
    const content = JSON.parse(await fs.readFile(pkgJsonPath, 'utf-8'));
    assert.notStrictEqual(content.version, '1.0.0');
    assert.strictEqual(content.version, result[0].newVersion);
  });
});
