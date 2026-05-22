import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

let _db: any = null;

function getDb() {
  if (!_db) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is missing!");
    }
    // Disable prefetch as it is not supported for "Transaction" pool mode
    const client = postgres(connectionString, { prepare: false });
    _db = drizzle(client);
  }
  return _db;
}

export const db = new Proxy({} as any, {
  get(_target, prop) {
    return Reflect.get(getDb(), prop);
  }
});

