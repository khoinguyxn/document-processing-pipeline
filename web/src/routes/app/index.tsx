import { ReceiptDataTable } from "@/components/receipts/receipt-data-table"
import { ReceiptEmptyStateCard } from "@/components/receipts/receipt-empty-state-card"
import { RECEIPT_COLUMNS } from "@/components/receipts/receipts-columns"
import { createFakeReceipts } from "@/models/fake-receipts"
import { isReceiptReady } from "@/models/receipt"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/app/")({
  component: RouteComponent,
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
          isRowDisabled={(receipt) => !isReceiptReady(receipt)}
        />
      )}
    </main>
  )
}
