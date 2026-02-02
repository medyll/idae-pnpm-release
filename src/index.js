// author : Lebrun Meddy
import { analyzeChanges } from "./detector.js";
import { bumpPackages } from "./versioner.js";
import { updateChangelog } from "./changelog.js";
import { finalizeGit } from "./git.js";
import { publishToRegistry } from "./publisher.js";
import { executePrePublishCommands } from "./pre-publish.js";

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

export async function executeRelease(options) {
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
  const released = await bumpPackages(changes, isPre, options.preId, { verbose });

  for (const pkg of released) {
    console.log(
      `  - ${colors.bright}${pkg.name}${colors.reset}: ${colors.yellow}${pkg.currentVersion}${colors.reset} -> ${colors.green}${pkg.newVersion}${colors.reset}`,
    );
    
    // 3. Changelogs
    console.log(`  - ${colors.blue}📝 Updating CHANGELOG.md...${colors.reset}`);
    await updateChangelog(pkg, { verbose });

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