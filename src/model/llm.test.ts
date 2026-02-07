import { describe, expect, it, mock, beforeEach, afterEach } from 'bun:test';
import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';

// Store original env
const originalEnv = { ...process.env };

// Mock getActiveProfile
let mockActiveProfile: ReturnType<typeof import('@/config/index.js').getActiveProfile> = null;

mock.module('@/config/index.js', () => ({
  getActiveProfile: () => mockActiveProfile,
}));

// Import after mocking
const { getChatModel, DEFAULT_MODEL } = await import('./llm.js');

describe('getChatModel', () => {
  beforeEach(() => {
    // Reset mocks and env
    mockActiveProfile = null;
    process.env = { ...originalEnv };
    delete process.env.MONET_BASE_URL;
    delete process.env.MONET_API_KEY;
    delete process.env.MONET_MODEL;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  // Priority chain tests (4 tests)
  describe('priority chain', () => {
    it('uses active profile when available (highest priority)', () => {
      mockActiveProfile = {
        name: 'test-profile',
        baseUrl: 'https://custom.api.com/v1',
        apiKey: 'profile-key',
        defaultModel: 'custom-model',
      };
      process.env.MONET_BASE_URL = 'https://monet.api.com/v1';
      process.env.MONET_API_KEY = 'monet-key';

      const model = getChatModel('test-model');

      expect(model).toBeInstanceOf(ChatOpenAI);
      // Profile takes priority over MONET_* env vars
      const config = (model as ChatOpenAI).lc_kwargs;
      expect(config.configuration?.baseURL).toBe('https://custom.api.com/v1');
      expect(config.apiKey).toBe('profile-key');
    });

    it('uses MONET_* env vars when no active profile', () => {
      mockActiveProfile = null;
      process.env.MONET_BASE_URL = 'https://monet.api.com/v1';
      process.env.MONET_API_KEY = 'monet-key';

      const model = getChatModel('test-model');

      expect(model).toBeInstanceOf(ChatOpenAI);
      const config = (model as ChatOpenAI).lc_kwargs;
      expect(config.configuration?.baseURL).toBe('https://monet.api.com/v1');
      expect(config.apiKey).toBe('monet-key');
    });

    it('detects claude- prefix and uses Anthropic provider', () => {
      mockActiveProfile = null;
      process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';

      const model = getChatModel('claude-3-opus');

      expect(model).toBeInstanceOf(ChatAnthropic);
    });

    it('falls back to OpenAI for unrecognized model names', () => {
      mockActiveProfile = null;
      process.env.OPENAI_API_KEY = 'test-openai-key';

      const model = getChatModel('gpt-4');

      expect(model).toBeInstanceOf(ChatOpenAI);
      const config = (model as ChatOpenAI).lc_kwargs;
      expect(config.model).toBe('gpt-4');
    });
  });

  // MONET_* env vars tests (4 tests)
  describe('MONET_* env vars', () => {
    it('requires both MONET_BASE_URL and MONET_API_KEY', () => {
      mockActiveProfile = null;
      process.env.MONET_BASE_URL = 'https://monet.api.com/v1';
      process.env.MONET_API_KEY = 'monet-key';

      const model = getChatModel('test-model');

      const config = (model as ChatOpenAI).lc_kwargs;
      expect(config.configuration?.baseURL).toBe('https://monet.api.com/v1');
      expect(config.apiKey).toBe('monet-key');
    });

    it('defaults MODEL to DEFAULT_MODEL when MONET_MODEL not set', () => {
      mockActiveProfile = null;
      process.env.MONET_BASE_URL = 'https://monet.api.com/v1';
      process.env.MONET_API_KEY = 'monet-key';
      // No MONET_MODEL set

      const model = getChatModel(); // No modelName provided

      const config = (model as ChatOpenAI).lc_kwargs;
      expect(config.model).toBe(DEFAULT_MODEL);
    });

    it('uses MONET_MODEL when modelName is empty', () => {
      mockActiveProfile = null;
      process.env.MONET_BASE_URL = 'https://monet.api.com/v1';
      process.env.MONET_API_KEY = 'monet-key';
      process.env.MONET_MODEL = 'custom-monet-model';

      const model = getChatModel(''); // Empty modelName triggers MONET_MODEL

      const config = (model as ChatOpenAI).lc_kwargs;
      expect(config.model).toBe('custom-monet-model');
    });

    it('ignores partial MONET config (only URL, no KEY)', () => {
      mockActiveProfile = null;
      process.env.MONET_BASE_URL = 'https://monet.api.com/v1';
      // No MONET_API_KEY
      process.env.OPENAI_API_KEY = 'test-openai-key';

      const model = getChatModel('gpt-4');

      // Should fall back to OpenAI, not use MONET
      const config = (model as ChatOpenAI).lc_kwargs;
      expect(config.configuration?.baseURL).toBeUndefined();
      expect(config.apiKey).toBe('test-openai-key');
    });
  });

  // Active profile behavior tests (2 tests)
  describe('active profile behavior', () => {
    it('uses profile baseUrl and apiKey', () => {
      mockActiveProfile = {
        name: 'my-profile',
        baseUrl: 'https://my-custom-api.com/v1',
        apiKey: 'my-secret-key',
        defaultModel: 'profile-default',
      };

      const model = getChatModel('requested-model');

      expect(model).toBeInstanceOf(ChatOpenAI);
      const config = (model as ChatOpenAI).lc_kwargs;
      expect(config.configuration?.baseURL).toBe('https://my-custom-api.com/v1');
      expect(config.apiKey).toBe('my-secret-key');
      expect(config.model).toBe('requested-model');
    });

    it('uses defaultModel from profile when modelName is empty', () => {
      mockActiveProfile = {
        name: 'my-profile',
        baseUrl: 'https://my-custom-api.com/v1',
        apiKey: 'my-secret-key',
        defaultModel: 'profile-default-model',
      };

      const model = getChatModel(''); // Empty modelName

      const config = (model as ChatOpenAI).lc_kwargs;
      expect(config.model).toBe('profile-default-model');
    });
  });
});
