import {
  RECEIPT_COLUMNS as COLUMNS,
  formatConfidence,
  formatCurrency,
} from "@/components/receipts/receipts-columns"
import { describe, expect, it } from "vitest"

describe("formatCurrency", () => {
  it("formatCurrency_ShouldFormatVndAmounts_WhenGivenANumber", () => {
    // Arrange
    const total = 1_250_000

    // Act
    const result = formatCurrency(total)

    // Assert
    expect(result).toContain("1.250.000")
  })

  it("formatCurrency_ShouldRenderAnEmDash_WhenValueIsNull", () => {
    // Arrange
    const total = null

    // Act
    const result = formatCurrency(total)

    // Assert
    expect(result).toBe("—")
  })
})

describe("formatConfidence", () => {
  it("formatConfidence_ShouldRenderAPercentage_WhenGivenARatio", () => {
    // Arrange
    const score = 0.926

    // Act
    const result = formatConfidence(score)

    // Assert
    expect(result).toBe("93%")
  })

  it("formatConfidence_ShouldRenderZeroPercent_WhenGivenZero", () => {
    // Act & Assert
    expect(formatConfidence(0)).toBe("0%")
  })

  it("formatConfidence_ShouldRenderAnEmDash_WhenValueIsNull", () => {
    // Arrange
    const score = null

    // Act
    const result = formatConfidence(score)

    // Assert
    expect(result).toBe("—")
  })
})

describe("COLUMNS", () => {
  it("COLUMNS_ShouldExposeEveryReceiptColumnInOrder", () => {
    // Arrange
    const expectedIds = [
      "select",
      "file",
      "provider",
      "receipt_number",
      "created_datetime",
      "total",
      "confidence_score",
      "status",
    ]

    // Act
    const ids = COLUMNS.map((column) =>
      "accessorKey" in column ? column.accessorKey : column.id
    )

    // Assert
    expect(ids).toEqual(expectedIds)
  })
})
