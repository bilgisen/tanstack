import { drizzle } from "drizzle-orm/d1";
import { getCloudflareEnv } from "./env";

let _db: any = null;

function getDb() {
  if (!_db) {
    const cfEnv = getCloudflareEnv();
    if (!cfEnv?.DB) {
      throw new Error("D1 binding 'DB' is missing from Cloudflare env!");
    }
    _db = drizzle(cfEnv.DB);
  }
  return _db;
}

export const db = new Proxy({} as any, {
  get(_target, prop) {
    return Reflect.get(getDb(), prop);
  }
});

