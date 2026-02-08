import { analyzeChanges } from '../src/detector.js';
import assert from 'assert';
import sinon from 'sinon';

describe('analyzeChanges - ignore file changes', () => {
  it('should ignore commits that only change package.json or CHANGELOG.md', async () => {
    const fakePackages = [
      { dir: '/fake/pkg', manifest: { name: 'pkg', version: '1.0.0', private: false } }
    ];

    const fakeExeca = sinon.stub();
    // 1) getLastTag
    fakeExeca.onCall(0).resolves({ stdout: 'v1.0.0' });
    // 2) git log --name-only <range> -- <path> -> only package.json
    fakeExeca.onCall(1).resolves({ stdout: 'package.json' });

    const result = await analyzeChanges({ deps: {
      findWorkspacePackages: async () => fakePackages,
      execa: fakeExeca
    }});

    assert.ok(Array.isArray(result));
    assert.strictEqual(result.length, 0);
  });

  it('should include commits that change other files inside package', async () => {
    const fakePackages = [
      { dir: '/fake/pkg', manifest: { name: 'pkg', version: '1.0.0', private: false } }
    ];

    const fakeExeca = sinon.stub();
    // 1) getLastTag
    fakeExeca.onCall(0).resolves({ stdout: 'v1.0.0' });
    // 2) git log --name-only <range> -- <path> -> file path inside package
    fakeExeca.onCall(1).resolves({ stdout: '/fake/pkg/src/index.js' });
    // 3) git log --format=%B%x1e -> commit bodies (record-separated)
    fakeExeca.onCall(2).resolves({ stdout: 'feat: add feature' });

    const result = await analyzeChanges({ deps: {
      findWorkspacePackages: async () => fakePackages,
      execa: fakeExeca
    }});

    assert.ok(Array.isArray(result));
    assert.strictEqual(result.length, 1);
    assert.ok(result[0].rawCommits.some(c => c.includes('feat: add feature')));
  });
});
