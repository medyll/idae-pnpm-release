import { execa } from "execa";
import fs from "fs/promises";
import path from "path";

async function readPackageManifest(pkgDir) {
  const manifestPath = path.join(pkgDir, "package.json");
  const content = await fs.readFile(manifestPath, "utf-8");
  return JSON.parse(content);
}

async function runPackageScript(pkgDir, scriptName) {
  console.log(`    pnpm run ${scriptName}...`);
  await execa("pnpm", ["run", scriptName], { cwd: pkgDir });
}

/**
 * Order packages so that a package is always built after the workspace
 * packages it depends on. Without this, a consumer can be built before its
 * dependency has produced dist/, and type resolution fails.
 * Cycles and unknown deps are tolerated: remaining nodes keep discovery order.
 * @param {Array} packages
 * @param {Map<string, object>} manifests - keyed by pkg.dir
 */
function sortByDependencyOrder(packages, manifests) {
  const byName = new Map();
  for (const pkg of packages) {
    const manifest = manifests.get(pkg.dir);
    if (manifest?.name) byName.set(manifest.name, pkg);
  }

  const dependenciesOf = (pkg) => {
    const manifest = manifests.get(pkg.dir) || {};
    const all = {
      ...manifest.dependencies,
      ...manifest.devDependencies,
      ...manifest.peerDependencies,
    };
    // Only workspace siblings that are part of this run matter here.
    return Object.keys(all).filter((name) => byName.has(name) && byName.get(name) !== pkg);
  };

  const sorted = [];
  const state = new Map(); // pkg -> 'visiting' | 'done'

  const visit = (pkg) => {
    const status = state.get(pkg);
    if (status === "done") return;
    if (status === "visiting") return; // cycle: break here, order stays best-effort
    state.set(pkg, "visiting");
    for (const depName of dependenciesOf(pkg)) {
      visit(byName.get(depName));
    }
    state.set(pkg, "done");
    sorted.push(pkg);
  };

  for (const pkg of packages) visit(pkg);
  return sorted;
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

  const manifests = new Map();
  for (const pkg of packages) {
    manifests.set(pkg.dir, await readPackageManifest(pkg.dir));
  }

  for (const pkg of sortByDependencyOrder(packages, manifests)) {
    const manifest = manifests.get(pkg.dir);
    const scripts = manifest.scripts || {};
    const missingScripts = requestedScripts.filter(
      (scriptName) => !scripts[scriptName],
    );

    if (missingScripts.length > 0) {
      console.log(
        `    ${manifest.name}: missing script(s): ${missingScripts.join(", ")}. Skipping.`,
      );
    }

    for (const scriptName of requestedScripts) {
      if (scripts[scriptName]) {
        await runPackageScript(pkg.dir, scriptName);
      }
    }
  }
}
