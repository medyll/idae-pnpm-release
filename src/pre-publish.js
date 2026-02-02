import { execa } from "execa";
import fs from "fs/promises";
import path from "path";

async function readPackageManifest(pkgDir) {
  const manifestPath = path.join(pkgDir, "package.json");
  const content = await fs.readFile(manifestPath, "utf-8");
  return JSON.parse(content);
}

async function runPackageScript(pkgDir, scriptName) {
  console.log(`    ⚙️  pnpm run ${scriptName}...`);
  await execa("pnpm", ["run", scriptName], { cwd: pkgDir });
}

/**
 * Execute pre-publish commands (build and/or package) before release
 * @param {Array} packages - Packages to process
 * @param {Object} options - CLI options
 * @param {boolean} options.build - Whether to run build
 * @param {boolean} options.package - Whether to run package
 */
export async function executePrePublishCommands(packages, options) {
  const requestedScripts = [];
  if (options.build) requestedScripts.push("build");
  if (options.package) requestedScripts.push("package");

  if (requestedScripts.length === 0) {
    return;
  }

  for (const pkg of packages) {
    const manifest = await readPackageManifest(pkg.dir);
    const scripts = manifest.scripts || {};
    const missingScripts = requestedScripts.filter(
      (scriptName) => !scripts[scriptName],
    );

    if (missingScripts.length > 0) {
      console.log(
        `    ℹ️  ${manifest.name}: missing script(s): ${missingScripts.join(", ")}. Skipping.`,
      );
    }

    for (const scriptName of requestedScripts) {
      if (scripts[scriptName]) {
        await runPackageScript(pkg.dir, scriptName);
      }
    }
  }
}
