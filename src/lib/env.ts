type NitroEvent = {
  context?: Record<string, unknown>
  req?: { runtime?: { cloudflare?: { env?: Record<string, string> } } }
}

export function ensureEnv() {
  try {
    const storageKey = Symbol.for("tanstack-start:event-storage");
    const storage = (globalThis as Record<symbol, unknown>)[storageKey] as { getStore?: () => unknown } | undefined;
    const store = storage?.getStore?.() as { h3Event?: NitroEvent } | NitroEvent | undefined;
    
    const event: NitroEvent | undefined = store && 'h3Event' in store ? store.h3Event : store as NitroEvent | undefined;
    
    if (event) {
      const cf = event.context?.cloudflare as { env?: Record<string, string> } | undefined
        || event.req?.runtime?.cloudflare;
      if (cf && cf.env) {
        for (const [key, value] of Object.entries(cf.env)) {
          if (value && typeof value === "string") {
            process.env[key] = value;
          }
        }
      }
    }
  } catch (error) {
    // Safe fallback
  }
}

export function getCloudflareEnv(): Record<string, string> | null {
  try {
    const storageKey = Symbol.for("tanstack-start:event-storage");
    const storage = (globalThis as Record<symbol, unknown>)[storageKey] as { getStore?: () => unknown } | undefined;
    const store = storage?.getStore?.() as { h3Event?: NitroEvent } | NitroEvent | undefined;
    const event: NitroEvent | undefined = store && 'h3Event' in store ? store.h3Event : store as NitroEvent | undefined;
    if (event) {
      const cf = event.context?.cloudflare as { env?: Record<string, string> } | undefined
        || event.req?.runtime?.cloudflare;
      if (cf && cf.env) {
        return cf.env;
      }
    }
  } catch (error) {
    // Safe fallback
  }
  return null;
}

