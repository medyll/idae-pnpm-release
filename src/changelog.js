// author : Lebrun Meddy
import fs from 'fs/promises';
import path from 'path';

export async function updateChangelog(pkg, { verbose } = {}) {
  const file = path.join(pkg.dir, 'CHANGELOG.md');
  let content = '';
  try {
    content = await fs.readFile(file, 'utf-8');
    if (verbose) console.log(`[verbose] Read existing changelog for ${pkg.name}`);
  } catch {
    content = '# Changelog\n';
    if (verbose) console.log(`[verbose] No existing changelog for ${pkg.name}, creating new.`);
  }

  const newEntry = `## [${pkg.newVersion}] - ${new Date().toISOString().split('T')[0]}\n- Update dependencies and fixes.\n`;
  if (verbose) console.log(`[verbose] Adding changelog entry for ${pkg.name}:`, newEntry);
  // Insert after the first H1
  const lines = content.split('\n');
  lines.splice(1, 0, '\n' + newEntry);
  await fs.writeFile(file, lines.join('\n'));
  if (verbose) console.log(`[verbose] Wrote changelog for ${pkg.name}`);
}