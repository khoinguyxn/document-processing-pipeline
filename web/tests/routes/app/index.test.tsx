import { describe, expect, it } from "vitest"
import { renderRoute } from "../../utils/router"
import { RECEIPT_STATUS_LABELS } from "@/models/receipt"

const TABLE_SELECTOR = '[data-slot="table"]'
const BODY_ROW_SELECTOR = '[data-slot="table-body"] [data-slot="table-row"]'
const HEADER_CELL_SELECTOR = '[data-slot="table-head"]'
const BODY_CELL_SELECTOR = '[data-slot="table-cell"]'
const FOOTER_SELECTOR = '[data-slot="table-footer"]'

const ROUTE_RECEIPT_COUNT = 9
const EMPTY_STATE_TITLE = "Chưa có hoá đơn nào trong lô này"
const COLUMN_HEADERS = [
  "",
  "Tệp",
  "Nhà cung cấp",
  "Số hoá đơn",
  "Ngày tạo",
  "Tổng tiền",
  "Độ tin cậy",
  "Trạng thái",
]
const STATUS_COLUMN_INDEX = COLUMN_HEADERS.indexOf("Trạng thái")

// `src/routes/app/index.tsx` seeds `createFakeReceipts(9)` at module scope, so
// the index route always takes the data-table branch. The empty-state card is
// unreachable from here and is covered by its own component test
// (`tests/components/receipts/receipt-empty-state-card.test.tsx`).
// `RouteComponent` is not exported, so the real router is the only way to mount
// it.
function renderAppIndex() {
  return renderRoute(<div />, { initialLocation: "/app" })
}

describe("RouteComponent", () => {
  it("RouteComponent_ShouldRenderTheReceiptsTable_WhenReceiptsExist", async () => {
    // Arrange & Act
    const screen = await renderAppIndex()

    // Assert — guards the `REC` typo regression: the route must render the
    // table instead of crashing into an empty container.
    expect(screen.container.querySelector(TABLE_SELECTOR)).not.toBeNull()
    expect(screen.container.querySelectorAll(BODY_ROW_SELECTOR)).toHaveLength(
      ROUTE_RECEIPT_COUNT
    )
    expect(screen.container.textContent).not.toContain(EMPTY_STATE_TITLE)
  })

  it("RouteComponent_ShouldRenderEveryReceiptColumnHeader_WhenReceiptsExist", async () => {
    // Arrange & Act
    const screen = await renderAppIndex()

    // Assert
    const headerCells = [
      ...screen.container.querySelectorAll<HTMLElement>(HEADER_CELL_SELECTOR),
    ]
    expect(headerCells.map((cell) => cell.textContent.trim())).toEqual(
      COLUMN_HEADERS
    )
  })

  it("RouteComponent_ShouldDimOnlyTheRowsThatAreNotParsed_WhenReceiptsAreMixed", async () => {
    // Arrange & Act
    const screen = await renderAppIndex()

    // Act
    const rows = [
      ...screen.container.querySelectorAll<HTMLElement>(BODY_ROW_SELECTOR),
    ]
    const statuses = rows.map((row) =>
      row
        .querySelectorAll<HTMLElement>(BODY_CELL_SELECTOR)
        [STATUS_COLUMN_INDEX].textContent.trim()
    )

    // Assert — the dimmed set must be exactly the non-ready rows, and the fake
    // receipts are seeded with ready rows so the comparison can fail.
    const parsedRowCount = statuses.filter(
      (status) =>
        status === RECEIPT_STATUS_LABELS.ready ||
        status === RECEIPT_STATUS_LABELS.failed ||
        status === RECEIPT_STATUS_LABELS.needs_review
    ).length
    const dimmedRows = rows.filter(
      (row) => row.getAttribute("data-disabled") === "true"
    )
    expect(parsedRowCount).toBeGreaterThan(0)
    expect(dimmedRows).toHaveLength(ROUTE_RECEIPT_COUNT - parsedRowCount)
  })

  it("RouteComponent_ShouldShowTheSeededRowCountInTheFooter_WhenReceiptsExist", async () => {
    // Arrange & Act
    const screen = await renderAppIndex()

    // Assert
    const footer = screen.container.querySelector<HTMLElement>(FOOTER_SELECTOR)
    expect(footer?.textContent).toContain(
      `Có ${ROUTE_RECEIPT_COUNT} tệp trong lô này`
    )
  })
})
