import { AppSidebar } from "@/components/app-sidebar"
import {
  DateRangePicker,
  getCurrentMonthRange,
} from "@/components/ui/date-range-picker"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { H1 } from "@/components/ui/typography"
import { PAGE_TITLE_LABELS, PAGES } from "@/models/pages"
import { Outlet, createFileRoute, useLocation } from "@tanstack/react-router"
import * as React from "react"
import type { DateRange } from "react-day-picker"

export const Route = createFileRoute("/app")({
  component: AppLayout,
})

function AppLayout() {
  const CURRENT_LOCATION = useLocation({
    select: (location) => location.pathname,
  })

  const CURRENT_PAGE_TITLE =
    PAGES.find((page) => page.to === CURRENT_LOCATION)?.title ?? "index"

  const [DATE_RANGE, SET_DATE_RANGE] =
    React.useState<DateRange>(getCurrentMonthRange)

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar pages={PAGES} />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <SidebarTrigger className="ml-2" />
            <div className="flex flex-1 items-center gap-4">
              <H1>{PAGE_TITLE_LABELS[CURRENT_PAGE_TITLE]}</H1>
              <DateRangePicker
                size="sm"
                value={DATE_RANGE}
                onValueChange={(range) => {
                  if (range) SET_DATE_RANGE(range)
                }}
              />
            </div>
          </header>
          <Outlet />
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
