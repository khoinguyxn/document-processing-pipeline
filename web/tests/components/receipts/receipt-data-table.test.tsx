import { describe, expect, it } from "vitest"
import { userEvent } from "vitest/browser"
import { ReceiptDataTable } from "@/components/receipts/receipt-data-table"
import { RECEIPT_COLUMNS } from "@/components/receipts/receipts-columns"
import type { Receipt } from "@/models/receipt"
import { renderWithRouter } from "../../utils/router"

const TABLE_SELECTOR = '[data-slot="table"]'
const HEADER_ROW_SELECTOR = '[data-slot="table-header"] [data-slot="table-row"]'
const BODY_ROW_SELECTOR = '[data-slot="table-body"] [data-slot="table-row"]'
const HEADER_CELL_SELECTOR = '[data-slot="table-head"]'
const BODY_CELL_SELECTOR = '[data-slot="table-cell"]'
const FOOTER_SELECTOR = '[data-slot="table-footer"]'
const FOOTER_CELL_SELECTOR = `${FOOTER_SELECTOR} [data-slot="table-cell"]`
const CHECKBOX_SELECTOR = 'input[type="checkbox"]'

// Two rows whose text lengths differ on purpose: alignment assertions only
// mean something when the table cannot line columns up by accident.
const RECEIPTS: Receipt[] = [
  {
    file: new File(["scan"], "hoa-don-tong-hop-thang-9.pdf", {
      type: "application/pdf",
    }),
    provider: "Cửa hàng Tạp Hoá Hòa Bình",
    receipt_number: 1024,
    created_datetime: new Date("2026-09-01T08:30:00Z"),
    total: 1_250_000,
    confidence_score: 0.926,
    status: "ready",
  },
  {
    file: new File(["scan"], "a.pdf", { type: "application/pdf" }),
    provider: null,
    receipt_number: null,
    created_datetime: new Date("2026-09-02T15:00:00Z"),
    total: null,
    confidence_score: null,
    status: "pending",
  },
]

function renderReceiptTable() {
  return renderWithRouter(
    <ReceiptDataTable
      columns={RECEIPT_COLUMNS}
      data={RECEIPTS}
      isRowDisabled={(receipt) => receipt.status !== "ready"}
    />
  )
}

function getBodyRows(container: HTMLElement) {
  return [...container.querySelectorAll<HTMLElement>(BODY_ROW_SELECTOR)]
}

function getHeaderCells(container: HTMLElement) {
  return [...container.querySelectorAll<HTMLElement>(HEADER_CELL_SELECTOR)]
}

// The row's `transition-colors` would leave the computed background partway
// through the animation, so the transition is turned off before hovering.
async function hoverWithoutTransition(element: HTMLElement) {
  element.style.transitionDuration = "0s"

  await userEvent.hover(element)
}

