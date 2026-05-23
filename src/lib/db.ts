import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { ensureEnv, getCloudflareEnv } from "./env";

let _db: any = null;

function getDb() {
  ensureEnv();
  if (!_db) {
    let connectionString = process.env.DATABASE_URL;

    // Support Cloudflare Hyperdrive
    const cfEnv = getCloudflareEnv();
    if (cfEnv?.HYPERDRIVE?.connectionString) {
      connectionString = cfEnv.HYPERDRIVE.connectionString;
    }

    if (!connectionString) {
      throw new Error("DATABASE_URL or HYPERDRIVE connectionString is missing!");
    }
    // Disable prefetch as it is not supported for "Transaction" pool mode
    // Add idle_timeout to prevent the connection from hanging the serverless environment
    const client = postgres(connectionString, {
      prepare: false,
      idle_timeout: 1,
      connect_timeout: 10,
    });
    _db = drizzle(client);
  }
  return _db;
}

export const db = new Proxy({} as any, {
  get(_target, prop) {
    return Reflect.get(getDb(), prop);
  }
});

