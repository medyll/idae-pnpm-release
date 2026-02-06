
import fs from 'fs/promises';
import path from 'path';
import findWorkspacePackages from '@pnpm/find-workspace-packages';

/**
 * Get the most recent changelog entry from string content
 */
function getLastChangelogEntry(changelogContent) {
  if (!changelogContent) return null;
  const changelogLines = changelogContent.split("\n");
  
  // Find the first header (current version)
  // We assume headers start with '## ' or '### ' depending on format, 
  // but usually top-level versions are ## [version]
  let firstHeaderIndex = -1;
  
  for (let i = 0; i < changelogLines.length; i++) {
    if (changelogLines[i].startsWith('## ')) {
        firstHeaderIndex = i;
        break;
    }
  }

  if (firstHeaderIndex === -1) return null;

  // Find the next header (previous version) to slice until there
  let secondHeaderIndex = -1;
  for (let i = firstHeaderIndex + 1; i < changelogLines.length; i++) {
     if (changelogLines[i].startsWith('## ')) {
        secondHeaderIndex = i;
        break;
     }
  }

  if (secondHeaderIndex === -1) {
    return changelogLines.slice(firstHeaderIndex).join("\n").trim();
  }
  return changelogLines.slice(firstHeaderIndex, secondHeaderIndex).join("\n").trim();
}

/**
 * Generate a root README.md for the monorepo
 */
export async function generateRootReadme({ verbose, dryRun } = {}) {
  const rootDir = process.cwd();
  const rootPkgPath = path.join(rootDir, 'package.json');
  let rootPkg = {};
  
  try {
    const rootPkgContent = await fs.readFile(rootPkgPath, 'utf-8');
    rootPkg = JSON.parse(rootPkgContent);
  } catch (e) {
    if (verbose) console.error('❌ Could not read root package.json for README generation');
    return;
  }

  const monorepoName = rootPkg.name === "root" ? "Monorepo Workspace" : rootPkg.name;
  const monorepoDescription = rootPkg.description || "Workspace managed by @medyll/idae-pnpm-release";

  // Use pnpm tools to find packages
  let getPkgs = findWorkspacePackages;
  if (typeof getPkgs !== 'function') {
    if (getPkgs.default && typeof getPkgs.default === 'function') {
       getPkgs = getPkgs.default;
    } else if (getPkgs.findWorkspacePackages && typeof getPkgs.findWorkspacePackages === 'function') {
       getPkgs = getPkgs.findWorkspacePackages;
    }
  }
  
  if (typeof getPkgs !== 'function') {
      console.error("❌ Could not load findWorkspacePackages function.");
      return;
  }
  
  const allPackages = await getPkgs(rootDir);
  
  // Filter out the root package itself (it usually has dir === rootDir)
  const packages = allPackages.filter(p => path.relative(rootDir, p.dir) !== '');

  if (verbose) console.log(`[verbose] Found ${packages.length} packages for README generation.`);

  // Collect info
  const repoInfos = await Promise.all(packages.map(async (pkg) => {
    const pkgPath = pkg.dir;
    
    // Check if blacklisted? (Feature removed for generic tool, but logic placeheld here)
    
    const changelogPath = path.join(pkgPath, 'CHANGELOG.md');
    let changelogContent = null;
    let lastChangelogEntry = null;

    try {
        changelogContent = await fs.readFile(changelogPath, 'utf-8');
        lastChangelogEntry = getLastChangelogEntry(changelogContent);
    } catch (e) {
        // No changelog found or read error
    }

    // Determine relative path for links in markdown
    const relativePath = path.relative(rootDir, pkgPath).split(path.sep).join(path.posix.sep);
    
    // Construct local links (works on GitHub/GitLab web UI)
    const githubLink = `./${relativePath}`;
    const changelogLink = `./${relativePath}/CHANGELOG.md`;

    return {
      name: pkg.manifest.name,
      description: pkg.manifest.description,
      version: pkg.manifest.version,
      changelog: lastChangelogEntry,
      changelogPath: changelogContent ? changelogPath : null,
      changelogLink,
      githubLink,
      private: pkg.manifest.private
    };
  }));

  // Sort by name
  repoInfos.sort((a, b) => a.name.localeCompare(b.name));

  /* GENERATE MARKDOWN */
  let readmeContent = `# ${monorepoName}\n\n${monorepoDescription}\n\n`;

  // List of packages Table of Contents
  readmeContent += "## Packages\n\n";
  repoInfos.forEach(info => {
    const privateLabel = info.private ? ' (private)' : '';
    readmeContent += `- [${info.name}](${info.githubLink})${privateLabel}\n`;
  });

  readmeContent += "\n## Details\n\n";
  repoInfos.forEach(info => {
    readmeContent += `### ${info.name}\n`;
    if (info.description) {
      readmeContent += `${info.description}\n\n`;
    }
    readmeContent += `**Location:** [${info.githubLink}](${info.githubLink})  \n`;
    readmeContent += `**Version:** ${info.version}`;
    if (info.changelogPath) {
      readmeContent += ` — [See Changelog](${info.changelogLink})`;
    }
    readmeContent += `\n\n`;
    
    // Optional: Include latest changelog snippet directly?
    // The original script put "see changelog" link.
    // It also had `repoInfo.changelog = lastChangelogEntry;` but didn't seem to output it in the `generateReadme` function loop in `readmeContent`.
    // Wait, checking the attachment `generate-readme.js`:
    // It does `readmeContent += [see changelog](${info.changelogLink})\n`
    // It does NOT print the changelog content itself in the loop, although it parses it.
    // So I will stick to the link.
  });

  const readmePath = path.join(rootDir, 'README.md');
  
  // Check if content changed
  let currentContent = '';
  try {
      currentContent = await fs.readFile(readmePath, 'utf-8');
  } catch (e) {}

  if (currentContent === readmeContent) {
    if (verbose) console.log(`[verbose] README.md is up to date.`);
    return;
  }

  if (dryRun) {
    console.log(`[dry-run] Would write updated README.md to ${readmePath}`);
    return;
  }

  await fs.writeFile(readmePath, readmeContent, 'utf-8');
  console.log(`📝 Generated root README.md`);
}
