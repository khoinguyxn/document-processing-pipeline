import { playwright } from "@vitest/browser-playwright"
import { defineConfig } from "vitest/config"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"

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
  plugins: [react()],
  test: {
    typecheck: { enabled: true },
    watch: false,
    globals: true,
    // Istanbul is used instead of the default v8 provider so coverage is
    // instrumented at the source level and works the same in the node and
    // browser projects. `enabled: false` keeps `bun run test` fast; the
    // `test:coverage` script and CI opt in with `--coverage`.
    coverage: {
      provider: "istanbul",
      enabled: false,
      reporter: ["text", "html", "lcov", "json-summary"],
      reportsDirectory: "./coverage",
      reportOnFailure: true,
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.d.ts", "src/**/*.gen.ts", "src/types/**"],
    },
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
        // Only the browser project needs Tailwind: the layout tests read
        // computed styles, and the root document that links `styles.css` is
        // swapped out by `renderRoute`. Keeping it out of the `unit` project
        // avoids paying the compile cost for pure-function tests.
        plugins: [tailwindcss()],
        test: {
          name: "browser",
          setupFiles: ["./tests/setup.ts"],
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
