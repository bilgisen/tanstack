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
      cloudflare: {
        wrangler: {
          name: "tanstack",
          vars: {
            "BETTER_AUTH_URL": "https://jetborsa.com",
            "VITE_HONO_API_URL": "https://hono.paraanaliz.workers.dev"
          },
          hyperdrive: [
            {
              binding: "HYPERDRIVE",
              id: "f614db26fd0a42838491f51346370c3d"
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
