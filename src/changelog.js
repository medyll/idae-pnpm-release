// author : Lebrun Meddy
import fs from 'fs/promises';
import path from 'path';

/**
 * Format conventional commits into changelog entries
 * Groups commits by type (feat, fix, etc.) and formats them
 */
function formatCommitEntries(commits) {
  if (!commits || commits.length === 0) {
    return '- Update dependencies and fixes.';
  }

  const grouped = {
    feat: [],
    fix: [],
    perf: [],
    docs: [],
    style: [],
    refactor: [],
    test: [],
    chore: [],
    ci: [],
    other: []
  };

  for (const commit of commits) {
    const match = commit.match(/^(feat|fix|perf|docs|style|refactor|test|chore|ci)(?:\(.+\))?!?:\s*(.+)/);
    if (match) {
      const [, type, message] = match;
      const cleanMessage = message.split('\n')[0].trim();
      grouped[type].push(cleanMessage);
    } else if (commit.trim()) {
      grouped.other.push(commit.split('\n')[0].trim());
    }
  }

  const typeLabels = {
    feat: 'Features',
    fix: 'Bug Fixes',
    perf: 'Performance',
    docs: 'Documentation',
    style: 'Styling',
    refactor: 'Refactoring',
    test: 'Tests',
    chore: 'Chores',
    ci: 'CI/CD',
    other: 'Other'
  };

  let output = '';
  for (const [type, messages] of Object.entries(grouped)) {
    if (messages.length > 0) {
      const label = typeLabels[type];
      output += `\n**${label}:**\n`;
      messages.forEach(msg => {
        output += `- ${msg}\n`;
      });
    }
  }

  return output || '- Update dependencies and fixes.';
}

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

  const commitEntries = formatCommitEntries(pkg.rawCommits);
  const newEntry = `## [${pkg.newVersion}] - ${new Date().toISOString().split('T')[0]}${commitEntries}\n`;
  if (verbose) console.log(`[verbose] Adding changelog entry for ${pkg.name}:`, newEntry);
  // Insert after the first H1
  const lines = content.split('\n');
  lines.splice(1, 0, '\n' + newEntry);
  await fs.writeFile(file, lines.join('\n'));
  if (verbose) console.log(`[verbose] Wrote changelog for ${pkg.name}`);
}