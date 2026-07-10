export function ensureEnv() {
  try {
    // Access the global AsyncLocalStorage stored by TanStack Start
    const storageKey = Symbol.for("tanstack-start:event-storage");
    const storage = (globalThis as any)[storageKey];
    const store = storage?.getStore();
    
    // In TanStack Start, the store contains the h3Event wrapper or the raw event
    const event = store?.h3Event || store;
    
    if (event) {
      // Support both Nitro v2 (event.context.cloudflare) and Nitro v3 (event.req.runtime.cloudflare)
      const cf = (event.context as any)?.cloudflare || (event as any).req?.runtime?.cloudflare;
      if (cf && cf.env) {
        for (const [key, value] of Object.entries(cf.env)) {
          if (value && typeof value === "string") {
            process.env[key] = value;
          }
        }
        
        // D1 connection uses the DB binding directly, no env mapping needed
      }
    }
  } catch (error) {
    // Safe fallback
  }
}

export function getCloudflareEnv(): any {
  try {
    const storageKey = Symbol.for("tanstack-start:event-storage");
    const storage = (globalThis as any)[storageKey];
    const store = storage?.getStore();
    const event = store?.h3Event || store;
    if (event) {
      const cf = (event.context as any)?.cloudflare || (event as any).req?.runtime?.cloudflare;
      if (cf && cf.env) {
        return cf.env;
      }
    }
  } catch (error) {
    // Safe fallback
  }
  return null;
}

