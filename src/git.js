// Commits & Tags multiples
import { execa } from 'execa';
// author : Lebrun Meddy

/**
 * Check if git user is configured, otherwise set a default bot identity
 */
async function ensureGitIdentity(verbose) {
  try {
    await execa('git', ['config', 'user.name']);
    if (verbose) console.log('[verbose] Git user.name is set.');
  } catch {
    console.log("🔧 No git identity found. Setting default bot identity...");
    if (verbose) console.log('[verbose] Would set git user.name and user.email to github-actions[bot]');
    /* await execa('git', ['config', 'user.name', 'github-actions[bot]']);
    await execa('git', ['config', 'user.email', 'github-actions[bot]@users.noreply.github.com']); */
  }
}

export async function finalizeGit(releasedPackages, { verbose } = {}) {
  // Check and set identity if needed
  await ensureGitIdentity(verbose);
  if (verbose) console.log('[verbose] Staging all changes for commit.');
  await execa('git', ['add', '.']);

  const commitMessage = `chore(release): publish packages\n\n${releasedPackages
    .map(p => `- ${p.name}@${p.newVersion}`)
    .join('\n')}`;
  if (verbose) console.log('[verbose] Commit message:', commitMessage);
  await execa('git', ['commit', '-m', commitMessage]);

  for (const pkg of releasedPackages) {
    const tagName = `${pkg.name}@${pkg.newVersion}`;
    if (verbose) console.log(`[verbose] Tagging ${tagName}`);
    // -f (force) prevents crashing if the tag was locally created before
    await execa('git', ['tag', '-a', tagName, '-m', tagName, '-f']);
  }

  if (verbose) console.log('[verbose] Pushing tags and commits to origin.');
  await execa('git', ['push', 'origin', '--follow-tags']);
}