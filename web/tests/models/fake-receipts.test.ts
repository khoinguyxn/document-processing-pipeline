import {
  FAKE_RECEIPTS,
  RECEIPT_ISSUE_PRESETS,
  createFakeReceipts,
} from "@/models/fake-receipts"
import { RECEIPT } from "@/models/receipt"
import { describe, expect, it } from "vitest"

describe("FAKE_RECEIPTS", () => {
  it("FAKE_RECEIPTS_ShouldContainNineReceipts", () => {
    // Arrange & Act & Assert
    expect(FAKE_RECEIPTS).toHaveLength(9)
  })

  it("FAKE_RECEIPTS_ShouldExposeEveryIssuePreset_SoNoPresetGoesUnused", () => {
    // Arrange
    const usedCodes = new Set(
      FAKE_RECEIPTS.flatMap((receipt) =>
        "issues" in receipt ? receipt.issues.map((issue) => issue.code) : []
      )
    )

    // Act & Assert
    for (const preset of RECEIPT_ISSUE_PRESETS) {
      expect(usedCodes.has(preset.code)).toBe(true)
    }
  })

  it("FAKE_RECEIPTS_ShouldCarryIssues_WhenStatusIsNeedsReviewOrFailed", () => {
    // Arrange
    const requiresIssues = FAKE_RECEIPTS.filter(
      (receipt) =>
        receipt.status === "needs_review" || receipt.status === "failed"
    )

    // Act & Assert
    for (const receipt of requiresIssues) {
      expect(receipt.issues.length).toBeGreaterThan(0)
    }
  })

  it("FAKE_RECEIPTS_ShouldParseCleanly_WhenValidatedByTheSchema", () => {
    // Act & Assert
    for (const receipt of FAKE_RECEIPTS) {
      const result = RECEIPT.safeParse(receipt)

      expect(result.success).toBe(true)
    }
  })

  it("FAKE_RECEIPTS_ShouldLeaveExtractedFieldsNull_WhenStatusIsPendingOrProcessing", () => {
    // Arrange
    const receipts = FAKE_RECEIPTS.filter(
      (receipt) =>
        receipt.status === "pending" || receipt.status === "processing"
    )

    // Act & Assert
    expect(receipts.length).toBeGreaterThan(0)
    for (const receipt of receipts) {
      expect(receipt.provider).toBeNull()
      expect(receipt.receipt_number).toBeNull()
      expect(receipt.total).toBeNull()
      expect(receipt.confidence_score).toBeNull()
      expect("issues" in receipt).toBe(false)
    }
  })

  it("FAKE_RECEIPTS_ShouldLeaveExtractedFieldsNull_WhenStatusIsFailed", () => {
    // Arrange
    const receipts = FAKE_RECEIPTS.filter(
      (receipt) => receipt.status === "failed"
    )

    // Act & Assert
    expect(receipts.length).toBeGreaterThan(0)
    for (const receipt of receipts) {
      expect(receipt.provider).toBeNull()
      expect(receipt.receipt_number).toBeNull()
      expect(receipt.total).toBeNull()
      expect(receipt.confidence_score).toBeNull()
      expect(receipt.issues.length).toBeGreaterThan(0)
    }
  })

  it("FAKE_RECEIPTS_ShouldPopulateExtractedFields_WhenStatusIsNeedsReview", () => {
    // Arrange
    const receipts = FAKE_RECEIPTS.filter(
      (receipt) => receipt.status === "needs_review"
    )

    // Act & Assert
    expect(receipts.length).toBeGreaterThan(0)
    for (const receipt of receipts) {
      expect(receipt.provider).not.toBeNull()
      expect(receipt.receipt_number).not.toBeNull()
      expect(receipt.total).not.toBeNull()
      expect(receipt.confidence_score).not.toBeNull()
      expect(receipt.issues.length).toBeGreaterThan(0)
    }
  })

  it("FAKE_RECEIPTS_ShouldPopulateExtractedFields_WhenStatusIsReady", () => {
    // Arrange
    const receipts = FAKE_RECEIPTS.filter(
      (receipt) => receipt.status === "ready"
    )

    // Act & Assert
    expect(receipts.length).toBeGreaterThan(0)
    for (const receipt of receipts) {
      expect(receipt.provider).not.toBeNull()
      expect(receipt.receipt_number).not.toBeNull()
      expect(receipt.total).not.toBeNull()
      expect(receipt.confidence_score).not.toBeNull()
      expect("issues" in receipt).toBe(false)
    }
  })
})

describe("createFakeReceipts", () => {
  it("createFakeReceipts_ShouldReturnTheRequestedCount", () => {
    // Act
    const receipts = createFakeReceipts(3)

    // Assert
    expect(receipts).toHaveLength(3)
  })

  it("createFakeReceipts_ShouldReturnNineReceipts_WhenCountIsOmitted", () => {
    // Act
    const receipts = createFakeReceipts()

    // Assert
    expect(receipts).toHaveLength(9)
  })
})
