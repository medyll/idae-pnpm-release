// author : Lebrun Meddy
import { analyzeChanges, isMonorepo } from "./detector.js";
import { bumpPackages } from "./versioner.js";
import { updateChangelog, regenerateChangelog } from "./changelog.js";
import { finalizeGit } from "./git.js";
import { publishToRegistry } from "./publisher.js";
import { executePrePublishCommands } from "./pre-publish.js";
import { generateRootReadme } from "./readme-generator.js";
import findWorkspacePackages from '@pnpm/find-workspace-packages';
import fs from 'fs/promises';
import path from 'path';

// Simple verbose logger
function vLog(verbose, ...args) {
  if (verbose) {
    console.log(`${"\x1b[90m"}[verbose]`, ...args, "\x1b[0m");
  }
}

// ANSI Color codes
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  red: "\x1b[31m",
};

/**
 * Get all packages for changelog regeneration
 */
async function getAllPackages({ verbose } = {}) {
  let allPackages = [];
  try {
    const getPkgs = typeof findWorkspacePackages === 'function' 
      ? findWorkspacePackages 
      : findWorkspacePackages.default;
    const result = await getPkgs('.');
    // pnpm tool may return an array or an object with a 'packages' property
    if (Array.isArray(result)) {
      allPackages = result;
    } else if (result && Array.isArray(result.packages)) {
      allPackages = result.packages;
    } else if (result && result.length === undefined && result && result.manifest) {
      // single package shape
      allPackages = [result];
    }
    if (verbose) console.log('[verbose] Found packages:', allPackages.map(p => p.manifest?.name || p.dir));
  } catch (e) {
    const manifestPath = path.join(process.cwd(), 'package.json');
    try {
      const content = await fs.readFile(manifestPath, 'utf-8');
      const manifest = JSON.parse(content);
      allPackages = [{
        dir: process.cwd(),
        manifest: manifest
      }];
    } catch (err) {
      console.error("❌ No pnpm workspace or package.json found.");
      return [];
    }
  }

  // If findWorkspacePackages returned only the root package but the repo
  // contains a pnpm workspace (pnpm-workspace.yaml) or `workspaces` in
  // package.json, try to enumerate `packages/*` directories as a fallback.
  try {
    if (allPackages.length <= 1) {
      const rootPkgPath = path.join(process.cwd(), 'package.json');
      let rootManifest = null;
      try {
        const content = await fs.readFile(rootPkgPath, 'utf-8');
        rootManifest = JSON.parse(content);
      } catch {}

      const hasWorkspaceFile = await (async () => {
        try {
          await fs.access(path.join(process.cwd(), 'pnpm-workspace.yaml'));
          return true;
        } catch { return false; }
      })();

      const hasWorkspacesField = rootManifest && Array.isArray(rootManifest.workspaces) && rootManifest.workspaces.length > 0;

      if (hasWorkspaceFile || hasWorkspacesField) {
        try {
          const packagesDir = path.join(process.cwd(), 'packages');
          const entries = await fs.readdir(packagesDir, { withFileTypes: true });
          const found = [];
          for (const ent of entries) {
            if (!ent.isDirectory()) continue;
            const pkgPath = path.join(packagesDir, ent.name, 'package.json');
            try {
              const data = await fs.readFile(pkgPath, 'utf-8');
              const manifest = JSON.parse(data);
              found.push({ dir: path.join(packagesDir, ent.name), manifest });
            } catch {}
          }
          if (found.length > 0) {
            // If a root package exists, include it so we can generate a root CHANGELOG
            if (rootManifest) {
              allPackages = [{ dir: process.cwd(), manifest: rootManifest }, ...found];
            } else {
              allPackages = found;
            }
            if (verbose) console.log('[verbose] Fallback: discovered packages in packages/*', allPackages.map(p => p.manifest.name));
          }
        } catch {}
      }
    }
  } catch {}
  return allPackages;
}

/**
 * Regeneration mode: regenerate all changelogs from git history
 */
