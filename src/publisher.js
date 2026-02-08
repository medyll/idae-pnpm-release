// author : Lebrun Meddy

import { execa } from 'execa';

export async function publishToRegistry(released, tag, { verbose } = {}) {
  if (!released || released.length === 0) return;

  // If multiple packages need publishing in a monorepo, use a single recursive pnpm call
  if (released.length > 1) {
    const filters = released.flatMap((p) => ['--filter', p.name]);
    const args = ['-r', 'publish', ...filters, '--tag', tag, '--no-git-checks'];
    if (verbose) console.log(`[verbose] Publishing ${released.length} packages with: pnpm ${args.join(' ')}`);
    await execa('pnpm', args, { stdio: 'inherit' });
    return;
  }

  // Single package (keep existing behavior)
  const pkg = released[0];
  if (verbose) console.log(`[verbose] Publishing ${pkg.name} with tag ${tag}`);
  await execa('pnpm', ['publish', '--filter', pkg.name, '--tag', tag, '--no-git-checks'], { stdio: 'inherit' });
}