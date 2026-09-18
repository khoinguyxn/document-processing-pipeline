import { useState } from "react"
import { Button } from "./ui/button"
import { ButtonGroup } from "./ui/button-group"

const INBOX_FILTERS = [
  { id: "all", label: "Tất cả", count: 9 },
  { id: "review", label: "Cần kiểm tra", count: 2 },
  { id: "error", label: "Lỗi", count: 1 },
  { id: "done", label: "Hoàn tất", count: 6 },
] as const

type InboxFilterId = (typeof INBOX_FILTERS)[number]["id"]

export function InboxButtonGroup({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [selectedId, setSelectedId] = useState<InboxFilterId>(
    INBOX_FILTERS[0].id
  )

  return (
    <ButtonGroup className={className} {...props}>
      {INBOX_FILTERS.map((filter) => {
        const isSelected = filter.id === selectedId

        return (
          <ButtonGroup key={filter.id}>
            <Button
              variant={isSelected ? "default" : "outline"}
              className={isSelected ? "" : "bg-background"}
              aria-pressed={isSelected}
              onClick={() => setSelectedId(filter.id)}
            >
              <span>{filter.label}</span>
              <span>{filter.count}</span>
            </Button>
          </ButtonGroup>
        )
      })}
    </ButtonGroup>
  )
}