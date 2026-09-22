import { PAGE_TITLE_LABELS } from "@/models/pages"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/app/suppliers")({
  component: RouteComponent,
  staticData: {
    title: PAGE_TITLE_LABELS.suppliers,
  },
})

function RouteComponent() {
  return <div>Hello "/suppliers"!</div>
}
