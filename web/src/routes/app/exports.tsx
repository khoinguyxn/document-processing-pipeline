import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/app/exports")({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/exports"!</div>
}