async function executeRegenerateChangelog(options) {
  const verbose = options.verbose;

  console.log(
    `\n${colors.bright}${colors.blue}📝 Regenerating CHANGELOGs from git history...${colors.reset}\n`,
  );
  vLog(verbose, "Options:", options);

  // Get all packages and detect monorepo by count
  const allPackages = await getAllPackages({ verbose });
  const monoRepo = allPackages.length > 1;
  console.log(`${colors.cyan}Monorepo mode: ${monoRepo ? 'YES' : 'NO'}${colors.reset}`);
  if (!allPackages.length) {
    console.error("❌ No packages found.");
    return;
  }

  console.log(`${colors.cyan}Found ${allPackages.length} package(s)${colors.reset}`);

  // Regenerate for each package (include private packages for changelog regeneration)
  for (const pkg of allPackages) {
    console.log(`${colors.cyan}  📝 ${pkg.manifest.name || pkg.dir}${colors.reset}`);
    
    // Prepare package object for changelog function
    const pkgData = {
      name: pkg.manifest.name,
      dir: pkg.dir,
      rawCommits: [] // Will be fetched inside regenerateChangelog
    };

    try {
      await regenerateChangelog(pkgData, monoRepo, { verbose });
      console.log(`${colors.green}    ✓ Generated${colors.reset}`);
    } catch (e) {
      console.error(`${colors.red}    ✗ Error: ${e.message}${colors.reset}`);
    }
  }

  console.log(
    `\n${colors.bright}${colors.green}🎉 Changelog regeneration completed!${colors.reset}\n`,
  );
}

export async function executeRelease(options) {
  // Handle regenerate changelog mode
  if (options.regenerateChangelog) {
    return executeRegenerateChangelog(options);
  }

  const isPre = process.env.GITHUB_REF !== "refs/heads/main";
  const mode = isPre ? `PRE-RELEASE (${options.preId})` : "STABLE";
  const verbose = options.verbose;

  console.log(
    `\n${colors.bright}${colors.blue}🚀 Starting release process in ${mode} mode...${colors.reset}\n`,
  );
  vLog(verbose, "Options:", options);

  // 1. Detection
  console.log(`${colors.cyan}🔍 Analyzing changes...${colors.reset}`);
  const changes = await analyzeChanges({ verbose });

  if (!changes.length) {
    console.log(
      `${colors.yellow}✨ Nothing to release. All packages are up to date.${colors.reset}`,
    );
    return;
  }

  console.log(
    `${colors.green}Found ${changes.length} package(s) with changes.${colors.reset}`,
  );

  // 2. Pre-publish commands (per package)
  await executePrePublishCommands(changes, options);

  // 3. Bumping versions
  console.log(`${colors.cyan}🆙 Bumping versions...${colors.reset}`);
  const released = await bumpPackages(changes, isPre, options.preId, { verbose, dryRun: options.dryRun });

  for (const pkg of released) {
    console.log(
      `  - ${colors.bright}${pkg.name}${colors.reset}: ${colors.yellow}${pkg.currentVersion}${colors.reset} -> ${colors.green}${pkg.newVersion}${colors.reset}`,
    );
    
    // 3. Changelogs
    console.log(`  - ${colors.blue}📝 Updating CHANGELOG.md...${colors.reset}`);
    await updateChangelog(pkg, { verbose });
  }

  // 4. Generate Root README if requested
  if (options.generateReadmeRoot) {
    console.log(`${colors.cyan}📝 Generating root README.md...${colors.reset}`);
    await generateRootReadme({ verbose, dryRun: options.dryRun });
  }

  // 5. Execution or Dry Run
  if (!options.dryRun) {
    console.log(
      `\n${colors.magenta}📂 Finalizing Git operations (commit & tags)...${colors.reset}`,
    );
    await finalizeGit(released, { verbose });

    console.log(`${colors.magenta}📦 Publishing to registry...${colors.reset}`);
    await publishToRegistry(released, isPre ? options.preId : "latest", {
      verbose,
    });

    console.log(
      `\n${colors.bright}${colors.green}🎉 Release successfully finished!${colors.reset}\n`,
    );
  } else {
    console.log(
      `\n${colors.bright}${colors.yellow}⚠️  DRY RUN COMPLETED${colors.reset}`,
    );
    console.log(
      `${colors.yellow}No changes were pushed to Git or NPM.${colors.reset}\n`,
    );
  }
}