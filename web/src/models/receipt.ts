import z from "zod"
import { fromError } from "zod-validation-error"

const RECEIPT_STATUSES = [
  "pending",
  "processing",
  "needs_review",
  "failed",
  "ready",
] as const

type ReceiptStatus = (typeof RECEIPT_STATUSES)[number]

const RECEIPT_STATUS_LABELS: Record<ReceiptStatus, string> = {
  pending: "Đang chờ",
  processing: "Đang xử lý",
  needs_review: "Cần kiểm tra",
  failed: "Lỗi",
  ready: "Hoàn tất",
}

type ReceiptIssue = {
  code: string
  message: string
}

type ReceiptBase = {
  file: File
  provider: string
  receipt_number: number
  created_datetime: Date
  total: number
  confidence_score: number
}

type ReceiptNeedsReview = ReceiptBase & {
  status: "needs_review"
  issues: ReceiptIssue[]
}

type ReceiptFailed = ReceiptBase & {
  status: "failed"
  issues: ReceiptIssue[]
}

type ReceiptClean = ReceiptBase & {
  status: Exclude<ReceiptStatus, "needs_review" | "failed">
}

type Receipt = ReceiptNeedsReview | ReceiptFailed | ReceiptClean

const RECEIPT_STATUS = z.enum(RECEIPT_STATUSES)

const RECEIPT_ISSUE = z.object({
  code: z.string(),
  message: z.string(),
}) satisfies z.ZodType<ReceiptIssue>

const RECEIPT_BASE = z.object({
  file: z.file(),
  provider: z.string(),
  receipt_number: z.number(),
  created_datetime: z.coerce.date(),
  total: z.number(),
  confidence_score: z.number(),
}) satisfies z.ZodType<ReceiptBase>

const RECEIPT = z.discriminatedUnion("status", [
  RECEIPT_BASE.extend({
    status: RECEIPT_STATUS.extract(["needs_review"]),
    issues: z.array(RECEIPT_ISSUE).min(1),
  }),
  RECEIPT_BASE.extend({
    status: RECEIPT_STATUS.extract(["failed"]),
    issues: z.array(RECEIPT_ISSUE).min(1),
  }),
  RECEIPT_BASE.extend({
    status: RECEIPT_STATUS.exclude(["needs_review", "failed"]),
  }),
]) satisfies z.ZodType<Receipt>

function parseReceipt(input: unknown): Receipt {
  const result = RECEIPT.safeParse(input)

  if (!result.success) {
    throw fromError(result.error)
  }

  return result.data
}

function isReceiptReady(receipt: Receipt): boolean {
  return receipt.status === "ready"
}

export {
  RECEIPT,
  RECEIPT_STATUSES,
  RECEIPT_STATUS_LABELS,
  isReceiptReady,
  parseReceipt,
}
export type { Receipt, ReceiptIssue, ReceiptStatus }
