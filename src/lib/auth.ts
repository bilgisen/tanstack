import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import * as schema from "./auth-schema";
import { ensureEnv } from "./env";
import { tanstackStartCookies } from "better-auth/tanstack-start";

let _auth: any = null;

function getAuth() {
  ensureEnv();
  if (!_auth) {
    _auth = betterAuth({
      database: drizzleAdapter(db, {
        provider: "pg",
        schema,
      }),
      user: {
        additionalFields: {
          role: {
            type: "string",
            defaultValue: "user",
          },
        },
      },
      baseURL: process.env.BETTER_AUTH_URL || "https://jetborsa.com",
      socialProviders: {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID as string,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
      },
      account: {
        storeStateStrategy: "cookie",
      },
      session: {
        cookieCache: {
          enabled: true,
          maxAge: 5 * 60,
        },
      },
      trustedOrigins: [
        "https://jetborsa.com",
        "http://localhost:3000",
      ],
      advanced: {
        defaultCookieAttributes: {
          sameSite: "lax",
          httpOnly: true,
          secure: true, // Workers.dev üzerinde HTTPS zorunlu olduğu için
        },
      },
      plugins: [
        tanstackStartCookies()
      ],
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

