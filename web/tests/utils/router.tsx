import {
  RouterProvider,
  createMemoryHistory,
  createRouter,
} from "@tanstack/react-router"
import { render } from "vitest-browser-react"
import type { RenderOptions } from "vitest-browser-react"
import { routeTree } from "@/routeTree.gen"

type ShellComponent = React.ComponentType<{ children: React.ReactNode }>

// TanStack Start's root route renders the whole document via `shellComponent`
// (`<html>`, `<head>`, `<body>`). `RouterProvider` honours that shell on the
// client too, which nests `<html>` inside the test container `<div>` and trips
// React's hydration check.
const ROOT_OPTIONS = routeTree.options as { shellComponent?: ShellComponent }

// `renderRoute` swaps the document shell for a bare fragment; `renderWithRouter`
// swaps it for the caller's UI so that UI sits inside the router context (which
// `Link` needs) without pulling in the matched file routes.
const ROUTE_CHILDREN_ONLY: ShellComponent = ({ children }) => <>{children}</>

interface RenderWithFileRoutesOptions extends Omit<RenderOptions, "wrapper"> {
  initialLocation?: string
  routerContext?: any
}

function createTestRouter(initialLocation: string, routerContext: any) {
  return createRouter({
    routeTree,
    history: createMemoryHistory({
      initialEntries: [initialLocation],
    }),
    context: routerContext,
  })
}

export async function renderRoute(
  ui: React.ReactElement,
  {
    initialLocation = "/",
    routerContext = {},
    ...renderOptions
  }: RenderWithFileRoutesOptions = {}
) {
  ROOT_OPTIONS.shellComponent = ROUTE_CHILDREN_ONLY
  const router = createTestRouter(initialLocation, routerContext)

  function Wrapper() {
    return <RouterProvider router={router} />
  }

  const result = await render(ui, { wrapper: Wrapper, ...renderOptions })

  return {
    ...result,
    router,
  }
}

/**
 * Renders `ui` inside a real router so `Link`/navigation hooks work, but skips
 * the file-based route tree. Use it to mount a component with mocked props
 * (e.g. `<AppSidebar pages={...} />`) without the actual route mounting instead.
 */
export async function renderWithRouter(
  ui: React.ReactElement,
  initialLocation: string = "/",
  {
    routerContext = {},
    ...renderOptions
  }: Omit<RenderWithFileRoutesOptions, "initialLocation"> = {}
) {
  ROOT_OPTIONS.shellComponent = () => ui
  const router = createTestRouter(initialLocation, routerContext)

  const result = await render(<RouterProvider router={router} />, renderOptions)

  return {
    ...result,
    router,
  }
}
