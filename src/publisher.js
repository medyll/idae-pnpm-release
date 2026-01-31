import { execa } from 'execa';

export async function publishToRegistry(released, tag) {
    for (const pkg of released) {
      await execa('pnpm', ['publish', '--filter', pkg.name, '--tag', tag, '--no-git-checks'], { stdio: 'inherit' });
    }
  }