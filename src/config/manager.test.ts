import { describe, test, expect, beforeEach, afterEach, mock } from 'bun:test';
import { mkdirSync, rmSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

// Create isolated temp directory for each test run
let testHomeDir: string;
let originalHome: string | undefined;

beforeEach(() => {
  testHomeDir = join(tmpdir(), `dexter-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  mkdirSync(testHomeDir, { recursive: true });
  originalHome = process.env.HOME;
  process.env.HOME = testHomeDir;
  process.env.USERPROFILE = testHomeDir; // Windows support
});

afterEach(() => {
  if (originalHome !== undefined) {
    process.env.HOME = originalHome;
  }
  process.env.USERPROFILE = originalHome;
  if (existsSync(testHomeDir)) {
    rmSync(testHomeDir, { recursive: true, force: true });
  }
});

// Helper to get config path in test home
function getTestConfigPath(): string {
  return join(testHomeDir, '.dexter', 'config.json');
}

// Helper to write raw config file
function writeTestConfig(content: string): void {
  const configDir = join(testHomeDir, '.dexter');
  mkdirSync(configDir, { recursive: true });
  writeFileSync(getTestConfigPath(), content, 'utf-8');
}

// Valid test profile
const validProfile = {
  name: 'test-profile',
  baseUrl: 'https://api.example.com',
  defaultModel: 'gpt-4',
};

const validConfig = {
  version: 1 as const,
  activeProfile: null,
  profiles: [],
};

describe('loadConfig', () => {
  test('returns default config when file missing', async () => {
    // Re-import to pick up env changes
    const { loadConfig } = await import('./manager.js');

    const config = loadConfig();

    expect(config.version).toBe(1);
    expect(config.activeProfile).toBeNull();
    expect(config.profiles).toEqual([]);
  });

  test('returns default config on invalid JSON', async () => {
    writeTestConfig('{ invalid json }');

    // Clear module cache and re-import
    delete require.cache[require.resolve('./manager.js')];
    const { loadConfig } = await import('./manager.js');

    const config = loadConfig();

    expect(config.version).toBe(1);
    expect(config.profiles).toEqual([]);
  });

  test('returns default config on invalid schema', async () => {
    writeTestConfig(JSON.stringify({ version: 999, invalid: true }));

    delete require.cache[require.resolve('./manager.js')];
    const { loadConfig } = await import('./manager.js');

    const config = loadConfig();

    expect(config.version).toBe(1);
    expect(config.profiles).toEqual([]);
  });

  test('returns valid config when file exists', async () => {
    const existingConfig = {
      version: 1,
      activeProfile: 'my-profile',
      profiles: [validProfile],
    };
    writeTestConfig(JSON.stringify(existingConfig));

    delete require.cache[require.resolve('./manager.js')];
    const { loadConfig } = await import('./manager.js');

    const config = loadConfig();

    expect(config.version).toBe(1);
    expect(config.activeProfile).toBe('my-profile');
    expect(config.profiles).toHaveLength(1);
    expect(config.profiles[0].name).toBe('test-profile');
  });
});

describe('saveConfig', () => {
  test('creates .dexter directory if missing', async () => {
    delete require.cache[require.resolve('./manager.js')];
    const { saveConfig } = await import('./manager.js');

    const configDir = join(testHomeDir, '.dexter');
    expect(existsSync(configDir)).toBe(false);

    saveConfig(validConfig);

    expect(existsSync(configDir)).toBe(true);
    expect(existsSync(getTestConfigPath())).toBe(true);
  });

  test('writes config atomically via temp file', async () => {
    delete require.cache[require.resolve('./manager.js')];
    const { saveConfig } = await import('./manager.js');

    saveConfig(validConfig);

    // Temp file should not exist after atomic rename
    const tempPath = `${getTestConfigPath()}.tmp`;
    expect(existsSync(tempPath)).toBe(false);

    // Final file should exist with correct content
    const content = JSON.parse(readFileSync(getTestConfigPath(), 'utf-8'));
    expect(content.version).toBe(1);
  });

  test('throws on invalid config', async () => {
    delete require.cache[require.resolve('./manager.js')];
    const { saveConfig } = await import('./manager.js');

    const invalidConfig = { version: 999, profiles: [] } as any;

    expect(() => saveConfig(invalidConfig)).toThrow('Invalid config');
  });
});

describe('addProfile', () => {
  test('adds new profile successfully', async () => {
    writeTestConfig(JSON.stringify(validConfig));

    delete require.cache[require.resolve('./manager.js')];
    const { addProfile, loadConfig } = await import('./manager.js');

    addProfile(validProfile);

    const config = loadConfig();
    expect(config.profiles).toHaveLength(1);
    expect(config.profiles[0].name).toBe('test-profile');
  });

  test('throws on duplicate profile name', async () => {
    const configWithProfile = {
      ...validConfig,
      profiles: [validProfile],
    };
    writeTestConfig(JSON.stringify(configWithProfile));

    delete require.cache[require.resolve('./manager.js')];
    const { addProfile } = await import('./manager.js');

    expect(() => addProfile(validProfile)).toThrow('already exists');
  });
});

describe('deleteProfile', () => {
  test('removes profile successfully', async () => {
    const configWithProfile = {
      ...validConfig,
      profiles: [validProfile],
    };
    writeTestConfig(JSON.stringify(configWithProfile));

    delete require.cache[require.resolve('./manager.js')];
    const { deleteProfile, loadConfig } = await import('./manager.js');

    deleteProfile('test-profile');

    const config = loadConfig();
    expect(config.profiles).toHaveLength(0);
  });

  test('clears activeProfile if deleted profile was active', async () => {
    const configWithActive = {
      version: 1 as const,
      activeProfile: 'test-profile',
      profiles: [validProfile],
    };
    writeTestConfig(JSON.stringify(configWithActive));

    delete require.cache[require.resolve('./manager.js')];
    const { deleteProfile, loadConfig } = await import('./manager.js');

    deleteProfile('test-profile');

    const config = loadConfig();
    expect(config.activeProfile).toBeNull();
  });

  test('throws on non-existent profile', async () => {
    writeTestConfig(JSON.stringify(validConfig));

    delete require.cache[require.resolve('./manager.js')];
    const { deleteProfile } = await import('./manager.js');

    expect(() => deleteProfile('non-existent')).toThrow('not found');
  });
});

describe('setActiveProfile', () => {
  test('sets existing profile as active', async () => {
    const configWithProfile = {
      ...validConfig,
      profiles: [validProfile],
    };
    writeTestConfig(JSON.stringify(configWithProfile));

    delete require.cache[require.resolve('./manager.js')];
    const { setActiveProfile, loadConfig } = await import('./manager.js');

    setActiveProfile('test-profile');

    const config = loadConfig();
    expect(config.activeProfile).toBe('test-profile');
  });

  test('throws on non-existent profile', async () => {
    writeTestConfig(JSON.stringify(validConfig));

    delete require.cache[require.resolve('./manager.js')];
    const { setActiveProfile } = await import('./manager.js');

    expect(() => setActiveProfile('non-existent')).toThrow('not found');
  });
});

describe('getActiveProfile', () => {
  test('returns null when no active profile', async () => {
    writeTestConfig(JSON.stringify(validConfig));

    delete require.cache[require.resolve('./manager.js')];
    const { getActiveProfile } = await import('./manager.js');

    const profile = getActiveProfile();

    expect(profile).toBeNull();
  });

  test('returns profile object when active profile set', async () => {
    const configWithActive = {
      version: 1 as const,
      activeProfile: 'test-profile',
      profiles: [validProfile],
    };
    writeTestConfig(JSON.stringify(configWithActive));

    delete require.cache[require.resolve('./manager.js')];
    const { getActiveProfile } = await import('./manager.js');

    const profile = getActiveProfile();

    expect(profile).not.toBeNull();
    expect(profile?.name).toBe('test-profile');
    expect(profile?.baseUrl).toBe('https://api.example.com');
  });
});

describe('listProfiles', () => {
  test('returns all profiles', async () => {
    const profile2 = {
      name: 'second-profile',
      baseUrl: 'https://api2.example.com',
      defaultModel: 'claude-3',
    };
    const configWithProfiles = {
      ...validConfig,
      profiles: [validProfile, profile2],
    };
    writeTestConfig(JSON.stringify(configWithProfiles));

    delete require.cache[require.resolve('./manager.js')];
    const { listProfiles } = await import('./manager.js');

    const profiles = listProfiles();

    expect(profiles).toHaveLength(2);
    expect(profiles[0].name).toBe('test-profile');
    expect(profiles[1].name).toBe('second-profile');
  });
});
