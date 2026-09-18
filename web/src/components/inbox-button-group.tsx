import { useState } from "react"

import { RECEIPT_STATUSES } from "@/models/receipt"
import type { ReceiptStatus } from "@/models/receipt"

import { Button } from "./ui/button"
import { ButtonGroup } from "./ui/button-group"

type InboxFilter = {
  id: string
  label: string
  count: number
  statuses: readonly ReceiptStatus[]
}

const INBOX_FILTERS = [
  { id: "all", label: "Tất cả", count: 9, statuses: RECEIPT_STATUSES },
  { id: "review", label: "Cần kiểm tra", count: 2, statuses: ["needs_review"] },
  { id: "error", label: "Lỗi", count: 1, statuses: ["failed"] },
  { id: "done", label: "Hoàn tất", count: 6, statuses: ["ready"] },
] as const satisfies readonly InboxFilter[]

type InboxFilterId = (typeof INBOX_FILTERS)[number]["id"]

type InboxButtonGroupProps = React.ComponentProps<"div"> & {
  onStatusesChange?: (statuses: readonly ReceiptStatus[]) => void
}

export function InboxButtonGroup({
  className,
  onStatusesChange,
  ...props
}: InboxButtonGroupProps) {
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
              onClick={() => {
                setSelectedId(filter.id)
                onStatusesChange?.(filter.statuses)
              }}
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