describe("ReceiptDataTable", () => {
  it("ReceiptDataTable_ShouldRenderHeaderAndBodyInsideOneTable_WhenRowsExist", async () => {
    // Arrange & Act
    const screen = await renderReceiptTable()

    // Assert — the header and the body must share one <table> so the browser
    // computes a single set of column widths for both.
    const tables = screen.container.querySelectorAll(TABLE_SELECTOR)
    expect(tables).toHaveLength(1)
    expect(tables[0].querySelector('[data-slot="table-header"]')).not.toBeNull()
    expect(tables[0].querySelector('[data-slot="table-body"]')).not.toBeNull()
    expect(screen.container.querySelectorAll(HEADER_ROW_SELECTOR)).toHaveLength(
      1
    )
    expect(getBodyRows(screen.container)).toHaveLength(RECEIPTS.length)
  })

  it("ReceiptDataTable_ShouldSeparateEveryRowWithABorder_WhenRowsExist", async () => {
    // Arrange & Act
    const screen = await renderReceiptTable()

    // Assert
    const rows = [
      ...screen.container.querySelectorAll<HTMLElement>(
        `${HEADER_ROW_SELECTOR}, ${BODY_ROW_SELECTOR}`
      ),
    ]
    expect(rows).toHaveLength(1 + RECEIPTS.length)

    // Every row but the last body row draws its own bottom border; the last one
    // is separated from the footer by the footer's top border, so the table
    // never shows a doubled line.
    for (const row of rows.slice(0, -1)) {
      const style = getComputedStyle(row)
      expect(style.borderBottomStyle).toBe("solid")
      expect(style.borderBottomWidth).not.toBe("0px")
    }

    const footer = screen.container.querySelector<HTMLElement>(FOOTER_SELECTOR)
    expect(footer).not.toBeNull()
    expect(getComputedStyle(footer!).borderTopWidth).not.toBe("0px")
  })

  it("ReceiptDataTable_ShouldAlignCellValuesWithTheirHeaders_WhenColumnWidthsDiffer", async () => {
    // Arrange
    const screen = await renderReceiptTable()

    // Act
    const headerCells = getHeaderCells(screen.container)
    const [firstRow, secondRow] = getBodyRows(screen.container)
    const firstRowCells = [
      ...firstRow.querySelectorAll<HTMLElement>(BODY_CELL_SELECTOR),
    ]
    const secondRowCells = [
      ...secondRow.querySelectorAll<HTMLElement>(BODY_CELL_SELECTOR),
    ]

    // Assert — every cell starts at the same left edge as its column header,
    // no matter how wide the cell's own content is.
    expect(headerCells).toHaveLength(firstRowCells.length)
    expect(headerCells).toHaveLength(secondRowCells.length)
    for (const [index, headerCell] of headerCells.entries()) {
      const headerLeft = headerCell.getBoundingClientRect().left
      expect(
        Math.abs(headerLeft - firstRowCells[index].getBoundingClientRect().left)
      ).toBeLessThanOrEqual(1)
      expect(
        Math.abs(
          headerLeft - secondRowCells[index].getBoundingClientRect().left
        )
      ).toBeLessThanOrEqual(1)
    }
  })

  it("ReceiptDataTable_ShouldDimAndDisableTheRow_WhenTheRowIsDisabled", async () => {
    // Arrange & Act
    const screen = await renderReceiptTable()

    // Act
    const [readyRow, pendingRow] = getBodyRows(screen.container)
    const readyCheckbox =
      readyRow.querySelector<HTMLInputElement>(CHECKBOX_SELECTOR)
    const pendingCheckbox =
      pendingRow.querySelector<HTMLInputElement>(CHECKBOX_SELECTOR)

    // Assert
    expect(pendingRow.getAttribute("data-disabled")).toBe("true")
    expect(Number(getComputedStyle(pendingRow).opacity)).toBeLessThan(1)
    expect(pendingCheckbox?.disabled).toBe(true)

    expect(readyRow.getAttribute("data-disabled")).not.toBe("true")
    expect(Number(getComputedStyle(readyRow).opacity)).toBe(1)
    expect(readyCheckbox?.disabled).toBe(false)
  })

  it("ReceiptDataTable_ShouldKeepItsBackgroundOnHover_WhenTheRowIsDisabled", async () => {
    // Arrange
    const screen = await renderReceiptTable()
    const [, pendingRow] = getBodyRows(screen.container)
    const restingBackground = getComputedStyle(pendingRow).backgroundColor

    // Act
    await hoverWithoutTransition(pendingRow)

    // Assert
    expect(getComputedStyle(pendingRow).backgroundColor).toBe(restingBackground)
  })

  it("ReceiptDataTable_ShouldHighlightOnHover_WhenTheRowIsEnabled", async () => {
    // Arrange
    const screen = await renderReceiptTable()
    const [readyRow] = getBodyRows(screen.container)
    const restingBackground = getComputedStyle(readyRow).backgroundColor

    // Act
    await hoverWithoutTransition(readyRow)

    // Assert — control for the assertion above: an enabled row must still react.
    expect(getComputedStyle(readyRow).backgroundColor).not.toBe(
      restingBackground
    )
  })

  it("ReceiptDataTable_ShouldShowTheRowCountInTheFooter_WhenRowsExist", async () => {
    // Arrange & Act
    const screen = await renderReceiptTable()

    // Assert
    const footer = screen.container.querySelector<HTMLElement>(FOOTER_SELECTOR)
    expect(footer?.textContent).toContain(
      `Có ${RECEIPTS.length} tệp trong lô này`
    )
  })

  it("ReceiptDataTable_ShouldKeepTheFooterAlignedWithTheColumns_WhenRowsExist", async () => {
    // Arrange
    const screen = await renderReceiptTable()
    const table = screen.container.querySelector<HTMLElement>(TABLE_SELECTOR)
    const headerCells = getHeaderCells(screen.container)

    // Act
    const footerCells = [
      ...(table?.querySelectorAll<HTMLTableCellElement>(FOOTER_CELL_SELECTOR) ??
        []),
    ]

    // Assert — the footer lives inside the same table, spans every column, and
    // starts at the same left edge as the first column.
    expect(table?.querySelector(FOOTER_SELECTOR)).not.toBeNull()
    expect(footerCells).toHaveLength(1)
    expect(footerCells[0].colSpan).toBe(headerCells.length)
    expect(
      Math.abs(
        footerCells[0].getBoundingClientRect().left -
          headerCells[0].getBoundingClientRect().left
      )
    ).toBeLessThanOrEqual(1)
  })
})
