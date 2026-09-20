import { fakerVI } from "@faker-js/faker"

import { parseReceipt } from "@/models/receipt"
import type { Receipt, ReceiptIssue, ReceiptStatus } from "@/models/receipt"

const FAKE_RECEIPT_COUNT = 9

const RECEIPT_SEED = 2026

const RECEIPT_STATUS_WEIGHTS: { value: ReceiptStatus; weight: number }[] = [
  { value: "ready", weight: 4 },
  { value: "needs_review", weight: 3 },
  { value: "pending", weight: 2 },
  { value: "processing", weight: 1 },
  { value: "failed", weight: 1 },
]

const FILE_EXTENSIONS = ["pdf", "jpg", "png"] as const

const MIME_TYPES: Record<(typeof FILE_EXTENSIONS)[number], string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  png: "image/png",
}

const RECEIPT_ISSUE_PRESETS: ReceiptIssue[] = [
  { code: "vat_mismatch", message: "Sai lệch thuế GTGT so với tổng tiền" },
  {
    code: "low_confidence",
    message: "Độ tin cậy nhận dạng thấp ở mục tổng tiền",
  },
  { code: "missing_tax_id", message: "Thiếu mã số thuế của nhà cung cấp" },
  {
    code: "unreadable_total",
    message: "Không đọc được tổng tiền trên hoá đơn",
  },
  {
    code: "duplicate_receipt",
    message: "Nghi ngờ trùng với hoá đơn đã xử lý",
  },
  { code: "invalid_date", message: "Ngày lập hoá đơn không hợp lệ" },
]

fakerVI.seed(RECEIPT_SEED)

function createReceiptFile(): File {
  const extension = fakerVI.helpers.arrayElement(FILE_EXTENSIONS)
  const name = `hoa-don-${fakerVI.string.alphanumeric(8).toLowerCase()}.${extension}`

  return new File([`fake scan for ${name}`], name, {
    type: MIME_TYPES[extension],
  })
}

function createReceiptIssue(): ReceiptIssue {
  return { ...fakerVI.helpers.arrayElement(RECEIPT_ISSUE_PRESETS) }
}

function createReceipt(status: ReceiptStatus): Receipt {
  const base = {
    file: createReceiptFile(),
    provider: fakerVI.company.name(),
    receipt_number: fakerVI.number.int({ min: 1, max: 999_999 }),
    created_datetime: fakerVI.date.recent({ days: 60 }),
    total: fakerVI.number.int({ min: 50_000, max: 25_000_000 }),
    confidence_score: fakerVI.number.float({
      min: 0.55,
      max: 1,
      fractionDigits: 2,
    }),
  }

  if (status === "needs_review" || status === "failed") {
    const issueCount = fakerVI.number.int({ min: 1, max: 2 })

    return parseReceipt({
      ...base,
      status,
      issues: Array.from({ length: issueCount }, createReceiptIssue),
    })
  }

  return parseReceipt({ ...base, status })
}

function createFakeReceipts(count = FAKE_RECEIPT_COUNT): Receipt[] {
  return Array.from({ length: count }, () =>
    createReceipt(fakerVI.helpers.weightedArrayElement(RECEIPT_STATUS_WEIGHTS))
  )
}

const FAKE_RECEIPTS: Receipt[] = createFakeReceipts()

export { FAKE_RECEIPTS, createFakeReceipts }
