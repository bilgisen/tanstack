// @ts-nocheck
import { createFileRoute } from '@tanstack/react-router'
import { auth } from '../../../lib/auth'
import { ensureEnv } from '../../../lib/env'
import { appendResponseHeader } from 'h3'

const getDebugErrorResponse = (error: any) => {
  ensureEnv();
  const env = typeof process !== 'undefined' ? process.env : {};
  const storageKey = Symbol.for("tanstack-start:event-storage");
  const storage = (globalThis as any)[storageKey];
  const store = storage?.getStore();
  
  // Attempt to safely inspect keys and serialize store
  let keys: string[] = [];
  let storeJson: string | null = null;
  try {
    if (store) {
      keys = Object.keys(store);
      // Strip circular or complex objects for simple logging
      const safeStore: any = {};
      for (const k of keys) {
        if (k === 'h3Event' || k === 'event') {
          safeStore[k] = {
            has_context: !!store[k]?.context,
            context_keys: store[k]?.context ? Object.keys(store[k].context) : [],
            has_req: !!store[k]?.req,
            req_keys: store[k]?.req ? Object.keys(store[k].req) : [],
            req_runtime_keys: store[k]?.req?.runtime ? Object.keys(store[k].req.runtime) : [],
            has_node: !!store[k]?.node,
            node_keys: store[k]?.node ? Object.keys(store[k].node) : [],
            node_req_runtime_keys: store[k]?.node?.req?.runtime ? Object.keys(store[k].node.req.runtime) : [],
            has_cloudflare: !!store[k]?.context?.cloudflare,
            cf_keys: store[k]?.context?.cloudflare ? Object.keys(store[k].context.cloudflare) : [],
            env_keys: store[k]?.context?.cloudflare?.env ? Object.keys(store[k].context.cloudflare.env) : [],
          };
        } else {
          safeStore[k] = typeof store[k];
        }
      }
      storeJson = JSON.stringify(safeStore);
    }
  } catch (e) {
    storeJson = "failed to serialize: " + String(e);
  }

  return new Response(JSON.stringify({
    error: error?.message || String(error),
    stack: error?.stack,
    env_checklist: {
      has_DATABASE_URL: !!env?.DATABASE_URL,
      has_BETTER_AUTH_SECRET: !!env?.BETTER_AUTH_SECRET,
      has_GOOGLE_CLIENT_ID: !!env?.GOOGLE_CLIENT_ID,
      has_GOOGLE_CLIENT_SECRET: !!env?.GOOGLE_CLIENT_SECRET,
      BETTER_AUTH_URL: env?.BETTER_AUTH_URL || "undefined",
    },
    debug: {
      has_storage: !!storage,
      has_store: !!store,
      store_keys: keys,
      store_json: storeJson,
    }
  }), {
    status: 500,
    headers: { 'Content-Type': 'application/json' }
  });
};

export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const incomingCookie = request.headers.get("cookie") || "none";
        console.log(`[Auth API GET] ${request.method} ${request.url} | Incoming Cookies: ${incomingCookie}`);
        
        // Get the active H3 event context if available
        const storageKey = Symbol.for("tanstack-start:event-storage");
        const storage = (globalThis as any)[storageKey];
        const store = storage?.getStore();
        const event = store?.h3Event || store;

        try {
          const res = await auth.handler(request);
          
          // Get individual cookies (without merging them with commas)
          let setCookies: string[] = [];
          if (typeof res.headers.getSetCookie === "function") {
            setCookies = res.headers.getSetCookie();
          } else {
            const rawSetCookie = res.headers.get("set-cookie");
            if (rawSetCookie) {
              setCookies = [rawSetCookie];
            }
          }
          console.log(`[Auth API GET Response] Status: ${res.status} | Outgoing Set-Cookie:`, setCookies);

          // If we have cookies and an active H3 event, set them directly on the event
          if (setCookies.length > 0 && event) {
            for (const cookie of setCookies) {
              appendResponseHeader(event, 'set-cookie', cookie);
            }
          }

          // Strip set-cookie from standard response headers to prevent Nitro folding them
          const newHeaders = new Headers();
          res.headers.forEach((value: string, key: string) => {
            if (key.toLowerCase() !== "set-cookie") {
              newHeaders.set(key, value);
            }
          });

          // Fallback: if H3 event unavailable, keep cookies on response directly
          if (!event && setCookies.length > 0) {
            for (const cookie of setCookies) {
              newHeaders.append("set-cookie", cookie);
            }
          }

          return new Response(res.body, {
            status: res.status,
            statusText: res.statusText,
            headers: newHeaders,
          });
        } catch (error) {
          console.error('[Auth API GET Error]', error);
          return getDebugErrorResponse(error);
        }
      },
      POST: async ({ request }) => {
        const incomingCookie = request.headers.get("cookie") || "none";
        console.log(`[Auth API POST] ${request.method} ${request.url} | Incoming Cookies: ${incomingCookie}`);
        
        // Get the active H3 event context if available
        const storageKey = Symbol.for("tanstack-start:event-storage");
        const storage = (globalThis as any)[storageKey];
        const store = storage?.getStore();
        const event = store?.h3Event || store;

        try {
          const res = await auth.handler(request);
          
          // Get individual cookies (without merging them with commas)
          let setCookies: string[] = [];
          if (typeof res.headers.getSetCookie === "function") {
            setCookies = res.headers.getSetCookie();
          } else {
            const rawSetCookie = res.headers.get("set-cookie");
            if (rawSetCookie) {
              setCookies = [rawSetCookie];
            }
          }
          console.log(`[Auth API POST Response] Status: ${res.status} | Outgoing Set-Cookie:`, setCookies);

          // If we have cookies and an active H3 event, set them directly on the event
          if (setCookies.length > 0 && event) {
            for (const cookie of setCookies) {
              appendResponseHeader(event, 'set-cookie', cookie);
            }
          }

          // Strip set-cookie from standard response headers to prevent Nitro folding them
          const newHeaders = new Headers();
          res.headers.forEach((value: string, key: string) => {
            if (key.toLowerCase() !== "set-cookie") {
              newHeaders.set(key, value);
            }
          });

          // Fallback: if H3 event unavailable, keep cookies on response directly
          if (!event && setCookies.length > 0) {
            for (const cookie of setCookies) {
              newHeaders.append("set-cookie", cookie);
            }
          }

          return new Response(res.body, {
            status: res.status,
            statusText: res.statusText,
            headers: newHeaders,
          });
        } catch (error) {
          console.error('[Auth API POST Error]', error);
          return getDebugErrorResponse(error);
        }
      },
    },
  },
})
