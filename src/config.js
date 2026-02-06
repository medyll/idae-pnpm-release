import fs from 'fs';
import path from 'path';

/**
 * Loads configuration from .idae.pnpm-release file in the current working directory
 * @returns {Object} Configuration object
 */
export function loadConfig() {
  const configName = '.idae.pnpm-release';
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
