import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { PAGE_TITLE_LABELS } from "@/models/pages"
import type { Page } from "@/models/pages"

import { Link } from "@tanstack/react-router"
import { H3 } from "./ui/typography"

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & { pages: Page[] }

export function AppSidebar({ pages, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="border-b border-b-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Bắc Nam"
              className="group-data-[collapsible=icon]:p-0! data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <span className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                BN
              </span>
              <H3 className="min-w-0 truncate text-lg leading-4 font-medium">
                Bắc Nam
              </H3>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <div className="relative flex w-full min-w-0 flex-col gap-2 p-2">
          <SidebarMenu>
            {pages.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={PAGE_TITLE_LABELS[item.title]}
                  asChild
                >
                  <Link to={item.to}>
                    <div className="flex flex-row items-center gap-2 text-primary/50 transition-colors group-hover/menu-button:text-primary">
                      {item.icon}
                      <span>{PAGE_TITLE_LABELS[item.title]}</span>
                    </div>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
