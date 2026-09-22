import { AppHeader } from "@/components/app-header"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { PAGES } from "@/models/pages"
import { Outlet, createFileRoute, useMatches } from "@tanstack/react-router"

export const Route = createFileRoute("/app")({
  component: AppLayout,
})

function AppLayout() {
  const LEAF_STATIC_DATA = useMatches({
    select: (matches) => matches[matches.length - 1]?.staticData,
  })

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar pages={PAGES} />
        <SidebarInset>
          <AppHeader {...LEAF_STATIC_DATA} />
          <Outlet />
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
