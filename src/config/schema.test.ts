import { describe, expect, it } from 'bun:test';
import { ConfigSchema, ProfileSchema } from './schema';

describe('ProfileSchema', () => {
  it('validates valid profile', () => {
    const validProfile = {
      name: 'Test Profile',
      baseUrl: 'https://api.example.com',
      apiKey: 'sk-test-key',
      defaultModel: 'gpt-4',
    };
    const result = ProfileSchema.safeParse(validProfile);
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const profile = {
      name: '',
      baseUrl: 'https://api.example.com',
      defaultModel: 'gpt-4',
    };
    const result = ProfileSchema.safeParse(profile);
    expect(result.success).toBe(false);
  });

  it('rejects name longer than 50 characters', () => {
    const profile = {
      name: 'a'.repeat(51),
      baseUrl: 'https://api.example.com',
      defaultModel: 'gpt-4',
    };
    const result = ProfileSchema.safeParse(profile);
    expect(result.success).toBe(false);
  });

  it('rejects invalid URL', () => {
    const profile = {
      name: 'Test',
      baseUrl: 'not-a-valid-url',
      defaultModel: 'gpt-4',
    };
    const result = ProfileSchema.safeParse(profile);
    expect(result.success).toBe(false);
  });

  it('allows optional apiKey', () => {
    const profile = {
      name: 'Test',
      baseUrl: 'https://api.example.com',
      defaultModel: 'gpt-4',
    };
    const result = ProfileSchema.safeParse(profile);
    expect(result.success).toBe(true);
  });

  it('rejects empty defaultModel', () => {
    const profile = {
      name: 'Test',
      baseUrl: 'https://api.example.com',
      defaultModel: '',
    };
    const result = ProfileSchema.safeParse(profile);
    expect(result.success).toBe(false);
  });
});

describe('ConfigSchema', () => {
  it('validates valid config', () => {
    const validConfig = {
      version: 1,
      activeProfile: 'default',
      profiles: [
        {
          name: 'default',
          baseUrl: 'https://api.example.com',
          defaultModel: 'gpt-4',
        },
      ],
    };
    const result = ConfigSchema.safeParse(validConfig);
    expect(result.success).toBe(true);
  });

  it('rejects version not equal to 1', () => {
    const config = {
      version: 2,
      activeProfile: null,
      profiles: [],
    };
    const result = ConfigSchema.safeParse(config);
    expect(result.success).toBe(false);
  });

  it('allows null activeProfile', () => {
    const config = {
      version: 1,
      activeProfile: null,
      profiles: [],
    };
    const result = ConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
  });
});
