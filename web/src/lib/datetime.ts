const DISPLAY_LOCALE = "vi-VN"

const DISPLAY_TIME_ZONE = "Asia/Ho_Chi_Minh"

const DATE_FORMATTER = new Intl.DateTimeFormat(DISPLAY_LOCALE, {
  timeZone: DISPLAY_TIME_ZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
})

const ZONED_DATE_PARTS_FORMATTER = new Intl.DateTimeFormat(DISPLAY_LOCALE, {
  timeZone: DISPLAY_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})

function formatDate(date: Date): string {
  return DATE_FORMATTER.format(date)
}

function getCurrentDate(now: Date = new Date()): Date {
  const parts = ZONED_DATE_PARTS_FORMATTER.formatToParts(now)
  const year = Number(parts.find((part) => part.type === "year")?.value)
  const month = Number(parts.find((part) => part.type === "month")?.value)
  const day = Number(parts.find((part) => part.type === "day")?.value)

  return new Date(year, month - 1, day)
}

export { DISPLAY_LOCALE, DISPLAY_TIME_ZONE, formatDate, getCurrentDate }
