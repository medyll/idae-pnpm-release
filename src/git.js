// Commits & Tags multiples
import { execa } from 'execa';

export async function finalizeGit(released) {
    await execa('git', ['add', '.']);
    await execa('git', ['commit', '-m', 'chore(release): publish packages']);
    for (const pkg of released) {
      const tag = `${pkg.name}@${pkg.newVersion}`;
      await execa('git', ['tag', tag]);
    }
    await execa('git', ['push', 'origin', '--follow-tags']);
  }