export { ProfileSchema, ConfigSchema, DEFAULT_CONFIG } from './schema.js';
export type { Profile, Config } from './schema.js';

export {
  getConfigPath,
  loadConfig,
  saveConfig,
  getActiveProfile,
  setActiveProfile,
  addProfile,
  deleteProfile,
  listProfiles,
} from './manager.js';
