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
        "/**": { headers: { "Cache-Control": "public, max-age=60, s-maxage=60" } },
      },
      cloudflare: {
        wrangler: {
          name: "tanstack",
          vars: {
            "BETTER_AUTH_URL": "https://jetborsa.com",
            "VITE_HONO_API_URL": "https://hono.jetborsa.com",
            "VITE_FINVERI_API_URL": "https://takapi.jetborsa.com"
          },
          d1_databases: [
            {
              binding: "DB",
              database_name: "jetmain",
              database_id: "a0023a59-c72a-4406-b674-bd35d1123108"
            }
          ],
          kv_namespaces: [
            {
              binding: "TANSTACK_KV_CACHE",
              id: "43a104ed19384acf8f671dcb18ce92be"
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
