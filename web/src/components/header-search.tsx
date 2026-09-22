import * as React from "react"

import { cn } from "cn"
import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"

type HeaderSearchProps = {
  placeholder: string
  className?: string
}

function HeaderSearch({ placeholder, className }: HeaderSearchProps) {
  const [query, setQuery] = React.useState("")

  return (
    <div className={cn("relative max-w-sm min-w-0 flex-1", className)}>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        className="bg-background pl-9"
        placeholder={placeholder}
        aria-label={placeholder}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
    </div>
  )
}

export { HeaderSearch }
