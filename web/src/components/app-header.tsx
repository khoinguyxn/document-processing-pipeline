import { HEADER_ACTIONS } from "@/components/header-actions"
import { HEADER_FILTERS } from "@/components/header-filters"
import { HeaderSearch } from "@/components/header-search"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { H1 } from "@/components/ui/typography"
import type { HeaderAction, HeaderFilter } from "@/models/header"

type AppHeaderProps = {
  title?: string
  search?: { placeholder: string }
  filters?: readonly HeaderFilter[]
  actions?: readonly HeaderAction[]
}

function AppHeader({ title, search, filters, actions }: AppHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <SidebarTrigger className="ml-2" />
      <div className="flex flex-1 items-center gap-4">
        {title ? <H1 className="min-w-0 truncate">{title}</H1> : null}
        {search ? <HeaderSearch placeholder={search.placeholder} /> : null}
        {filters?.map((filter) => {
          const Filter = HEADER_FILTERS[filter]

          return <Filter key={filter} />
        })}
      </div>
      {actions?.length ? (
        <div className="mr-2 flex items-center gap-2">
          {actions.map((action) => {
            const Action = HEADER_ACTIONS[action]

            return <Action key={action} />
          })}
        </div>
      ) : null}
    </header>
  )
}

export { AppHeader }
