import {  drizzle } from "drizzle-orm/d1";
import { getCloudflareEnv } from "./env";
import * as schema from "./schema";
import type {DrizzleD1Database} from "drizzle-orm/d1";

let _db: DrizzleD1Database<typeof schema> | null = null;

function getDb(): DrizzleD1Database<typeof schema> | null {
  if (!_db) {
    const cfEnv = getCloudflareEnv();
    if (!cfEnv?.DB) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error("D1 binding 'DB' is missing from Cloudflare env!");
      }
      console.warn("[db] D1 binding 'DB' is missing in dev environment — DB-backed features disabled");
      return null;
    }
    _db = drizzle(cfEnv.DB, { schema });
  }
  return _db;
}

export const db = new Proxy({} as DrizzleD1Database<typeof schema>, {
  get(_target, prop) {
    const instance = getDb();
    if (!instance) return undefined;
    return Reflect.get(instance, prop);
  }
});
