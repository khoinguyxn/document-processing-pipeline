import { createColumnHelper } from "@tanstack/react-table"
import { FileText, Image as ImageIcon } from "lucide-react"

import { formatDate } from "@/lib/datetime"
import { RECEIPT_STATUS_LABELS } from "@/models/receipt"
import type { Receipt, ReceiptStatus } from "@/models/receipt"

import type { ReceiptDataTableFeatures } from "./receipt-data-table-features"

const COLUMN_HELPER = createColumnHelper<ReceiptDataTableFeatures, Receipt>()

const STATUS_CLASSES: Record<ReceiptStatus, string> = {
  pending: "text-muted-foreground",
  processing: "text-sky-600",
  needs_review: "text-amber-600",
  failed: "text-destructive",
  ready: "text-emerald-600",
}

const CURRENCY_FORMATTER = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
})

function formatCurrency(value: number): string {
  return CURRENCY_FORMATTER.format(value)
}

function formatConfidence(value: number): string {
  return `${Math.round(value * 100)}%`
}

function renderFileIcon(file: File): React.ReactNode {
  const iconClassName = "size-4 shrink-0 text-muted-foreground"

  return file.type.startsWith("image/") ? (
    <ImageIcon className={iconClassName} />
  ) : (
    <FileText className={iconClassName} />
  )
}

const COLUMNS = COLUMN_HELPER.columns([
  COLUMN_HELPER.display({
    id: "select",
    enableSorting: false,
    enableColumnFilter: false,
    header: ({ table }) => (
      <input
        type="checkbox"
        aria-label="Chọn tất cả"
        className="size-4 stroke-accent/5 align-middle accent-primary"
        checked={table.getIsAllPageRowsSelected()}
        ref={(element) => {
          if (element) {
            element.indeterminate = table.getIsSomePageRowsSelected()
          }
        }}
        onChange={table.getToggleAllPageRowsSelectedHandler()}
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        aria-label="Chọn hoá đơn"
        className="size-4 align-middle accent-primary"
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onChange={row.getToggleSelectedHandler()}
      />
    ),
  }),
  COLUMN_HELPER.accessor("file", {
    header: "Tệp",
    enableSorting: false,
    enableColumnFilter: false,
    cell: (info) => {
      const file = info.getValue()

      return (
        <div className="flex items-center gap-2">
          {renderFileIcon(file)}
          <span className="max-w-64 truncate">{file.name}</span>
        </div>
      )
    },
  }),
  COLUMN_HELPER.accessor("provider", {
    header: "Nhà cung cấp",
    sortFn: "text",
    filterFn: "includesString",
    cell: (info) => (
      <span className="block max-w-56 truncate">{info.getValue()}</span>
    ),
  }),
  COLUMN_HELPER.accessor("receipt_number", {
    header: "Số hoá đơn",
    sortFn: "basic",
    enableColumnFilter: false,
    cell: (info) => info.getValue(),
  }),
  COLUMN_HELPER.accessor("created_datetime", {
    header: "Ngày tạo",
    sortFn: "datetime",
    enableColumnFilter: false,
    cell: (info) => formatDate(info.getValue()),
  }),
  COLUMN_HELPER.accessor("total", {
    header: "Tổng tiền",
    sortFn: "basic",
    enableColumnFilter: false,
    cell: (info) => formatCurrency(info.getValue()),
  }),
  COLUMN_HELPER.accessor("confidence_score", {
    header: "Độ tin cậy",
    sortFn: "basic",
    enableColumnFilter: false,
    cell: (info) => formatConfidence(info.getValue()),
  }),
  COLUMN_HELPER.accessor((row) => RECEIPT_STATUS_LABELS[row.status], {
    id: "status",
    header: "Trạng thái",
    sortFn: "text",
    filterFn: "includesString",
    cell: (info) => (
      <span className={STATUS_CLASSES[info.row.original.status]}>
        {info.getValue()}
      </span>
    ),
  }),
])

export { COLUMNS as RECEIPT_COLUMNS, formatConfidence, formatCurrency }
export type { ReceiptDataTableFeatures } from "./receipt-data-table-features"
