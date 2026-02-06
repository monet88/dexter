import { z } from 'zod';

export const ProfileSchema = z.object({
  name: z.string().min(1).max(50),
  baseUrl: z.string().url(),
  apiKey: z.string().optional(),
  defaultModel: z.string().min(1),
});

export const ConfigSchema = z.object({
  version: z.literal(1),
  activeProfile: z.string().nullable(),
  profiles: z.array(ProfileSchema),
});

export type Profile = z.infer<typeof ProfileSchema>;
export type Config = z.infer<typeof ConfigSchema>;

export const DEFAULT_CONFIG: Config = {
  version: 1,
  activeProfile: null,
  profiles: [],
};
