import { PAGE_TITLE_LABELS } from "@/models/pages"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/app/exports")({
  component: RouteComponent,
  staticData: {
    title: PAGE_TITLE_LABELS.exports,
    filters: ["date-range"],
  },
})

function RouteComponent() {
  return <div>Hello "/exports"!</div>
}
