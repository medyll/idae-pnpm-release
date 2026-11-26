import { isMonorepo } from '../src/detector.js';
import assert from 'assert';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';

describe('isMonorepo', () => {
  // The repository itself is a pnpm workspace (packages/package1, package2
  // fixtures), so the single-package case runs in its own temporary folder.
  it('should return false for a single package', async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'single-pkg-'));
    await fs.writeFile(path.join(tmpDir, 'package.json'), JSON.stringify({ name: 'single', version: '1.0.0' }));
    const cwd = process.cwd();
    process.chdir(tmpDir);
    try {
      assert.strictEqual(await isMonorepo(), false);
    } finally {
      process.chdir(cwd);
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });
});
