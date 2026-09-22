import { useTable } from "@tanstack/react-table"
import type { ColumnDef, RowData } from "@tanstack/react-table"
import { FEATURES } from "./receipt-data-table-features"
import type { ReceiptDataTableFeatures } from "./receipt-data-table-features"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table"

interface ReceiptDataTableProps<TData extends RowData> {
  columns: ColumnDef<ReceiptDataTableFeatures, TData>[]
  data: TData[]
  isRowDisabled: (row: TData) => boolean
}

export function ReceiptDataTable<TData extends RowData>({
  columns,
  data,
  isRowDisabled,
}: ReceiptDataTableProps<TData>) {
  const isDisabled = (row: TData) => isRowDisabled(row)

  const table = useTable({
    features: FEATURES,
    data,
    columns,
    enableRowSelection: (row) => !isDisabled(row.original),
  })

  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="bg-muted/20">
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <table.FlexRender header={header} />
                    )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                data-disabled={isDisabled(row.original)}
                className="bg-sidebar data-[disabled=true]:opacity-50 data-[disabled=true]:hover:bg-sidebar"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                -
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={table.getVisibleLeafColumns().length}>
              <div className="flex flex-wrap items-center justify-between gap-2 font-normal text-muted-foreground">
                <span>
                  Có {table.getRowModel().rows.length} tệp trong lô này
                </span>
                <span>
                  Trạng thái được cập nhật sau khi máy chủ xử lý xong.
                </span>
              </div>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  )
}
