import fs from 'fs';
import path from 'path';
import readline from 'readline';

/**
 * Loads configuration from .idae-pnpm-release file in the current working directory
 * @returns {Object} Configuration object
 */
export function loadConfig() {
  const configName = '.idae-pnpm-release';
  const configPath = path.join(process.cwd(), configName);
  
  if (fs.existsSync(configPath)) {
    try {
      const content = fs.readFileSync(configPath, 'utf-8');
      return JSON.parse(content);
    } catch (e) {
      console.warn(`\x1b[33mWarning: Failed to parse ${configName}: ${e.message}\x1b[0m`);
    }
  }
  return {};
}

/**
 * Creates a default .idae-pnpm-release configuration file
 * @param {Object} [options] - CLI options
 * @param {boolean} [options.yes] - Skip interaction and use defaults
 */
export async function createConfig(options = {}) {
  const configName = '.idae-pnpm-release';
  const configPath = path.join(process.cwd(), configName);
  
  if (fs.existsSync(configPath)) {
    console.warn(`\x1b[33mWarning: ${configName} already exists.\x1b[0m`);
    return;
  }

  const defaultConfig = {
    "dry-run": false,
    "pre-id": "alpha",
    "verbose": false,
    "build": false,
    "package": false,
    "regenerate-changelog": false,
    "generate-readme-root": false
  };

  /** @type {Record<string, any>} */
  let configToWrite = defaultConfig;

  if (!options?.yes) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    /**
     * @param {string} q 
     * @param {string|boolean} d 
     * @returns {Promise<string|boolean>}
     */
    const question = (q, d) => new Promise(resolve => {
      const dStr = typeof d === 'boolean' ? (d ? 'y' : 'n') : d;
      rl.question(`${q} (${dStr})? `, (answer) => {
        const a = answer.trim().toLowerCase();
        if (typeof d === 'boolean') {
           if (a === 'y' || a === 'yes') resolve(true);
           else if (a === 'n' || a === 'no') resolve(false);
           else resolve(d);
        } else {
           resolve(a || d);
        }
      });
    });

    console.log(`\nConfiguration setup for ${configName}`);
    const useDefaults = await question('Use default settings', true);

    if (!useDefaults) {
      configToWrite = {};
      configToWrite['dry-run'] = await question('Enable dry-run by default', defaultConfig['dry-run']);
      configToWrite['pre-id'] = await question('Pre-release identifier', defaultConfig['pre-id']);
      configToWrite['verbose'] = await question('Enable verbose logging', defaultConfig['verbose']);
      configToWrite['build'] = await question('Run build script on formatting', defaultConfig['build']);
      configToWrite['package'] = await question('Run package script on formatting', defaultConfig['package']);
      configToWrite['regenerate-changelog'] = await question('Regenerate changelog (no publish)', defaultConfig['regenerate-changelog']);
      configToWrite['generate-readme-root'] = await question('Generate root README', defaultConfig['generate-readme-root']);
    }

    rl.close();
  }

  try {
    fs.writeFileSync(configPath, JSON.stringify(configToWrite, null, 2));
    console.log(`\x1b[32mCreated configuration file: ${configName} (defaults: ${options.yes || configToWrite === defaultConfig})\x1b[0m`);
    if (!options.yes && configToWrite !== defaultConfig) {
      console.log('Custom configuration applied:');
      console.log(JSON.stringify(configToWrite, null, 2));
    }
  } catch (e) {
    console.error(`\x1b[31mError creating ${configName}: ${e.message}\x1b[0m`);
  }
}
