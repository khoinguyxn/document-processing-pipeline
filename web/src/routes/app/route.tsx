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
import type { Page } from "@/types/pages"
import { Outlet, createFileRoute, useLocation } from "@tanstack/react-router"
import { CirclePile, Folder, Sheet } from "lucide-react"
import * as React from "react"
import type { DateRange } from "react-day-picker"

export const Route = createFileRoute("/app")({
  component: AppLayout,
})

export const PAGES: Page[] = [
  {
    title: "Hòm thư",
    to: "/app",
    icon: <Folder />,
  },
  {
    title: "Xuất dữ liệu",
    to: "/app/exports",
    icon: <Sheet />,
  },
  {
    title: "Nhà cung cấp",
    to: "/app/suppliers",
    icon: <CirclePile />,
  },
]

function AppLayout() {
  const CURRENT_LOCATION = useLocation({
    select: (location) => location.pathname,
  })

  const CURRENT_PAGE_TITLE = PAGES.find(
    (page) => page.to === CURRENT_LOCATION
  )?.title

  const [DATE_RANGE, SET_DATE_RANGE] =
    React.useState<DateRange>(getCurrentMonthRange)

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar pages={PAGES} />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <SidebarTrigger className="ml-2" />
            <div className="flex flex-1 items-center gap-4">
              <H1>{CURRENT_PAGE_TITLE}</H1>
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
