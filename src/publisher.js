// author : Lebrun Meddy

import { execa } from 'execa';

export async function publishToRegistry(released, tag, { verbose } = {}) {
  for (const pkg of released) {
    if (verbose) console.log(`[verbose] Publishing ${pkg.name} with tag ${tag}`);
    await execa('pnpm', ['publish', '--filter', pkg.name, '--tag', tag, '--no-git-checks','--access', 'public'], { stdio: 'inherit' });
  }
}