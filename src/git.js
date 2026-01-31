// Commits & Tags multiples
import { execa } from 'execa';

export async function finalizeGit(releasedPackages) {
  // 1. Setup identity if running in CI
  if (process.env.GITHUB_ACTIONS) {
    console.log("🔧 Configuring CI git identity...");
    /* await execa('git', ['config', 'user.name', 'github-actions[bot]']);
    await execa('git', ['config', 'user.email', 'github-actions[bot]@users.noreply.github.com']); */
  }

  // 2. Stage changes
  await execa('git', ['add', '.']);

  // 3. Create the release commit
  const commitMessage = `chore(release): publish packages\n\n${releasedPackages
    .map(p => `- ${p.name}@${p.newVersion}`)
    .join('\n')}`;
  
  await execa('git', ['commit', '-m', commitMessage]);

  // 4. Create tags
  for (const pkg of releasedPackages) {
    const tagName = `${pkg.name}@${pkg.newVersion}`;
    await execa('git', ['tag', '-a', tagName, '-m', tagName]);
  }

  // 5. Push (follow-tags triggers the push of the tags we just created)
  await execa('git', ['push', 'origin', '--follow-tags']);
}