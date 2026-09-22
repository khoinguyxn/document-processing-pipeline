import { ReceiptDataTable } from "@/components/receipts/receipt-data-table"
import { ReceiptEmptyStateCard } from "@/components/receipts/receipt-empty-state-card"
import { RECEIPT_COLUMNS } from "@/components/receipts/receipts-columns"
import { createFakeReceipts } from "@/models/fake-receipts"
import { PAGE_TITLE_LABELS } from "@/models/pages"
import { isReceiptParsed } from "@/models/receipt"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/app/")({
  component: RouteComponent,
  staticData: {
    title: PAGE_TITLE_LABELS.index,
    actions: ["upload", "camera"],
    filters: ["date-range"],
    search: { placeholder: "Tìm kiếm hoá đơn…" },
  },
})

const RECEIPT = createFakeReceipts(9)

function RouteComponent() {
  return (
    <main className="flex h-full w-full flex-col items-center justify-center bg-accent">
      {RECEIPT.length === 0 ? (
        <ReceiptEmptyStateCard />
      ) : (
        <ReceiptDataTable
          columns={RECEIPT_COLUMNS}
          data={RECEIPT}
          isRowDisabled={(receipt) => !isReceiptParsed(receipt)}
        />
      )}
    </main>
  )
}
