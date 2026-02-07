import { isMonorepo } from '../src/detector.js';
import assert from 'assert';

describe('isMonorepo', () => {
  it('should return false for a single package (this repo)', async () => {
    const result = await isMonorepo();
    assert.strictEqual(result, false);
  });
});
