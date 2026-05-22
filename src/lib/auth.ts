import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import * as schema from "./auth-schema";

let _auth: any = null;

function getAuth() {
  if (!_auth) {
    _auth = betterAuth({
      database: drizzleAdapter(db, {
        provider: "pg",
        schema,
      }),
      socialProviders: {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID as string,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
      },
    });
  }
  return _auth;
}

export const auth = new Proxy({} as any, {
  get(_target, prop) {
    const authInstance = getAuth();
    const value = Reflect.get(authInstance, prop);
    if (typeof value === "function") {
      return value.bind(authInstance);
    }
    return value;
  }
});

