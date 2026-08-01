import {  drizzle } from "drizzle-orm/d1";
import { getCloudflareEnv } from "./env";
import * as schema from "./schema";
import type {DrizzleD1Database} from "drizzle-orm/d1";

let _db: DrizzleD1Database<typeof schema> | null = null;

function getDb(): DrizzleD1Database<typeof schema> {
  if (!_db) {
    const cfEnv = getCloudflareEnv();
    if (!cfEnv?.DB) {
      throw new Error("D1 binding 'DB' is missing from Cloudflare env!");
    }
    _db = drizzle(cfEnv.DB, { schema });
  }
  return _db;
}

export const db = new Proxy({} as DrizzleD1Database<typeof schema>, {
  get(_target, prop) {
    return Reflect.get(getDb(), prop);
  }
});

