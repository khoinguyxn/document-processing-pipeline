import { fakerVI } from "@faker-js/faker"

import { parseReceipt } from "@/models/receipt"
import type { Receipt, ReceiptIssue, ReceiptStatus } from "@/models/receipt"

const FAKE_RECEIPT_COUNT = 9

const RECEIPT_SEED = 2026

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
  {
    code: "blurry_scan",
    message: "Bản quét bị mờ, không đọc được nội dung",
  },
]

const VAT_MISMATCH_ISSUE = RECEIPT_ISSUE_PRESETS[0]
const LOW_CONFIDENCE_ISSUE = RECEIPT_ISSUE_PRESETS[1]
const MISSING_TAX_ID_ISSUE = RECEIPT_ISSUE_PRESETS[2]
const UNREADABLE_TOTAL_ISSUE = RECEIPT_ISSUE_PRESETS[3]
const DUPLICATE_RECEIPT_ISSUE = RECEIPT_ISSUE_PRESETS[4]
const INVALID_DATE_ISSUE = RECEIPT_ISSUE_PRESETS[5]
const BLURRY_SCAN_ISSUE = RECEIPT_ISSUE_PRESETS[6]

const NULL_EXTRACTED_FIELDS = {
  provider: null,
  receipt_number: null,
  total: null,
  confidence_score: null,
}

type ReceiptScenario = {
  status: ReceiptStatus
  confidence_score: number | null
  issues?: ReceiptIssue[]
}

const RECEIPT_SCENARIOS: ReceiptScenario[] = [
  { status: "pending", confidence_score: null },
  { status: "processing", confidence_score: null },
  {
    status: "failed",
    confidence_score: null,
    issues: [UNREADABLE_TOTAL_ISSUE],
  },
  {
    status: "failed",
    confidence_score: null,
    issues: [BLURRY_SCAN_ISSUE],
  },
  {
    status: "needs_review",
    confidence_score: 0.78,
    issues: [VAT_MISMATCH_ISSUE],
  },
  {
    status: "needs_review",
    confidence_score: 0.45,
    issues: [LOW_CONFIDENCE_ISSUE, MISSING_TAX_ID_ISSUE],
  },
  {
    status: "needs_review",
    confidence_score: 0.62,
    issues: [INVALID_DATE_ISSUE, DUPLICATE_RECEIPT_ISSUE],
  },
  { status: "ready", confidence_score: 0.96 },
  { status: "ready", confidence_score: 0.93 },
]

function createReceiptFile(): File {
  const extension = fakerVI.helpers.arrayElement(FILE_EXTENSIONS)
  const name = `hoa-don-${fakerVI.string.alphanumeric(8).toLowerCase()}.${extension}`

  return new File([`fake scan for ${name}`], name, {
    type: MIME_TYPES[extension],
  })
}

function createExtractedFields(confidence_score: number) {
  return {
    provider: fakerVI.company.name(),
    receipt_number: fakerVI.number.int({ min: 1, max: 999_999 }),
    total: fakerVI.number.int({ min: 50_000, max: 25_000_000 }),
    confidence_score,
  }
}

function createReceiptFromScenario(scenario: ReceiptScenario): Receipt {
  const extracted =
    scenario.confidence_score === null
      ? NULL_EXTRACTED_FIELDS
      : createExtractedFields(scenario.confidence_score)

  return parseReceipt({
    file: createReceiptFile(),
    created_datetime: fakerVI.date.recent({ days: 60 }),
    ...extracted,
    status: scenario.status,
    ...(scenario.issues
      ? { issues: scenario.issues.map((issue) => ({ ...issue })) }
      : {}),
  })
}

function createFakeReceipts(count = FAKE_RECEIPT_COUNT): Receipt[] {
  fakerVI.seed(RECEIPT_SEED)

  return Array.from({ length: count }, (_, index) =>
    createReceiptFromScenario(
      RECEIPT_SCENARIOS[index % RECEIPT_SCENARIOS.length]
    )
  )
}

const FAKE_RECEIPTS: Receipt[] = createFakeReceipts()

export { RECEIPT_ISSUE_PRESETS, FAKE_RECEIPTS, createFakeReceipts }
