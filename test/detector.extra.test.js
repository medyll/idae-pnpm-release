import { isMonorepo } from '../src/detector.js';
import assert from 'assert';
import fs from 'fs/promises';
import path from 'path';

describe('isMonorepo', () => {
  it('should return false for a single package (this repo)', async () => {
    const result = await isMonorepo();
    assert.strictEqual(result, false);
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
    const result = await isMonorepo({ verbose: true });
    assert.strictEqual(result, false);
  });
});
