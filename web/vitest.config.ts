import { playwright } from "@vitest/browser-playwright"
import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import { tanstackRouter } from "@tanstack/router-vite-plugin"

// Standalone config: the Vite config's plugins (TanStack Start, Nitro,
// Tailwind) are not needed to run tests and only slow the run down.
//
// Two projects keep the fast node-based pure-function tests separate from the
// component tests, which need a real browser for layout, focus and pointer
// events. `extends: true` inherits `resolve.tsconfigPaths` from this root.
const config = defineConfig({
  resolve: {
    tsconfigPaths: true,
    // Radix and the React renderer are prebundled separately, which can leave
    // two React copies in the browser bundle ("reading 'useCallback' of null").
    dedupe: ["react", "react-dom", "radix-ui"],
  },
  plugins: [
    tanstackRouter({
      // Configure for test environment
      target: "react",
      routesDirectory: "./src/routes",
      generatedRouteTree: "./src/routeTree.gen.ts",
      disableLogging: true,
    }),
    react(),
  ],
  test: {
    typecheck: { enabled: true },
    watch: false,
    globals: true,
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "node",
          include: ["tests/**/*.test.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "browser",
          include: ["tests/**/*.test.tsx"],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
            // The sidebar renders a `Sheet` instead of the desktop layout below
            // the 768px `useIsMobile` breakpoint, so tests need a desktop size.
            viewport: { width: 1280, height: 720 },
          },
        },
      },
    ],
  },
})

export default config
