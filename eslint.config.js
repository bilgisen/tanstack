//  @ts-check

import tseslint from "@typescript-eslint/eslint-plugin"
import { tanstackConfig } from "@tanstack/eslint-config"

export default [
  {
    ignores: [".output/**", "scratch/**"],
  },
  ...tanstackConfig,
  {
    files: ["**/*.{js,ts,tsx}"],
    plugins: {
      "@typescript-eslint": tseslint,
    },
    // Types in this legacy codebase are optimistically shaped and don't reflect
    // runtime API responses. Defensive `?.` / `??` / truthiness guards are
    // intentional; removing them based on static types risks runtime crashes.
    rules: {
      "@typescript-eslint/no-unnecessary-condition": "off",
      // Generated route tree and legacy API routes intentionally use @ts-nocheck.
      "@typescript-eslint/ban-ts-comment": [
        "error",
        {
          "ts-expect-error": false,
          "ts-ignore": "allow-with-description",
          "ts-nocheck": false,
        },
      ],
    },
  },
]
