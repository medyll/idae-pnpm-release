import { analyzeChanges } from '../src/detector.js';
import assert from 'assert';
import sinon from 'sinon';

describe('analyzeChanges (mocked)', () => {
  it('should return empty array if no commits since last tag', async () => {
    const fakePackages = [
      { dir: '/fake/pkg', manifest: { name: 'pkg', version: '1.0.0', private: false } }
    ];
    const fakeExeca = sinon.stub().resolves({ stdout: '' });
    const result = await analyzeChanges({ deps: {
      findWorkspacePackages: async () => fakePackages,
      execa: fakeExeca
    }});
    assert.deepStrictEqual(result, []);
  });

  it('should return a package with commits if there are new commits', async () => {
    const fakePackages = [
      { dir: '/fake/pkg', manifest: { name: 'pkg', version: '1.0.0', private: false } }
    ];
    const fakeExeca = sinon.stub();
    fakeExeca.onFirstCall().resolves({ stdout: 'v1.0.0' }); // getLastTag
    fakeExeca.onSecondCall().resolves({ stdout: 'feat: add feature\nfix: bugfix' }); // git log
    const result = await analyzeChanges({ deps: {
      findWorkspacePackages: async () => fakePackages,
      execa: fakeExeca
    }});
    assert.ok(Array.isArray(result));
    assert.ok(result.length >= 1);
    assert.ok(result[0].rawCommits.includes('feat: add feature'));
  });

  it('should skip private packages in a multi-package workspace', async () => {
    const fakePackages = [
      { dir: '/fake/pkg1', manifest: { name: 'pkg1', version: '1.0.0', private: true } },
      { dir: '/fake/pkg2', manifest: { name: 'pkg2', version: '1.0.0', private: false } }
    ];
    const fakeExeca = sinon.stub().resolves({ stdout: 'feat: pkg2 change' });
    const result = await analyzeChanges({ deps: {
      findWorkspacePackages: async () => fakePackages,
      execa: fakeExeca
    }});
    assert.ok(Array.isArray(result));
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].name, 'pkg2');
  });
});
