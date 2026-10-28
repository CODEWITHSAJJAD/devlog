/// <reference types="@cloudflare/workers-types" />

export interface Env {
  DB: D1Database;
  JWT_SECRET: string;
}

export interface EventContextData extends Record<string, unknown> {
  userId?: string;
}
