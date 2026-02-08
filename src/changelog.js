// author : Lebrun Meddy
import fs from 'fs/promises';
import path from 'path';
import { execa } from 'execa';
import { loadConfig } from './config.js';

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
    // Get commit hashes first, then filter by relevant files (use repo-relative path)
    const relPath = path.relative(process.cwd(), packageDir).replace(/\\/g, '/') || '.';
    const args = ['log', '--format=%H', '--', relPath];

    const { stdout: hashesOut } = await execa('git', args);
    const hashes = hashesOut.split('\n').filter(Boolean);

    const commits = [];
    for (const hash of hashes) {
      const { stdout: filesOut } = await execa('git', ['show', '--pretty=format:', '--name-only', hash]);
      const files = filesOut.split('\n').map(f => f.trim()).filter(Boolean);

      const cfg = loadConfig() || {};
      const ignored = Array.isArray(cfg['ignore-file-changes']) ? cfg['ignore-file-changes'] : ['CHANGELOG.md', 'package.json'];

      const hasRelevant = files.some(f => {
          const abs = path.resolve(process.cwd(), f);
          if (!abs.startsWith(path.resolve(packageDir))) return false;
          const rel = path.relative(path.resolve(packageDir), abs).replace(/\\\\/g, '/');
          if (ignored.includes(rel)) return false;
          return true;
        });

      if (hasRelevant) {
        const { stdout: bodyOut } = await execa('git', ['show', '-s', '--format=%B', hash]);
        commits.push(bodyOut.trim());
      }
    }

    if (verbose) console.log(`[verbose] Retrieved ${commits.length} relevant commits for package`);
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
    // Build commits from hashes but only include relevant-file commits (use repo-relative path)
    const relPath = path.relative(process.cwd(), packageDir).replace(/\\/g, '/') || '.';
    const args = ['log', '--format=%H', '--', relPath];

    const { stdout: hashesOut } = await execa('git', args);
    const hashes = hashesOut.split('\n').filter(Boolean);

    const commits = [];
    for (const hash of hashes) {
      const { stdout: filesOut } = await execa('git', ['show', '--pretty=format:', '--name-only', hash]);
      const files = filesOut.split('\n').map(f => f.trim()).filter(Boolean);

      const hasRelevant = files.some(f => {
        const abs = path.resolve(process.cwd(), f);
        if (!abs.startsWith(path.resolve(packageDir))) return false;
        const rel = path.relative(path.resolve(packageDir), abs).replace(/\\\\/g, '/');
        if (rel === 'package.json' || rel === 'CHANGELOG.md') return false;
        return true;
      });

      if (hasRelevant) {
        const { stdout: detailOut } = await execa('git', ['show', '-s', '--format=%ai|%s', hash]);
        const [dateTime, ...subjectParts] = detailOut.split('|');
        const date = (dateTime || '').split(' ')[0];
        const subject = subjectParts.join('|').trim();
        commits.push({ date, subject });
      }
    }

    if (verbose) console.log(`[verbose] Retrieved ${commits.length} relevant commits with details`);
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
    
    // 1. Unreleased (HEAD to Newest Tag) - consider only relevant-file commits
    if (tags.length > 0) {
      const newestTag = tags[0];
      try {
        // get hashes in range (use repo-relative package path)
        const relPkg = path.relative(process.cwd(), pkg.dir).replace(/\\/g, '/') || '.';
        const argsHashes = ['log', `${newestTag}..HEAD`, '--format=%H', '--', relPkg];
        const { stdout: hashesOut } = await execa('git', argsHashes);
        const hashes = hashesOut.split('\n').filter(Boolean);

        const unreleasedCommits = [];
        for (const hash of hashes) {
          const { stdout: filesOut } = await execa('git', ['show', '--pretty=format:', '--name-only', hash]);
          const files = filesOut.split('\n').map(f => f.trim()).filter(Boolean);
          const cfg = loadConfig() || {};
          const ignored = Array.isArray(cfg['ignore-file-changes']) ? cfg['ignore-file-changes'] : ['CHANGELOG.md', 'package.json'];
          const hasRelevant = files.some(f => {
              const abs = path.resolve(process.cwd(), f);
              if (!abs.startsWith(path.resolve(pkg.dir))) return false;
              const rel = path.relative(path.resolve(pkg.dir), abs).replace(/\\\\/g, '/');
              if (ignored.includes(rel)) return false;
              return true;
            });
          if (hasRelevant) {
            const { stdout: detailOut } = await execa('git', ['show', '-s', '--format=%ai|%s', hash]);
            const [dateTime, ...subjectParts] = detailOut.split('|');
            const date = (dateTime || '').split(' ')[0];
            const subject = subjectParts.join('|').trim();
            unreleasedCommits.push({ date, subject });
          }
        }

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
      // No tags, everything is unreleased (allCommits already filtered for relevant files)
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
        // get hashes for this range then filter by relevant files (use repo-relative package path)
        const relPkg = path.relative(process.cwd(), pkg.dir).replace(/\\/g, '/') || '.';
        const argsHashes = ['log', range, '--format=%H', '--', relPkg];
        const { stdout: hashesOut } = await execa('git', argsHashes);
        const hashes = hashesOut.split('\n').filter(Boolean);

        const versionCommits = [];
        for (const hash of hashes) {
          const { stdout: filesOut } = await execa('git', ['show', '--pretty=format:', '--name-only', hash]);
          const files = filesOut.split('\n').map(f => f.trim()).filter(Boolean);
          const cfg = loadConfig() || {};
          const ignored = Array.isArray(cfg['ignore-file-changes']) ? cfg['ignore-file-changes'] : ['CHANGELOG.md', 'package.json'];
          const hasRelevant = files.some(f => {
            const abs = path.resolve(process.cwd(), f);
            if (!abs.startsWith(path.resolve(pkg.dir))) return false;
            const rel = path.relative(path.resolve(pkg.dir), abs).replace(/\\\\/g, '/');
            if (ignored.includes(rel)) return false;
            return true;
          });
          if (hasRelevant) {
            const { stdout: detailOut } = await execa('git', ['show', '-s', '--format=%ai|%s', hash]);
            const [dateTime, ...subjectParts] = detailOut.split('|');
            const date = (dateTime || '').split(' ')[0];
            const subject = subjectParts.join('|').trim();
            versionCommits.push({ date, subject });
          }
        }
        
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