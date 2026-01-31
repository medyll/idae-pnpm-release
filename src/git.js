// Commits & Tags multiples
import { execa } from 'execa';
// author : Lebrun Meddy

/**
 * Check if git user is configured, otherwise set a default bot identity
 */
async function ensureGitIdentity() {
  try {
    await execa('git', ['config', 'user.name']);
  } catch {
    console.log("🔧 No git identity found. Setting default bot identity...");
    /* await execa('git', ['config', 'user.name', 'github-actions[bot]']);
    await execa('git', ['config', 'user.email', 'github-actions[bot]@users.noreply.github.com']); */
  }
}

export async function finalizeGit(releasedPackages) {
  // Check and set identity if needed
  await ensureGitIdentity();

  await execa('git', ['add', '.']);

  const commitMessage = `chore(release): publish packages\n\n${releasedPackages
    .map(p => `- ${p.name}@${p.newVersion}`)
    .join('\n')}`;
  
  await execa('git', ['commit', '-m', commitMessage]);

  for (const pkg of releasedPackages) {
    const tagName = `${pkg.name}@${pkg.newVersion}`;
    // -f (force) prevents crashing if the tag was locally created before
    await execa('git', ['tag', '-a', tagName, '-m', tagName, '-f']);
  }

  await execa('git', ['push', 'origin', '--follow-tags']);
}