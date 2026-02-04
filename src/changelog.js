// author : Lebrun Meddy
import fs from 'fs/promises';
import path from 'path';
import { execa } from 'execa';

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

/**
 * Get all commits for a package from the entire git history
 * For monorepos, filters commits that touch the package directory
 */
async function getAllCommitsForPackage(packageDir, isMonorepo, { verbose } = {}) {
  try {
    const args = ['log', '--format=%B', '--'];
    if (!isMonorepo) {
      // Single package: get all commits
      args.push('.');
    } else {
      // Monorepo: get only commits touching this package directory
      args.push(packageDir);
    }
    
    const { stdout } = await execa('git', args);
    if (verbose) console.log(`[verbose] Retrieved all commits for package`);
    
    // Parse commits - split by double newlines or by conventional commit patterns
    const commits = stdout
      .split('\n\n')
      .filter(c => c.trim())
      .map(c => c.trim());
    
    return commits;
  } catch (e) {
    if (verbose) console.log(`[verbose] No commits found:`, e.message);
    return [];
  }
}

/**
 * Extract version number from tag
 */
function extractVersionFromTag(tag) {
  if (tag === 'Unreleased') return null;
  const match = tag.match(/@(.+)$|^v?(.+)$/);
  return match ? (match[1] || match[2]) : null;
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

/**
 * Regenerate changelog from all commits
 * For monorepos: only commits touching package directory
 * For single packages: all commits
 */
/**
 * Get all commits with details (hash, date, subject)
 */
async function getCommitsWithDetails(packageDir, isMonorepo, { verbose } = {}) {
  try {
    const args = ['log', '--format=%ai|%s', '--'];
    if (!isMonorepo) {
      args.push('.');
    } else {
      args.push(packageDir);
    }
    
    const { stdout } = await execa('git', args);
    if (verbose) console.log(`[verbose] Retrieved all commits with details`);
    
    const commits = stdout
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        const [dateTime, ...subjectParts] = line.split('|');
        const date = dateTime.split(' ')[0];
        const subject = subjectParts.join('|').trim();
        return { date, subject };
      });
    
    return commits;
  } catch (e) {
    if (verbose) console.log(`[verbose] No commits found:`, e.message);
    return [];
  }
}

export async function regenerateChangelog(pkg, isMonorepo, { verbose } = {}) {
  const file = path.join(pkg.dir, 'CHANGELOG.md');
  if (verbose) console.log(`[verbose] Regenerating changelog for ${pkg.name} (isMonorepo: ${isMonorepo})`);
  
  try {
    // Fetch all commits with details (used if no tags)
    const allCommits = await getCommitsWithDetails(pkg.dir, isMonorepo, { verbose });
    if (verbose) console.log(`[verbose] Found ${allCommits.length} total commits`);
    
    // Get all tags for this package
    const tagPattern = isMonorepo ? `${pkg.name}@*` : 'v*';
    let tags = [];
    try {
      const { stdout } = await execa('git', ['tag', '-l', tagPattern, '--sort=-version:refname']);
      tags = stdout.split('\n').filter(t => t.trim());
      if (verbose) console.log(`[verbose] Found tags:`, tags);
    } catch {
      if (verbose) console.log(`[verbose] No tags found`);
    }
    
    // Build changelog
    let changelog = '# Changelog\n';
    
    // 1. Unreleased (HEAD to Newest Tag)
    if (tags.length > 0) {
      const newestTag = tags[0];
      try {
        const args = ['log', `${newestTag}..HEAD`, '--format=%ai|%s', '--'];
        if (isMonorepo) {
          args.push(pkg.dir);
        } else {
          args.push('.');
        }

        const { stdout } = await execa('git', args);
        const unreleasedCommits = stdout
          .split('\n')
          .filter(line => line.trim())
          .map(line => {
            const [dateTime, ...subjectParts] = line.split('|');
            const date = dateTime.split(' ')[0];
            const subject = subjectParts.join('|').trim();
            return { date, subject };
          });

        if (unreleasedCommits.length > 0) {
           changelog += `\n## [Unreleased] - ${new Date().toISOString().split('T')[0]}\n`;
           unreleasedCommits.forEach(({ date, subject }) => {
             changelog += `- **${date}** - ${subject}\n`;
           });
        }
      } catch (e) {
         if (verbose) console.log(`[verbose] No unreleased commits found or error: ${e.message}`);
      }
    } else if (allCommits.length > 0) {
      // No tags, everything is unreleased
      changelog += `\n## [Unreleased] - ${new Date().toISOString().split('T')[0]}\n`;
      allCommits.forEach(({ date, subject }) => {
        changelog += `- **${date}** - ${subject}\n`;
      });
    }

    // 2. Version Commits (Newest Tag to Oldest Tag)
    for (let i = 0; i < tags.length; i++) {
      const currentTag = tags[i];
      const nextTag = tags[i + 1];
      
      let range;
      if (nextTag) {
        range = `${nextTag}..${currentTag}`;
      } else {
        range = `${currentTag}`;
      }
      
      try {
        const args = ['log', range, '--format=%ai|%s', '--'];
        if (isMonorepo) {
          args.push(pkg.dir);
        } else {
          args.push('.');
        }
        
        const { stdout } = await execa('git', args);
        const versionCommits = stdout
          .split('\n')
          .filter(line => line.trim())
          .map(line => {
             const [dateTime, ...subjectParts] = line.split('|');
             const date = dateTime.split(' ')[0];
             const subject = subjectParts.join('|').trim();
             return { date, subject };
           });
        
        if (versionCommits.length > 0) {
          const version = extractVersionFromTag(currentTag);
          
          // Get the date of this tag
          let dateStr = new Date().toISOString().split('T')[0];
          try {
            const { stdout: dateOut } = await execa('git', ['log', '-1', '--format=%ai', currentTag]);
            dateStr = dateOut.split(' ')[0];
          } catch {}
          
          const displayVersion = version || 'Unreleased';
          changelog += `\n## [${displayVersion}] - ${dateStr}\n`;
          
          versionCommits.forEach(({ date, subject }) => {
            changelog += `- **${date}** - ${subject}\n`;
          });
        }
      } catch {
        // No commits in this range
      }
    }
    
    await fs.writeFile(file, changelog);
    if (verbose) console.log(`[verbose] Regenerated changelog for ${pkg.name}`);
  } catch (e) {
    if (verbose) console.log(`[verbose] Error regenerating changelog:`, e.message);
    throw e;
  }
}