import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TIMEOUT_MS = 30000;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export interface VnBridgeResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Simple in-memory cache with TTL
const cache = new Map<string, { data: unknown; expires: number }>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && entry.expires > Date.now()) {
    return entry.data as T;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: unknown): void {
  cache.set(key, { data, expires: Date.now() + CACHE_TTL_MS });
}

export async function callVnstock<T>(command: string, args: string[]): Promise<VnBridgeResponse<T>> {
  const cacheKey = `${command}:${args.join(':')}`;
  const cached = getCached<VnBridgeResponse<T>>(cacheKey);
  if (cached) {
    return cached;
  }

  const scriptPath = resolve(__dirname, '../../../scripts/vnstock-cli.py');

  return new Promise((resolve, reject) => {
    const proc = spawn('python', [scriptPath, command, ...args], {
      env: { ...process.env },
    });
    let stdout = '';
    let stderr = '';

    const timeout = setTimeout(() => {
      proc.kill();
      reject(new Error(`vnstock timeout after ${TIMEOUT_MS / 1000}s`));
    }, TIMEOUT_MS);

    proc.stdout.on('data', (data) => {
      stdout += data;
    });
    proc.stderr.on('data', (data) => {
      stderr += data;
    });

    proc.on('close', (code) => {
      clearTimeout(timeout);
      if (code !== 0) {
        reject(new Error(`Python process exited with code ${code}: ${stderr}`));
        return;
      }
      try {
        const result = JSON.parse(stdout) as VnBridgeResponse<T>;
        if (!result.success) {
          reject(new Error(result.error || 'Unknown vnstock error'));
        } else {
          setCache(cacheKey, result);
          resolve(result);
        }
      } catch {
        reject(new Error(`Failed to parse vnstock response: ${stdout}`));
      }
    });

    proc.on('error', (err) => {
      clearTimeout(timeout);
      reject(new Error(`Failed to spawn Python: ${err.message}`));
    });
  });
}
