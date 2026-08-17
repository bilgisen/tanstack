import { defineConfig } from "vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import viteTsConfigPaths from "vite-tsconfig-paths"
import tailwindcss from "@tailwindcss/vite"
import { nitro } from "nitro/vite"

const config = defineConfig({
  plugins: [
    devtools(),
    nitro({
      preset: "cloudflare-module",
      compatibilityDate: "2024-11-01",
      routeRules: {
        "/**": { headers: { "Cache-Control": "no-cache" } },
        "/api/market/**": { proxy: "https://hono.jetborsa.com/api/market/**" },
      },
      cloudflare: {
        wrangler: {
          name: "tanstack",
          vars: {
            "BETTER_AUTH_URL": "https://jetborsa.com",
            "VITE_HONO_API_URL": "https://hono.jetborsa.com",
            "VITE_FINVERI_API_URL": "https://tekapi.jetborsa.com",
            "DODO_PAYMENTS_RETURN_URL": "https://jetborsa.com/profil",
            "DODO_PAYMENTS_ENVIRONMENT": "live_mode"
          },
          d1_databases: [
            {
              binding: "DB",
              database_name: "jetmain",
              database_id: "e1e08e3c-5ffb-4c61-b10f-5d6862515b30"
            }
          ],
          kv_namespaces: [
            {
              binding: "TANSTACK_KV_CACHE",
              id: "fba1675816d54b9eacab5bd52faaede1"
            }
          ]
        }
      }
    }),
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
})

export default config
