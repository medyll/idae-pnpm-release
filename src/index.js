import { analyzeChanges } from './detector.js';
import { bumpPackages } from './versioner.js';
import { updateChangelog } from './changelog.js';
import { finalizeGit } from './git.js';
import { publishToRegistry } from './publisher.js';

export async function executeRelease(options) {
  const isPre = process.env.GITHUB_REF !== 'refs/heads/main';
  
  const changes = await analyzeChanges();
  if (!changes.length) return console.log('Nothing to release.');

  const released = await bumpPackages(changes, isPre, options.preId);
  
  for (const pkg of released) {
    await updateChangelog(pkg);
  }

  if (!options.dryRun) {
    await finalizeGit(released);
    await publishToRegistry(released, isPre ? options.preId : 'latest');
  }
}