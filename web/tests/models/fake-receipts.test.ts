import { FAKE_RECEIPTS, createFakeReceipts } from "@/models/fake-receipts"
import { RECEIPT } from "@/models/receipt"
import { describe, expect, it } from "vitest"

describe("FAKE_RECEIPTS", () => {
  it("FAKE_RECEIPTS_ShouldContainNineReceipts", () => {
    // Arrange & Act & Assert
    expect(FAKE_RECEIPTS).toHaveLength(9)
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
