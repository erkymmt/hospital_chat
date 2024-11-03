import type { D1Database } from '@cloudflare/workers-types';

export function getEnv(): Env {
  return {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
    DB: process.env.DB as unknown as D1Database
  };
}

export const runtime = "edge";

interface Env {
  OPENAI_API_KEY: string;
  DB: D1Database;
}