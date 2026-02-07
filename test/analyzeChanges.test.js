import { analyzeChanges } from '../src/detector.js';
import assert from 'assert';

describe('analyzeChanges', () => {
  it('should return an array (single package, no changes)', async () => {
    const result = await analyzeChanges();
    assert.ok(Array.isArray(result));
  });

  it('should support verbose option', async () => {
    const result = await analyzeChanges({ verbose: true });
    assert.ok(Array.isArray(result));
  });

  it('should return empty array if no package.json', async () => {
    // Simule un dossier temporaire sans package.json
    const fs = await import('fs/promises');
    const path = await import('path');
    const tmpDir = path.join(process.cwd(), 'test-tmp-no-pkg-analyze');
    await fs.mkdir(tmpDir, { recursive: true });
    const cwd = process.cwd();
    process.chdir(tmpDir);
    try {
      const result = await analyzeChanges();
      assert.deepStrictEqual(result, []);
    } finally {
      process.chdir(cwd);
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });
});
