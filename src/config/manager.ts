import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { ConfigSchema, DEFAULT_CONFIG, type Config, type Profile } from './schema.js';

/**
 * Get path to config file (~/.dexter/config.json)
 */
export function getConfigPath(): string {
  return join(homedir(), '.dexter', 'config.json');
}

/**
 * Ensure .dexter directory exists
 */
function ensureConfigDir(): void {
  const configDir = join(homedir(), '.dexter');
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true });
  }
}

/**
 * Load config from disk. Returns default if not exists or corrupted.
 */
export function loadConfig(): Config {
  const configPath = getConfigPath();

  if (!existsSync(configPath)) {
    return { ...DEFAULT_CONFIG };
  }

  try {
    const raw = readFileSync(configPath, 'utf-8');
    const parsed = JSON.parse(raw);
    const result = ConfigSchema.safeParse(parsed);

    if (result.success) {
      return result.data;
    }

    // Invalid schema, return default
    return { ...DEFAULT_CONFIG };
  } catch {
    // JSON parse error or read error, return default
    return { ...DEFAULT_CONFIG };
  }
}

/**
 * Save config to disk atomically (write to temp, then rename)
 */
export function saveConfig(config: Config): void {
  const result = ConfigSchema.safeParse(config);
  if (!result.success) {
    throw new Error(`Invalid config: ${result.error.message}`);
  }

  ensureConfigDir();
  const configPath = getConfigPath();
  const tempPath = `${configPath}.tmp`;

  writeFileSync(tempPath, JSON.stringify(result.data, null, 2), 'utf-8');
  renameSync(tempPath, configPath);
}

/**
 * Get active profile or null if none set
 */
export function getActiveProfile(): Profile | null {
  const config = loadConfig();

  if (!config.activeProfile) {
    return null;
  }

  return config.profiles.find((p) => p.name === config.activeProfile) ?? null;
}

/**
 * Set active profile by name. Throws if profile not found.
 */
export function setActiveProfile(name: string | null): void {
  const config = loadConfig();

  if (name !== null) {
    const exists = config.profiles.some((p) => p.name === name);
    if (!exists) {
      throw new Error(`Profile "${name}" not found`);
    }
  }

  config.activeProfile = name;
  saveConfig(config);
}

/**
 * Add a new profile. Throws if duplicate name exists.
 */
export function addProfile(profile: Profile): void {
  const config = loadConfig();

  const exists = config.profiles.some((p) => p.name === profile.name);
  if (exists) {
    throw new Error(`Profile "${profile.name}" already exists`);
  }

  config.profiles.push(profile);
  saveConfig(config);
}

/**
 * Delete profile by name. Clears activeProfile if deleted.
 */
export function deleteProfile(name: string): void {
  const config = loadConfig();

  const index = config.profiles.findIndex((p) => p.name === name);
  if (index === -1) {
    throw new Error(`Profile "${name}" not found`);
  }

  config.profiles.splice(index, 1);

  if (config.activeProfile === name) {
    config.activeProfile = null;
  }

  saveConfig(config);
}

/**
 * List all profiles
 */
export function listProfiles(): Profile[] {
  const config = loadConfig();
  return config.profiles;
}
