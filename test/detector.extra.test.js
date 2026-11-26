import { isMonorepo } from '../src/detector.js';
import assert from 'assert';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';

// The repository itself is a pnpm workspace (packages/package1, package2
// fixtures): single-package cases run in a temporary folder of their own.
async function inSinglePackage(fn) {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'single-pkg-'));
  await fs.writeFile(path.join(tmpDir, 'package.json'), JSON.stringify({ name: 'single', version: '1.0.0' }));
  const cwd = process.cwd();
  process.chdir(tmpDir);
  try {
    return await fn();
  } finally {
    process.chdir(cwd);
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
}

describe('isMonorepo', () => {
  it('should return false for a single package', async () => {
    const result = await inSinglePackage(() => isMonorepo());
    assert.strictEqual(result, false);
  });

  it('should return true for this repository (pnpm workspace)', async () => {
    assert.strictEqual(await isMonorepo(), true);
  });

  it('should return false if no package.json exists', async () => {
    // Simule un dossier temporaire sans package.json
    const tmpDir = path.join(process.cwd(), 'test-tmp-no-pkg');
    await fs.mkdir(tmpDir, { recursive: true });
    const cwd = process.cwd();
    process.chdir(tmpDir);
    try {
      const result = await isMonorepo();
      assert.strictEqual(result, false);
    } finally {
      process.chdir(cwd);
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });

  it('should handle verbose option without error', async () => {
    const result = await inSinglePackage(() => isMonorepo({ verbose: true }));
    assert.strictEqual(result, false);
  });
});
