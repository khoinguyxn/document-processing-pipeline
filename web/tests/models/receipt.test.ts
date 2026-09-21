import { RECEIPT, isReceiptParsed, parseReceipt } from "@/models/receipt"
import { fuzz } from "@traversable/zod-test"
import * as fc from "fast-check"
import { describe, expect, it } from "vitest"
import { isValidationError } from "zod-validation-error"

function createReceipt(overrides: Record<string, unknown> = {}) {
  return {
    file: new File(["scan"], "receipt.pdf", { type: "application/pdf" }),
    provider: "Nhà cung cấp",
    receipt_number: 42,
    created_datetime: "2026-09-18T00:00:00.000Z",
    total: 1_000_000,
    confidence_score: 0.92,
    ...overrides,
  }
}

function createIssue(overrides: Record<string, unknown> = {}) {
  return { code: "vat_mismatch", message: "Sai lệch thuế GTGT", ...overrides }
}

describe("RECEIPT", () => {
  it("RECEIPT_ShouldParseTheReceipt_WhenStatusIsPending", () => {
    // Arrange
    const input = createReceipt({ status: "pending" })

    // Act
    const result = RECEIPT.safeParse(input)

    // Assert
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.status).toBe("pending")
      expect(result.data.created_datetime).toBeInstanceOf(Date)
      expect("issues" in result.data).toBe(false)
    }
  })

  it("RECEIPT_ShouldParseNullExtractedFields_WhenStatusIsPending", () => {
    // Arrange
    const input = createReceipt({
      status: "pending",
      provider: null,
      receipt_number: null,
      total: null,
      confidence_score: null,
    })

    // Act
    const result = RECEIPT.safeParse(input)

    // Assert
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.provider).toBeNull()
      expect(result.data.receipt_number).toBeNull()
      expect(result.data.total).toBeNull()
      expect(result.data.confidence_score).toBeNull()
    }
  })

  it("RECEIPT_ShouldRequireIssues_WhenStatusIsNeedsReview", () => {
    // Arrange
    const missingIssues = createReceipt({ status: "needs_review" })
    const emptyIssues = createReceipt({ status: "needs_review", issues: [] })

    // Act
    const missingResult = RECEIPT.safeParse(missingIssues)
    const emptyResult = RECEIPT.safeParse(emptyIssues)

    // Assert
    expect(missingResult.success).toBe(false)
    expect(emptyResult.success).toBe(false)
  })

  it("RECEIPT_ShouldParseIssues_WhenStatusIsNeedsReview", () => {
    // Arrange
    const input = createReceipt({
      status: "needs_review",
      issues: [createIssue()],
    })

    // Act
    const result = RECEIPT.safeParse(input)

    // Assert
    expect(result.success).toBe(true)
    if (result.success && result.data.status === "needs_review") {
      expect(result.data.issues[0].code).toBe("vat_mismatch")
    }
  })

  it("RECEIPT_ShouldRequireIssues_WhenStatusIsFailed", () => {
    // Arrange
    const input = createReceipt({ status: "failed", issues: [] })

    // Act
    const result = RECEIPT.safeParse(input)

    // Assert
    expect(result.success).toBe(false)
  })

  it("RECEIPT_ShouldReject_WhenStatusIsUnknown", () => {
    // Arrange
    const input = createReceipt({ status: "archived" })

    // Act
    const result = RECEIPT.safeParse(input)

    // Assert
    expect(result.success).toBe(false)
  })
})

describe("parseReceipt", () => {
  it("parseReceipt_ShouldReturnTheReceipt_WhenInputIsValid", () => {
    // Arrange
    const input = createReceipt({ status: "ready" })

    // Act
    const receipt = parseReceipt(input)

    // Assert
    expect(receipt.status).toBe("ready")
    expect(receipt.provider).toBe("Nhà cung cấp")
  })

  it("parseReceipt_ShouldThrowAValidationErrorWithTheFieldPath_WhenInputIsInvalid", () => {
    // Arrange
    const input = createReceipt({ status: "needs_review" })

    // Act
    let thrown: unknown
    try {
      parseReceipt(input)
    } catch (error) {
      thrown = error
    }

    // Assert
    expect(isValidationError(thrown)).toBe(true)
    expect((thrown as Error).message).toContain("issues")
  })
})

describe("isReceiptParsed", () => {
  it("isReceiptReady_ShouldReturnTrue_WhenStatusIsReady", () => {
    // Arrange
    const receipt = parseReceipt(createReceipt({ status: "ready" }))

    // Act
    const result = isReceiptParsed(receipt)

    // Assert
    expect(result).toBe(true)
  })

  it("isReceiptReady_ShouldReturnFalse_WhenStatusIsAnythingElse", () => {
    // Arrange
    const receipts = [
      parseReceipt(createReceipt({ status: "pending" })),
      parseReceipt(createReceipt({ status: "processing" })),
      parseReceipt(
        createReceipt({ status: "needs_review", issues: [createIssue()] })
      ),
      parseReceipt(
        createReceipt({ status: "failed", issues: [createIssue()] })
      ),
    ]

    // Act
    const results = receipts.map(isReceiptParsed)

    // Assert
    expect(results).toEqual([false, false, false, false])
  })
})

describe("RECEIPT (fuzz)", () => {
  it("RECEIPT_ShouldAcceptEveryFuzzedReceipt", () => {
    // Arrange
    const generator = fuzz(RECEIPT, {
      array: { minLength: 1 },
      number: { noDefaultInfinity: true, noNaN: true },
    })

    // Act & Assert
    fc.assert(
      fc.property(generator, (receipt) => {
        expect(RECEIPT.safeParse(receipt).success).toBe(true)
      }),
      { numRuns: 200 }
    )
  })

  it("RECEIPT_ShouldAlwaysCarryIssues_WhenFuzzedStatusIsNeedsReviewOrFailed", () => {
    // Arrange
    const generator = fuzz(RECEIPT, { array: { minLength: 1 } })

    // Act & Assert
    fc.assert(
      fc.property(generator, (receipt) => {
        const requiresIssues =
          receipt.status === "needs_review" || receipt.status === "failed"

        if (requiresIssues) {
          expect(receipt.issues.length).toBeGreaterThan(0)
        }
      }),
      { numRuns: 200 }
    )
  })
})
