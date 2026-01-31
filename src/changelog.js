import fs from 'fs/promises';
import path from 'path';

export async function updateChangelog(pkg) {
  const file = path.join(pkg.dir, 'CHANGELOG.md');
  let content = '';
  try { content = await fs.readFile(file, 'utf-8'); } catch { content = '# Changelog\n'; }

  const newEntry = `## [${pkg.newVersion}] - ${new Date().toISOString().split('T')[0]}\n- Update dependencies and fixes.\n`;
  
  // Insert after the first H1
  const lines = content.split('\n');
  lines.splice(1, 0, '\n' + newEntry);
  await fs.writeFile(file, lines.join('\n'));
}